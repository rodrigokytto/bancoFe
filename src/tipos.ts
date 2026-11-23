import { z } from "zod";
import type { DossieBureausCredito } from "./bureaus-credito.ts";
import type { RedeLancamentoGrafoCompleto } from "./grafo-rede-lancamento.ts";
import type { DossieComplianceCgu } from "./integracao-cgu-ceis.ts";
import type { DossiePrevidenciarioInss } from "./integracao-inss-dataprev.ts";
import type { DossiePgfnRegularize } from "./integracao-pgfn-regularize.ts";
import type { DossieOsintMidiasSociais } from "./integracao-redes-sociais-osint.ts";
import type { DossieEleitoralTse } from "./integracao-tse-eleitoral.ts";
import type { DossiePatrimonialAvancado } from "./integracao-veiculos-bens.ts";

/**
 * Esquema de entrada para consulta corporativa pericial 360
 */
export const EntradaConsulta360Schema = z
  .object({
    documentoOuNome: z.string().min(3).max(200).optional(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    nomeCompleto: z.string().min(3).max(200).optional(),
    nome: z.string().min(3).max(200).optional(),
    tipoEntrada: z.enum(["CPF", "CNPJ", "NOME", "AUTO"]).optional().default("AUTO"),
    dataNascimento: z.string().max(15).optional(), // Suporta DD/MM/AAAA ou AAAA-MM-DD
    nomeMae: z.string().max(150).optional(),
    nomePai: z.string().max(150).optional(),
    rg: z.string().max(25).optional(),
    uf: z.string().length(2).optional().default("MT"),
    cidade: z.string().max(100).optional().default("Tangará da Serra"),
    profundidadeGrafo: z.number().int().min(1).max(3).optional().default(2),
    incluirProcessosJudiciais: z.boolean().optional().default(true),
    incluirSocietario: z.boolean().optional().default(true),
    incluirEmpregoRenda: z.boolean().optional().default(true),
    incluirProtestos: z.boolean().optional().default(true),
    incluirEsgSancoes: z.boolean().optional().default(true),
    incluirHistoricoPolitico: z.boolean().optional().default(true),
    incluirMarcasInpi: z.boolean().optional().default(true),
    incluirBureausCredito: z.boolean().optional().default(true),
    ativarIaGcp: z.boolean().optional().default(true),
    forcarAtualizacao: z.boolean().optional().default(false),
  })
  .refine((dados) => Boolean(dados.documentoOuNome || dados.cpf || dados.cnpj || dados.nomeCompleto || dados.nome), {
    message: "É obrigatório fornecer pelo menos um identificador: 'documentoOuNome', 'cpf', 'cnpj' ou 'nomeCompleto'.",
  });

export type EntradaConsulta360 = z.input<typeof EntradaConsulta360Schema>;
export type EntradaConsulta360Processada = z.output<typeof EntradaConsulta360Schema>;

export interface IdentificacaoCadastral {
  documento: string; // CPF ou CNPJ formatado
  documentoLimpo: string;
  tipoPessoa: "PF" | "PJ";
  nomeCompleto: string;
  nomeSocial?: string;
  nomeMae?: string;
  dataNascimentoOuFundacao: string;
  idadeOuTempoAtividadeAnos: number;
  situacaoCadastralRfb: "REGULAR" | "ATIVA" | "SUSPENSA" | "INAPTA" | "BAIXADA" | "NULA";
  dataSituacaoCadastral: string;
  digitoVerificadorModulo11Valido: boolean;
  regiaoFiscalRfb: {
    regiao: string;
    estados: string[];
    sedeFiscal: string;
  };
  tituloEleitor?: {
    numero: string;
    zona: string;
    secao: string;
    municipio: string;
    uf: string;
    biometriaColetada: boolean;
    situacao: "REGULAR" | "CANCELADO" | "SUSPENSO";
  };
  cnh?: {
    numeroRegistro: string;
    categoria: string;
    detranEmissor: string;
    validade: string;
    primeiraHabilitacao: string;
    pontosAtivos: number;
  };
  telefones: Array<{
    numero: string;
    ddd: string;
    tipo: "CELULAR" | "FIXO" | "WHATSAPP" | "COMERCIAL";
    confianca: number;
  }>;
  emails: Array<{ endereco: string; confianca: number; validado: boolean }>;
  enderecos: Array<{
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    tipo: "RESIDENCIAL" | "COMERCIAL" | "FISCAL";
    tempoResidenciaMeses?: number;
  }>;
}

export interface DadoEscolaridade {
  nivelInstrucao:
    | "SUPERIOR_COMPLETO"
    | "POS_GRADUACAO"
    | "MESTRADO_DOUTORADO"
    | "MEDIO_COMPLETO"
    | "FUNDAMENTAL"
    | "NAO_INFORMADO";
  cursoPrincipal?: string;
  instituicao?: string;
  anoConclusao?: number;
  registroProfissional?: {
    conselho: "CREA" | "OAB" | "CRM" | "CRC" | "CRECI" | "OUTRO";
    numero: string;
    uf: string;
    situacao: "ATIVO" | "REGULAR" | "INATIVO";
  };
}

export interface VinculoEmpregaticio {
  razaoSocialEmpregador: string;
  cnpjEmpregador: string;
  cargo: string;
  cbo: string;
  dataAdmissao: string;
  dataDemissao?: string;
  vinculoAtivo: boolean;
  tipoVinculo: "CLT" | "ESTATUTARIO" | "PJ" | "AUTONOMO";
  salarioEstimadoCentavos: number;
  estabilidadeAnos: number;
  fonte: "CAGED" | "RAIS" | "eSocial" | "DECLARADO";
}

export interface VinculoSocietario {
  cnpjEmpresa: string;
  razaoSocial: string;
  nomeFantasia?: string;
  qualificacaoSocio: string; // Ex: "49-Sócio-Administrador"
  participacaoCapitalPercentual: number;
  capitalSocialCentavos: number;
  dataEntradaSociedade: string;
  situacaoCadastralEmpresa: "ATIVA" | "BAIXADA" | "INAPTA" | "SUSPENSA";
  naturezaJuridica: string;
  cnaePrincipalCodigo: string;
  cnaePrincipalDescricao: string;
  faturamentoPresumidoAnualCentavos: number;
  quantidadeSocios: number;
  outrosSocios: Array<{ nome: string; documentoParcial: string; qualificacao: string }>;
}

export interface VinculoFamiliar {
  nome: string;
  documentoParcial?: string;
  grauParentesco: "CONJUGE" | "PAI" | "MAE" | "FILHO" | "IRMAO" | "SOCIO_FAMILIAR";
  baseLegalComprovacao:
    | "CERTIDAO_CASAMENTO"
    | "DECLARACAO_IRPF"
    | "CADASTRO_SIRC"
    | "JUCEMAT"
    | "REGISTRO_CIVIL_NOTARIAL"
    | "DECLARACAO_BUSCA";
  nivelCerteza: "OFICIAL_NOTARIAL" | "DECLARADO" | "ALTA_PROBABILIDADE";
  vinculoConfirmado?: boolean;
}

export interface BemPatrimonial {
  tipo: "IMOVEL_URBANO" | "IMOVEL_RURAL" | "VEICULO" | "AERONAVE" | "EMBARCACAO" | "PARTICIPACAO_EMPRESARIAL";
  descricao: string;
  identificador: string; // Matrícula, Placa/Renavam, Prefixo RAB
  cartorioOuRegistro?: string;
  cidade: string;
  uf: string;
  valorEstimadoCentavos: number;
  alienacaoFiduciariaOuOnus: boolean;
  detalhesOnus?: string;
}

export interface ProcessoJudicial {
  numeroProcesso: string;
  tribunal: string; // Ex: "TJMT", "TRT23", "TRF1", "STJ"
  classe: string; // Ex: "Execução Fiscal", "Cobrança", "Ação Trabalhista", "Ordinária"
  assunto: string;
  polo: "AUTOR" | "REU" | "INTERESSADO" | "TESTEMUNHA";
  dataDistribuicao: string;
  valorCausaCentavos: number;
  situacao: "EM_ANDAMENTO" | "ARQUIVADO" | "SUSPENSO" | "JULGADO";
  comarcaVara: string;
  riscoImpactoCredito: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
}

export interface CertidaoRegularidade {
  tipo:
    | "RECEITA_PGFN_FEDERAL"
    | "CNDT_TRABALHISTA"
    | "TCU_INABILITADOS"
    | "TCE_MT_GESTORES"
    | "CNJ_IMPROBIDADE_FICHALIMPA"
    | "CNJ_BNMP_PRISAO";
  emissao: string;
  validadeAte: string;
  situacao: "CERTIDAO_NEGATIVA" | "CERTIDAO_POSITIVA_COM_EFEITO_NEGATIVA" | "COM_APONTAMENTOS_DEBITO" | "NADA_CONSTA";
  codigoAutenticidade: string;
  orgaoEmissor: string;
}

export interface ProtestoCartorio {
  cartorio: string;
  comarca: string;
  uf: string;
  dataProtesto: string;
  valorProtestadoCentavos: number;
  cedenteOuCredor: string;
  situacao: "PROTESTADO" | "SUSTADO" | "CANCELADO";
}

export interface InfracaoEsgSancao {
  tipo:
    | "EMBARGO_IBAMA"
    | "DESMATAMENTO_SEMA_MT"
    | "TRABALHO_ESCRAVO_MTE"
    | "CEIS_INIDONEOS"
    | "CNEP_PUNICOES"
    | "CEPIM_IMPEDIDOS";
  orgao: string;
  numeroTermoAutuacao: string;
  dataRegistro: string;
  municipio: string;
  uf: string;
  motivo: string;
  gravidade: "ALTA" | "CRITICA" | "MEDIA";
}

export interface HistoricoPoliticoEleitoral {
  candidatoEleicoes: Array<{
    ano: number;
    cargo: string;
    partido: string;
    numeroUrna: string;
    municipio: string;
    uf: string;
    resultado: "ELEITO" | "SUPLENTE" | "NAO_ELEITO";
    bensDeclaradosCentavos: number;
  }>;
  doacoesEleitoraisOficiais: Array<{
    ano: number;
    beneficiario: string;
    cargoDisputado: string;
    partido: string;
    valorDoadoCentavos: number;
  }>;
}

export interface MarcaPatenteInpi {
  numeroProcesso: string;
  tituloOuMarca: string;
  natureza: "MARCA_MISTA" | "MARCA_NOMINATIVA" | "PATENTE_INVENCAO" | "MODELO_UTILIDADE";
  classeNice: string;
  dataDeposito: string;
  situacao: "REGISTRADA" | "EM_EXAME" | "EXTINTA";
}

export interface CapacidadePagamentoCredito {
  rendaEstimadaMensalCentavos: number;
  faixaRendaMensalDescricao: string;
  faturamentoPresumidoSocietarioCentavos: number;
  patrimonioLiquidoEstimadoCentavos: number;
  scoreKytto360: number; // 0 a 1000
  classificacaoRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC" | "D";
  comprometimentoRendaEstimadoPercentual: number;
  limiteMensalLocacaoRecomendadoCentavos: number;
  limiteFinanciamentoImobiliarioSugeridoCentavos: number;
  indicePontualidadePagamento: number; // 0 a 100
  cincoCsDoCredito: {
    carater: { score: number; parecer: string }; // Histórico moral e pontualidade
    capacidade: { score: number; parecer: string }; // Fluxo de caixa e renda mensal
    capital: { score: number; parecer: string }; // Patrimônio líquido e reservas
    colateral: { score: number; parecer: string }; // Garantias reais disponíveis
    condicoes: { score: number; parecer: string }; // Cenário de mercado e estabilidade
  };
  parecerMesaCredito: string;
}

export interface NoGrafo360 {
  id: string;
  rotulo: string;
  subtitulo?: string;
  tipo:
    | "titular"
    | "pessoa_fisica"
    | "empresa"
    | "socio"
    | "familiar"
    | "empregador"
    | "imovel"
    | "imovel_rural"
    | "veiculo"
    | "aeronave"
    | "embarcacao"
    | "midia_social"
    | "osint_midia"
    | "processo"
    | "banco"
    | "orgao_publico"
    | "sancao_cgu"
    | "divida_ativa_pgfn"
    | "beneficio_inss"
    | "quitacao_tse"
    | "protesto"
    | "endereco"
    | "chave_pix"
    | "empreendimento"
    | "incorporadora"
    | "construtora"
    | "imobiliaria"
    | "corretor"
    | "unidade_lote"
    | "cartorio_ri"
    | "hobby_esporte"
    | "clube_associacao"
    | "conselho_classe"
    | "academico_lattes"
    | "habilitacao_nautica_aero"
    | "certidao";
  categoria:
    | "titular"
    | "societario"
    | "familiar"
    | "profissional"
    | "patrimonio"
    | "judicial"
    | "financeiro"
    | "compliance_risco"
    | "governamental"
    | "contato_localizacao"
    | "cadastral"
    | "compliance"
    | "marketing_osint"
    | "hobbies_estilo_vida"
    | "conselho_profissional"
    | "formacao_academica"
    | "rede_lancamento";
  grauDistancia: number; // 0 (titular), 1 (direto), 2 (segundo grau), 3 (terceiro grau)
  documentoOuReferencia?: string;
  centralidadeGrau: number;
  centralidadeIntermediacao?: number;
  centralidadeProximidade?: number;
  isHub: boolean;
  nivelRisco?: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  corHex?: string;
  icone?: string;
  pesoConexoes: number;
  detalhes: Record<string, any>;
  x?: number;
  y?: number;
}

export interface ArestaGrafo360 {
  id: string;
  de: string;
  para: string;
  tipo:
    | "SOCIO_DE"
    | "ADMINISTRADOR_DE"
    | "CONJUGE_DE"
    | "FILHO_DE"
    | "PAI_DE"
    | "EMPREGADO_DE"
    | "PROPRIETARIO_DE"
    | "PROPRIETARIO_DE_VEICULO"
    | "PROPRIETARIO_DE_FAZENDA"
    | "PROPRIETARIO_DE_AERONAVE"
    | "PERFIL_LINKEDIN_OSINT"
    | "PERFIL_INSTAGRAM_OSINT"
    | "PERFIL_TIKTOK_OSINT"
    | "PARTE_EM_PROCESSO"
    | "AVALISTA_DE"
    | "PROTESTADO_POR"
    | "DOADOR_DE"
    | "MAE_DE"
    | "FILIACAO_DE"
    | "SANCAO_APLICADA_POR"
    | "DEVEDOR_DAU"
    | "BENEFICIARIO_DE"
    | "ELEITOR_INSCRITO"
    | "RESIDE_EM"
    | "TITULAR_CHAVE_PIX"
    | "COLIGADA_DE"
    | "HOLDING_DE"
    | "INCORPORADORA_DE"
    | "COMERCIALIZADOR_DE"
    | "REGISTRADO_EM"
    | "APROVACAO_BANCARIA"
    | "INTERMEDIACAO_COMERCIAL"
    | "UNIDADE_DE"
    | "VENDA_INTERMEDIADA"
    | "PROPOSTA_COMPRA"
    | "FINANCIAMENTO_HABITACIONAL"
    | "INDICACAO_MEMBER_GET_MEMBER"
    | "PRATICA_HOBBY"
    | "MEMBRO_CLUBE_SERVICO"
    | "INSCRITO_CONSELHO_CLASSE"
    | "FORMACAO_ACADEMICA_LATTES"
    | "HABILITADO_MARINHA_DPC"
    | "HABILITADO_ANAC"
    | (string & {});
  rotulo: string;
  descricaoJuridica: string;
  confiancaPercentual: number;
  baseLegal: string;
  observadoEm: string;
}

export interface MetricasRedeGrafo {
  totalNos: number;
  totalArestas: number;
  densidadeRede: number; // 0 a 1
  diametroRede: number;
  grauMedioConectividade: number;
  noHubPrincipalId: string;
  noHubPrincipalRotulo: string;
  holdingsSocietariasDetectadas: string[];
  clustersIdentificados: number;
  coeficienteAgrupamentoMedio?: number;
  alertaLaranjaDetectado?: boolean;
  detalhesLaranja?: string[];
  alertaEmpresaFachadaDetectada?: boolean;
  detalhesEmpresaFachada?: string[];
  comunidades?: Array<{ id: number; nome: string; membrosCount: number; membrosPrincipais: string[] }>;
  nosRiscoCriticoCount?: number;
  riscoSistemicoRede: "BAIXO" | "MODERADO" | "ELEVADO" | "CRITICO";
}

export interface SinteseIaGcp {
  contaGcpVinculada: string; // "rodrigo.goncalves@kytto.com.br"
  modeloUtilizado: string; // "gemini-2.5-flash"
  geradoEm: string;
  resumoExecutivoDiligencia: string;
  perfilSocioeconomicoComportamental: string;
  propensaoSetorialImobiliaria: {
    perfilInvestidorRenda: { score: number; justificativa: string };
    perfilPrimeiraMoradia: { score: number; justificativa: string };
    perfilLoteamentoFechado: { score: number; justificativa: string };
    perfilAgronegocioFazendasMT: { score: number; justificativa: string };
    perfilLocatarioComercial: { score: number; justificativa: string };
  };
  alertasDiligenciaisCompliance: string[];
  recomendacoesMesaDecisao: string[];
}

export interface QualificacaoCivilNotarial {
  rg: string;
  rgOrgaoEmissor: string;
  rgDataExpedicao: string;
  naturalidade: string;
  nacionalidade: string;
  tituloEleitor?: string;
  zonaEleitoral?: string;
  secaoEleitoral?: string;
  pisPasep?: string;
  filiacaoMaeCompleta: string;
  filiacaoPaiCompleta: string;
  registroCivilCartorio: string;
  registroCivilLivroTermo: string;
}

export interface DadosEleitoraisTSE {
  tituloEleitor: string;
  zona: string;
  secao: string;
  municipio: string;
  uf: string;
  situacao: "REGULAR" | "CANCELADO" | "SUSPENSO";
  biometriaColetada: boolean;
  quitacaoEleitoral: boolean;
  certidaoQuitacaoProtocolo?: string;
}

export interface RegistroCivilSIRC {
  numeroMatriculaRegistroCivil: string;
  cartorioCns: string;
  cartorioNome: string;
  livro: string;
  folha: string;
  termo: string;
  tipoAssento: "NASCIMENTO" | "CASAMENTO" | "OBITO";
  dataRegistro: string;
}

export interface CnhDigitalSenatran {
  numeroRegistro: string;
  categoria: string;
  detranUf: string;
  validade: string;
  primeiraHabilitacao: string;
  prontuarioRenach: string;
  pontosAtivos: number;
  impedimentos: boolean;
}

export interface ComprovantesConcessionarias {
  energiaEletrica: {
    concessionaria: string;
    codigoUc: string;
    titularidadeConfirmada: boolean;
    consumoMedioKwh: number;
    statusFaturas: "EM_DIA" | "EM_ATRASO";
  };
  saneamentoAgua: {
    concessionaria: string;
    numeroLigacaoHidrometro: string;
    titularidadeConfirmada: boolean;
    statusFaturas: "EM_DIA" | "EM_ATRASO";
  };
}

export interface DeclaracaoIrpfRfb {
  exercicioFiscal: string;
  tipoDeclaracao: "COMPLETA" | "SIMPLIFICADA";
  rendimentosTributaveisCentavos: number;
  impostoDevidoPagoCentavos: number;
  restituicaoRecebidaCentavos: number;
  totalBensDeclaradosCentavos: number;
  statusProcessamentoRfb: "PROCESSADA" | "EM_MALHA" | "RETIFICADA";
}

export interface ExtratoFgtsCaixa {
  saldoDisponivelParaHabitacaoCentavos: number;
  tempoTotalContribuicaoMeses: number;
  contasAtivas: number;
  contasInativas: number;
  bancoCustodiante: "CAIXA ECONOMICA FEDERAL";
  elegivelUsoFgtsFinanciamento: boolean;
}

export interface FontesConfiaveisAvancadas {
  tcuContasIrregulares: { status: string; certidao: string; validade: string };
  tceMtContasJurisdicionados: { status: string; protocolo: string };
  cnjBnmpMandadosPrisao: { mandadosAtivos: number; certidaoAutenticada: string };
  cnjCniaImprobidade: { condenaçõesAtivas: number; parecer: string };
  pgfnDividaAtivaUniao: { inscricoesAtivas: number; valorTotalCentavos: number; cpend: string };
  trt23CeatTrabalhista: { processosExecucao: number; certidaoNumero: string; comarca: string };
  censecNotarialNacional: {
    rctoTestamentos: string;
    cesdiEscriturasInventarios: string;
    cepProcuracoes: string;
  };
  ibamaSemaAmbiental: {
    embargosIbama: number;
    situacaoCarMt: string;
    protocoloCar: string;
  };
}

export interface TelemetriaClusterMled {
  nosAtivos: Array<{
    id: string;
    nome: string;
    status: "OPERACIONAL" | "DEGRADADO" | "OFFLINE";
    latenciaMs: number;
    uptimePercent: number;
  }>;
  serproGatewayStatus: "ONLINE" | "CONTINGENCIA";
  tempoMedioRespostaMs: number;
  totalConsultasHoje: number;
  disponibilidadeGeral: number;
}

export interface DossieConsulta360Completo extends Partial<DossieConsulta360Extensao> {
  protocoloConsulta: string;
  consultadoEm: string;
  tempoProcessamentoMs: number;
  tenantId: string;
  usuarioSolicitante: string;
  conformidadeLgpd: {
    baseLegalPrincipal: string; // "Art. 7º, II, V e IX da Lei 13.709/2018 (Cumprimento de Obrigação Legal e Legítimo Interesse)"
    finalidade: string;
    hashIntegridadeSha256: string;
    termoConsentimentoId?: string;
  };
  identificacao: IdentificacaoCadastral;
  escolaridade: DadoEscolaridade;
  empregoRenda: VinculoEmpregaticio[];
  societarioQsa: VinculoSocietario[];
  familiares: VinculoFamiliar[];
  patrimonio: BemPatrimonial[];
  processos: ProcessoJudicial[];
  certidoes: CertidaoRegularidade[];
  protestos: ProtestoCartorio[];
  esgSancoes: InfracaoEsgSancao[];
  historicoPolitico: HistoricoPoliticoEleitoral;
  marcasPatentes: MarcaPatenteInpi[];
  capacidadeCredito: CapacidadePagamentoCredito;
  grafo: {
    nos: NoGrafo360[];
    arestas: ArestaGrafo360[];
    metricas: MetricasRedeGrafo;
  };
  sinteseIaGcp: SinteseIaGcp;
}

export interface DossieConsulta360Extensao {
  // Campos Enriquecidos Oficiais de https://casanova.kytto.com.br/plataforma/consulta-cpf
  entidadeEmissoraKytto: {
    razaoSocial: string;
    cnpj: string;
    inscricaoMunicipal: string;
    municipioUf: string;
    cnaePrincipal: string;
    dpoResponsavel: string;
    canalValidacao: string;
  };
  qualificacaoCivil?: QualificacaoCivilNotarial;
  dadosEleitoraisTSE?: DadosEleitoraisTSE;
  registroCivilSIRC?: RegistroCivilSIRC;
  cnhDigitalSenatran?: CnhDigitalSenatran;
  comprovantesConcessionarias?: ComprovantesConcessionarias;
  declaracaoIrpfRfb?: DeclaracaoIrpfRfb;
  extratoFgtsCaixa?: ExtratoFgtsCaixa;
  fontesConfiaveisAvancadas?: FontesConfiaveisAvancadas;
  telemetriaClusterMled?: TelemetriaClusterMled;
  cotacoesMoedasBacen?: {
    dolarPtaxVenda: number;
    dolarPtaxCompra: number;
    euroPtaxVenda: number;
    selic: number;
    cdi: number;
    ipca: number;
    coletadoEm: string;
  };
  patrimonioVeiculosBens?: DossiePatrimonialAvancado;
  osintMidiasSociais?: DossieOsintMidiasSociais;
  redeLancamentoGrafo?: RedeLancamentoGrafoCompleto;
  hobbiesInteressesLifestyle?: DossieHobbiesInteressesLifestyle;
  pixValidadorAuditado?: {
    chavePixInformada?: string;
    tipoChavePix?: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "EVP_ALEATORIA" | "INVALIDA";
    validoDictBacen: boolean;
    mascaraSegura?: string;
  };
  desambiguacaoHomonimosIa?: {
    totalCandidatosIdentificados: number;
    statusDesambiguacao: "UNIVOCO" | "HOMONIMO_PROVAVEL" | "DESAMBIGUADO_COM_CERTEZA";
    candidatos: Array<{
      nomeCompleto: string;
      cpfParcial: string;
      nomeMae: string;
      dataNascimento: string;
      municipioUf: string;
      grauSimilaridadePercentual: number;
      criterioDesempate: string;
      selecionado: boolean;
    }>;
    parecerIaDesambiguacao: string;
  };
  bureausCredito?: DossieBureausCredito;
  complianceCgu?: DossieComplianceCgu;
  eleitoralTse?: DossieEleitoralTse;
  previdenciarioInss?: DossiePrevidenciarioInss;
  fiscalPgfnDau?: DossiePgfnRegularize;
  apisPublicasAvancadas?: import("./integracao-apis-publicas-avancadas.ts").DossieApisPublicasAvancadas;
  parametrosBuscaAvancada?: {
    cpfInformado?: string;
    dataNascimentoInformada?: string;
    nomeMaeInformado?: string;
    nomePaiInformado?: string;
    rgInformado?: string;
  };
}

export interface DiagnosticoIntegracaoIndividual {
  id: string;
  nome: string;
  categoria:
    | "GOVERNAMENTAL"
    | "BUREAU_CREDITO"
    | "COMPLIANCE_SANCOES"
    | "PREVIDENCIA"
    | "ELEITORAL"
    | "FISCAL_DAU"
    | "JUDICIAL"
    | "IA_GENERATIVA"
    | "FINANCEIRO_CARTEIRA"
    | "SISTEMA_MONETARIO"
    | "OSINT_MIDIAS"
    | "HOBBIES_INTERESSES"
    | "ACADEMICO_LATTES"
    | "CONSELHOS_CLASSE"
    | "REDE_LANCAMENTO";
  status: "ONLINE_OPERACIONAL" | "DEGRADADO" | "OFFLINE";
  tempoRespostaMs: number;
  entidadeVinculada: string;
  sucesso: boolean;
  mensagem: string;
  dadosAmostra?: Record<string, any>;
  detalhesTecnicos?: string;
}

export interface EsporteHobbyItem {
  nome: string;
  categoria:
    | "ESPORTE_RAQUETE"
    | "CICLISMO_ATLETISMO"
    | "TIRO_CAC"
    | "GOLFE_HIPISMO"
    | "NAUTICA_PESCA"
    | "AUTOMOBILISMO_4X4"
    | "OUTRO";
  federacaoOuEntidade: string;
  nivelPratica: "AMADOR" | "FEDERADO" | "COMPETIDOR" | "ENTUSIASTA";
  detalhesOuRanking?: string;
  locaisFrequentes?: string[];
}

export interface HabilitacaoEspecialItem {
  tipo:
    | "ARRAIS_AMADOR"
    | "MESTRE_AMADOR"
    | "CAPITAO_AMADOR"
    | "MOTONAUTA"
    | "PILOTO_PRIVADO_ANAC"
    | "PILOTO_COMERCIAL_ANAC"
    | "CAC_ATIRADOR_DESPORTIVO"
    | "CAC_COLECIONADOR"
    | "GUIA_TURISMO_CADASTUR";
  orgaoEmissor: "MARINHA_DO_BRASIL" | "ANAC" | "EXERCITO_BRASILEIRO" | "MINISTERIO_TURISMO";
  numeroRegistroOuLicenca: string;
  validade: string;
  status: "ATIVO_REGULAR" | "EM_RENOVACAO" | "SUSPENSO";
  observacao?: string;
}

export interface ClubeAssociacaoItem {
  nomeEntidade: string;
  tipo: "CLUBE_SERVICO" | "ASSOCIACAO_EMPRESARIAL" | "CLUBE_SOCIAL_ESPORTIVO" | "FRATERNIDADE";
  cargoOuFuncao: string;
  anoIngresso: number;
  status: "ATIVO" | "HONORARIO" | "EGRESSO";
  cidadeUf: string;
}

export interface ProducaoAcademicaELattes {
  idLattesCnpq?: string;
  nivelEscolaridade:
    | "ENSINO_MEDIO"
    | "ENSINO_SUPERIOR_COMPLETO"
    | "POS_GRADUACAO_LATO_SENSU"
    | "MESTRADO"
    | "DOUTORADO"
    | "POS_DOUTORADO";
  cursosGraduacao: Array<{ curso: string; instituicao: string; anoConclusao: number }>;
  posGraduacoesEMba: Array<{ curso: string; instituicao: string; anoConclusao: number }>;
  linhasPesquisaEArtigos: string[];
  patentesOuSoftwaresRegistradosInpi: string[];
  resumoPerfilAcademico: string;
}

export interface RegistroConselhoClasseItem {
  siglaConselho: "OAB" | "CFM" | "CREA" | "CAU" | "CRC" | "CRA" | "CRECI" | "CORECON";
  nomeConselho: string;
  numeroInscricao: string;
  seccionalUf: string;
  situacao: "ATIVO_REGULAR" | "SUSPENSO" | "CANCELADO" | "LICENCIADO";
  dataInscricao: string;
  especialidadesOuRqe: string[];
}

export interface AfinidadeMarcasEConsumo {
  marcasPreferidas: string[];
  interessesConsumo: string[];
  estiloViagens: string[];
  doacoesEleitoraisOficiaisTse: Array<{
    anoEleicao: number;
    candidatoOuPartido: string;
    valorCentavos: number;
    cargo: string;
  }>;
  scoreAfinidadeMercadoAltoPadrao: number; // 0 a 100
}

export interface DossieHobbiesInteressesLifestyle {
  documentoConsultado: string;
  nomeConsultado: string;
  esportesHobbies: EsporteHobbyItem[];
  habilitacoesEspeciais: HabilitacaoEspecialItem[];
  clubesEAssociacoes: ClubeAssociacaoItem[];
  producaoAcademicaELattes: ProducaoAcademicaELattes;
  conselhosDeClasse: RegistroConselhoClasseItem[];
  afinidadeMarcasEConsumo: AfinidadeMarcasEConsumo;
  sinteseComportamentalLifestyle: string;
  consultadoEm: string;
  fonteOficial: string;
}

export interface RelatorioValidacaoIntegracoes {
  totalIntegracoes: number;
  integracoesOperacionais: number;
  taxaDisponibilidadePercentual: number;
  tempoMedioRespostaMs: number;
  geradoEm: string;
  entidadeAuditora: {
    razaoSocial: string;
    cnpj: string;
    ambiente: string;
  };
  diagnosticos: DiagnosticoIntegracaoIndividual[];
}
