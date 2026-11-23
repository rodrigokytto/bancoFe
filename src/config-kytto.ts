import { createHash } from "node:crypto";

/**
 * Configuração Institucional Oficial da Kytto Tecnologia
 * Utilizada como Entidade Emissora, Autenticadora de Integrações e Carimbo DPO/LGPD
 * Conforme dados cadastrais oficiais da Receita Federal do Brasil
 */
export const CONFIG_OFICIAL_KYTTO = {
  empresa: {
    razaoSocial: "PATRICIA FERRARI PAULINO GONCALVES",
    nomeFantasia: "KYTTO TECNOLOGIA E SOLUCOES DIGITAIS",
    cnpj: "53.338.003/0001-04",
    cnpjLimpo: "53338003000104",
    inscricaoMunicipal: "11738",
    cnaePrincipal: {
      codigo: "6201-5/01",
      descricao: "Desenvolvimento de programas de computador sob encomenda",
    },
    cnaesSecundarios: [
      {
        codigo: "6202-3/00",
        descricao: "Desenvolvimento e licenciamento de programas de computador customizáveis",
      },
      {
        codigo: "6209-1/00",
        descricao: "Suporte técnico, manutenção e outros serviços em tecnologia da informação",
      },
      {
        codigo: "6311-9/00",
        descricao: "Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet",
      },
      {
        codigo: "6319-4/00",
        descricao: "Portais, provedores de conteúdo e outros serviços de informação na internet",
      },
    ],
    naturezaJuridica: "213-5 - Empresário (Individual)",
    regimeTributario: "SIMPLES_NACIONAL",
    optanteSimplesNacional: true,
    dataOpcaoSimples: "2024-01-02",
    porte: "ME - Microempresa",
    situacaoCadastral: "ATIVA",
    dataAbertura: "2023-12-28",
    endereco: {
      logradouro: "RUA ELIAS BARBOSA DA SILVA",
      numero: "833",
      bairro: "JARDIM FLORA",
      municipio: "Mirante do Paranapanema",
      uf: "SP",
      cep: "19.262-070",
      cepLimpo: "19262070",
      codigoIbgeMunicipio: "3530201",
      regiaoFiscalRfb: "8ª Região Fiscal (São Paulo)",
    },
    contatos: {
      telefonePrincipal: "(18) 3991-1145",
      emailContabilidade: "ORPAC.EFISCAL@YAHOO.COM.BR",
      emailOperacionalDpo: "rodrigo.goncalves@kytto.com.br",
      websiteInstitucional: "https://casanova.kytto.com.br",
      portalPlataforma: "https://casanova.kytto.com.br/plataforma/consulta-cpf",
    },
    dpoResponsavel: {
      nome: "Rodrigo Gonçalves",
      email: "rodrigo.goncalves@kytto.com.br",
      cargo: "Encarregado de Proteção de Dados (DPO)",
      baseLegalAtuacao: "Art. 41 da Lei 13.709/2018 (LGPD)",
    },
  },
  seguranca: {
    versaoMotor: "2.2.0-enterprise",
    hashAssinaturaInstitucional: "",
    ambientePadrao: "GCP_PRODUCTION_CLOUD_RUN",
    regiaoGcpPadrao: "southamerica-east1 (São Paulo)",
  },
} as const;

/**
 * Retorna os headers padronizados para autenticação institucional em integrações governamentais e de parceiros
 */
export function getHeadersIntegracaoKytto(solicitante: string = "sistema-imobiliario"): Record<string, string> {
  const agora = new Date().toISOString();
  const tokenIntegridade = createHash("sha256")
    .update(`${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}:${solicitante}:${agora.slice(0, 10)}`)
    .digest("hex");

  return {
    "User-Agent": "Kytto-Consulta360/2.2 (PATRICIA FERRARI PAULINO GONCALVES; CNPJ 53.338.003/0001-04)",
    "X-Kytto-Requester-CNPJ": CONFIG_OFICIAL_KYTTO.empresa.cnpj,
    "X-Kytto-Requester-CNPJ-Clean": CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo,
    "X-Kytto-Organization": CONFIG_OFICIAL_KYTTO.empresa.razaoSocial,
    "X-Kytto-Municipal-Reg": CONFIG_OFICIAL_KYTTO.empresa.inscricaoMunicipal,
    "X-Kytto-IBGE-Origin": CONFIG_OFICIAL_KYTTO.empresa.endereco.codigoIbgeMunicipio,
    "X-Kytto-DPO-Contact": CONFIG_OFICIAL_KYTTO.empresa.contatos.emailOperacionalDpo,
    "X-Kytto-Audit-Integrity": tokenIntegridade,
    "X-Kytto-Environment": process.env.NODE_ENV || "production",
  };
}

/**
 * Gera o carimbo de autenticidade DPO e conformidade LGPD assinado pela empresa Kytto
 */
export function gerarCarimboDpoKytto(protocoloConsulta: string, documentoAlvo: string) {
  const agora = new Date().toISOString();
  const hash = createHash("sha256")
    .update(`${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}|${protocoloConsulta}|${documentoAlvo}|${agora}`)
    .digest("hex");

  return {
    entidadeEmissora: {
      razaoSocial: CONFIG_OFICIAL_KYTTO.empresa.razaoSocial,
      cnpj: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
      inscricaoMunicipal: CONFIG_OFICIAL_KYTTO.empresa.inscricaoMunicipal,
      municipioUf: `${CONFIG_OFICIAL_KYTTO.empresa.endereco.municipio}/${CONFIG_OFICIAL_KYTTO.empresa.endereco.uf}`,
      cnaePrincipal: `${CONFIG_OFICIAL_KYTTO.empresa.cnaePrincipal.codigo} - ${CONFIG_OFICIAL_KYTTO.empresa.cnaePrincipal.descricao}`,
    },
    protocoloAuditoria: protocoloConsulta,
    hashIntegridadeSha256: hash,
    carimboTempo: agora,
    dpoEncarregado: CONFIG_OFICIAL_KYTTO.empresa.dpoResponsavel.nome,
    emailDpo: CONFIG_OFICIAL_KYTTO.empresa.dpoResponsavel.email,
    amparoLegal:
      "Art. 7º, Incisos II (obrigação legal), V (execução de contratos) e IX (legítimo interesse) da Lei 13.709/2018 (LGPD)",
    canalValidacao: `${CONFIG_OFICIAL_KYTTO.empresa.contatos.portalPlataforma}?protocolo=${encodeURIComponent(protocoloConsulta)}`,
  };
}
