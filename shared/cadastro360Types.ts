export interface SocioQSA {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  participacaoPercentual: number;
  pep: boolean; // Pessoa Politicamente Exposta
  beneficiarioFinalUBO: boolean;
  dataEntrada: string;
  documentosValidados: boolean;
  email?: string;
  telefone?: string;
}

export interface ChecagemCompliance {
  status: "nada_consta" | "alerta" | "em_analise";
  dataConsulta: string;
  detalhes?: string;
}

export interface CompliancePLD {
  scoreCompliance: number; // 0 a 100
  nivelRisco: "baixo" | "medio" | "alto" | "critico";
  ultimaVarredura: string;
  proximaRevisao: string;
  ofacSanctions: ChecagemCompliance;
  csnuOnu: ChecagemCompliance;
  ceafGov: ChecagemCompliance;
  cepim: ChecagemCompliance;
  trabalhoEscravoMte: ChecagemCompliance;
  ceisTcu: ChecagemCompliance;
  scrBacenConforme: boolean;
  pepIdentificado: boolean;
  observacoesCompliance: string;
}

export interface AnaliseFinanceiraRating {
  faturamentoUltimos12Meses: number;
  ebitdaAnual: number;
  margemEbitda: number; // ex: 22.4%
  lucroLiquido: number;
  ativoTotal: number;
  patrimonioLiquido: number;
  dividaLiquidaEbitda: number; // ex: 1.25x
  liquidezCorrente: number; // ex: 2.10
  scoreBureau: number; // 0 a 1000
  ratingCMN2682: "AA" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  provisaoPddExigida: number; // % conforme CMN 2.682 (0% a 100%)
  dataUltimoBalanco: string;
  contadorResponsavel: {
    nome: string;
    crc: string;
  };
}

export interface SublimiteProduto {
  produtoId: string;
  produtoNome: string;
  limiteAprovado: number;
  limiteTomado: number;
  limiteDisponivel: number;
  taxaPadraoMes: number; // ex: 1.45%
  status: "ativo" | "bloqueado" | "sob_revisao";
}

export interface LimitesOperacionais {
  limiteGlobalAprovado: number;
  limiteUtilizadoTotal: number;
  limiteDisponivelTotal: number;
  sublimites: SublimiteProduto[];
  dataAprovacaoAlcada: string;
  aprovadoPor: string;
  nivelAlcada: "Analista Pleno" | "Gerente de Risco" | "Diretoria Financeira" | "Comitê Executivo";
  validadeLimite: string;
}

export interface GarantiaColateral {
  id: string;
  tipoGarantia: 
    | "alienacao_fiduciaria_imovel" 
    | "penhor_agricola_cpr" 
    | "cessao_recebiveis_duplicatas" 
    | "fianca_aval_socios" 
    | "alienacao_veiculos_frota";
  descricao: string;
  valorAvaliacao: number;
  valorGarantiaComprometida: number;
  ltvPercentual: number; // Loan-to-Value %
  detalhesRegistro: {
    matriculaOuContrato?: string;
    cartorioOuRegistradora?: string;
    dataRegistro?: string;
    status: "registrada" | "em_prenotacao" | "pendente";
  };
}

export interface OperacaoContratoHistorico {
  id: string;
  numeroContrato: string;
  tipoOperacao: string;
  valorOriginal: number;
  saldoDevedor: number;
  taxaMensal: number;
  dataContratacao: string;
  vencimentoFinal: string;
  parcelasTotal: number;
  parcelasPagas: number;
  pontualidadeHistorica: "100% em dia" | "1 atraso leve < 5d" | "em dia";
  status: "ativo" | "liquidado" | "em_cobranca";
}

export interface ContaGraficaBancoFe {
  banco: string; // "BancoFe S.A. (799)"
  agencia: string; // "0001"
  contaCorrente: string;
  chavePix: string;
  saldoConta: number;
  limiteChequeEspecial: number;
  travaDomicilioBancario: {
    ativa: boolean;
    registradora: "CERC" | "CIP" | "TAG";
    status: "vigente" | "pendente";
    percentualRetencao: number;
  };
}

export interface ClienteEmpresa360 {
  id: string;
  codigo: string; // ex: BFE-360-0101
  razaoSocial: string;
  nomeFantasia: string;
  cnpjCpf: string;
  tipoPessoa: "PJ" | "PF";
  statusCadastral: "homologado" | "em_analise" | "pendente_documentos" | "restricao_compliance" | "bloqueado";
  empresaOrigemId: string; // bancofe, operacoes_financeiras_crm, zuma_agro, etc.
  empresaOrigemNome: string;
  dadosCadastrais: {
    inscricaoEstadual?: string;
    dataFundacao: string;
    porte: "ME" | "EPP" | "MEDIO" | "GRANDE";
    regimeTributario: "Simples Nacional" | "Lucro Presumido" | "Lucro Real";
    cnaePrincipal: { codigo: string; descricao: string };
    cnaesSecundarios: Array<{ codigo: string; descricao: string }>;
    capitalSocial: number;
    faturamentoAnualDeclarado: number;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
    contatos: {
      nomeResponsavel: string;
      cargo: string;
      email: string;
      telefone: string;
      whatsapp: string;
      departamentoFinanceiro?: { nome: string; email: string; telefone: string };
    };
  };
  contaGraficaBancoFe: ContaGraficaBancoFe;
  quadroSocietario: SocioQSA[];
  compliancePLD: CompliancePLD;
  analiseFinanceira: AnaliseFinanceiraRating;
  limitesOperacionais: LimitesOperacionais;
  garantiasColaterais: GarantiaColateral[];
  historicoOperacoes: OperacaoContratoHistorico[];
  percentualCompletudeCadastral: number; // 0 a 100%
  criadoEm: string;
  atualizadoEm: string;
}

export type TipoDocumentoPreCadastro = 
  | "cartao_cnpj"
  | "contrato_social_estatuto"
  | "documento_socios_cnh"
  | "comprovante_sede_endereco"
  | "balanco_patrimonial_dre"
  | "faturamento_12m_pgdas"
  | "cnd_federal_fgts_trabalhista"
  | "declaracao_irpf_socios"
  | "garantia_matricula_ccir"
  | "domicilio_bancario_trava"
  | "declaracao_origem_recursos_pld"
  | "cnd_estadual_municipal"
  | "procuracao_certidao_junta";

export interface DocumentoPreCadastro {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipoDocumento: TipoDocumentoPreCadastro;
  titulo: string;
  obrigatorio: boolean;
  categoria: "cadastral" | "financeiro" | "certidoes" | "garantias" | "compliance";
  status: "pendente_envio" | "em_analise" | "aprovado" | "rejeitado" | "expirado";
  arquivoNome?: string;
  arquivoUrl?: string;
  tamanhoBytes?: number;
  formato?: string;
  hashSha256?: string;
  dataEnvio?: string;
  dataAnalise?: string;
  analisadoPor?: string;
  validadeData?: string;
  diasParaExpirar?: number;
  justificativaRejeicao?: string;
  metadadosExtraidos?: Record<string, any>;
}

export type TipoTermoDigital = 
  | "consentimento_scr_bacen"
  | "abertura_conta_grafica_domicilio"
  | "adesao_pld_ft_compliance"
  | "consentimento_open_finance"
  | "cessao_fiduciaria_recebiveis_trava"
  | "constituicao_garantias_aval"
  | "ccb_eletronica_credito";

export interface TermoDigitalBancoFe {
  id: string;
  codigo: string; // ex: TRM-SCR-2026-001
  tipoTermo: TipoTermoDigital;
  titulo: string;
  normativaReferencia: string;
  clienteId: string;
  clienteNome: string;
  clienteCnpjCpf: string;
  status: "assinado" | "pendente_assinatura" | "minuta_gerada";
  dataGeracao: string;
  dataAssinatura?: string;
  signatarioNome?: string;
  signatarioCpf?: string;
  signatarioIp?: string;
  certificadoDigital?: "ICP-Brasil A1" | "Assinatura Eletrônica Avançada Lei 14.063/20";
  hashIntegridadeSha256: string;
  conteudoMinutaMarkdown: string;
}

export interface MetricasCadastro360 {
  totalClientesCadastrados: number;
  totalEmpresasHomologadas: number;
  totalPendenteDocumentos: number;
  totalRestricaoCompliance: number;
  volumeTotalLimitesAprovados: number;
  volumeTotalLimitesUtilizados: number;
  volumeTotalLimitesDisponiveis: number;
  taxaMediaCompletudeCadastral: number;
  totalDocumentosEmAnalise: number;
  totalTermosAssinados: number;
  totalTermosPendentes: number;
}
