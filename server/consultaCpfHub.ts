/**
 * Montagem das rotas do Módulo Único de Integrações (hub) e da Consulta CPF completa.
 *
 *   /api/admin/hub-integracoes/*   catálogo, status, teste de conexão, habilitação por unidade
 *   /api/admin/consulta-cpf/*      consulta, histórico e detalhe do dossiê
 *
 * Segredos nunca passam por aqui: o hub só informa se a variável de ambiente existe
 * (INFOSIMPLES_TOKEN, TRANSPARENCIA_API_KEY, DATAJUD_API_KEY, GEMINI_API_KEY, ...).
 * Persistência: arquivo JSON em data/ (mesmo padrão dos demais stores do BancoFe).
 */
import fs from "fs";
import os from "os";
import path from "path";
import type { Request, Response, NextFunction } from "express";
// @ts-ignore módulo JS (ESM) sem tipos
import { createIntegracoesHubRouter } from "./consultaCpf/routes.js";
import { verificarAutenticacao, extrairCookies } from "../src/server/auth-unificada";

type Estado = { integracoesHub: Record<string, any>; consultasCpf: any[] };

let ARQUIVO = path.resolve(process.cwd(), "data", "consulta-cpf-hub.json");
let estado: Estado | null = null;

function carregar(): Estado {
  if (estado) return estado;
  try {
    if (fs.existsSync(ARQUIVO)) {
      const j = JSON.parse(fs.readFileSync(ARQUIVO, "utf-8"));
      estado = { integracoesHub: j.integracoesHub || {}, consultasCpf: j.consultasCpf || [] };
      return estado;
    }
  } catch (e) {
    console.warn("[consulta-cpf-hub] não foi possível ler o arquivo de estado:", (e as Error).message);
  }
  estado = { integracoesHub: {}, consultasCpf: [] };
  return estado;
}

function salvar() {
  const dados = JSON.stringify(carregar());
  const tentar = (alvo: string) => {
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    fs.writeFileSync(alvo, dados, "utf-8");
  };
  try {
    tentar(ARQUIVO);
  } catch {
    try {
      ARQUIVO = path.join(os.tmpdir(), "consulta-cpf-hub.json");
      tentar(ARQUIVO);
    } catch (e) {
      console.warn("[consulta-cpf-hub] não foi possível persistir o estado:", (e as Error).message);
    }
  }
}

/** Exige sessão real (cookie ou Authorization). O cabeçalho x-bypass-auth, sozinho, NÃO basta. */
export function exigirSessao(req: Request, res: Response, next: NextFunction) {
  const temCredencial = Boolean(req.headers.authorization) || Object.keys(extrairCookies(req)).length > 0;
  if (!temCredencial || !verificarAutenticacao(req)) {
    return res.status(401).json({ error: "sessão inválida ou expirada", code: "UNAUTHENTICATED" });
  }
  const u = (req as any).usuario;
  (req as any).user = u || { nome: "Operador autenticado", role: "admin", platformAdmin: true };
  next();
}

const ID_VALIDO = /^[a-z0-9_.:-]{1,64}$/i;

export function registerConsultaCpfHub(app: any) {
  const { hub, consultaCpf } = createIntegracoesHubRouter({
    db: () => carregar(),
    save: salvar,
    audit: (req: any, area: string, msg: string) => {
      console.log(
        JSON.stringify({
          severity: "NOTICE",
          component: area,
          message: msg,
          usuario: req.user?.nome || null,
          em: new Date().toISOString(),
        })
      );
    },
    obterEmpresaId: (req: any) => {
      const bruto = String(req.headers["x-empresa-id"] || req.query?.empresaId || "bancofe");
      return ID_VALIDO.test(bruto) ? bruto : "bancofe";
    },
    perfilDoUsuario: (u: any) => (u?.role === "admin" || u?.platformAdmin ? "admin" : "staff"),
    isPlatformAdmin: (req: any) => Boolean(req.user?.platformAdmin),
  });
  app.use("/api/admin/hub-integracoes", exigirSessao, hub);
  app.use("/api/admin/consulta-cpf", exigirSessao, consultaCpf);
}
