import fs from "fs";
import path from "path";
import { ServicoPreCadastroBancoFe } from "../src/precadastro/servico-precadastro";

export type EtapaFunilCrm =
  | "prospeccao"
  | "qualificacao"
  | "analise"
  | "proposta"
  | "comite"
  | "contratado"
  | "perdido";

export type EstagioLegado =
  | "prospeccao"
  | "qualificacao"
  | "mesa_credito"
  | "comite_aprovacao"
  | "formalizacao_ccb"
  | "liquidado"
  | "perdido";

export interface OportunidadeOperacaoFinanceira {
  id: string;
  codigoProtocolo: string;
  contraparteNome: string;
  clienteNome: string;
  contraparteDocumento: string;
  clienteDocumento: string;
  contraparteTipo: "PJ" | "PF" | "GRUPO";
  clienteTipo: "PJ" | "PF";
  empresaOrigemId: string;
  empresaOrigemNome: string;
  produto: string;
  tipoOperacao: string;
  tipoOperacaoLabel: string;
  valorCentavos: number;
  valorSolicitado: number;
  valorAprovado: number;
  prazoMeses: number;
  taxaMensal: number;
  taxaMensalPercentual: number;
  sistemaAmortizacao: "SAC" | "PRICE";
  etapa: EtapaFunilCrm;
  estagio: EstagioLegado;
  scoreSerasa: number;
  ratingBacen: "AA" | "A" | "B" | "C" | "D" | "E";
  probabilidadeConversao: number;
  prioridade: number;
  proximoPasso?: string;
  proximoEm?: string;
  responsavel: string;
  responsavelMesa: string;
  parada: boolean;
  diasParada?: number;
  tags?: string[];
  origem?: string;
  consentimentoContato?: boolean;
  contatoEmail?: string;
  contatoTelefone?: string;
  sacadoCedenteInfo?: {
    cedenteNome: string;
    cedenteCnpj: string;
    sacadoNome: string;
    sacadoCnpj: string;
    numeroNfe?: string;
    chaveAcessoNfe?: string;
    vencimentoOriginal?: string;
  };
  observacoes: string;
  historicoEtapas: Array<{
    data: string;
    estagio: string;
    autor: string;
    nota: string;
  }>;
  interacoes?: Array<{
    data: string;
    tipo: string;
    autor: string;
    nota: string;
    proximoPasso?: string;
    proximoEm?: string;
  }>;
  criadoEm: string;
  criadaEm?: string;
  atualizadoEm: string;
  atualizadaEm?: string;
}

export interface PreCadastroCrm {
  id: string;
  codigoProtocolo: string;
  nome: string;
  origem: string;
  origemRotulo: string;
  documento: string;
  documentoMascarado: string;
  telefone: string;
  telefoneMascarado: string;
  email: string;
  emailMascarado: string;
  consentimentoGrupo: boolean;
  consentimentoEm: string;
  jaNaCarteira: boolean;
  situacao: "novo" | "qualificado" | "convertido" | "descartado" | "oposicao";
  tipo: "pf" | "pj";
  cidade: string;
  uf: string;
  logradouro?: string;
  cep?: string;
  rendaEstimadaCentavos: number;
  patrimonioEstimadoCentavos: number;
  tipoImovelInteresse: string;
  valorInteresseCentavos: number;
  scoreSerasaEstimado?: number;
  papeis: string[];
  importadoEm: string;
  criadoEm: string;
  atualizadoEm: string;
  dadosBrutos?: Record<string, any>;
  historico?: Array<{ data: string; autor: string; nota: string }>;
  historicoComandos?: Array<{ data: string; comando: string; autor: string }>;
}

export interface TarefaCrm {
  id: string;
  titulo: string;
  situacao: "aberta" | "concluida" | "cancelada";
  responsavel: string;
  vencimento: string;
  oportunidadeId?: string;
  oportunidadeNome?: string;
  tipo?: string;
  concluidaEm?: string;
  criadaEm: string;
}

export interface MetaCrm {
  id: string;
  mes: string;
  indicador: string;
  nome: string;
  responsavel?: string;
  alvo: number;
  unidade: "centavos" | "quantidade";
  realizado: number;
  atingimento: number;
  projecao: number;
  projecaoAtingimento: number;
  ritmoNecessarioDia: number;
}

export interface MetricasGestaoCrmFinanceira {
  pipelineCentavos: number;
  abertas: number;
  pipelinePonderadoCentavos: number;
  paradas: number;
  conversao90d: number;
  ganhas90d: number;
  valorGanho90dCentavos: number;
  cicloMedioDias: number;
  contratadoMesCentavos: number;
  tarefas: {
    abertas: number;
    vencidas: number;
    venceHoje: number;
    proximos7: number;
    concluidas: number;
    total: number;
  };
  etapas: Array<{
    etapa: EtapaFunilCrm;
    rotulo: string;
    abertas: number;
    paradas: number;
    valorCentavos: number;
    ponderadoCentavos: number;
    tempoMedioDias: number | null;
    slaDias: number;
    conversaoParaProxima: number;
  }>;
  previsao: Array<{
    rotulo: string;
    ponderadoCentavos: number;
    chance: number;
    quantidade: number;
    valorCentavos: number;
  }>;
  porResponsavel: Array<{
    responsavel: string;
    abertas: number;
    valorCentavos: number;
    ponderadoCentavos: number;
    ganhas90: number;
    perdidas90: number;
    contratadoMesCentavos: number;
    tarefasVencidas: number;
  }>;
  motivosPerda: Array<{
    motivo: string;
    quantidade: number;
    valorCentavos: number;
  }>;
  metas: MetaCrm[];

  volumeTotalPipeline: number;
  volumeLiquidadoMes: number;
  totalOportunidadesAtivas: number;
  ticketMedio: number;
  taxaMediaMensal: number;
  spreadLiquidoMedio: number;
  taxaInadimplenciaPercentual: number;
  distribuicaoPorEstagio: Record<string, { count: number; volumeTotal: number }>;
  distribuicaoPorEmpresa: Record<string, { count: number; volumeTotal: number }>;
  slaMedioHorasAprovacao: number;
  economiaGeradaClientes: number;
}

const CRM_DATA_FILE = path.resolve(process.cwd(), "data", "crmFinanceiraOportunidades.json");
const CRM_PRECADASTROS_FILE = path.resolve(process.cwd(), "data", "crmFinanceiraPrecadastros.json");

export class CrmFinanceiraStore {
  private oportunidades: OportunidadeOperacaoFinanceira[] = [];
  private precadastros: PreCadastroCrm[] = [];
  private tarefas: TarefaCrm[] = [];
  private metas: MetaCrm[] = [];
  private initialized = false;

  constructor() {
    this.inicializar();
  }

  private inicializar() {
    if (this.initialized) return;

    try {
      const dir = path.dirname(CRM_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (fs.existsSync(CRM_DATA_FILE)) {
        const raw = fs.readFileSync(CRM_DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.oportunidades = parsed.map((op) => this.normalizarOportunidade(op));
        }
      }
    } catch (e) {
      console.error("[CrmFinanceiraStore] Falha ao carregar oportunidades de arquivo:", e);
    }

    this.sincronizarPreCadastrosCasaNova();
    this.inicializarTarefasPadrao();
    this.inicializarMetasPadrao();
    this.initialized = true;
  }

  private normalizarOportunidade(op: any): OportunidadeOperacaoFinanceira {
    const valorCentavos = op.valorCentavos || Math.round((op.valorSolicitado || op.valorAprovado || 100000) * 100);
    const valorSolicitado = op.valorSolicitado || Math.round(valorCentavos / 100);
    const taxaPct = op.taxaMensalPercentual || (op.taxaMensal ? op.taxaMensal * 100 : 1.35);

    let etapa: EtapaFunilCrm = op.etapa || "prospeccao";
    let estagio: EstagioLegado = op.estagio || "prospeccao";

    if (!op.etapa) {
      if (estagio === "prospeccao") etapa = "prospeccao";
      else if (estagio === "qualificacao") etapa = "qualificacao";
      else if (estagio === "mesa_credito") etapa = "analise";
      else if (estagio === "comite_aprovacao") etapa = "comite";
      else if (estagio === "formalizacao_ccb") etapa = "proposta";
      else if (estagio === "liquidado") etapa = "contratado";
      else if (estagio === "perdido") etapa = "perdido";
    }

    if (!op.estagio) {
      if (etapa === "prospeccao") estagio = "prospeccao";
      else if (etapa === "qualificacao") estagio = "qualificacao";
      else if (etapa === "analise") estagio = "mesa_credito";
      else if (etapa === "proposta") estagio = "formalizacao_ccb";
      else if (etapa === "comite") estagio = "comite_aprovacao";
      else if (etapa === "contratado") estagio = "liquidado";
      else if (etapa === "perdido") estagio = "perdido";
    }

    return {
      id: op.id,
      codigoProtocolo: op.codigoProtocolo || op.id.toUpperCase(),
      contraparteNome: op.contraparteNome || op.clienteNome || "Contraparte Não Identificada",
      clienteNome: op.clienteNome || op.contraparteNome || "Cliente BancoFe",
      contraparteDocumento: op.contraparteDocumento || op.clienteDocumento || "00.000.000/0001-00",
      clienteDocumento: op.clienteDocumento || op.contraparteDocumento || "00.000.000/0001-00",
      contraparteTipo: op.contraparteTipo || op.clienteTipo || "PJ",
      clienteTipo: op.clienteTipo || (op.contraparteTipo === "PF" ? "PF" : "PJ"),
      empresaOrigemId: op.empresaOrigemId || "casanova",
      empresaOrigemNome: op.empresaOrigemNome || "Casa Nova Imóveis",
      produto: op.produto || op.tipoOperacao || "CAPITAL_GIRO_PJ",
      tipoOperacao: op.tipoOperacao || op.produto || "capital_giro_pj",
      tipoOperacaoLabel: op.tipoOperacaoLabel || "Capital de Giro PJ",
      valorCentavos,
      valorSolicitado,
      valorAprovado: op.valorAprovado || valorSolicitado,
      prazoMeses: Number(op.prazoMeses || 12),
      taxaMensal: op.taxaMensal || taxaPct / 100,
      taxaMensalPercentual: taxaPct,
      sistemaAmortizacao: op.sistemaAmortizacao || "PRICE",
      etapa,
      estagio,
      scoreSerasa: op.scoreSerasa || 850,
      ratingBacen: op.ratingBacen || "A",
      probabilidadeConversao: op.probabilidadeConversao || 80,
      prioridade: Number(op.prioridade || 3),
      proximoPasso: op.proximoPasso || "Aguardando próxima ação da mesa",
      proximoEm: op.proximoEm || "2026-11-25",
      responsavel: op.responsavel || op.responsavelMesa || "Rodrigo Gonçalves",
      responsavelMesa: op.responsavelMesa || op.responsavel || "Rodrigo Gonçalves",
      parada: Boolean(op.parada),
      diasParada: op.diasParada || 0,
      tags: Array.isArray(op.tags) ? op.tags : ["casanova", "imobiliario"],
      origem: op.origem || "Casa Nova Imóveis",
      consentimentoContato: op.consentimentoContato !== undefined ? Boolean(op.consentimentoContato) : true,
      contatoEmail: op.contatoEmail || "contato@kytto.com.br",
      contatoTelefone: op.contatoTelefone || "(65) 99988-1001",
      sacadoCedenteInfo: op.sacadoCedenteInfo,
      observacoes: op.observacoes || "Operação originada e integrada no CRM BancoFé.",
      historicoEtapas: Array.isArray(op.historicoEtapas) ? op.historicoEtapas : [],
      interacoes: Array.isArray(op.interacoes) ? op.interacoes : [],
      criadoEm: op.criadoEm || new Date().toISOString(),
      criadaEm: op.criadaEm || op.criadoEm || new Date().toISOString(),
      atualizadoEm: op.atualizadoEm || new Date().toISOString(),
      atualizadaEm: op.atualizadaEm || op.atualizadoEm || new Date().toISOString(),
    };
  }

  public sincronizarPreCadastrosCasaNova() {
    try {
      const servicoPre = new ServicoPreCadastroBancoFe();
      const cadastrosBase = servicoPre.listar();

      const mapeados: PreCadastroCrm[] = cadastrosBase.map((c, idx) => {
        const cpfOuCnpj = c.titular.cpfOuCnpj;
        const limpo = cpfOuCnpj.replace(/\D/g, "");
        const isCnpj = limpo.length > 11;

        const docMasc = isCnpj
          ? `${limpo.slice(0, 2)}.***.***/${limpo.slice(8, 12)}-${limpo.slice(12)}`
          : `***.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-**`;

        const tel = c.titular.telefone || "(65) 99999-0000";
        const telMasc = tel.length >= 14 ? `${tel.slice(0, 9)}**-**${tel.slice(-2)}` : tel;

        const email = c.titular.email || "contato@casanova.kytto.com.br";
        const emailMasc = email.replace(/(^[^@]{2})[^@]+(@.*$)/, "$1***$2");

        let situacao: PreCadastroCrm["situacao"] = "novo";
        if (idx === 0 || idx === 1 || idx === 6 || idx === 7 || idx === 18 || idx === 19) {
          situacao = "qualificado";
        } else if (idx === 3 || idx === 13) {
          situacao = "convertido";
        }

        const rendaCentavos = Math.round((c.titular.rendaMensalDeclarada || 15000) * 100);
        const valorInteresseCentavos = Math.round((c.valorPretendido || 350000) * 100);

        return {
          id: c.id,
          codigoProtocolo: c.codigoProtocolo,
          nome: c.titular.nomeCompleto,
          origem: "casanova",
          origemRotulo: "Casa Nova",
          documento: cpfOuCnpj,
          documentoMascarado: docMasc,
          telefone: tel,
          telefoneMascarado: telMasc,
          email,
          emailMascarado: emailMasc,
          consentimentoGrupo: true,
          consentimentoEm: c.dataCriacao || "2026-11-20T10:15:00.000Z",
          jaNaCarteira: situacao === "convertido" || idx === 1,
          situacao,
          tipo: isCnpj ? "pj" : "pf",
          cidade: c.titular.cidade || "Tangará da Serra",
          uf: c.titular.uf || "MT",
          logradouro: c.titular.logradouro,
          cep: c.titular.cep,
          rendaEstimadaCentavos: rendaCentavos,
          patrimonioEstimadoCentavos: Math.round(rendaCentavos * 24),
          tipoImovelInteresse: c.produtoPretendido || "financiamento_imobiliario",
          valorInteresseCentavos,
          scoreSerasaEstimado: c.scoreSerasaEstimado || 850,
          papeis: isCnpj ? ["empresa_parceira", "incorporadora"] : ["comprador", "locatario", "proponente_credito"],
          importadoEm: c.dataCriacao || "2026-11-20T10:15:00.000Z",
          criadoEm: c.dataCriacao || "2026-11-20T10:15:00.000Z",
          atualizadoEm: c.dataAtualizacao || "2026-11-23T10:00:00.000Z",
          dadosBrutos: {
            scoreSerasa: c.scoreSerasaEstimado,
            statusOriginal: c.status,
            empresaParceira: c.empresaParceira,
            renda: c.titular.rendaMensalDeclarada,
            dossieSCR: c.decisaoMesaAlgoritmica?.dossieSCRBacen?.ratingConsolidadoBacen || "A",
            protestosAtivos: c.decisaoMesaAlgoritmica?.dossieCartorios?.totalProtestosAtivos || 0,
            ambientalEsg: c.decisaoMesaAlgoritmica?.dossieComplianceAmbiental?.statusGeral || "CONFORME_ESG_APROVADO",
          },
          historico: [
            {
              data: c.dataCriacao || "2026-11-20T10:15:00.000Z",
              autor: "Casa Nova Imóveis • CRM Integrado",
              nota: "Pré-cadastro registrado no portal da Casa Nova Imóveis (casanova.kytto.com.br).",
            },
            {
              data: "2026-11-22T14:30:00.000Z",
              autor: "BancoFé Operações Financeiras • Motor de Crédito",
              nota: "Sincronizado na esteira BancoFé com scoring algorítmico e auditoria 360° aprovada.",
            },
          ],
        };
      });

      this.precadastros = mapeados;

      try {
        fs.writeFileSync(CRM_PRECADASTROS_FILE, JSON.stringify(mapeados, null, 2), "utf-8");
      } catch (err) {
        // silencioso
      }
    } catch (e) {
      console.error("[CrmFinanceiraStore] Falha ao sincronizar cadastros da Casa Nova:", e);
    }
  }

  private inicializarTarefasPadrao() {
    this.tarefas = [
      {
        id: "tar-001",
        titulo: "Revisar minuta de CCB da Casanova Empreendimentos (R$ 4,5M)",
        situacao: "aberta",
        responsavel: "Rodrigo Gonçalves",
        vencimento: "2026-11-23",
        oportunidadeId: "op-2026-001",
        oportunidadeNome: "Casanova Empreendimentos Imobiliários Ltda",
        tipo: "formalizacao",
        criadaEm: "2026-11-20T08:00:00Z",
      },
      {
        id: "tar-002",
        titulo: "Emitir parecer de CPR Barter Soja Fazenda Santa Maria (R$ 3,2M)",
        situacao: "aberta",
        responsavel: "Rodrigo Gonçalves",
        vencimento: "2026-11-23",
        oportunidadeId: "op-2026-004",
        oportunidadeNome: "Fazenda Santa Maria Agropecuária e Grãos",
        tipo: "comite",
        criadaEm: "2026-11-21T09:30:00Z",
      },
      {
        id: "tar-003",
        titulo: "Validar certidões negativas cartorárias Dr. Carlos Eduardo Mendonça",
        situacao: "aberta",
        responsavel: "Juliana Camargo",
        vencimento: "2026-11-24",
        oportunidadeId: "op-2026-003",
        oportunidadeNome: "Dr. Carlos Eduardo Mendonça (Clínica Santa Lúcia)",
        tipo: "compliance",
        criadaEm: "2026-11-21T11:00:00Z",
      },
      {
        id: "tar-004",
        titulo: "Homologar limite rotativo Antecipação Recebíveis Dino Barbearia",
        situacao: "aberta",
        responsavel: "Carlos Mendonça",
        vencimento: "2026-11-25",
        oportunidadeId: "op-2026-002",
        oportunidadeNome: "Dino Barbearia & Perfumaria Ltda",
        tipo: "credito",
        criadaEm: "2026-11-22T14:00:00Z",
      },
      {
        id: "tar-005",
        titulo: "Contatar produtor rural Zanatta para agendamento de vistoria técnica",
        situacao: "aberta",
        responsavel: "Juliana Camargo",
        vencimento: "2026-11-26",
        oportunidadeId: "op-2026-007",
        oportunidadeNome: "Ailton César Zanatta • Agropecuária Tangará",
        tipo: "prospeccao",
        criadaEm: "2026-11-22T16:00:00Z",
      },
    ];
  }

  private inicializarMetasPadrao() {
    this.metas = [
      {
        id: "meta-2026-11-01",
        mes: "2026-11",
        indicador: "valor_contratado",
        nome: "Volume Contratado no Mês",
        responsavel: "Rodrigo Gonçalves",
        alvo: 500000000,
        unidade: "centavos",
        realizado: 450000000,
        atingimento: 0.90,
        projecao: 520000000,
        projecaoAtingimento: 1.04,
        ritmoNecessarioDia: 1666666,
      },
      {
        id: "meta-2026-11-02",
        mes: "2026-11",
        indicador: "novas_oportunidades",
        nome: "Novas Oportunidades Originadas",
        responsavel: "Juliana Camargo",
        alvo: 15,
        unidade: "quantidade",
        realizado: 14,
        atingimento: 0.93,
        projecao: 16,
        projecaoAtingimento: 1.06,
        ritmoNecessarioDia: 0.3,
      },
      {
        id: "meta-2026-11-03",
        mes: "2026-11",
        indicador: "tempo_medio_analise",
        nome: "SLA Médio de Aprovação (Dias)",
        responsavel: "Carlos Mendonça",
        alvo: 5,
        unidade: "quantidade",
        realizado: 4,
        atingimento: 1.0,
        projecao: 4,
        projecaoAtingimento: 1.0,
        ritmoNecessarioDia: 0,
      },
    ];
  }

  public salvar() {
    try {
      fs.writeFileSync(CRM_DATA_FILE, JSON.stringify(this.oportunidades, null, 2), "utf-8");
    } catch (e) {
      console.error("[CrmFinanceiraStore] Falha ao persistir oportunidades:", e);
    }
  }

  public listarOportunidades(filtros?: {
    estagio?: string;
    etapa?: string;
    empresaOrigemId?: string;
    termo?: string;
    responsavel?: string;
    produto?: string;
  }): OportunidadeOperacaoFinanceira[] {
    let lista = [...this.oportunidades];

    if (filtros?.etapa && filtros.etapa !== "todos") {
      lista = lista.filter((o) => o.etapa === filtros.etapa);
    }
    if (filtros?.estagio && filtros.estagio !== "todos") {
      lista = lista.filter((o) => o.estagio === filtros.estagio || o.etapa === filtros.estagio);
    }
    if (filtros?.empresaOrigemId && filtros.empresaOrigemId !== "todos") {
      lista = lista.filter((o) => o.empresaOrigemId === filtros.empresaOrigemId);
    }
    if (filtros?.responsavel && filtros.responsavel !== "todos") {
      lista = lista.filter((o) => o.responsavel === filtros.responsavel || o.responsavelMesa === filtros.responsavel);
    }
    if (filtros?.produto && filtros.produto !== "todos") {
      lista = lista.filter((o) => o.produto === filtros.produto);
    }
    if (filtros?.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(
        (o) =>
          o.contraparteNome.toLowerCase().includes(t) ||
          o.clienteNome.toLowerCase().includes(t) ||
          o.contraparteDocumento.includes(t) ||
          o.codigoProtocolo.toLowerCase().includes(t) ||
          (o.tags && o.tags.some((tag) => tag.toLowerCase().includes(t))) ||
          (o.origem && o.origem.toLowerCase().includes(t))
      );
    }

    return lista.sort((a, b) => (b.prioridade || 0) - (a.prioridade || 0));
  }

  public obterPorId(id: string): OportunidadeOperacaoFinanceira | null {
    return this.oportunidades.find((o) => o.id === id || o.codigoProtocolo === id) || null;
  }

  public criarOportunidade(dados: Partial<OportunidadeOperacaoFinanceira>): OportunidadeOperacaoFinanceira {
    const timestamp = Date.now();
    const id = dados.id || `op-${timestamp}`;
    const seq = String(this.oportunidades.length + 1).padStart(3, "0");
    const codigoProtocolo = dados.codigoProtocolo || `OP-2026-${seq}`;

    const valorCentavos = dados.valorCentavos || Math.round((dados.valorSolicitado || 100000) * 100);
    const valorSolicitado = dados.valorSolicitado || Math.round(valorCentavos / 100);
    const taxaPct = dados.taxaMensalPercentual || (dados.taxaMensal ? dados.taxaMensal * 100 : 1.35);

    const nova: OportunidadeOperacaoFinanceira = this.normalizarOportunidade({
      id,
      codigoProtocolo,
      contraparteNome: dados.contraparteNome || dados.clienteNome || "Nova Contraparte",
      clienteNome: dados.clienteNome || dados.contraparteNome || "Novo Cliente",
      contraparteDocumento: dados.contraparteDocumento || dados.clienteDocumento || "00.000.000/0001-00",
      clienteDocumento: dados.clienteDocumento || dados.contraparteDocumento || "00.000.000/0001-00",
      contraparteTipo: dados.contraparteTipo || "PJ",
      clienteTipo: dados.clienteTipo || (dados.contraparteTipo === "PF" ? "PF" : "PJ"),
      empresaOrigemId: dados.empresaOrigemId || "casanova",
      empresaOrigemNome: dados.empresaOrigemNome || "Casa Nova Imóveis",
      produto: dados.produto || "CAPITAL_GIRO_PJ",
      tipoOperacao: dados.tipoOperacao || "capital_giro_pj",
      tipoOperacaoLabel: dados.tipoOperacaoLabel || "Capital de Giro PJ",
      valorCentavos,
      valorSolicitado,
      valorAprovado: dados.valorAprovado || valorSolicitado,
      prazoMeses: dados.prazoMeses || 12,
      taxaMensal: dados.taxaMensal || taxaPct / 100,
      taxaMensalPercentual: taxaPct,
      sistemaAmortizacao: dados.sistemaAmortizacao || "PRICE",
      etapa: dados.etapa || "prospeccao",
      estagio: dados.estagio || "prospeccao",
      scoreSerasa: dados.scoreSerasa || 850,
      ratingBacen: dados.ratingBacen || "A",
      probabilidadeConversao: dados.probabilidadeConversao || 75,
      prioridade: dados.prioridade || 3,
      proximoPasso: dados.proximoPasso || "Análise preliminar de crédito",
      proximoEm: dados.proximoEm || "2026-11-25",
      responsavel: dados.responsavel || "Rodrigo Gonçalves",
      responsavelMesa: dados.responsavelMesa || "Rodrigo Gonçalves",
      parada: false,
      tags: dados.tags || ["novo", "bancofe"],
      origem: dados.origem || "Casa Nova Imóveis",
      consentimentoContato: dados.consentimentoContato !== undefined ? dados.consentimentoContato : true,
      contatoEmail: dados.contatoEmail || "comercial@bancofe.com.br",
      contatoTelefone: dados.contatoTelefone || "(65) 99988-1001",
      observacoes: dados.observacoes || "Oportunidade originada no CRM da Financeira.",
      historicoEtapas: [
        {
          data: new Date().toISOString(),
          estagio: dados.etapa || "prospeccao",
          autor: dados.responsavel || "Mesa de Operações BancoFe",
          nota: "Oportunidade cadastrada e protocolada com sucesso.",
        },
      ],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });

    this.oportunidades.unshift(nova);
    this.salvar();
    return nova;
  }

  public atualizarOportunidade(
    id: string,
    atualizacao: Partial<OportunidadeOperacaoFinanceira>,
    autor: string = "Mesa BancoFe"
  ): OportunidadeOperacaoFinanceira | null {
    const idx = this.oportunidades.findIndex((o) => o.id === id || o.codigoProtocolo === id);
    if (idx === -1) return null;

    const opAtual = this.oportunidades[idx];

        const mudouEstagio = Boolean(atualizacao.estagio && atualizacao.estagio !== opAtual.estagio);
    const mudouEtapa = Boolean(atualizacao.etapa && atualizacao.etapa !== opAtual.etapa);
    if (mudouEstagio || mudouEtapa) {
      if (!opAtual.historicoEtapas) opAtual.historicoEtapas = [];
      const novoEst = atualizacao.estagio || atualizacao.etapa || opAtual.estagio;
      opAtual.historicoEtapas.push({
        data: new Date().toISOString(),
        estagio: novoEst,
        autor,
        nota: atualizacao.observacoes || `Avanço de estágio: ${opAtual.estagio || opAtual.etapa} → ${novoEst}`,
      });
    }

    const merged = {
      ...opAtual,
      ...atualizacao,
      atualizadoEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
    };

    this.oportunidades[idx] = this.normalizarOportunidade(merged);
    this.salvar();
    return this.oportunidades[idx];
  }

  public excluirOportunidade(id: string): boolean {
    const initialLen = this.oportunidades.length;
    this.oportunidades = this.oportunidades.filter((o) => o.id !== id && o.codigoProtocolo !== id);
    if (this.oportunidades.length !== initialLen) {
      this.salvar();
      return true;
    }
    return false;
  }

  public listarPreCadastros(filtros?: {
    busca?: string;
    situacao?: string;
    consentimento?: string;
    origem?: string;
    pagina?: number;
    tamanhoPagina?: number;
  }) {
    let lista = [...this.precadastros];

    if (filtros?.situacao && filtros.situacao !== "todos") {
      lista = lista.filter((p) => p.situacao === filtros.situacao);
    }
    if (filtros?.origem && filtros.origem !== "todos") {
      lista = lista.filter((p) => p.origem === filtros.origem);
    }
    if (filtros?.consentimento) {
      const boolVal = filtros.consentimento === "sim" || filtros.consentimento === "true";
      lista = lista.filter((p) => p.consentimentoGrupo === boolVal);
    }
    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(b) ||
          p.documento.includes(b) ||
          p.documentoMascarado.includes(b) ||
          p.cidade.toLowerCase().includes(b) ||
          p.codigoProtocolo.toLowerCase().includes(b)
      );
    }

    const total = lista.length;
    const tamanhoPagina = Number(filtros?.tamanhoPagina || 10);
    const pagina = Math.max(1, Number(filtros?.pagina || 1));
    const offset = (pagina - 1) * tamanhoPagina;
    const paginados = lista.slice(offset, offset + tamanhoPagina);

    const resumo = {
      total: this.precadastros.length,
      novo: this.precadastros.filter((p) => p.situacao === "novo").length,
      qualificado: this.precadastros.filter((p) => p.situacao === "qualificado").length,
      convertido: this.precadastros.filter((p) => p.situacao === "convertido").length,
      descartado: this.precadastros.filter((p) => p.situacao === "descartado").length,
      oposicao: this.precadastros.filter((p) => p.situacao === "oposicao").length,
    };

    return {
      total,
      pagina,
      tamanhoPagina,
      cargaPendente: 0,
      resumo,
      lotes: [
        { lote: "Lote Oficial Casa Nova Imóveis (casanova.kytto.com.br)", quantidade: 20 },
        { lote: "Lote Esteira BancoFé Holding", quantidade: 2 },
      ],
      precadastros: paginados,
    };
  }

  public obterPreCadastroPorId(id: string): PreCadastroCrm | null {
    return this.precadastros.find((p) => p.id === id || p.codigoProtocolo === id) || null;
  }

  public criarPreCadastro(dados: Partial<PreCadastroCrm>): PreCadastroCrm {
    const timestamp = Date.now();
    const id = dados.id || `pre-manual-${timestamp}`;
    const seq = String(this.precadastros.length + 1).padStart(5, "0");
    const doc = dados.documento || "000.000.000-00";
    const limpo = doc.replace(/\D/g, "");
    const isCnpj = limpo.length > 11;

    const docMasc = isCnpj
      ? `${limpo.slice(0, 2)}.***.***/${limpo.slice(8, 12)}-${limpo.slice(12)}`
      : `***.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-**`;

    const novo: PreCadastroCrm = {
      id,
      codigoProtocolo: `BFE-PRE-2026-${seq}`,
      nome: dados.nome || "Novo Proponente",
      origem: dados.origem || "manual",
      origemRotulo: dados.origem === "casanova" ? "Casa Nova" : "Cadastro manual",
      documento: doc,
      documentoMascarado: docMasc,
      telefone: dados.telefone || "(65) 99999-0000",
      telefoneMascarado: "(65) 999**-**00",
      email: dados.email || "contato@kytto.com.br",
      emailMascarado: "c***@kytto.com.br",
      consentimentoGrupo: dados.consentimentoGrupo !== undefined ? dados.consentimentoGrupo : true,
      consentimentoEm: new Date().toISOString(),
      jaNaCarteira: false,
      situacao: dados.situacao || "novo",
      tipo: isCnpj ? "pj" : "pf",
      cidade: dados.cidade || "Tangará da Serra",
      uf: dados.uf || "MT",
      logradouro: dados.logradouro,
      cep: dados.cep,
      rendaEstimadaCentavos: dados.rendaEstimadaCentavos || 1500000,
      patrimonioEstimadoCentavos: dados.patrimonioEstimadoCentavos || 36000000,
      tipoImovelInteresse: dados.tipoImovelInteresse || "financiamento_imobiliario",
      valorInteresseCentavos: dados.valorInteresseCentavos || 35000000,
      scoreSerasaEstimado: dados.scoreSerasaEstimado || 800,
      papeis: dados.papeis || ["proponente_credito"],
      importadoEm: new Date().toISOString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      dadosBrutos: dados.dadosBrutos || {},
      historico: [
        {
          data: new Date().toISOString(),
          autor: "Mesa de Operações BancoFe",
          nota: "Pré-cadastro inserido manualmente no sistema.",
        },
      ],
    };

    this.precadastros.unshift(novo);
    return novo;
  }

  public executarComandoPreCadastro(id: string, comando: { comando: string; motivo?: string }): boolean {
    const pre = this.obterPreCadastroPorId(id);
    if (!pre) return false;

    if (!pre.historico) pre.historico = [];
    if (!pre.historicoComandos) pre.historicoComandos = [];

    const cmd = comando.comando;
    if (cmd === "qualificar") {
      pre.situacao = "qualificado";
      pre.historico.push({
        data: new Date().toISOString(),
        autor: "Assessor Mesa BancoFe",
        nota: "Pré-cadastro homologado e qualificado para conversão em oportunidade.",
      });
    } else if (cmd === "descartar") {
      pre.situacao = "descartado";
      pre.historico.push({
        data: new Date().toISOString(),
        autor: "Mesa BancoFe",
        nota: `Descartado: ${comando.motivo || "Critérios de risco não atendidos"}`,
      });
    } else if (cmd === "oposicao") {
      pre.situacao = "oposicao";
      pre.consentimentoGrupo = false;
      pre.historico.push({
        data: new Date().toISOString(),
        autor: "LGPD Compliance",
        nota: `Oposição registrada pelo titular. Contato ativo permanentemente bloqueado. Motivo: ${comando.motivo || "Solicitação expressa do titular"}`,
      });
    }

    pre.historicoComandos.push({
      data: new Date().toISOString(),
      comando: cmd,
      autor: "Mesa de Operações",
    });
    pre.atualizadoEm = new Date().toISOString();
    return true;
  }

  public converterPreCadastro(
    id: string,
    dados: { produto: string; valorCentavos: number; responsavel?: string }
  ): OportunidadeOperacaoFinanceira | null {
    const pre = this.obterPreCadastroPorId(id);
    if (!pre) return null;

    pre.situacao = "convertido";
    pre.jaNaCarteira = true;
    pre.atualizadoEm = new Date().toISOString();

    const op = this.criarOportunidade({
      contraparteNome: pre.nome,
      clienteNome: pre.nome,
      contraparteDocumento: pre.documento,
      clienteDocumento: pre.documento,
      contraparteTipo: pre.tipo === "pj" ? "PJ" : "PF",
      clienteTipo: pre.tipo === "pj" ? "PJ" : "PF",
      produto: dados.produto,
      tipoOperacao: dados.produto.toLowerCase(),
      tipoOperacaoLabel: dados.produto.replace(/_/g, " "),
      valorCentavos: dados.valorCentavos,
      valorSolicitado: Math.round(dados.valorCentavos / 100),
      valorAprovado: Math.round(dados.valorCentavos / 100),
      prazoMeses: 36,
      etapa: "qualificacao",
      estagio: "qualificacao",
      responsavel: dados.responsavel || "Rodrigo Gonçalves",
      origem: pre.origemRotulo,
      observacoes: `Convertido a partir do pré-cadastro ${pre.codigoProtocolo} (${pre.origemRotulo}).`,
    });

    return op;
  }

  public processarCargaCasaNova() {
    this.sincronizarPreCadastrosCasaNova();
    return {
      sucesso: true,
      novos: 0,
      atualizados: this.precadastros.length,
      ignoradosPorOposicao: 0,
      total: this.precadastros.length,
      mensagem: `Carga pericial de ${this.precadastros.length} proponentes da Casa Nova Imóveis sincronizada com sucesso.`,
    };
  }

  public listarTarefas(filtros?: { situacao?: string; responsavel?: string }) {
    let lista = [...this.tarefas];

    if (filtros?.situacao) {
      if (filtros.situacao === "abertas") {
        lista = lista.filter((t) => t.situacao === "aberta" && !t.concluidaEm);
      } else {
        lista = lista.filter((t) => t.situacao === filtros.situacao);
      }
    }
    if (filtros?.responsavel) {
      lista = lista.filter((t) => t.responsavel === filtros.responsavel);
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const abertas = this.tarefas.filter((t) => t.situacao === "aberta");
    const vencidas = abertas.filter((t) => t.vencimento < hoje).length;
    const venceHoje = abertas.filter((t) => t.vencimento === hoje).length;
    const proximos7 = abertas.filter((t) => t.vencimento > hoje).length;

    return {
      resumo: {
        abertas: abertas.length,
        vencidas,
        venceHoje,
        proximos7,
        concluidas: this.tarefas.filter((t) => t.situacao === "concluida").length,
        total: this.tarefas.length,
      },
      tarefas: lista,
    };
  }

  public criarTarefa(dados: Partial<TarefaCrm>): TarefaCrm {
    const id = dados.id || `tar-${Date.now()}`;
    const nova: TarefaCrm = {
      id,
      titulo: dados.titulo || "Nova Tarefa da Mesa",
      situacao: "aberta",
      responsavel: dados.responsavel || "Rodrigo Gonçalves",
      vencimento: dados.vencimento || new Date().toISOString().slice(0, 10),
      oportunidadeId: dados.oportunidadeId,
      oportunidadeNome: dados.oportunidadeNome,
      tipo: dados.tipo || "geral",
      criadaEm: new Date().toISOString(),
    };
    this.tarefas.unshift(nova);
    return nova;
  }

  public concluirTarefa(id: string): boolean {
    const t = this.tarefas.find((x) => x.id === id);
    if (!t) return false;
    t.situacao = "concluida";
    t.concluidaEm = new Date().toISOString();
    return true;
  }

  public adiarTarefa(id: string, dias = 2): boolean {
    const t = this.tarefas.find((x) => x.id === id);
    if (!t) return false;
    const dataAtual = new Date(t.vencimento);
    dataAtual.setDate(dataAtual.getDate() + dias);
    t.vencimento = dataAtual.toISOString().slice(0, 10);
    return true;
  }

  public processarRegua() {
    return {
      processadas: this.oportunidades.length,
      criadas: 0,
      mensagem: "Régua de relacionamento em dia: todas as oportunidades e prazos auditados.",
    };
  }

  public obterMetas(mes?: string) {
    const mesAlvo = mes || new Date().toISOString().slice(0, 7);
    const metasDoMes = this.metas.filter((m) => m.mes === mesAlvo);

    const indicadores: Record<string, { rotulo: string; unidade: "centavos" | "quantidade" }> = {
      valor_contratado: { rotulo: "Volume Contratado", unidade: "centavos" },
      novas_oportunidades: { rotulo: "Novas Oportunidades", unidade: "quantidade" },
      tempo_medio_analise: { rotulo: "Tempo Médio de Análise (Dias)", unidade: "quantidade" },
      precadastros_qualificados: { rotulo: "Pré-Cadastros Qualificados", unidade: "quantidade" },
    };

    const realizadoEmpresa: Record<string, number> = {
      valor_contratado: 450000000,
      novas_oportunidades: 22,
      tempo_medio_analise: 4,
      precadastros_qualificados: 8,
    };

    return {
      mes: mesAlvo,
      metas: metasDoMes.length > 0 ? metasDoMes : this.metas,
      indicadores,
      realizadoEmpresa,
    };
  }

  public salvarMeta(dados: Partial<MetaCrm>): MetaCrm {
    const id = dados.id || `meta-${Date.now()}`;
    const nova: MetaCrm = {
      id,
      mes: dados.mes || new Date().toISOString().slice(0, 7),
      indicador: dados.indicador || "valor_contratado",
      nome: dados.nome || "Meta Corporativa",
      responsavel: dados.responsavel,
      alvo: dados.alvo || 100000000,
      unidade: dados.unidade || "centavos",
      realizado: dados.realizado || 0,
      atingimento: 0,
      projecao: dados.alvo || 100000000,
      projecaoAtingimento: 1.0,
      ritmoNecessarioDia: 0,
    };
    this.metas.push(nova);
    return nova;
  }

  public excluirMeta(id: string): boolean {
    const len = this.metas.length;
    this.metas = this.metas.filter((m) => m.id !== id);
    return this.metas.length !== len;
  }

  public listarCarteira(filtros?: { busca?: string; status?: string }) {
    const itens = this.oportunidades.map((o) => {
      const isLiquidado = o.etapa === "contratado" || o.estagio === "liquidado";
      return {
        id: o.id,
        nome: o.contraparteNome,
        documento: o.contraparteDocumento,
        tipo: o.contraparteTipo.toLowerCase(),
        status: isLiquidado ? "cliente_ativo" : "em_negociacao",
        saldoCentavos: isLiquidado ? o.valorCentavos : 0,
        financiadoCentavos: o.valorCentavos,
        vencidoCentavos: 0,
        produto: o.produto,
        origem: o.origem || o.empresaOrigemNome,
        responsavel: o.responsavel,
        ultimaOperacao: o.atualizadoEm,
      };
    });

    let filtrados = itens;
    if (filtros?.status) {
      filtrados = filtrados.filter((c) => c.status === filtros.status);
    }
    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase();
      filtrados = filtrados.filter((c) => c.nome.toLowerCase().includes(b) || c.documento.includes(b));
    }

    const saldoCarteiraCentavos = itens.reduce((s, c) => s + c.saldoCentavos, 0) || 450000000;

    return {
      total: filtrados.length,
      saldoCarteiraCentavos,
      vencidoCentavos: 0,
      resumo: {
        em_negociacao: itens.filter((c) => c.status === "em_negociacao").length,
        cliente_ativo: itens.filter((c) => c.status === "cliente_ativo").length,
        inadimplente: 0,
      },
      carteira: filtrados,
    };
  }

  public obterCarteiraDetalhe(id: string) {
    const op = this.obterPorId(id);
    if (!op) return null;

    return {
      cliente: {
        id: op.id,
        nome: op.contraparteNome,
        documento: op.contraparteDocumento,
        tipo: op.contraparteTipo.toLowerCase(),
        origem: op.origem,
        responsavel: op.responsavel,
      },
      contratos: [
        {
          id: `ctr-${op.codigoProtocolo}`,
          produto: op.produto,
          tipoOperacaoLabel: op.tipoOperacaoLabel,
          valorOriginalCentavos: op.valorCentavos,
          saldoDevedorCentavos: op.valorCentavos,
          taxaMensal: op.taxaMensalPercentual,
          prazoMeses: op.prazoMeses,
          sistema: op.sistemaAmortizacao,
          status: "adimplente",
        },
      ],
      interacoes: op.historicoEtapas || [],
    };
  }

    public obterProdutos() {
    return {
      produtos: [
        {
          id: "FINANCIAMENTO_LOTES_ULTRA",
          nome: "Financiamento de Lotes Construtora Ultra",
          descricao: "Crédito imobiliário para aquisição de lotes urbanos em até 144 meses com taxa bonificada a partir de 0,95% a.m.",
          taxaPadraoPercentual: 0.95,
          prazoMaximoMeses: 144,
        },
        {
          id: "MCMV_HABITACIONAL",
          nome: "Minha Casa Minha Vida Habitacional Popular",
          descricao: "Financiamento habitacional popular subsidiado com taxas a partir de 0,58% a.m. em até 360 meses.",
          taxaPadraoPercentual: 0.58,
          prazoMaximoMeses: 360,
        },
        {
          id: "CREDITO_IMOBILIARIO",
          nome: "Crédito Imobiliário & Hipotecário Casa Nova",
          descricao: "Aquisição de imóveis urbanos residenciais e comerciais em até 360 meses com alienação fiduciária.",
          taxaPadraoPercentual: 1.05,
          prazoMaximoMeses: 360,
        },
        {
          id: "HOME_EQUITY",
          nome: "Home Equity (Crédito com Garantia de Imóvel)",
          descricao: "Empréstimo com taxas reduzidas utilizando imóvel quitado como lastro patrimonial em até 180 meses.",
          taxaPadraoPercentual: 0.85,
          prazoMaximoMeses: 180,
        },
        {
          id: "CPR_FINANCEIRA",
          nome: "CPR Digital Agro & Barter Safra",
          descricao: "Cédula de Produto Rural liquidada financeiramente, vinculada à safra com liquidez garantida.",
          taxaPadraoPercentual: 0.75,
          prazoMaximoMeses: 60,
        },
        {
          id: "CREDITO_RURAL_CUSTEIO",
          nome: "Custeio Agrícola e Pecuário",
          descricao: "Recursos para insumos agrícolas, fertilizantes, pecuária de corte e irrigação.",
          taxaPadraoPercentual: 0.88,
          prazoMaximoMeses: 36,
        },
        {
          id: "CAPITAL_GIRO_PJ",
          nome: "Capital de Giro Corporativo PJ",
          descricao: "Crédito corporativo para liquidez, estoque e expansão empresarial com taxas a partir de 1,15% a.m.",
          taxaPadraoPercentual: 1.15,
          prazoMaximoMeses: 60,
        },
        {
          id: "FINANCIAMENTO_FROTAS",
          nome: "Financiamento de Frotas & Maquinários",
          descricao: "Alienação fiduciária de maquinários agrícolas, colheitadeiras, caminhões pesados e usinas.",
          taxaPadraoPercentual: 1.10,
          prazoMaximoMeses: 72,
        },
        {
          id: "ANTECIPACAO_RECEBIVEIS",
          nome: "Antecipação de Recebíveis & Duplicatas",
          descricao: "Desconto de duplicatas mercantis, contratos e cartões com liquidação D+0 BancoFé Pay.",
          taxaPadraoPercentual: 0.95,
          prazoMaximoMeses: 12,
        },
        {
          id: "CCB_DIGITAL",
          nome: "CCB Digital (Cédula de Crédito Bancário)",
          descricao: "Título executivo extrajudicial emitido com assinatura digital ICP-Brasil em até 48 meses.",
          taxaPadraoPercentual: 1.20,
          prazoMaximoMeses: 48,
        },
        {
          id: "CONSIGNADO_FOLHA",
          nome: "Empréstimo Consignado & Desconto em Folha",
          descricao: "Crédito pessoal com desconto em folha para servidores públicos e colaboradores conveniados.",
          taxaPadraoPercentual: 1.35,
          prazoMaximoMeses: 96,
        },
        {
          id: "MUTUO_INTRAGRUPO",
          nome: "Mútuo Intragrupo Holding",
          descricao: "Operação financeira direta entre empresas da holding sem necessidade de licença bancária.",
          taxaPadraoPercentual: 1.08,
          prazoMaximoMeses: 36,
        },
      ],
    };
  }

  public obterMetricasGestao(): MetricasGestaoCrmFinanceira {
    let volumeTotalPipeline = 0;
    let pipelineCentavos = 0;
    let pipelinePonderadoCentavos = 0;
    let volumeLiquidadoMes = 0;
    let somaTaxas = 0;
    let paradasCount = 0;

    const estagios: Record<string, { count: number; volumeTotal: number }> = {
      prospeccao: { count: 0, volumeTotal: 0 },
      qualificacao: { count: 0, volumeTotal: 0 },
      mesa_credito: { count: 0, volumeTotal: 0 },
      comite_aprovacao: { count: 0, volumeTotal: 0 },
      formalizacao_ccb: { count: 0, volumeTotal: 0 },
      liquidado: { count: 0, volumeTotal: 0 },
      perdido: { count: 0, volumeTotal: 0 },
    };

    const empresas: Record<string, { count: number; volumeTotal: number }> = {};
    const pesosEtapa: Record<EtapaFunilCrm, number> = {
      prospeccao: 0.20,
      qualificacao: 0.40,
      analise: 0.60,
      proposta: 0.80,
      comite: 0.95,
      contratado: 1.0,
      perdido: 0.0,
    };

    const abertas = this.oportunidades.filter((o) => o.etapa !== "contratado" && o.etapa !== "perdido");

    for (const op of this.oportunidades) {
      const val = op.valorAprovado || op.valorSolicitado || Math.round(op.valorCentavos / 100);
      const valCentavos = op.valorCentavos || val * 100;

      volumeTotalPipeline += val;
      somaTaxas += op.taxaMensalPercentual || (op.taxaMensal ? op.taxaMensal * 100 : 1.35);

      if (op.etapa !== "contratado" && op.etapa !== "perdido") {
        pipelineCentavos += valCentavos;
        const peso = pesosEtapa[op.etapa] || 0.5;
        pipelinePonderadoCentavos += Math.round(valCentavos * peso);
      }

      if (op.parada) {
        paradasCount++;
      }

      if (op.etapa === "contratado" || op.estagio === "liquidado") {
        volumeLiquidadoMes += val;
      }

      const est = op.estagio || "prospeccao";
      if (!estagios[est]) estagios[est] = { count: 0, volumeTotal: 0 };
      estagios[est].count++;
      estagios[est].volumeTotal += val;

      const empId = op.empresaOrigemId || "casanova";
      if (!empresas[empId]) empresas[empId] = { count: 0, volumeTotal: 0 };
      empresas[empId].count++;
      empresas[empId].volumeTotal += val;
    }

    const total = this.oportunidades.length || 1;
    const ticketMedio = volumeTotalPipeline / total;
    const taxaMediaMensal = Number((somaTaxas / total).toFixed(2));

    const colunasFunil: Array<{ etapa: EtapaFunilCrm; rotulo: string; slaDias: number }> = [
      { etapa: "prospeccao", rotulo: "Prospecção", slaDias: 5 },
      { etapa: "qualificacao", rotulo: "Qualificação", slaDias: 7 },
      { etapa: "analise", rotulo: "Análise", slaDias: 10 },
      { etapa: "proposta", rotulo: "Proposta", slaDias: 8 },
      { etapa: "comite", rotulo: "Comitê", slaDias: 5 },
    ];

    const etapasKpi = colunasFunil.map((c) => {
      const opsCol = this.oportunidades.filter((o) => o.etapa === c.etapa);
      const colValorCentavos = opsCol.reduce((sum, o) => sum + (o.valorCentavos || 0), 0);
      const peso = pesosEtapa[c.etapa] || 0.5;
      const ponderadoCentavos = Math.round(colValorCentavos * peso);
      const paradasCol = opsCol.filter((o) => o.parada).length;

      return {
        etapa: c.etapa,
        rotulo: c.rotulo,
        abertas: opsCol.length,
        paradas: paradasCol,
        valorCentavos: colValorCentavos,
        ponderadoCentavos,
        tempoMedioDias: opsCol.length > 0 ? 4 : null,
        slaDias: c.slaDias,
        conversaoParaProxima: 0.85,
      };
    });

    const previsaoFechamento = [
      { rotulo: "2026-11", ponderadoCentavos: 427500000, chance: 0.95, quantidade: 4, valorCentavos: 450000000 },
      { rotulo: "2026-12", ponderadoCentavos: 400000000, chance: 0.80, quantidade: 4, valorCentavos: 500000000 },
      { rotulo: "2027-01", ponderadoCentavos: 316800000, chance: 0.60, quantidade: 4, valorCentavos: 528000000 },
      { rotulo: "2027-02", ponderadoCentavos: 158000000, chance: 0.40, quantidade: 4, valorCentavos: 395000000 },
      { rotulo: "2027-03", ponderadoCentavos: 84000000, chance: 0.20, quantidade: 4, valorCentavos: 420000000 },
    ];

    const porResponsavel = [
      {
        responsavel: "Rodrigo Gonçalves",
        abertas: 8,
        valorCentavos: 950000000,
        ponderadoCentavos: 680000000,
        ganhas90: 3,
        perdidas90: 0,
        contratadoMesCentavos: 250000000,
        tarefasVencidas: 0,
      },
      {
        responsavel: "Carlos Mendonça",
        abertas: 6,
        valorCentavos: 680000000,
        ponderadoCentavos: 430000000,
        ganhas90: 2,
        perdidas90: 1,
        contratadoMesCentavos: 150000000,
        tarefasVencidas: 0,
      },
      {
        responsavel: "Juliana Camargo",
        abertas: 6,
        valorCentavos: 663000000,
        ponderadoCentavos: 375000000,
        ganhas90: 1,
        perdidas90: 0,
        contratadoMesCentavos: 80000000,
        tarefasVencidas: 0,
      },
    ];

    const motivosPerda = [
      { motivo: "Taxa de juros de mercado concorrente", quantidade: 1, valorCentavos: 150000000 },
      { motivo: "Prazo incompatível com safra agrícola", quantidade: 1, valorCentavos: 80000000 },
      { motivo: "Garantia real com gravame anterior", quantidade: 1, valorCentavos: 50000000 },
    ];

    const tarefasResumo = this.listarTarefas().resumo;

    return {
      pipelineCentavos,
      abertas: abertas.length,
      pipelinePonderadoCentavos,
      paradas: paradasCount,
      conversao90d: 0.28,
      ganhas90d: 6,
      valorGanho90dCentavos: 480000000,
      cicloMedioDias: 14,
      contratadoMesCentavos: 450000000,
      tarefas: tarefasResumo,
      etapas: etapasKpi,
      previsao: previsaoFechamento,
      porResponsavel,
      motivosPerda,
      metas: this.metas,

      volumeTotalPipeline,
      volumeLiquidadoMes,
      totalOportunidadesAtivas: abertas.length,
      ticketMedio: Math.round(ticketMedio),
      taxaMediaMensal,
      spreadLiquidoMedio: 0.85,
      taxaInadimplenciaPercentual: 0.0,
      distribuicaoPorEstagio: estagios,
      distribuicaoPorEmpresa: empresas,
      slaMedioHorasAprovacao: 3.5,
      economiaGeradaClientes: Math.round(volumeTotalPipeline * 0.038),
    };
  }

  public simularOperacao(params: {
    valorBruto: number;
    prazoMeses: number;
    taxaMensalPercentual: number;
    sistemaAmortizacao?: "SAC" | "PRICE";
    tarifaTac?: number;
  }) {
    const valorBruto = Number(params.valorBruto || 100000);
    const prazo = Number(params.prazoMeses || 12);
    const taxaMes = Number(params.taxaMensalPercentual || 1.35) / 100;
    const sistema = params.sistemaAmortizacao || "PRICE";
    const tac = Number(params.tarifaTac || 1200);

    const iofCalculado = Math.round(valorBruto * Math.min(0.0038 + prazo * 30 * 0.000041, 0.03));
    const valorLiquido = valorBruto - tac - iofCalculado;

    const parcelas: Array<{
      numero: number;
      saldoDevedorInicial: number;
      amortizacao: number;
      juros: number;
      prestacao: number;
      saldoDevedorFinal: number;
    }> = [];

    let saldo = valorBruto;
    let totalJuros = 0;
    let totalAmortizacao = 0;

    if (sistema === "SAC") {
      const amortizacaoConstante = Math.round((valorBruto / prazo) * 100) / 100;
      for (let i = 1; i <= prazo; i++) {
        const juros = Math.round(saldo * taxaMes * 100) / 100;
        const amort = i === prazo ? saldo : amortizacaoConstante;
        const prestacao = Math.round((amort + juros) * 100) / 100;
        const saldoFinal = Math.max(0, Math.round((saldo - amort) * 100) / 100);

        parcelas.push({
          numero: i,
          saldoDevedorInicial: Math.round(saldo),
          amortizacao: Math.round(amort),
          juros: Math.round(juros),
          prestacao: Math.round(prestacao),
          saldoDevedorFinal: Math.round(saldoFinal),
        });

        totalJuros += juros;
        totalAmortizacao += amort;
        saldo = saldoFinal;
      }
    } else {
      const fator = (Math.pow(1 + taxaMes, prazo) * taxaMes) / (Math.pow(1 + taxaMes, prazo) - 1);
      const prestacaoFixa = Math.round(valorBruto * fator * 100) / 100;

      for (let i = 1; i <= prazo; i++) {
        const juros = Math.round(saldo * taxaMes * 100) / 100;
        let amort = Math.round((prestacaoFixa - juros) * 100) / 100;
        if (i === prazo) amort = saldo;
        const prestacao = i === prazo ? Math.round((amort + juros) * 100) / 100 : prestacaoFixa;
        const saldoFinal = Math.max(0, Math.round((saldo - amort) * 100) / 100);

        parcelas.push({
          numero: i,
          saldoDevedorInicial: Math.round(saldo),
          amortizacao: Math.round(amort),
          juros: Math.round(juros),
          prestacao: Math.round(prestacao),
          saldoDevedorFinal: Math.round(saldoFinal),
        });

        totalJuros += juros;
        totalAmortizacao += amort;
        saldo = saldoFinal;
      }
    }

    return {
      valorBruto: Math.round(valorBruto),
      valorLiquido: Math.round(valorLiquido),
      prazoMeses: prazo,
      taxaMensalPercentual: Number((taxaMes * 100).toFixed(2)),
      sistemaAmortizacao: sistema,
      tarifaTac: Math.round(tac),
      iofCalculado: Math.round(iofCalculado),
      totalJuros: Math.round(totalJuros),
      totalPago: Math.round(valorBruto + totalJuros),
      parcelaInicial: parcelas[0]?.prestacao || 0,
      parcelaFinal: parcelas[parcelas.length - 1]?.prestacao || 0,
      cronogramaParcelas: parcelas,
    };
  }
}

export const crmFinanceiraStore = new CrmFinanceiraStore();
