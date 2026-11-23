import fs from "fs";
import path from "path";

export interface OportunidadeOperacaoFinanceira {
  id: string;
  codigoProtocolo: string; // ex: OP-2026-0142
  clienteNome: string;
  clienteDocumento: string; // CPF ou CNPJ
  clienteTipo: "PJ" | "PF";
  empresaOrigemId: string; // bancofe, zuma, agro, boutique, holding_kytto, etc.
  empresaOrigemNome: string;
  tipoOperacao: 
    | "antecipacao_recebiveis" 
    | "capital_giro_pj" 
    | "cpr_agro_barter" 
    | "financiamento_frotas" 
    | "ccb_fomento" 
    | "desconto_duplicatas";
  tipoOperacaoLabel: string;
  valorSolicitado: number;
  valorAprovado: number;
  prazoMeses: number;
  taxaMensalPercentual: number; // ex: 1.45%
  sistemaAmortizacao: "SAC" | "PRICE";
  estagio: 
    | "prospeccao" 
    | "qualificacao" 
    | "mesa_credito" 
    | "comite_aprovacao" 
    | "formalizacao_ccb" 
    | "liquidado" 
    | "perdido";
  scoreSerasa: number; // 0 a 1000
  ratingBacen: "AA" | "A" | "B" | "C" | "D" | "E";
  probabilidadeConversao: number; // 0 a 100%
  responsavelMesa: string;
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
  criadoEm: string;
  atualizadoEm: string;
}

export interface MetricasGestaoCrmFinanceira {
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

const DADOS_INICIAIS: OportunidadeOperacaoFinanceira[] = [
  {
    id: "op-2026-001",
    codigoProtocolo: "OP-2026-001",
    clienteNome: "Casanova Empreendimentos Imobiliários Ltda",
    clienteDocumento: "18.987.654/0001-99",
    clienteTipo: "PJ",
    empresaOrigemId: "holding_kytto",
    empresaOrigemNome: "Holding Kytto",
    tipoOperacao: "ccb_fomento",
    tipoOperacaoLabel: "Cédula de Crédito Bancário (CCB Fomento)",
    valorSolicitado: 4500000,
    valorAprovado: 4500000,
    prazoMeses: 36,
    taxaMensalPercentual: 1.25,
    sistemaAmortizacao: "SAC",
    estagio: "formalizacao_ccb",
    scoreSerasa: 920,
    ratingBacen: "AA",
    probabilidadeConversao: 95,
    responsavelMesa: "Rodrigo Gonçalves",
    contatoEmail: "diretoria@casanova.kytto.com.br",
    contatoTelefone: "(65) 99988-1001",
    observacoes: "Emissão de CCB lastreada em recebíveis de unidades imobiliárias com garantia hipotecária registrada.",
    historicoEtapas: [
      { data: "2026-11-18T10:00:00Z", estagio: "prospeccao", autor: "Comercial BancoFe", nota: "Início da estruturação" },
      { data: "2026-11-20T14:30:00Z", estagio: "mesa_credito", autor: "Mesa Algorítmica", nota: "Score 920 aprovado sem restrições SCR Bacen" },
      { data: "2026-11-22T09:15:00Z", estagio: "formalizacao_ccb", autor: "Jurídico Kytto", nota: "Minuta de CCB gerada com assinatura ICP-Brasil" },
    ],
    criadoEm: "2026-11-18T10:00:00Z",
    atualizadoEm: "2026-11-23T07:00:00Z",
  },
  {
    id: "op-2026-002",
    codigoProtocolo: "OP-2026-002",
    clienteNome: "Agro MT Grãos, Sementes & Armazéns Gerais",
    clienteDocumento: "52.123.456/0003-30",
    clienteTipo: "PJ",
    empresaOrigemId: "zuma_agro",
    empresaOrigemNome: "Agro MT Fazendas & Grãos",
    tipoOperacao: "cpr_agro_barter",
    tipoOperacaoLabel: "Cédula de Produto Rural (CPR Barter Soja/Milho)",
    valorSolicitado: 8200000,
    valorAprovado: 8200000,
    prazoMeses: 12,
    taxaMensalPercentual: 1.15,
    sistemaAmortizacao: "PRICE",
    estagio: "mesa_credito",
    scoreSerasa: 890,
    ratingBacen: "A",
    probabilidadeConversao: 85,
    responsavelMesa: "Mesa de Crédito Agrícola",
    contatoEmail: "safra@agromt.com.br",
    contatoTelefone: "(65) 99922-3344",
    sacadoCedenteInfo: {
      cedenteNome: "Agro MT Grãos Ltda",
      cedenteCnpj: "52.123.456/0003-30",
      sacadoNome: "Bunge Alimentos S.A. / Cargill",
      sacadoCnpj: "44.123.987/0001-44",
      numeroNfe: "NF-89241",
      vencimentoOriginal: "2027-05-30",
    },
    observacoes: "Barter de insumos e custeio de colheita safra 26/27. Compliance ambiental SICAR e SEMA-MT 100% adimplente.",
    historicoEtapas: [
      { data: "2026-11-19T11:00:00Z", estagio: "prospeccao", autor: "Gerente Agro", nota: "Proposta de Barter recebida" },
      { data: "2026-11-21T16:00:00Z", estagio: "mesa_credito", autor: "Analista de Risco", nota: "Checagem de matrículas e CAR aprovada" },
    ],
    criadoEm: "2026-11-19T11:00:00Z",
    atualizadoEm: "2026-11-23T06:30:00Z",
  },
  {
    id: "op-2026-003",
    codigoProtocolo: "OP-2026-003",
    clienteNome: "Zuma Gastronomia & Pescados Eireli",
    clienteDocumento: "52.123.456/0001-78",
    clienteTipo: "PJ",
    empresaOrigemId: "zuma_gastronomia",
    empresaOrigemNome: "Zuma Gastronomia",
    tipoOperacao: "antecipacao_recebiveis",
    tipoOperacaoLabel: "Antecipação de Recebíveis de Cartão & Pix",
    valorSolicitado: 680000,
    valorAprovado: 680000,
    prazoMeses: 6,
    taxaMensalPercentual: 0.98,
    sistemaAmortizacao: "PRICE",
    estagio: "liquidado",
    scoreSerasa: 910,
    ratingBacen: "AA",
    probabilidadeConversao: 100,
    responsavelMesa: "Esteira Automática Open Finance",
    contatoEmail: "financeiro@zumagastronomia.com.br",
    contatoTelefone: "(65) 99655-4433",
    observacoes: "Travas de domicílio bancário Stone e Sicredi registradas na CERC. Liquidação instantânea executada via PIX BancoFe.",
    historicoEtapas: [
      { data: "2026-11-22T08:00:00Z", estagio: "prospeccao", autor: "App BancoFe", nota: "Solicitação via portal do lojista" },
      { data: "2026-11-22T08:02:00Z", estagio: "mesa_credito", autor: "Mesa Algorítmica", nota: "Aprovação instantânea de risco" },
      { data: "2026-11-22T08:05:00Z", estagio: "liquidado", autor: "Core Banking Engine", nota: "R$ 680.000,00 creditado na conta corporativa" },
    ],
    criadoEm: "2026-11-22T08:00:00Z",
    atualizadoEm: "2026-11-22T08:05:00Z",
  },
  {
    id: "op-2026-004",
    codigoProtocolo: "OP-2026-004",
    clienteNome: "Transportadora & Frotas Tangará Ltda",
    clienteDocumento: "34.567.890/0002-95",
    clienteTipo: "PJ",
    empresaOrigemId: "bancofe_logistica",
    empresaOrigemNome: "BancoFe Logística",
    tipoOperacao: "financiamento_frotas",
    tipoOperacaoLabel: "Financiamento de Frotas & Carretas Scania",
    valorSolicitado: 1850000,
    valorAprovado: 1750000,
    prazoMeses: 48,
    taxaMensalPercentual: 1.38,
    sistemaAmortizacao: "SAC",
    estagio: "comite_aprovacao",
    scoreSerasa: 840,
    ratingBacen: "B",
    probabilidadeConversao: 80,
    responsavelMesa: "Comitê de Crédito Corporativo",
    contatoEmail: "frotas@transportes.com.br",
    contatoTelefone: "(65) 99911-2233",
    observacoes: "Aquisição de 3 cavalos mecânicos Scania R540 com alienação fiduciária e telemetria GPS integrada ao ERP.",
    historicoEtapas: [
      { data: "2026-11-20T15:00:00Z", estagio: "qualificacao", autor: "Gerente Frotas", nota: "Orçamentos Scania anexados" },
      { data: "2026-11-22T11:00:00Z", estagio: "comite_aprovacao", autor: "Mesa de Crédito", nota: "Enviado para deliberação do comitê com parecer favorável" },
    ],
    criadoEm: "2026-11-20T15:00:00Z",
    atualizadoEm: "2026-11-23T07:15:00Z",
  },
  {
    id: "op-2026-005",
    clienteNome: "Boutique Zuma Concept Moda e Acessórios",
    codigoProtocolo: "OP-2026-005",
    clienteDocumento: "52.123.456/0002-59",
    clienteTipo: "PJ",
    empresaOrigemId: "zuma_moda",
    empresaOrigemNome: "Zuma Moda & Boutique",
    tipoOperacao: "capital_giro_pj",
    tipoOperacaoLabel: "Capital de Giro Rápido para Coleção Verão",
    valorSolicitado: 340000,
    valorAprovado: 340000,
    prazoMeses: 18,
    taxaMensalPercentual: 1.42,
    sistemaAmortizacao: "PRICE",
    estagio: "qualificacao",
    scoreSerasa: 860,
    ratingBacen: "A",
    probabilidadeConversao: 70,
    responsavelMesa: "Rodrigo Gonçalves",
    contatoEmail: "comercial@zumamoda.com.br",
    contatoTelefone: "(65) 99611-9988",
    observacoes: "Compra de mostruário, peças de linho e tecidos premium para inauguração da loja conceito em Tangará.",
    historicoEtapas: [
      { data: "2026-11-21T09:00:00Z", estagio: "prospeccao", autor: "Loja Boutique", nota: "Necessidade de estoque de fim de ano" },
      { data: "2026-11-22T17:00:00Z", estagio: "qualificacao", autor: "Mesa de Crédito", nota: "DRE preliminar e faturamento analisados" },
    ],
    criadoEm: "2026-11-21T09:00:00Z",
    atualizadoEm: "2026-11-23T05:40:00Z",
  },
  {
    id: "op-2026-006",
    clienteNome: "Usinas de Concreto Serrano & Premoldados S.A.",
    codigoProtocolo: "OP-2026-006",
    clienteDocumento: "18.987.654/0002-70",
    clienteTipo: "PJ",
    empresaOrigemId: "holding_kytto",
    empresaOrigemNome: "Holding Kytto",
    tipoOperacao: "desconto_duplicatas",
    tipoOperacaoLabel: "Desconto de Duplicatas & Recebíveis de Obras",
    valorSolicitado: 5200000,
    valorAprovado: 5200000,
    prazoMeses: 24,
    taxaMensalPercentual: 1.18,
    sistemaAmortizacao: "SAC",
    estagio: "prospeccao",
    scoreSerasa: 940,
    ratingBacen: "AA",
    probabilidadeConversao: 60,
    responsavelMesa: "Diretoria de Operações",
    contatoEmail: "concreto@kytto.com.br",
    contatoTelefone: "(65) 99933-7711",
    observacoes: "Duplicatas mercantis emitidas contra construtoras e obras de pavimentação em Mato Grosso.",
    historicoEtapas: [
      { data: "2026-11-22T14:00:00Z", estagio: "prospeccao", autor: "Mesa de Fomento", nota: "Mapeamento de 28 duplicatas a descontar" },
    ],
    criadoEm: "2026-11-22T14:00:00Z",
    atualizadoEm: "2026-11-23T07:10:00Z",
  },
  {
    id: "op-2026-007",
    clienteNome: "Cooperativa Agrícola Regional dos Parecis",
    codigoProtocolo: "OP-2026-007",
    clienteDocumento: "03.456.789/0001-22",
    clienteTipo: "PJ",
    empresaOrigemId: "bancofe_credito",
    empresaOrigemNome: "BancoFe Crédito PJ",
    tipoOperacao: "antecipacao_recebiveis",
    tipoOperacaoLabel: "Cessão de Crédito Estruturado FIDC Agrícola",
    valorSolicitado: 3100000,
    valorAprovado: 3100000,
    prazoMeses: 12,
    taxaMensalPercentual: 1.08,
    sistemaAmortizacao: "SAC",
    estagio: "formalizacao_ccb",
    scoreSerasa: 880,
    ratingBacen: "A",
    probabilidadeConversao: 90,
    responsavelMesa: "Mesa FIDC BancoFe",
    contatoEmail: "credito@parecisagro.coop.br",
    contatoTelefone: "(65) 3311-5500",
    observacoes: "Cessão de carteira de contratos de venda futura com travas de garantia e seguro agrícola.",
    historicoEtapas: [
      { data: "2026-11-19T08:30:00Z", estagio: "prospeccao", autor: "Gerente Parcerias", nota: "Auditoria contábil da cooperativa realizada" },
      { data: "2026-11-21T10:00:00Z", estagio: "mesa_credito", autor: "Mesa de Crédito", nota: "Rating A aprovado com lastro fiduciário" },
      { data: "2026-11-23T06:00:00Z", estagio: "formalizacao_ccb", autor: "Mesa FIDC", nota: "Contrato de cessão pronto para formalização" },
    ],
    criadoEm: "2026-11-19T08:30:00Z",
    atualizadoEm: "2026-11-23T06:00:00Z",
  }
];

export class CrmFinanceiraStore {
  private oportunidades: OportunidadeOperacaoFinanceira[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    try {
      const dir = path.dirname(CRM_DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(CRM_DATA_FILE)) {
        const raw = fs.readFileSync(CRM_DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.oportunidades = parsed;
        } else {
          this.oportunidades = JSON.parse(JSON.stringify(DADOS_INICIAIS));
          this.salvar();
        }
      } else {
        this.oportunidades = JSON.parse(JSON.stringify(DADOS_INICIAIS));
        this.salvar();
      }
    } catch (e) {
      console.error("[CrmFinanceiraStore] Falha ao carregar arquivo, utilizando dados base:", e);
      this.oportunidades = JSON.parse(JSON.stringify(DADOS_INICIAIS));
    }

    this.initialized = true;
  }

  private salvar() {
    try {
      fs.writeFileSync(CRM_DATA_FILE, JSON.stringify(this.oportunidades, null, 2), "utf-8");
    } catch (e) {
      console.error("[CrmFinanceiraStore] Falha ao persistir dados:", e);
    }
  }

  public listarOportunidades(filtros?: {
    estagio?: string;
    empresaOrigemId?: string;
    termo?: string;
  }): OportunidadeOperacaoFinanceira[] {
    let lista = [...this.oportunidades];

    if (filtros?.estagio && filtros.estagio !== "todos") {
      lista = lista.filter((o) => o.estagio === filtros.estagio);
    }

    if (filtros?.empresaOrigemId && filtros.empresaOrigemId !== "todos") {
      lista = lista.filter((o) => o.empresaOrigemId === filtros.empresaOrigemId);
    }

    if (filtros?.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(
        (o) =>
          o.clienteNome.toLowerCase().includes(t) ||
          o.clienteDocumento.includes(t) ||
          o.codigoProtocolo.toLowerCase().includes(t) ||
          o.tipoOperacaoLabel.toLowerCase().includes(t)
      );
    }

    return lista.sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
  }

  public obterPorId(id: string): OportunidadeOperacaoFinanceira | null {
    return this.oportunidades.find((o) => o.id === id || o.codigoProtocolo === id) || null;
  }

  public criarOportunidade(dados: Partial<OportunidadeOperacaoFinanceira>): OportunidadeOperacaoFinanceira {
    const agora = new Date().toISOString();
    const count = this.oportunidades.length + 1;
    const protocolNumber = String(count).padStart(3, "0");
    const id = `op-2026-${protocolNumber}`;

    const nova: OportunidadeOperacaoFinanceira = {
      id,
      codigoProtocolo: `OP-2026-${protocolNumber}`,
      clienteNome: dados.clienteNome || "Novo Cliente Corporativo",
      clienteDocumento: dados.clienteDocumento || "00.000.000/0001-00",
      clienteTipo: dados.clienteTipo || "PJ",
      empresaOrigemId: dados.empresaOrigemId || "bancofe",
      empresaOrigemNome: dados.empresaOrigemNome || "BancoFe Fintech",
      tipoOperacao: dados.tipoOperacao || "capital_giro_pj",
      tipoOperacaoLabel: dados.tipoOperacaoLabel || "Capital de Giro PJ Estruturado",
      valorSolicitado: Number(dados.valorSolicitado || 100000),
      valorAprovado: Number(dados.valorAprovado || dados.valorSolicitado || 100000),
      prazoMeses: Number(dados.prazoMeses || 12),
      taxaMensalPercentual: Number(dados.taxaMensalPercentual || 1.35),
      sistemaAmortizacao: dados.sistemaAmortizacao || "PRICE",
      estagio: dados.estagio || "prospeccao",
      scoreSerasa: Number(dados.scoreSerasa || 850),
      ratingBacen: dados.ratingBacen || "A",
      probabilidadeConversao: Number(dados.probabilidadeConversao || 75),
      responsavelMesa: dados.responsavelMesa || "Rodrigo Gonçalves",
      contatoEmail: dados.contatoEmail,
      contatoTelefone: dados.contatoTelefone,
      sacadoCedenteInfo: dados.sacadoCedenteInfo,
      observacoes: dados.observacoes || "Oportunidade originada via painel /admin CRM Financeiro.",
      historicoEtapas: [
        {
          data: agora,
          estagio: dados.estagio || "prospeccao",
          autor: dados.responsavelMesa || "Rodrigo Gonçalves",
          nota: "Oportunidade criada com sucesso.",
        },
      ],
      criadoEm: agora,
      atualizadoEm: agora,
    };

    this.oportunidades.unshift(nova);
    this.salvar();
    return nova;
  }

  public atualizarOportunidade(
    id: string,
    atualizacao: Partial<OportunidadeOperacaoFinanceira>,
    autor = "Mesa de Operações"
  ): OportunidadeOperacaoFinanceira | null {
    const index = this.oportunidades.findIndex((o) => o.id === id || o.codigoProtocolo === id);
    if (index === -1) return null;

    const op = this.oportunidades[index];
    const agora = new Date().toISOString();

    const estagioMudou = atualizacao.estagio && atualizacao.estagio !== op.estagio;
    const historico = [...op.historicoEtapas];

    if (estagioMudou) {
      historico.push({
        data: agora,
        estagio: atualizacao.estagio!,
        autor,
        nota: atualizacao.observacoes || `Avanço de estágio para: ${atualizacao.estagio}`,
      });
    }

    const atualizado: OportunidadeOperacaoFinanceira = {
      ...op,
      ...atualizacao,
      historicoEtapas: historico,
      atualizadoEm: agora,
    };

    this.oportunidades[index] = atualizado;
    this.salvar();
    return atualizado;
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

  public obterMetricasGestao(): MetricasGestaoCrmFinanceira {
    let volumeTotalPipeline = 0;
    let volumeLiquidadoMes = 0;
    let somaTaxas = 0;
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

    for (const op of this.oportunidades) {
      const val = op.valorAprovado || op.valorSolicitado;
      volumeTotalPipeline += val;
      somaTaxas += op.taxaMensalPercentual;

      if (op.estagio === "liquidado") {
        volumeLiquidadoMes += val;
      }

      if (!estagios[op.estagio]) {
        estagios[op.estagio] = { count: 0, volumeTotal: 0 };
      }
      estagios[op.estagio].count++;
      estagios[op.estagio].volumeTotal += val;

      const empId = op.empresaOrigemId;
      if (!empresas[empId]) {
        empresas[empId] = { count: 0, volumeTotal: 0 };
      }
      empresas[empId].count++;
      empresas[empId].volumeTotal += val;
    }

    const total = this.oportunidades.length || 1;
    const ticketMedio = volumeTotalPipeline / total;
    const taxaMediaMensal = Number((somaTaxas / total).toFixed(2));

    return {
      volumeTotalPipeline,
      volumeLiquidadoMes,
      totalOportunidadesAtivas: this.oportunidades.filter((o) => o.estagio !== "liquidado" && o.estagio !== "perdido").length,
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

    // Alíquota de IOF PF/PJ aproximada (0.38% flat + 0.0041% diário, cap 3.0%)
    const iofCalculado = Math.round(valorBruto * Math.min(0.0038 + (prazo * 30 * 0.000041), 0.03));
    const valorLiquido = valorBruto - tac - iofCalculado;

    // Cronograma de parcelas
    const parcelas: Array<{
      numero: number;
      saldoDevedorInicial: number;
      amortizacao: number;
      juros: number;
      prestacao: number;
      saldoDevedorFinal: number;
    }> = [];

    let saldo = valorBruto;
    let totalPago = 0;
    let totalJuros = 0;

    if (sistema === "PRICE") {
      const prestacaoFixa = valorBruto * ((taxaMes * Math.pow(1 + taxaMes, prazo)) / (Math.pow(1 + taxaMes, prazo) - 1));
      for (let i = 1; i <= prazo; i++) {
        const juros = saldo * taxaMes;
        const amortizacao = prestacaoFixa - juros;
        const saldoFinal = Math.max(0, saldo - amortizacao);
        parcelas.push({
          numero: i,
          saldoDevedorInicial: Math.round(saldo),
          amortizacao: Math.round(amortizacao),
          juros: Math.round(juros),
          prestacao: Math.round(prestacaoFixa),
          saldoDevedorFinal: Math.round(saldoFinal),
        });
        saldo = saldoFinal;
        totalPago += prestacaoFixa;
        totalJuros += juros;
      }
    } else {
      // SAC
      const amortizacaoConstante = valorBruto / prazo;
      for (let i = 1; i <= prazo; i++) {
        const juros = saldo * taxaMes;
        const prestacao = amortizacaoConstante + juros;
        const saldoFinal = Math.max(0, saldo - amortizacaoConstante);
        parcelas.push({
          numero: i,
          saldoDevedorInicial: Math.round(saldo),
          amortizacao: Math.round(amortizacaoConstante),
          juros: Math.round(juros),
          prestacao: Math.round(prestacao),
          saldoDevedorFinal: Math.round(saldoFinal),
        });
        saldo = saldoFinal;
        totalPago += prestacao;
        totalJuros += juros;
      }
    }

    const cetAnual = ((Math.pow(1 + taxaMes, 12) - 1) * 100).toFixed(2);
    const retornoBancoFe = Math.round(totalJuros + tac);

    return {
      valorBruto,
      valorLiquido,
      tac,
      iofCalculado,
      prazoMeses: prazo,
      taxaMensalPercentual: (taxaMes * 100).toFixed(2),
      cetAnualPercentual: cetAnual,
      sistemaAmortizacao: sistema,
      totalJuros: Math.round(totalJuros),
      totalPago: Math.round(totalPago),
      retornoEsperadoBancoFe: retornoBancoFe,
      parcelaInicial: parcelas[0]?.prestacao || 0,
      parcelaFinal: parcelas[parcelas.length - 1]?.prestacao || 0,
      cronogramaParcelas: parcelas,
    };
  }
}

export const crmFinanceiraStore = new CrmFinanceiraStore();
