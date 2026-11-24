/**
 * Escopo por empresa (multi-tenant) da Mesa de Operações / CRM Financeira.
 *
 * Regra:
 *  - holding_kytto (ou "todos"/vazio)  -> visão consolidada do grupo;
 *  - bancofe                           -> operações próprias + originadas fora do grupo
 *                                         (clientes externos atendidos pela financeira);
 *  - demais empresas                   -> somente operações originadas por elas.
 * Pré-cadastros da Casa Nova (lead com consentimento do grupo) ficam visíveis para
 * Holding, Casa Nova e BancoFé.
 */

export const EMPRESAS_DO_GRUPO = [
  "holding_kytto",
  "bancofe",
  "zuma_agro",
  "zuma_gastronomia",
  "palatare_pizzaria",
  "barbearia_dino",
  "agro_open_ttc",
  "serrano_concreto",
  "casa_nova_imoveis",
  "stallone_nutre_sport",
  "supermercado_kytto",
  "zuma_moda",
  "kytto_energia_solar",
  "bancofe_logistica",
  "kytto_tech_software",
] as const;

const ALIASES: Record<string, string> = {
  casanova: "casa_nova_imoveis",
  casa_nova: "casa_nova_imoveis",
  dino_barbearia: "barbearia_dino",
  stallone_fitness: "stallone_nutre_sport",
  stallone: "stallone_nutre_sport",
  holding_bancofe: "holding_kytto",
  holding: "holding_kytto",
  kytto: "holding_kytto",
  bancofe_financeira: "bancofe",
  bancofe_credito: "bancofe",
  operacoes_financeiras_crm: "bancofe",
  palatare: "palatare_pizzaria",
  kytto_tech: "kytto_tech_software",
  kytto_energia: "kytto_energia_solar",
  supermercado: "supermercado_kytto",
  serrano: "serrano_concreto",
  zuma_cozinha_oriental: "zuma_gastronomia",
};

export function normalizarEmpresaId(id?: string | null): string {
  if (!id) return "";
  const base = String(id)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return ALIASES[base] || base;
}

export function ehVisaoConsolidada(empresaAtiva: string): boolean {
  return !empresaAtiva || empresaAtiva === "todos" || empresaAtiva === "holding_kytto";
}

/** A origem informada pertence ao escopo da empresa ativa? */
export function origemNoEscopo(empresaAtiva: string, origem?: string | null): boolean {
  if (ehVisaoConsolidada(empresaAtiva)) return true;
  const o = normalizarEmpresaId(origem);
  if (o === empresaAtiva) return true;
  if (empresaAtiva === "bancofe") {
    return !o || !(EMPRESAS_DO_GRUPO as readonly string[]).includes(o);
  }
  return false;
}

/** Pré-cadastros: Casa Nova também visíveis para a BancoFé (consentimento do grupo). */
export function precadastroNoEscopo(empresaAtiva: string, origem?: string | null): boolean {
  if (ehVisaoConsolidada(empresaAtiva)) return true;
  const o = normalizarEmpresaId(origem);
  if (empresaAtiva === "bancofe") return true;
  return o === empresaAtiva;
}

export function filtrarPorEscopo<T>(
  empresaAtiva: string,
  lista: T[],
  origemDe: (item: T) => string | null | undefined,
): T[] {
  if (ehVisaoConsolidada(empresaAtiva)) return lista;
  return lista.filter((i) => origemNoEscopo(empresaAtiva, origemDe(i)));
}

const NOMES_ALIAS: Record<string, string> = {};

/** Rótulo curto para exibição do escopo. */
export function rotuloEscopo(empresaAtiva: string, nome?: string): string {
  if (ehVisaoConsolidada(normalizarEmpresaId(empresaAtiva))) return "Consolidado do Grupo (Holding Kytto)";
  return nome || NOMES_ALIAS[empresaAtiva] || empresaAtiva;
}
