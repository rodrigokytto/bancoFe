import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { zumaRouter } from "./routers/zumaRouter";
import { adminRouter } from "./routers/adminRouter";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { validarCredenciaisUniversal } from "../src/server/auth-unificada";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          email: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const email = input.email.trim().toLowerCase();
        const password = input.password.trim();

        const authRes = validarCredenciaisUniversal(email, password);
        if (authRes.valido && authRes.usuario) {
          const user = {
            id: 1,
            openId: "usr_rodrigo_zuma",
            name: authRes.usuario.nome,
            email: authRes.usuario.email,
            role: "admin",
            cargo: "Proprietário & Administrador Geral",
            unidade: "Tangará da Serra - MT",
            lastSignedIn: new Date().toISOString(),
          };

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, "session_zuma_rodrigo", {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 365,
          });

          return {
            success: true,
            user,
          };
        }

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: authRes.erro || "E-mail ou senha incorretos. Acesso restrito ao BancoFe / Zuma Pilot.",
        });
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  zuma: zumaRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
