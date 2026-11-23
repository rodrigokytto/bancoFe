import { describe, expect, it } from "vitest";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Autenticação Corporativa PRD - Casanova / Kytto", () => {
  const { app } = criarServidorConsulta360();

  it("GET /login deve renderizar a tela oficial de login com identidade Casanova DataGraph", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/login",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.body).toContain("Acesso Seguro PRD");
    expect(res.body).toContain("Casanova");
    expect(res.body).toContain("Admin");
    expect(res.body).toContain("#080581Verdao");
  });

  it("POST /api/v1/auth/login com credenciais corretas deve autenticar e retornar token corporativo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        username: "Admin",
        password: "#080581Verdao",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.token).toBe("QWRtaW46IzA4MDU4MVZlcmRhbw==");
    expect(body.usuario.login).toBe("Admin");
    expect(body.usuario.perfil).toBe("ADMINISTRADOR_MASTER");
    expect(res.headers["set-cookie"]).toContain("session_token=");
  });

  it("POST /api/v1/auth/login com senha incorreta deve rejeitar com status 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        username: "Admin",
        password: "senha_errada_123",
      },
    });
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(false);
  });

  it("GET /logout deve expirar o cookie de sessão e redirecionar para /login", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/logout",
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
    expect(res.headers["set-cookie"]).toContain("Max-Age=0");
  });

  it("Acesso com cookie de sessão válido deve ser autorizado em /api/v1/auth/me", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: {
        cookie: "session_token=QWRtaW46IzA4MDU4MVZlcmRhbw==",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.autenticado).toBe(true);
    expect(body.usuario).toBe("Admin");
  });
});
