import { createHash } from "node:crypto";
export { CONFIG_OFICIAL_KYTTO, getHeadersIntegracaoKytto } from "./config-kytto.ts";

/**
 * Configuração Institucional Oficial do BancoFé
 * Plataforma Bancária, Hub de Crédito Habitacional, Rural e Digital
 * Integrado ao ecossistema Casa Nova Imóveis, Construtora Ultra e Kytto Tecnologia
 */
export const CONFIG_OFICIAL_BANCOFE = {
  instituicao: {
    nome: "BancoFé",
    razaoSocial: "BANCOFE MEIOS DE PAGAMENTO E CORRESPONDENTE BANCARIO LTDA",
    nomeFantasia: "BANCO FÉ - CRÉDITO INTELIGENTE & BANKING 360",
    cnpj: "53.338.003/0001-04", // Vinculado à Kytto Tecnologia
    cnpjLimpo: "53338003000104",
    ispb: "00000000",
    segmentoBacen: "S5 - Correspondente Bancário Multibancos e Sociedade de Crédito Direto",
    dominioOficial: "bancofe.com.br",
    urlProducao: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app",
    urlCasanova: "https://casanova.kytto.com.br",
    versao: "2.8.0-bancofe-enterprise",
  },
  seguranca: {
    usuarioAdminPadrao: process.env.BANCOFE_ADMIN_USER || "Admin",
    senhaAdminPadrao: process.env.BANCOFE_ADMIN_PASS || "#080581Verdao",
    jwtSecret: process.env.PAINEL_SEGREDO || "bancofe_secret_key_prod_2026",
    tokenPrdValido: Buffer.from(
      `${process.env.BANCOFE_ADMIN_USER || "Admin"}:${process.env.BANCOFE_ADMIN_PASS || "#080581Verdao"}`
    ).toString("base64"),
  },
  modulosPadrao: [
    {
      id: "mod-consulta360",
      nome: "Consulta 360 CPF & CNPJ (KYC/AML)",
      ativo: true,
      rota: "/plataforma/consulta-cpf",
      descricao: "Diligência completa em 48+ fontes governamentais e financeiras",
    },
    {
      id: "mod-clientes-radar",
      nome: "Radar Preditivo & Base de Clientes",
      ativo: true,
      rota: "/plataforma/clientes-potenciais",
      descricao: "Mapeamento socioeconômico de clientes potenciais e investidores",
    },
    {
      id: "mod-precadastro360",
      nome: "Esteira de Pré-Cadastro 360",
      ativo: true,
      rota: "/plataforma/precadastro",
      descricao: "Onboarding de clientes e pré-aprovação autônoma de crédito",
    },
    {
      id: "mod-corban-multibancos",
      nome: "Esteira de Crédito & Corban",
      ativo: true,
      rota: "/plataforma/credito",
      descricao: "Conectores bancários (Caixa, BB, Itaú, Bradesco, Santander)",
    },
    {
      id: "mod-carteira-pix",
      nome: "Carteira Digital & Cobranças PIX",
      ativo: true,
      rota: "/plataforma/carteira",
      descricao: "Chaves PIX DICT, recarga de saldos e tokenização de cartões",
    },
    {
      id: "mod-admin-negocios",
      nome: "Gestão de Módulos por Negócio",
      ativo: true,
      rota: "/admin",
      descricao: "Painel de controle de negócios e ativação de módulos corporativos",
    },
  ],
};
