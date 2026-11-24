import { toast as sonner } from "sonner";
import { DEFAULT_BUSINESSES } from "@shared/businessModules";

export const CHAVE_NEGOCIO = "bancofe_active_business";

/** Unidades do grupo em que o hub tem "uso específico" (operações financeiras / crédito). */
export const UNIDADES_FINANCEIRAS = new Set(["bancofe", "bancofe_credito", "operacoes_financeiras_crm"]);

export function negocioAtivoId(): string {
  try {
    return localStorage.getItem(CHAVE_NEGOCIO) || "bancofe";
  } catch {
    return "bancofe";
  }
}

async function chamar(metodo: string, url: string, corpo?: unknown) {
  const token = typeof localStorage !== "undefined" ? (localStorage.getItem("zuma_token") || localStorage.getItem("zuma_auth_session")) : null;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
    "x-empresa-id": negocioAtivoId(),
  };
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(url, {
    method: metodo,
    credentials: "same-origin",
    headers,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const tipo = resp.headers.get("content-type") || "";
  if (!tipo.includes("application/json")) {
    throw new Error(`Serviço indisponível (HTTP ${resp.status}). Tente novamente em instantes.`);
  }
  const dados = await resp.json();
  if (!resp.ok) throw new Error(dados?.error || dados?.message || `Erro HTTP ${resp.status}`);
  return dados;
}

export const api = {
  get: (url: string) => chamar("GET", url),
  post: (url: string, corpo?: unknown) => chamar("POST", url, corpo ?? {}),
  put: (url: string, corpo?: unknown) => chamar("PUT", url, corpo ?? {}),
};

const avisar = (msg: string, tipo?: string) => (tipo === "error" ? sonner.error(msg) : sonner.success(msg));
/** Referência estável (evita laços em useCallback/useEffect). */
export const useToast = () => avisar;

export interface UnidadeHub {
  id: string;
  nome: string;
  icone?: string;
  setor: string;
}

export function listaUnidades(): UnidadeHub[] {
  return DEFAULT_BUSINESSES.map((b: any) => ({
    id: b.id,
    nome: b.name,
    icone: "",
    setor: UNIDADES_FINANCEIRAS.has(b.id) ? "financeira" : "outra",
  }));
}

export function empresaAtiva(): UnidadeHub {
  const id = negocioAtivoId();
  return listaUnidades().find((u) => u.id === id) || { id, nome: id, setor: UNIDADES_FINANCEIRAS.has(id) ? "financeira" : "outra" };
}

export const ehFinanceira = (u?: { setor?: string } | null) => Boolean(u && u.setor === "financeira");
