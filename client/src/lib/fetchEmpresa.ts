/**
 * fetch com escopo da empresa ativa: envia o header x-empresa-id (empresa selecionada
 * no seletor do topo) para que o servidor devolva apenas os dados dessa empresa.
 */
export const CHAVE_EMPRESA_ATIVA = "bancofe_active_business";

export function empresaAtivaId(): string {
  try {
    return localStorage.getItem(CHAVE_EMPRESA_ATIVA) || "bancofe";
  } catch {
    return "bancofe";
  }
}

export function fetchEmpresa(input: RequestInfo | URL, init: RequestInit = {}, empresaId?: string): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("x-empresa-id")) headers.set("x-empresa-id", empresaId || empresaAtivaId());
  return fetch(input, { ...init, headers });
}
