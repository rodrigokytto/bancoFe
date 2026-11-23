import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ClienteEmpresa360,
  DocumentoPreCadastro,
  TermoDigitalBancoFe,
  MetricasCadastro360,
  TipoDocumentoPreCadastro,
  TipoTermoDigital
} from "@shared/cadastro360Types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const CLIENTES_FILE = path.resolve(DATA_DIR, "cadastro360Clientes.json");
const DOCUMENTOS_FILE = path.resolve(DATA_DIR, "precadastroDocumentos.json");
const TERMOS_FILE = path.resolve(DATA_DIR, "termosDigitaisBancoFe.json");

function gerarSha256(conteudo: string): string {
  return crypto.createHash("sha256").update(conteudo).digest("hex");
}

export class Cadastro360Store {
  private static instance: Cadastro360Store;
  private clientes: ClienteEmpresa360[] = [];
  private documentos: DocumentoPreCadastro[] = [];
  private termos: TermoDigitalBancoFe[] = [];
  private initialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): Cadastro360Store {
    if (!Cadastro360Store.instance) {
      Cadastro360Store.instance = new Cadastro360Store();
    }
    return Cadastro360Store.instance;
  }

  private init() {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Carregar Clientes 360
    if (fs.existsSync(CLIENTES_FILE)) {
      try {
        const raw = fs.readFileSync(CLIENTES_FILE, "utf-8");
        this.clientes = JSON.parse(raw);
      } catch {
        this.clientes = this.gerarClientesIniciais();
      }
    } else {
      this.clientes = this.gerarClientesIniciais();
      this.salvarClientes();
    }

    // 2. Carregar Documentos do Pré-Cadastro
    if (fs.existsSync(DOCUMENTOS_FILE)) {
      try {
        const raw = fs.readFileSync(DOCUMENTOS_FILE, "utf-8");
        this.documentos = JSON.parse(raw);
      } catch {
        this.documentos = this.gerarDocumentosIniciais();
      }
    } else {
      this.documentos = this.gerarDocumentosIniciais();
      this.salvarDocumentos();
    }

    // 3. Carregar Termos Digitais
    if (fs.existsSync(TERMOS_FILE)) {
      try {
        const raw = fs.readFileSync(TERMOS_FILE, "utf-8");
        this.termos = JSON.parse(raw);
      } catch {
        this.termos = this.gerarTermosIniciais();
      }
    } else {
      this.termos = this.gerarTermosIniciais();
      this.salvarTermos();
    }

    this.initialized = true;
  }

  private salvarClientes() {
    try {
      fs.writeFileSync(CLIENTES_FILE, JSON.stringify(this.clientes, null, 2), "utf-8");
    } catch (err) {
      console.error("[Cadastro360Store] Erro ao salvar clientes:", err);
    }
  }

  private salvarDocumentos() {
    try {
      fs.writeFileSync(DOCUMENTOS_FILE, JSON.stringify(this.documentos, null, 2), "utf-8");
    } catch (err) {
      console.error("[Cadastro360Store] Erro ao salvar documentos:", err);
    }
  }

  private salvarTermos() {
    try {
      fs.writeFileSync(TERMOS_FILE, JSON.stringify(this.termos, null, 2), "utf-8");
    } catch (err) {
      console.error("[Cadastro360Store] Erro ao salvar termos:", err);
    }
  }

  // ==========================================
  // OPERAÇÕES DE CLIENTES 360
  // ==========================================

  public listarClientes(filtros?: {
    empresaOrigemId?: string;
    statusCadastral?: string;
    busca?: string;
  }): ClienteEmpresa360[] {
    let result = [...this.clientes];

    if (filtros?.empresaOrigemId && filtros.empresaOrigemId !== "todas") {
      result = result.filter((c) => c.empresaOrigemId === filtros.empresaOrigemId);
    }

    if (filtros?.statusCadastral && filtros.statusCadastral !== "todos") {
      result = result.filter((c) => c.statusCadastral === filtros.statusCadastral);
    }

    if (filtros?.busca) {
      const q = filtros.busca.toLowerCase();
      result = result.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(q) ||
          c.nomeFantasia.toLowerCase().includes(q) ||
          c.cnpjCpf.includes(q) ||
          c.codigo.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public obterClientePorId(id: string): ClienteEmpresa360 | undefined {
    return this.clientes.find((c) => c.id === id);
  }

  public criarCliente(dados: Partial<ClienteEmpresa360>): ClienteEmpresa360 {
    const id = `cli-360-${Date.now().toString(36)}`;
    const num = (this.clientes.length + 1).toString().padStart(4, "0");
    const codigo = `BFE-360-${num}`;
    const agora = new Date().toISOString();

    const novoCliente: ClienteEmpresa360 = {
      id,
      codigo,
      razaoSocial: dados.razaoSocial || "Nova Empresa Parceira Ltda",
      nomeFantasia: dados.nomeFantasia || dados.razaoSocial || "Nova Empresa",
      cnpjCpf: dados.cnpjCpf || "00.000.000/0001-00",
      tipoPessoa: dados.tipoPessoa || "PJ",
      statusCadastral: "pendente_documentos",
      empresaOrigemId: dados.empresaOrigemId || "operacoes_financeiras_crm",
      empresaOrigemNome: dados.empresaOrigemNome || "BancoFe — Operações & CRM",
      dadosCadastrais: dados.dadosCadastrais || {
        dataFundacao: "2020-01-01",
        porte: "MEDIO",
        regimeTributario: "Lucro Presumido",
        cnaePrincipal: { codigo: "46.23-1-09", descricao: "Comércio atacadista de alimentos" },
        cnaesSecundarios: [],
        capitalSocial: 1000000,
        faturamentoAnualDeclarado: 5000000,
        endereco: {
          logradouro: "Av. Brasil",
          numero: "1000",
          bairro: "Centro",
          cidade: "Tangará da Serra",
          uf: "MT",
          cep: "78300-000",
        },
        contatos: {
          nomeResponsavel: "Contato Financeiro",
          cargo: "Diretor Financeiro",
          email: "financeiro@empresa.com.br",
          telefone: "(65) 3326-1000",
          whatsapp: "(65) 99999-0000",
        },
      },
      contaGraficaBancoFe: {
        banco: "BancoFe S.A. (Código 799)",
        agencia: "0001",
        contaCorrente: `${Math.floor(100000 + Math.random() * 900000)}-1`,
        chavePix: dados.cnpjCpf || "financeiro@bancofe.com.br",
        saldoConta: 0,
        limiteChequeEspecial: 50000,
        travaDomicilioBancario: {
          ativa: true,
          registradora: "CERC",
          status: "vigente",
          percentualRetencao: 100,
        },
      },
      quadroSocietario: dados.quadroSocietario || [
        {
          id: `soc-${Date.now()}-1`,
          nome: "Sócio Administrador",
          cpf: "000.000.000-00",
          cargo: "Sócio-Administrador",
          participacaoPercentual: 100,
          pep: false,
          beneficiarioFinalUBO: true,
          dataEntrada: "2020-01-01",
          documentosValidados: true,
        },
      ],
      compliancePLD: {
        scoreCompliance: 90,
        nivelRisco: "baixo",
        ultimaVarredura: agora,
        proximaRevisao: new Date(Date.now() + 180 * 86400000).toISOString(),
        ofacSanctions: { status: "nada_consta", dataConsulta: agora },
        csnuOnu: { status: "nada_consta", dataConsulta: agora },
        ceafGov: { status: "nada_consta", dataConsulta: agora },
        cepim: { status: "nada_consta", dataConsulta: agora },
        trabalhoEscravoMte: { status: "nada_consta", dataConsulta: agora },
        ceisTcu: { status: "nada_consta", dataConsulta: agora },
        scrBacenConforme: true,
        pepIdentificado: false,
        observacoesCompliance: "Varredura automatizada inicial sem pendências.",
      },
      analiseFinanceira: {
        faturamentoUltimos12Meses: dados.dadosCadastrais?.faturamentoAnualDeclarado || 5000000,
        ebitdaAnual: (dados.dadosCadastrais?.faturamentoAnualDeclarado || 5000000) * 0.2,
        margemEbitda: 20.0,
        lucroLiquido: (dados.dadosCadastrais?.faturamentoAnualDeclarado || 5000000) * 0.12,
        ativoTotal: 6500000,
        patrimonioLiquido: 4200000,
        dividaLiquidaEbitda: 1.2,
        liquidezCorrente: 1.85,
        scoreBureau: 780,
        ratingCMN2682: "A",
        provisaoPddExigida: 0.5,
        dataUltimoBalanco: "2025-12-31",
        contadorResponsavel: { nome: "Contabilidade Central MT", crc: "MT-018245/O" },
      },
      limitesOperacionais: {
        limiteGlobalAprovado: 1000000,
        limiteUtilizadoTotal: 0,
        limiteDisponivelTotal: 1000000,
        sublimites: [
          {
            produtoId: "lim_giro",
            produtoNome: "Capital de Giro (CCB)",
            limiteAprovado: 500000,
            limiteTomado: 0,
            limiteDisponivel: 500000,
            taxaPadraoMes: 1.35,
            status: "ativo",
          },
          {
            produtoId: "lim_recebiveis",
            produtoNome: "Desconto de Duplicatas & NF-e",
            limiteAprovado: 500000,
            limiteTomado: 0,
            limiteDisponivel: 500000,
            taxaPadraoMes: 1.15,
            status: "ativo",
          },
        ],
        dataAprovacaoAlcada: agora,
        aprovadoPor: "Mesa de Crédito BancoFe",
        nivelAlcada: "Gerente de Risco",
        validadeLimite: new Date(Date.now() + 365 * 86400000).toISOString(),
      },
      garantiasColaterais: dados.garantiasColaterais || [],
      historicoOperacoes: [],
      percentualCompletudeCadastral: 35,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    this.clientes.unshift(novoCliente);
    this.salvarClientes();

    // Gerar checklist de documentos obrigatórios para o novo pré-cadastro
    this.gerarChecklistDocumentosPadrao(novoCliente);

    // Gerar minutas dos termos regulatórios padrão
    this.gerarTermosPadraoParaCliente(novoCliente);

    return novoCliente;
  }

  public atualizarCliente(id: string, dados: Partial<ClienteEmpresa360>): ClienteEmpresa360 {
    const idx = this.clientes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Cliente ${id} não encontrado.`);

    this.clientes[idx] = {
      ...this.clientes[idx],
      ...dados,
      atualizadoEm: new Date().toISOString(),
    };

    this.recalcularCompletudeCadastral(id);
    this.salvarClientes();
    return this.clientes[idx];
  }

  public executarVarreduraCompliance(id: string): ClienteEmpresa360 {
    const cliente = this.obterClientePorId(id);
    if (!cliente) throw new Error(`Cliente ${id} não encontrado.`);

    const agora = new Date().toISOString();
    cliente.compliancePLD = {
      ...cliente.compliancePLD,
      scoreCompliance: 96,
      nivelRisco: "baixo",
      ultimaVarredura: agora,
      proximaRevisao: new Date(Date.now() + 180 * 86400000).toISOString(),
      ofacSanctions: { status: "nada_consta", dataConsulta: agora },
      csnuOnu: { status: "nada_consta", dataConsulta: agora },
      ceafGov: { status: "nada_consta", dataConsulta: agora },
      cepim: { status: "nada_consta", dataConsulta: agora },
      trabalhoEscravoMte: { status: "nada_consta", dataConsulta: agora },
      ceisTcu: { status: "nada_consta", dataConsulta: agora },
      scrBacenConforme: true,
      observacoesCompliance: `Varredura automatizada 360° executada com sucesso em ${new Date().toLocaleDateString("pt-BR")}. Nenhuma inconformidade regulatória detectada no Bacen/SIT/TCU.`,
    };

    cliente.statusCadastral = "homologado";
    cliente.atualizadoEm = agora;
    this.salvarClientes();
    return cliente;
  }

  // ==========================================
  // OPERAÇÕES DE DOCUMENTOS (VAULT DIGITAL)
  // ==========================================

  public listarDocumentosPorCliente(clienteId: string): DocumentoPreCadastro[] {
    return this.documentos.filter((d) => d.clienteId === clienteId);
  }

  public uploadDocumento(
    clienteId: string,
    tipoDocumento: TipoDocumentoPreCadastro,
    arquivoInfo: {
      arquivoNome: string;
      formato?: string;
      tamanhoBytes?: number;
      arquivoUrl?: string;
      validadeData?: string;
    }
  ): DocumentoPreCadastro {
    const cliente = this.obterClientePorId(clienteId);
    if (!cliente) throw new Error(`Cliente ${clienteId} não encontrado.`);

    const hash = gerarSha256(`${clienteId}_${tipoDocumento}_${Date.now()}`);
    const agora = new Date().toISOString();

    // Verificar se já existe item de checklist para atualizar
    const existente = this.documentos.find(
      (d) => d.clienteId === clienteId && d.tipoDocumento === tipoDocumento
    );

    if (existente) {
      existente.status = "em_analise";
      existente.arquivoNome = arquivoInfo.arquivoNome;
      existente.arquivoUrl = arquivoInfo.arquivoUrl || `/uploads/docs/${arquivoInfo.arquivoNome}`;
      existente.formato = arquivoInfo.formato || "application/pdf";
      existente.tamanhoBytes = arquivoInfo.tamanhoBytes || 1024 * 512;
      existente.hashSha256 = hash;
      existente.dataEnvio = agora;
      existente.validadeData = arquivoInfo.validadeData;
      existente.justificativaRejeicao = undefined;
      this.salvarDocumentos();
      this.recalcularCompletudeCadastral(clienteId);
      return existente;
    }

    const novoDoc: DocumentoPreCadastro = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clienteId,
      clienteNome: cliente.razaoSocial,
      tipoDocumento,
      titulo: this.obterTituloDocumento(tipoDocumento),
      obrigatorio: true,
      categoria: this.obterCategoriaDocumento(tipoDocumento),
      status: "em_analise",
      arquivoNome: arquivoInfo.arquivoNome,
      arquivoUrl: arquivoInfo.arquivoUrl || `/uploads/docs/${arquivoInfo.arquivoNome}`,
      formato: arquivoInfo.formato || "application/pdf",
      tamanhoBytes: arquivoInfo.tamanhoBytes || 1024 * 512,
      hashSha256: hash,
      dataEnvio: agora,
      validadeData: arquivoInfo.validadeData,
    };

    this.documentos.push(novoDoc);
    this.salvarDocumentos();
    this.recalcularCompletudeCadastral(clienteId);
    return novoDoc;
  }

  public alterarStatusDocumento(
    docId: string,
    status: "aprovado" | "rejeitado" | "em_analise",
    operador: string,
    justificativa?: string
  ): DocumentoPreCadastro {
    const doc = this.documentos.find((d) => d.id === docId);
    if (!doc) throw new Error(`Documento ${docId} não encontrado.`);

    doc.status = status;
    doc.analisadoPor = operador;
    doc.dataAnalise = new Date().toISOString();

    if (status === "rejeitado") {
      doc.justificativaRejeicao = justificativa || "Documento com inconformidade ou ilegível.";
    } else {
      doc.justificativaRejeicao = undefined;
    }

    this.salvarDocumentos();
    this.recalcularCompletudeCadastral(doc.clienteId);
    return doc;
  }

  private recalcularCompletudeCadastral(clienteId: string) {
    const docs = this.listarDocumentosPorCliente(clienteId);
    const cliente = this.obterClientePorId(clienteId);
    if (!cliente || docs.length === 0) return;

    const obrigatorios = docs.filter((d) => d.obrigatorio);
    const aprovados = obrigatorios.filter((d) => d.status === "aprovado").length;
    const pct = Math.round((aprovados / obrigatorios.length) * 100);

    cliente.percentualCompletudeCadastral = pct;
    if (pct >= 90) {
      cliente.statusCadastral = "homologado";
    } else if (docs.some((d) => d.status === "rejeitado")) {
      cliente.statusCadastral = "pendente_documentos";
    } else if (docs.some((d) => d.status === "em_analise")) {
      cliente.statusCadastral = "em_analise";
    }

    this.salvarClientes();
  }

  // ==========================================
  // OPERAÇÕES DE TERMOS DIGITAIS
  // ==========================================

  public listarTermosPorCliente(clienteId: string): TermoDigitalBancoFe[] {
    return this.termos.filter((t) => t.clienteId === clienteId);
  }

  public obterTermoPorId(termoId: string): TermoDigitalBancoFe | undefined {
    return this.termos.find((t) => t.id === termoId);
  }

  public assinarTermo(
    termoId: string,
    signatarioInfo: {
      nome: string;
      cpf: string;
      ip?: string;
    }
  ): TermoDigitalBancoFe {
    const termo = this.obterTermoPorId(termoId);
    if (!termo) throw new Error(`Termo ${termoId} não encontrado.`);

    const agora = new Date().toISOString();
    termo.status = "assinado";
    termo.dataAssinatura = agora;
    termo.signatarioNome = signatarioInfo.nome;
    termo.signatarioCpf = signatarioInfo.cpf;
    termo.signatarioIp = signatarioInfo.ip || "177.136.240.12";
    termo.certificadoDigital = "Assinatura Eletrônica Avançada Lei 14.063/20";
    termo.hashIntegridadeSha256 = gerarSha256(
      `${termo.id}_${signatarioInfo.cpf}_${agora}_${termo.conteudoMinutaMarkdown}`
    );

    this.salvarTermos();
    return termo;
  }

  // ==========================================
  // MÉTRICAS GERAIS CADASTRO 360
  // ==========================================

  public obterMetricasGerais(): MetricasCadastro360 {
    const totalClientes = this.clientes.length;
    const homologadas = this.clientes.filter((c) => c.statusCadastral === "homologado").length;
    const pendentes = this.clientes.filter((c) => c.statusCadastral === "pendente_documentos").length;
    const restricoes = this.clientes.filter((c) => c.statusCadastral === "restricao_compliance").length;

    let volAprovado = 0;
    let volTomado = 0;
    let somaCompletude = 0;

    for (const c of this.clientes) {
      volAprovado += c.limitesOperacionais.limiteGlobalAprovado;
      volTomado += c.limitesOperacionais.limiteUtilizadoTotal;
      somaCompletude += c.percentualCompletudeCadastral;
    }

    const docsEmAnalise = this.documentos.filter((d) => d.status === "em_analise").length;
    const termosAssinados = this.termos.filter((t) => t.status === "assinado").length;
    const termosPendentes = this.termos.filter((t) => t.status !== "assinado").length;

    return {
      totalClientesCadastrados: totalClientes,
      totalEmpresasHomologadas: homologadas,
      totalPendenteDocumentos: pendentes,
      totalRestricaoCompliance: restricoes,
      volumeTotalLimitesAprovados: volAprovado,
      volumeTotalLimitesUtilizados: volTomado,
      volumeTotalLimitesDisponiveis: Math.max(0, volAprovado - volTomado),
      taxaMediaCompletudeCadastral: totalClientes > 0 ? Math.round(somaCompletude / totalClientes) : 0,
      totalDocumentosEmAnalise: docsEmAnalise,
      totalTermosAssinados: termosAssinados,
      totalTermosPendentes: termosPendentes,
    };
  }

  // ==========================================
  // SEED DATA & GERADORES DE CHECKLIST
  // ==========================================

  private obterTituloDocumento(tipo: TipoDocumentoPreCadastro): string {
    const titulos: Record<TipoDocumentoPreCadastro, string> = {
      cartao_cnpj: "Cartão CNPJ / Comprovante de Inscrição na RFB",
      contrato_social_estatuto: "Contrato Social Consolidado ou Estatuto com Ata de Eleição",
      documento_socios_cnh: "Documento Oficial com Foto dos Sócios e Administradores (RG/CNH)",
      comprovante_sede_endereco: "Comprovante de Endereço / Sede Social da Empresa",
      balanco_patrimonial_dre: "Balanço Patrimonial dos 2 Últimos Exercícios com DRE (CRC Ativo)",
      faturamento_12m_pgdas: "Relação de Faturamento dos Últimos 12 Meses (Extrato PGDAS/SPED)",
      cnd_federal_fgts_trabalhista: "Certidão Conjunta Federal (PGFN), FGTS (CRF) e CNDT Trabalhista",
      declaracao_irpf_socios: "Declaração de IRPF e Recibo de Entrega dos Sócios Majoritários",
      garantia_matricula_ccir: "Certidão de Matrícula de Imóvel com Ônus Reais ou CCIR/CAR Agrícola",
      domicilio_bancario_trava: "Comprovante de Conta BancoFe e Termo de Trava de Domicílio CERC",
      declaracao_origem_recursos_pld: "Declaração de Propósito da Operação & Origem de Recursos (PLD-FT)",
      cnd_estadual_municipal: "Certidão Negativa de Débitos Estaduais (SEFAZ) e Municipais",
      procuracao_certidao_junta: "Certidão Simplificada da Junta Comercial (JUCEMAT/JUCESP)",
    };
    return titulos[tipo] || "Documento Complementar";
  }

  private obterCategoriaDocumento(tipo: TipoDocumentoPreCadastro): DocumentoPreCadastro["categoria"] {
    if (["cartao_cnpj", "contrato_social_estatuto", "documento_socios_cnh", "comprovante_sede_endereco", "procuracao_certidao_junta"].includes(tipo)) {
      return "cadastral";
    }
    if (["balanco_patrimonial_dre", "faturamento_12m_pgdas", "declaracao_irpf_socios"].includes(tipo)) {
      return "financeiro";
    }
    if (["cnd_federal_fgts_trabalhista", "cnd_estadual_municipal"].includes(tipo)) {
      return "certidoes";
    }
    if (["garantia_matricula_ccir", "domicilio_bancario_trava"].includes(tipo)) {
      return "garantias";
    }
    return "compliance";
  }

  private gerarChecklistDocumentosPadrao(cliente: ClienteEmpresa360) {
    const tipos: TipoDocumentoPreCadastro[] = [
      "cartao_cnpj",
      "contrato_social_estatuto",
      "documento_socios_cnh",
      "comprovante_sede_endereco",
      "balanco_patrimonial_dre",
      "faturamento_12m_pgdas",
      "cnd_federal_fgts_trabalhista",
      "declaracao_irpf_socios",
      "garantia_matricula_ccir",
      "domicilio_bancario_trava",
      "declaracao_origem_recursos_pld",
      "cnd_estadual_municipal",
      "procuracao_certidao_junta",
    ];

    for (const tipo of tipos) {
      const hash = gerarSha256(`${cliente.id}_${tipo}`);
      this.documentos.push({
        id: `doc-${cliente.id}-${tipo}`,
        clienteId: cliente.id,
        clienteNome: cliente.razaoSocial,
        tipoDocumento: tipo,
        titulo: this.obterTituloDocumento(tipo),
        obrigatorio: true,
        categoria: this.obterCategoriaDocumento(tipo),
        status: "pendente_envio",
        hashSha256: hash,
      });
    }

    this.salvarDocumentos();
  }

  private gerarTermosPadraoParaCliente(cliente: ClienteEmpresa360) {
    const agora = new Date().toISOString();
    const termosInfo: Array<{ tipo: TipoTermoDigital; titulo: string; normativa: string; markdown: string }> = [
      {
        tipo: "consentimento_scr_bacen",
        titulo: "Termo de Consentimento para Consulta ao SCR / Banco Central",
        normativa: "Resolução CMN nº 4.571/2017 e Resolução BCB nº 105/2021",
        markdown: `# TERMO DE CONSENTIMENTO PARA CONSULTA AO SISTEMA DE INFORMAÇÕES DE CRÉDITO (SCR) DO BANCO CENTRAL DO BRASIL

Pelo presente instrumento, a empresa **${cliente.razaoSocial}**, inscrita no CNPJ/MF sob o nº **${cliente.cnpjCpf}**, neste ato representada por seus administradores constituídos, **AUTORIZA** expressamente o **BANCOFE S.A. - BANCO MÚLTIPLO DIGITAL**, instituição financeira participante do Sistema Financeiro Nacional, a consultar as informações consolidadas relativas a operações de crédito, coobrigações e limites de crédito em nome da empresa e de seus sócios perante o **Sistema de Informações de Crédito (SCR)**, administrado pelo **Banco Central do Brasil (BACEN)**.

## 1. Finalidades da Consulta
A presente autorização é outorgada em caráter irrevogável e irretratável para fins de:
a) Avaliação e concessão de limites de crédito operacional, capital de giro e desconto de títulos;
b) Monitoramento contínuo do risco de crédito e solvência da empresa e garantidores;
c) Cumprimento das exigências prudenciais estabelecidas pela Resolução CMN nº 2.682/1999 e Resolução CMN nº 4.966/2021.

## 2. Ciência e Direitos do Titular
A empresa declara-se ciente de que:
- O SCR tem por finalidades fornecer ao Banco Central informações para fins de supervisão do risco de crédito e propiciar o intercâmbio de informações entre instituições financeiras;
- O cliente poderá ter acesso aos dados constantes em seu nome no SCR por meio do sistema Registrato do Banco Central do Brasil;
- Eventuais pedidos de correção, exclusão ou registro de manifestação de discordância deverão ser direcionados à instituição que originou o registro.

São Paulo/Tangará da Serra, ${new Date().toLocaleDateString("pt-BR")}.`,
      },
      {
        tipo: "abertura_conta_grafica_domicilio",
        titulo: "Termo de Abertura de Conta Gráfica & Domicílio Bancário BancoFe",
        normativa: "Resolução BCB nº 96/2021 e Circular Bacen 3.952/2019",
        markdown: `# TERMO DE ADESÃO À CONTA GRÁFICA DIGITAL E DOMICÍLIO BANCÁRIO BANCOFE

A empresa **${cliente.razaoSocial}** (CNPJ: **${cliente.cnpjCpf}**) adere expressamente às Condições Gerais de Abertura de Conta Gráfica de Pagamentos e Liquidação Financeira junto ao **BANCOFE S.A. (Código de Compensação 799)**, vinculada à Agência **0001**, com faculdade de emissão de chaves PIX dinâmicas e estáticas, liquidação de borderôs e trava de recebíveis.

## Cláusula de Domicílio e Liquidação Centralizada
As partes estabelecem que os recursos provenientes das operações de fomento mercantil, desconto de duplicatas mercantis e antecipação de recebíveis de cartões serão obrigatoriamente liquidados na Conta Gráfica BancoFe, constituindo domicílio bancário irrevogável nos termos das normativas das Registradoras de Recebíveis (CERC/CIP/TAG).`,
      },
      {
        tipo: "adesao_pld_ft_compliance",
        titulo: "Termo de Adesão à Política de Prevenção à Lavagem de Dinheiro (PLD-FT)",
        normativa: "Lei Federal nº 9.613/1998 e Circular BACEN nº 3.978/2020",
        markdown: `# TERMO DE CONFORMIDADE E DECLARAÇÃO DE PREVENÇÃO À LAVAGEM DE DINHEIRO E FINANCIAMENTO DO TERRORISMO (PLD-FT)

A empresa **${cliente.razaoSocial}** declara sob as penas da lei que todas as transações, operações de crédito e aportes operados através do BancoFe decorrem de atividades lícitas, legítimas e com origem patrimonial devidamente comprovada em seus balanços e declarações de renda.

Declara outrossim que seus sócios, administradores e beneficiários finais (UBOs) não figuram em listas restritivas internacionais (OFAC, CSNU, Interpol) nem no cadastro de empregadores que submeteram trabalhadores a condições análogas à escravidão do Ministério do Trabalho e Emprego (MTE).`,
      },
      {
        tipo: "consentimento_open_finance",
        titulo: "Termo de Consentimento para Compartilhamento de Dados Open Finance Brasil",
        normativa: "Resolução Conjunta nº 1/2020 BACEN/CMN",
        markdown: `# TERMO DE CONSENTIMENTO OPEN FINANCE BRASIL

Autorização expressa concedida pela empresa **${cliente.razaoSocial}** ao **BancoFe S.A.** para recepcionar, consolidar e processar dados cadastrais, transacionais e histórico de limites provenientes de outras instituições financeiras participantes do ecossistema Open Finance, com vistas à redução das taxas de juros e elevação dos limites de crédito operacionais.`,
      },
      {
        tipo: "cessao_fiduciaria_recebiveis_trava",
        titulo: "Termo de Cessão Fiduciária de Recebíveis & Trava de Domicílio",
        normativa: "Lei nº 9.514/1997 e Lei nº 10.931/2004",
        markdown: `# TERMO DE CONSTITUIÇÃO DE CESSÃO FIDUCIÁRIA DE DIREITOS CREDITÓRIOS E RECEBÍVEIS

Para garantia do fiel e integral cumprimento de todas as obrigações pecuniárias decorrentes de operações de crédito, a empresa **${cliente.razaoSocial}** cede fiduciariamente ao **BancoFe S.A.** a totalidade dos direitos creditórios oriundos de recebíveis de cartões de débito/crédito e duplicatas mercantis emitidas contra sacados comerciais, com registro formal perante a registradora de ativos financeiros autorizada pelo BACEN (CERC/CIP).`,
      },
      {
        tipo: "constituicao_garantias_aval",
        titulo: "Termo de Constituição de Garantias & Aval Solidário dos Sócios",
        normativa: "Código Civil Brasileiro (Arts. 818 e seguintes) e Lei 10.931/2004",
        markdown: `# TERMO DE AVAL E FIANÇA SOLIDÁRIA EM GARANTIA DE OPERAÇÕES FINANCEIRAS

Os sócios administradores da empresa **${cliente.razaoSocial}** declaram-se garantidores e principais pagadores, em caráter solidário e com expressa renúncia ao benefício de ordem insculpido no Artigo 827 do Código Civil, de todas as operações de crédito contratadas perante o BancoFe.`,
      },
      {
        tipo: "ccb_eletronica_credito",
        titulo: "Minuta Geral de Cédula de Crédito Bancário Eletrônica (CCB)",
        normativa: "Lei Federal nº 10.931/2004 (Artigos 26 a 45)",
        markdown: `# CÉDULA DE CRÉDITO BANCÁRIO ELETRÔNICA (CCB) - MINUTA PADRÃO BANCOFE

**EMITENTE:** ${cliente.razaoSocial} (CNPJ: ${cliente.cnpjCpf})
**CREDOR:** BancoFe S.A. - Banco Múltiplo Digital (CNPJ: 34.567.890/0001-12)
**PRAÇA DE PAGAMENTO:** Tangará da Serra/MT ou São Paulo/SP

Pela presente Cédula de Crédito Bancário, emitida com fundamento na Lei nº 10.931/2004, o Emitente confessa-se devedor ao Credor da quantia líquida, certa e exigível correspondente aos desembolsos efetivados sob a esteira de crédito do BancoFe, acrescida dos juros remuneratórios e encargos contratados. Título executivo extrajudicial dotado de plena eficácia jurídica conforme a MP nº 899/2019 e Lei nº 14.063/2020.`,
      },
    ];

    for (const t of termosInfo) {
      const termoId = `trm-${cliente.id}-${t.tipo}`;
      const hash = gerarSha256(`${cliente.id}_${t.tipo}_${t.markdown}`);
      this.termos.push({
        id: termoId,
        codigo: `TRM-${cliente.codigo.replace("BFE-360-", "")}-${t.tipo.substring(0, 4).toUpperCase()}`,
        tipoTermo: t.tipo,
        titulo: t.titulo,
        normativaReferencia: t.normativa,
        clienteId: cliente.id,
        clienteNome: cliente.razaoSocial,
        clienteCnpjCpf: cliente.cnpjCpf,
        status: "minuta_gerada",
        dataGeracao: agora,
        hashIntegridadeSha256: hash,
        conteudoMinutaMarkdown: t.markdown,
      });
    }

    this.salvarTermos();
  }

  // ==========================================
  // CARGA INICIAL DE 8 EMPRESAS BANCOFE
  // ==========================================

  private gerarClientesIniciais(): ClienteEmpresa360[] {
    return [
      {
        id: "cli-360-001",
        codigo: "BFE-360-0001",
        razaoSocial: "Casanova Empreendimentos Imobiliários Ltda",
        nomeFantasia: "Casanova Engenharia & Loteamentos",
        cnpjCpf: "18.987.654/0001-99",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "holding_kytto",
        empresaOrigemNome: "Holding Kytto Controladoria",
        dadosCadastrais: {
          inscricaoEstadual: "13.456.789-0",
          dataFundacao: "2014-03-15",
          porte: "GRANDE",
          regimeTributario: "Lucro Presumido",
          cnaePrincipal: { codigo: "41.10-7-00", descricao: "Incorporação de empreendimentos imobiliários" },
          cnaesSecundarios: [
            { codigo: "41.20-4-00", descricao: "Construção de edifícios" },
            { codigo: "68.10-2-01", descricao: "Compra e venda de imóveis próprios" },
          ],
          capitalSocial: 15000000,
          faturamentoAnualDeclarado: 48000000,
          endereco: {
            logradouro: "Av. Brasil",
            numero: "2450-A",
            bairro: "Jardim Europa",
            cidade: "Tangará da Serra",
            uf: "MT",
            cep: "78300-112",
          },
          contatos: {
            nomeResponsavel: "Rodrigo Ribeiro Gonçalves",
            cargo: "Diretor Geral",
            email: "diretoria@casanova.kytto.com.br",
            telefone: "(65) 3326-8800",
            whatsapp: "(65) 99988-1001",
            departamentoFinanceiro: {
              nome: "Ana Paula Silva",
              email: "financeiro@casanova.kytto.com.br",
              telefone: "(65) 3326-8815",
            },
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "482019-4",
          chavePix: "18.987.654/0001-99",
          saldoConta: 1245800.5,
          limiteChequeEspecial: 500000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-001-1",
            nome: "Rodrigo Ribeiro Gonçalves",
            cpf: "123.456.789-00",
            cargo: "Sócio-Administrador",
            participacaoPercentual: 85,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2014-03-15",
            documentosValidados: true,
            email: "rodrigo.goncalves@kytto.com.br",
            telefone: "(65) 99988-1001",
          },
          {
            id: "soc-001-2",
            nome: "Kytto Participações Societárias S.A.",
            cpf: "18.987.654/0001-00",
            cargo: "Pessoa Jurídica Sócia",
            participacaoPercentual: 15,
            pep: false,
            beneficiarioFinalUBO: false,
            dataEntrada: "2018-06-20",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 98,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-20T14:30:00Z",
          proximaRevisao: "2027-05-20T14:30:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-20T14:30:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Dossiê corporativo 100% regular perante Bacen e Receita Federal.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 48000000,
          ebitdaAnual: 14200000,
          margemEbitda: 29.58,
          lucroLiquido: 10400000,
          ativoTotal: 68500000,
          patrimonioLiquido: 45200000,
          dividaLiquidaEbitda: 0.85,
          liquidezCorrente: 2.84,
          scoreBureau: 920,
          ratingCMN2682: "AA",
          provisaoPddExigida: 0.0,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Marcio L. Silveira", crc: "MT-009412/O-4" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 12000000,
          limiteUtilizadoTotal: 4500000,
          limiteDisponivelTotal: 7500000,
          sublimites: [
            {
              produtoId: "lim_ccb",
              produtoNome: "CCB Estruturada Imobiliária",
              limiteAprovado: 8000000,
              limiteTomado: 4500000,
              limiteDisponivel: 3500000,
              taxaPadraoMes: 1.25,
              status: "ativo",
            },
            {
              produtoId: "lim_giro",
              produtoNome: "Capital de Giro Rotativo",
              limiteAprovado: 2500000,
              limiteTomado: 0,
              limiteDisponivel: 2500000,
              taxaPadraoMes: 1.35,
              status: "ativo",
            },
            {
              produtoId: "lim_recebiveis",
              produtoNome: "Desconto de Recebíveis de Venda",
              limiteAprovado: 1500000,
              limiteTomado: 0,
              limiteDisponivel: 1500000,
              taxaPadraoMes: 1.15,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-15T10:00:00Z",
          aprovadoPor: "Comitê Executivo BancoFe",
          nivelAlcada: "Comitê Executivo",
          validadeLimite: "2027-11-15T10:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-001",
            tipoGarantia: "alienacao_fiduciaria_imovel",
            descricao: "Alienação Fiduciária do Loteamento Parque dos Ipês (Matrícula 45.890 - 1º RGI Tangará/MT)",
            valorAvaliacao: 18500000,
            valorGarantiaComprometida: 6000000,
            ltvPercentual: 32.4,
            detalhesRegistro: {
              matriculaOuContrato: "45.890 Livro 2-RG",
              cartorioOuRegistradora: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
              dataRegistro: "2026-10-10",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-001",
            numeroContrato: "CCB-2026-001-CASANOVA",
            tipoOperacao: "CCB Fomento & Obra",
            valorOriginal: 4500000,
            saldoDevedor: 4500000,
            taxaMensal: 1.25,
            dataContratacao: "2026-11-18",
            vencimentoFinal: "2029-11-18",
            parcelasTotal: 36,
            parcelasPagas: 0,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 100,
        criadoEm: "2026-01-10T08:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-002",
        codigo: "BFE-360-0002",
        razaoSocial: "Cooperativa Agro Industrial Tangará da Serra",
        nomeFantasia: "CoopAgro MT",
        cnpjCpf: "03.221.998/0001-44",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "zuma_agro",
        empresaOrigemNome: "BancoFe Agro & Safra MT",
        dadosCadastrais: {
          inscricaoEstadual: "13.112.334-9",
          dataFundacao: "2008-07-22",
          porte: "GRANDE",
          regimeTributario: "Lucro Real",
          cnaePrincipal: { codigo: "01.11-3-02", descricao: "Cultivo de soja" },
          cnaesSecundarios: [
            { codigo: "01.11-3-01", descricao: "Cultivo de arroz" },
            { codigo: "46.21-4-00", descricao: "Comércio atacadista de grãos e cereais" },
          ],
          capitalSocial: 28000000,
          faturamentoAnualDeclarado: 95000000,
          endereco: {
            logradouro: "Rodovia MT-358, Km 14",
            numero: "S/N",
            bairro: "Zona Rural",
            cidade: "Tangará da Serra",
            uf: "MT",
            cep: "78300-970",
          },
          contatos: {
            nomeResponsavel: "Marcos Vinicius de Oliveira",
            cargo: "Diretor Comercial e Barter",
            email: "marcos.oliveira@coopagro.mt.agr.br",
            telefone: "(65) 3311-5000",
            whatsapp: "(65) 99877-2200",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "772091-8",
          chavePix: "03.221.998/0001-44",
          saldoConta: 2840900.0,
          limiteChequeEspecial: 1000000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-002-1",
            nome: "Marcos Vinicius de Oliveira",
            cpf: "234.567.890-11",
            cargo: "Presidente Executivo",
            participacaoPercentual: 40,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2008-07-22",
            documentosValidados: true,
          },
          {
            id: "soc-002-2",
            nome: "Conselho de Produtores Associados de MT",
            cpf: "03.221.998/0001-00",
            cargo: "Colegiado Cooperativo",
            participacaoPercentual: 60,
            pep: false,
            beneficiarioFinalUBO: false,
            dataEntrada: "2008-07-22",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 96,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-21T09:00:00Z",
          proximaRevisao: "2027-05-21T09:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-21T09:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Certificações ambientais SICAR e conformidade com moratória da soja em dia.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 95000000,
          ebitdaAnual: 24500000,
          margemEbitda: 25.78,
          lucroLiquido: 18900000,
          ativoTotal: 112000000,
          patrimonioLiquido: 68000000,
          dividaLiquidaEbitda: 1.1,
          liquidezCorrente: 2.15,
          scoreBureau: 890,
          ratingCMN2682: "A",
          provisaoPddExigida: 0.5,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Gerson F. Albuquerque", crc: "MT-011244/O" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 25000000,
          limiteUtilizadoTotal: 8200000,
          limiteDisponivelTotal: 16800000,
          sublimites: [
            {
              produtoId: "lim_cpr",
              produtoNome: "CPR Financeira / Barter Soja",
              limiteAprovado: 15000000,
              limiteTomado: 8200000,
              limiteDisponivel: 6800000,
              taxaPadraoMes: 1.18,
              status: "ativo",
            },
            {
              produtoId: "lim_giro",
              produtoNome: "Capital de Giro Insumos",
              limiteAprovado: 10000000,
              limiteTomado: 0,
              limiteDisponivel: 10000000,
              taxaPadraoMes: 1.25,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-10T11:00:00Z",
          aprovadoPor: "Comitê Executivo BancoFe",
          nivelAlcada: "Comitê Executivo",
          validadeLimite: "2027-11-10T11:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-002",
            tipoGarantia: "penhor_agricola_cpr",
            descricao: "Penhor de 120.000 sacas de soja comercial depositadas nos Armazéns Tangará",
            valorAvaliacao: 15600000,
            valorGarantiaComprometida: 8200000,
            ltvPercentual: 52.5,
            detalhesRegistro: {
              matriculaOuContrato: "CPR-REG-2026-881",
              cartorioOuRegistradora: "B3 S.A. / Registradora Central",
              dataRegistro: "2026-10-15",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-002",
            numeroContrato: "CPR-2026-002-COOP",
            tipoOperacao: "CPR Barter Soja",
            valorOriginal: 8200000,
            saldoDevedor: 8200000,
            taxaMensal: 1.18,
            dataContratacao: "2026-11-12",
            vencimentoFinal: "2027-05-30",
            parcelasTotal: 1,
            parcelasPagas: 0,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 100,
        criadoEm: "2026-01-12T09:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-003",
        codigo: "BFE-360-0003",
        razaoSocial: "Transportadora Rota Norte Cargas & Logística Ltda",
        nomeFantasia: "Rota Norte Logística Express",
        cnpjCpf: "22.334.455/0001-88",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "bancofe_logistica",
        empresaOrigemNome: "BancoFe Logística & Frotas",
        dadosCadastrais: {
          inscricaoEstadual: "13.889.001-2",
          dataFundacao: "2016-09-01",
          porte: "MEDIO",
          regimeTributario: "Lucro Presumido",
          cnaePrincipal: { codigo: "49.30-2-02", descricao: "Transporte rodoviário de carga intermunicipal" },
          cnaesSecundarios: [{ codigo: "52.11-7-99", descricao: "Depósitos de mercadorias para terceiros" }],
          capitalSocial: 4500000,
          faturamentoAnualDeclarado: 19800000,
          endereco: {
            logradouro: "Av. dos Imigrantes",
            numero: "890",
            bairro: "Distrito Industrial",
            cidade: "Cuiabá",
            uf: "MT",
            cep: "78098-500",
          },
          contatos: {
            nomeResponsavel: "Claudia Regina Meireles",
            cargo: "Diretora Operacional",
            email: "operacoes@rotanorte.com.br",
            telefone: "(65) 3614-9000",
            whatsapp: "(65) 99614-9001",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "119024-3",
          chavePix: "22.334.455/0001-88",
          saldoConta: 412000.0,
          limiteChequeEspecial: 200000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CIP",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-003-1",
            nome: "Claudia Regina Meireles",
            cpf: "345.678.901-22",
            cargo: "Sócia-Diretora",
            participacaoPercentual: 70,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2016-09-01",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 94,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-19T16:00:00Z",
          proximaRevisao: "2027-05-19T16:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-19T16:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "ANTT em dia, sem autuações graves no MTE.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 19800000,
          ebitdaAnual: 3800000,
          margemEbitda: 19.19,
          lucroLiquido: 2100000,
          ativoTotal: 18400000,
          patrimonioLiquido: 9800000,
          dividaLiquidaEbitda: 1.45,
          liquidezCorrente: 1.72,
          scoreBureau: 815,
          ratingCMN2682: "A",
          provisaoPddExigida: 0.5,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Valéria S. Ramos", crc: "MT-014490/O" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 5000000,
          limiteUtilizadoTotal: 3100000,
          limiteDisponivelTotal: 1900000,
          sublimites: [
            {
              produtoId: "lim_frotas",
              produtoNome: "Financiamento de Carretas & Frota",
              limiteAprovado: 3500000,
              limiteTomado: 3100000,
              limiteDisponivel: 400000,
              taxaPadraoMes: 1.38,
              status: "ativo",
            },
            {
              produtoId: "lim_combustivel",
              produtoNome: "Conta Garantida Combustíveis",
              limiteAprovado: 1500000,
              limiteTomado: 0,
              limiteDisponivel: 1500000,
              taxaPadraoMes: 1.42,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-05T14:00:00Z",
          aprovadoPor: "Diretoria Financeira BancoFe",
          nivelAlcada: "Diretoria Financeira",
          validadeLimite: "2027-11-05T14:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-003",
            tipoGarantia: "alienacao_veiculos_frota",
            descricao: "Alienação Fiduciária de 8 Cavalos Mecânicos Scania R450 ano 2024",
            valorAvaliacao: 5200000,
            valorGarantiaComprometida: 3100000,
            ltvPercentual: 59.6,
            detalhesRegistro: {
              matriculaOuContrato: "SNG-DETRAN-MT-8812",
              cartorioOuRegistradora: "DETRAN-MT / B3",
              dataRegistro: "2026-08-20",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-003",
            numeroContrato: "FROTA-2026-003-ROTA",
            tipoOperacao: "Financiamento de Frota",
            valorOriginal: 3100000,
            saldoDevedor: 2850000,
            taxaMensal: 1.38,
            dataContratacao: "2026-08-25",
            vencimentoFinal: "2029-08-25",
            parcelasTotal: 36,
            parcelasPagas: 3,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 95,
        criadoEm: "2026-01-15T11:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-004",
        codigo: "BFE-360-0004",
        razaoSocial: "Boutique Donna Bella Varejo e Confecções Ltda",
        nomeFantasia: "Zuma Moda & Donna Bella",
        cnpjCpf: "31.445.566/0001-77",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "zuma_moda",
        empresaOrigemNome: "BancoFe Varejo — Zuma Moda",
        dadosCadastrais: {
          inscricaoEstadual: "13.220.887-1",
          dataFundacao: "2019-11-10",
          porte: "ME",
          regimeTributario: "Simples Nacional",
          cnaePrincipal: { codigo: "47.81-4-00", descricao: "Comércio varejista de artigos do vestuário e acessórios" },
          cnaesSecundarios: [],
          capitalSocial: 800000,
          faturamentoAnualDeclarado: 3800000,
          endereco: {
            logradouro: "Rua Antônio Hortolani",
            numero: "345",
            bairro: "Centro",
            cidade: "Tangará da Serra",
            uf: "MT",
            cep: "78300-015",
          },
          contatos: {
            nomeResponsavel: "Juliana Sartori",
            cargo: "Sócia-Gerente",
            email: "juliana@donnabella.com.br",
            telefone: "(65) 3326-4400",
            whatsapp: "(65) 99912-3344",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "551020-9",
          chavePix: "31.445.566/0001-77",
          saldoConta: 84300.0,
          limiteChequeEspecial: 50000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-004-1",
            nome: "Juliana Sartori",
            cpf: "456.789.012-33",
            cargo: "Sócia-Administradora",
            participacaoPercentual: 100,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2019-11-10",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 97,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-18T10:00:00Z",
          proximaRevisao: "2027-05-18T10:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-18T10:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Simples Nacional regular, DAS em dia.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 3800000,
          ebitdaAnual: 760000,
          margemEbitda: 20.0,
          lucroLiquido: 520000,
          ativoTotal: 2400000,
          patrimonioLiquido: 1600000,
          dividaLiquidaEbitda: 0.6,
          liquidezCorrente: 2.1,
          scoreBureau: 790,
          ratingCMN2682: "A",
          provisaoPddExigida: 0.5,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Eliane P. Toledo", crc: "MT-020110/O" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 600000,
          limiteUtilizadoTotal: 180000,
          limiteDisponivelTotal: 420000,
          sublimites: [
            {
              produtoId: "lim_antecipacao_cartao",
              produtoNome: "Antecipação de Recebíveis Cartões",
              limiteAprovado: 350000,
              limiteTomado: 180000,
              limiteDisponivel: 170000,
              taxaPadraoMes: 1.12,
              status: "ativo",
            },
            {
              produtoId: "lim_giro_colecao",
              produtoNome: "Capital de Giro Compras Coleção",
              limiteAprovado: 250000,
              limiteTomado: 0,
              limiteDisponivel: 250000,
              taxaPadraoMes: 1.35,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-10-25T15:00:00Z",
          aprovadoPor: "Mesa de Crédito BancoFe",
          nivelAlcada: "Analista Pleno",
          validadeLimite: "2027-10-25T15:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-004",
            tipoGarantia: "cessao_recebiveis_duplicatas",
            descricao: "Cessão Fiduciária com Trava de Recebíveis de Cartões de Crédito (CERC)",
            valorAvaliacao: 450000,
            valorGarantiaComprometida: 180000,
            ltvPercentual: 40.0,
            detalhesRegistro: {
              matriculaOuContrato: "TRV-CERC-2026-449",
              cartorioOuRegistradora: "CERC Registradora",
              dataRegistro: "2026-10-26",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-004",
            numeroContrato: "ANT-2026-004-MODA",
            tipoOperacao: "Antecipação de Recebíveis de Cartão",
            valorOriginal: 180000,
            saldoDevedor: 92000,
            taxaMensal: 1.12,
            dataContratacao: "2026-10-28",
            vencimentoFinal: "2027-01-28",
            parcelasTotal: 3,
            parcelasPagas: 1,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 92,
        criadoEm: "2026-01-20T10:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-005",
        codigo: "BFE-360-0005",
        razaoSocial: "Restaurante Zuma Oriental Tangará Ltda",
        nomeFantasia: "Zuma Gastronomia Oriental",
        cnpjCpf: "52.123.456/0001-78",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "zuma_gastronomia",
        empresaOrigemNome: "BancoFe Gastronomia — Zuma Cozinha",
        dadosCadastrais: {
          inscricaoEstadual: "13.901.442-8",
          dataFundacao: "2022-04-10",
          porte: "ME",
          regimeTributario: "Simples Nacional",
          cnaePrincipal: { codigo: "56.11-2-01", descricao: "Restaurantes e similares" },
          cnaesSecundarios: [{ codigo: "56.20-1-04", descricao: "Fornecimento de alimentos preparados preponderantemente para consumo domiciliar" }],
          capitalSocial: 1200000,
          faturamentoAnualDeclarado: 4200000,
          endereco: {
            logradouro: "Rua Sebastião Barreto",
            numero: "120",
            bairro: "Centro",
            cidade: "Tangará da Serra",
            uf: "MT",
            cep: "78300-000",
          },
          contatos: {
            nomeResponsavel: "Chef e Gestor Operacional",
            cargo: "Gerente Geral",
            email: "operacao@zumaoriental.com.br",
            telefone: "(65) 3326-9900",
            whatsapp: "(65) 99922-8800",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "991040-2",
          chavePix: "52.123.456/0001-78",
          saldoConta: 198400.0,
          limiteChequeEspecial: 100000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-005-1",
            nome: "Zuma Participações Gastronômicas Ltda",
            cpf: "52.123.456/0001-00",
            cargo: "Sócia Controladora",
            participacaoPercentual: 100,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2022-04-10",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 99,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-22T10:00:00Z",
          proximaRevisao: "2027-05-22T10:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-22T10:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Alvará sanitário e registros em dia.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 4200000,
          ebitdaAnual: 980000,
          margemEbitda: 23.33,
          lucroLiquido: 680000,
          ativoTotal: 2800000,
          patrimonioLiquido: 1950000,
          dividaLiquidaEbitda: 0.5,
          liquidezCorrente: 2.2,
          scoreBureau: 830,
          ratingCMN2682: "A",
          provisaoPddExigida: 0.5,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Marcio L. Silveira", crc: "MT-009412/O-4" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 800000,
          limiteUtilizadoTotal: 250000,
          limiteDisponivelTotal: 550000,
          sublimites: [
            {
              produtoId: "lim_antecipacao_ifood_pos",
              produtoNome: "Antecipação de Recebíveis POS & Delivery",
              limiteAprovado: 500000,
              limiteTomado: 250000,
              limiteDisponivel: 250000,
              taxaPadraoMes: 1.15,
              status: "ativo",
            },
            {
              produtoId: "lim_giro_insumos",
              produtoNome: "Capital de Giro Insumos Salmão Fresco",
              limiteAprovado: 300000,
              limiteTomado: 0,
              limiteDisponivel: 300000,
              taxaPadraoMes: 1.30,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-01T10:00:00Z",
          aprovadoPor: "Mesa de Crédito BancoFe",
          nivelAlcada: "Analista Pleno",
          validadeLimite: "2027-11-01T10:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-005",
            tipoGarantia: "cessao_recebiveis_duplicatas",
            descricao: "Trava de Domicílio dos Recebíveis de Cartões das 27 Mesas e Delivery",
            valorAvaliacao: 600000,
            valorGarantiaComprometida: 250000,
            ltvPercentual: 41.6,
            detalhesRegistro: {
              matriculaOuContrato: "TRV-CERC-ZUMA-09",
              cartorioOuRegistradora: "CERC",
              dataRegistro: "2026-11-02",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-005",
            numeroContrato: "POS-2026-005-ZUMA",
            tipoOperacao: "Antecipação de Recebíveis de Restaurante",
            valorOriginal: 250000,
            saldoDevedor: 180000,
            taxaMensal: 1.15,
            dataContratacao: "2026-11-03",
            vencimentoFinal: "2027-02-03",
            parcelasTotal: 3,
            parcelasPagas: 1,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 96,
        criadoEm: "2026-01-25T14:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-006",
        codigo: "BFE-360-0006",
        razaoSocial: "Kytto Mineração & Usinas de Concreto S.A.",
        nomeFantasia: "Kytto Engenharia & Minerais",
        cnpjCpf: "18.987.654/0002-70",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "holding_kytto",
        empresaOrigemNome: "Holding Kytto Controladoria",
        dadosCadastrais: {
          inscricaoEstadual: "13.665.441-0",
          dataFundacao: "2012-08-14",
          porte: "GRANDE",
          regimeTributario: "Lucro Real",
          cnaePrincipal: { codigo: "08.10-0-06", descricao: "Extração de areia, cascalho ou pedregulho e britagem" },
          cnaesSecundarios: [{ codigo: "23.30-3-05", descricao: "Preparação de massa de concreto e argamassa para construção" }],
          capitalSocial: 22000000,
          faturamentoAnualDeclarado: 64000000,
          endereco: {
            logradouro: "Distrito Industrial Norte",
            numero: "Lote 14-B",
            bairro: "Distrito Industrial",
            cidade: "Tangará da Serra",
            uf: "MT",
            cep: "78300-850",
          },
          contatos: {
            nomeResponsavel: "Eng. Roberto Cavalcanti",
            cargo: "Diretor Industrial",
            email: "roberto@kytto.com.br",
            telefone: "(65) 3326-7000",
            whatsapp: "(65) 99933-7001",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "882010-1",
          chavePix: "18.987.654/0002-70",
          saldoConta: 1890400.0,
          limiteChequeEspecial: 800000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-006-1",
            nome: "Rodrigo Ribeiro Gonçalves",
            cpf: "123.456.789-00",
            cargo: "Presidente do Conselho",
            participacaoPercentual: 90,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2012-08-14",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 98,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-20T10:00:00Z",
          proximaRevisao: "2027-05-20T10:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-20T10:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Licenças ANM (Agência Nacional de Mineração) e SEMA-MT vigentes.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 64000000,
          ebitdaAnual: 18200000,
          margemEbitda: 28.43,
          lucroLiquido: 13500000,
          ativoTotal: 84000000,
          patrimonioLiquido: 56000000,
          dividaLiquidaEbitda: 0.95,
          liquidezCorrente: 2.65,
          scoreBureau: 905,
          ratingCMN2682: "AA",
          provisaoPddExigida: 0.0,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Marcio L. Silveira", crc: "MT-009412/O-4" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 15000000,
          limiteUtilizadoTotal: 4200000,
          limiteDisponivelTotal: 10800000,
          sublimites: [
            {
              produtoId: "lim_equipamentos",
              produtoNome: "Financiamento de Usinas & Britadores",
              limiteAprovado: 10000000,
              limiteTomado: 4200000,
              limiteDisponivel: 5800000,
              taxaPadraoMes: 1.28,
              status: "ativo",
            },
            {
              produtoId: "lim_giro",
              produtoNome: "Capital de Giro Industrial",
              limiteAprovado: 5000000,
              limiteTomado: 0,
              limiteDisponivel: 5000000,
              taxaPadraoMes: 1.32,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-12T09:00:00Z",
          aprovadoPor: "Comitê Executivo BancoFe",
          nivelAlcada: "Comitê Executivo",
          validadeLimite: "2027-11-12T09:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-006",
            tipoGarantia: "alienacao_fiduciaria_imovel",
            descricao: "Área Industrial de Britagem e Concreto com 48 hectares (Matrícula 29.112 - Tangará/MT)",
            valorAvaliacao: 22000000,
            valorGarantiaComprometida: 5500000,
            ltvPercentual: 25.0,
            detalhesRegistro: {
              matriculaOuContrato: "29.112",
              cartorioOuRegistradora: "1º RGI Tangará da Serra/MT",
              dataRegistro: "2026-09-14",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-006",
            numeroContrato: "USINA-2026-006-KYTTO",
            tipoOperacao: "CCB Financiamento Industrial",
            valorOriginal: 4200000,
            saldoDevedor: 3950000,
            taxaMensal: 1.28,
            dataContratacao: "2026-09-18",
            vencimentoFinal: "2029-09-18",
            parcelasTotal: 36,
            parcelasPagas: 2,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 100,
        criadoEm: "2026-02-01T08:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-007",
        codigo: "BFE-360-0007",
        razaoSocial: "Agropecuária Rio do Sangue - Fazenda Progresso",
        nomeFantasia: "Fazenda Progresso & Confinamento MT",
        cnpjCpf: "14.887.332/0001-50",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "zuma_agro",
        empresaOrigemNome: "BancoFe Agro & Safra MT",
        dadosCadastrais: {
          inscricaoEstadual: "13.440.119-3",
          dataFundacao: "2010-05-18",
          porte: "GRANDE",
          regimeTributario: "Lucro Real",
          cnaePrincipal: { codigo: "01.51-2-01", descricao: "Criação de bovinos para corte" },
          cnaesSecundarios: [{ codigo: "01.11-3-02", descricao: "Cultivo de milho safrinha" }],
          capitalSocial: 35000000,
          faturamentoAnualDeclarado: 72000000,
          endereco: {
            logradouro: "Gleba Rio do Sangue, Lote 4",
            numero: "S/N",
            bairro: "Zona Rural",
            cidade: "Campo Novo do Parecis",
            uf: "MT",
            cep: "78360-000",
          },
          contatos: {
            nomeResponsavel: "Luiz Fernando Barreto",
            cargo: "Produtor e Administrador",
            email: "luiz.barreto@fazendaprogresso.agr.br",
            telefone: "(65) 3382-1200",
            whatsapp: "(65) 99981-4400",
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "331090-4",
          chavePix: "14.887.332/0001-50",
          saldoConta: 2150000.0,
          limiteChequeEspecial: 1000000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-007-1",
            nome: "Luiz Fernando Barreto",
            cpf: "567.890.123-44",
            cargo: "Sócio Titular",
            participacaoPercentual: 100,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2010-05-18",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 95,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-21T11:00:00Z",
          proximaRevisao: "2027-05-21T11:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-21T11:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "CAR validado, reserva legal averbada, sem desmatamento ilegal.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 72000000,
          ebitdaAnual: 21600000,
          margemEbitda: 30.0,
          lucroLiquido: 16200000,
          ativoTotal: 96000000,
          patrimonioLiquido: 74000000,
          dividaLiquidaEbitda: 0.88,
          liquidezCorrente: 2.45,
          scoreBureau: 885,
          ratingCMN2682: "A",
          provisaoPddExigida: 0.5,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Gerson F. Albuquerque", crc: "MT-011244/O" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 20000000,
          limiteUtilizadoTotal: 6500000,
          limiteDisponivelTotal: 13500000,
          sublimites: [
            {
              produtoId: "lim_confinamento",
              produtoNome: "Custeio Pecuário & Confinamento Bovino",
              limiteAprovado: 12000000,
              limiteTomado: 6500000,
              limiteDisponivel: 5500000,
              taxaPadraoMes: 1.20,
              status: "ativo",
            },
            {
              produtoId: "lim_cpr_boi",
              produtoNome: "CPR Financeira de Boi Gordo",
              limiteAprovado: 8000000,
              limiteTomado: 0,
              limiteDisponivel: 8000000,
              taxaPadraoMes: 1.22,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-08T15:00:00Z",
          aprovadoPor: "Comitê Executivo BancoFe",
          nivelAlcada: "Comitê Executivo",
          validadeLimite: "2027-11-08T15:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-007",
            tipoGarantia: "penhor_agricola_cpr",
            descricao: "Penhor Pecuário de 3.500 Cabeças de Gado Nelore em Confinamento Rastreado",
            valorAvaliacao: 12500000,
            valorGarantiaComprometida: 6500000,
            ltvPercentual: 52.0,
            detalhesRegistro: {
              matriculaOuContrato: "PEN-PEC-2026-112",
              cartorioOuRegistradora: "Cartório do 1º Ofício de Campo Novo do Parecis/MT",
              dataRegistro: "2026-10-05",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-007",
            numeroContrato: "PEC-2026-007-PROG",
            tipoOperacao: "Custeio Pecuário Bovino",
            valorOriginal: 6500000,
            saldoDevedor: 6500000,
            taxaMensal: 1.20,
            dataContratacao: "2026-10-10",
            vencimentoFinal: "2027-10-10",
            parcelasTotal: 12,
            parcelasPagas: 1,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 98,
        criadoEm: "2026-02-10T10:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
      {
        id: "cli-360-008",
        codigo: "BFE-360-0008",
        razaoSocial: "Fintech Soluções de Pagamento e Crédito Fe S.A.",
        nomeFantasia: "BancoFe Instituição de Pagamento",
        cnpjCpf: "34.567.890/0001-12",
        tipoPessoa: "PJ",
        statusCadastral: "homologado",
        empresaOrigemId: "bancofe",
        empresaOrigemNome: "BancoFe Core Banking & Open Finance",
        dadosCadastrais: {
          inscricaoEstadual: "13.000.999-9",
          dataFundacao: "2023-01-15",
          porte: "GRANDE",
          regimeTributario: "Lucro Real",
          cnaePrincipal: { codigo: "64.99-9-99", descricao: "Outras atividades de serviços financeiros não especificadas" },
          cnaesSecundarios: [
            { codigo: "66.19-3-02", descricao: "Correspondentes de instituições financeiras" },
            { codigo: "66.13-4-00", descricao: "Administração de cartões de crédito" },
          ],
          capitalSocial: 50000000,
          faturamentoAnualDeclarado: 120000000,
          endereco: {
            logradouro: "Av. Brigadeiro Faria Lima",
            numero: "3477",
            complemento: "Torre Sul, 14º Andar",
            bairro: "Itaim Bibi",
            cidade: "São Paulo",
            uf: "SP",
            cep: "04538-133",
          },
          contatos: {
            nomeResponsavel: "Rodrigo Ribeiro Gonçalves",
            cargo: "CEO & Diretor Executivo",
            email: "rodrigo.goncalves@kytto.com.br",
            telefone: "(11) 3045-8000",
            whatsapp: "(11) 98899-7700",
            departamentoFinanceiro: {
              nome: "Controladoria Geral BancoFe",
              email: "controladoria@bancofe.com.br",
              telefone: "(11) 3045-8010",
            },
          },
        },
        contaGraficaBancoFe: {
          banco: "BancoFe S.A. (Código 799)",
          agencia: "0001",
          contaCorrente: "100001-0",
          chavePix: "pix@bancofe.com.br",
          saldoConta: 15480920.0,
          limiteChequeEspecial: 5000000,
          travaDomicilioBancario: {
            ativa: true,
            registradora: "CERC",
            status: "vigente",
            percentualRetencao: 100,
          },
        },
        quadroSocietario: [
          {
            id: "soc-008-1",
            nome: "Rodrigo Ribeiro Gonçalves",
            cpf: "123.456.789-00",
            cargo: "Diretor Presidente (CEO)",
            participacaoPercentual: 95,
            pep: false,
            beneficiarioFinalUBO: true,
            dataEntrada: "2023-01-15",
            documentosValidados: true,
          },
        ],
        compliancePLD: {
          scoreCompliance: 100,
          nivelRisco: "baixo",
          ultimaVarredura: "2026-11-23T08:00:00Z",
          proximaRevisao: "2027-05-23T08:00:00Z",
          ofacSanctions: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          csnuOnu: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          ceafGov: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          cepim: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          trabalhoEscravoMte: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          ceisTcu: { status: "nada_consta", dataConsulta: "2026-11-23T08:00:00Z" },
          scrBacenConforme: true,
          pepIdentificado: false,
          observacoesCompliance: "Homologado pelo Banco Central do Brasil para operação de pagamentos e Open Finance.",
        },
        analiseFinanceira: {
          faturamentoUltimos12Meses: 120000000,
          ebitdaAnual: 38400000,
          margemEbitda: 32.0,
          lucroLiquido: 28900000,
          ativoTotal: 185000000,
          patrimonioLiquido: 124000000,
          dividaLiquidaEbitda: 0.45,
          liquidezCorrente: 3.4,
          scoreBureau: 980,
          ratingCMN2682: "AA",
          provisaoPddExigida: 0.0,
          dataUltimoBalanco: "2025-12-31",
          contadorResponsavel: { nome: "Marcio L. Silveira", crc: "MT-009412/O-4" },
        },
        limitesOperacionais: {
          limiteGlobalAprovado: 50000000,
          limiteUtilizadoTotal: 12500000,
          limiteDisponivelTotal: 37500000,
          sublimites: [
            {
              produtoId: "lim_funding_fidc",
              produtoNome: "Funding Institucional & FIDC",
              limiteAprovado: 30000000,
              limiteTomado: 12500000,
              limiteDisponivel: 17500000,
              taxaPadraoMes: 1.05,
              status: "ativo",
            },
            {
              produtoId: "lim_intercompany",
              produtoNome: "Linha de Liquidez Intercompany",
              limiteAprovado: 20000000,
              limiteTomado: 0,
              limiteDisponivel: 20000000,
              taxaPadraoMes: 1.10,
              status: "ativo",
            },
          ],
          dataAprovacaoAlcada: "2026-11-01T09:00:00Z",
          aprovadoPor: "Conselho de Administração",
          nivelAlcada: "Comitê Executivo",
          validadeLimite: "2027-11-01T09:00:00Z",
        },
        garantiasColaterais: [
          {
            id: "gar-008",
            tipoGarantia: "cessao_recebiveis_duplicatas",
            descricao: "Carteira de Recebíveis Elegíveis do BancoFe registradas na B3/CERC",
            valorAvaliacao: 65000000,
            valorGarantiaComprometida: 12500000,
            ltvPercentual: 19.2,
            detalhesRegistro: {
              matriculaOuContrato: "CRT-B3-2026-990",
              cartorioOuRegistradora: "B3 S.A.",
              dataRegistro: "2026-10-01",
              status: "registrada",
            },
          },
        ],
        historicoOperacoes: [
          {
            id: "op-hist-008",
            numeroContrato: "FIDC-2026-008-BFE",
            tipoOperacao: "Funding FIDC Carteira Fe",
            valorOriginal: 12500000,
            saldoDevedor: 12500000,
            taxaMensal: 1.05,
            dataContratacao: "2026-10-02",
            vencimentoFinal: "2028-10-02",
            parcelasTotal: 24,
            parcelasPagas: 1,
            pontualidadeHistorica: "100% em dia",
            status: "ativo",
          },
        ],
        percentualCompletudeCadastral: 100,
        criadoEm: "2026-01-01T00:00:00Z",
        updatedAt: "2026-11-23T10:00:00Z",
      } as any,
    ];
  }

  private gerarDocumentosIniciais(): DocumentoPreCadastro[] {
    const docs: DocumentoPreCadastro[] = [];
    const tipos: TipoDocumentoPreCadastro[] = [
      "cartao_cnpj",
      "contrato_social_estatuto",
      "documento_socios_cnh",
      "comprovante_sede_endereco",
      "balanco_patrimonial_dre",
      "faturamento_12m_pgdas",
      "cnd_federal_fgts_trabalhista",
      "declaracao_irpf_socios",
      "garantia_matricula_ccir",
      "domicilio_bancario_trava",
      "declaracao_origem_recursos_pld",
      "cnd_estadual_municipal",
      "procuracao_certidao_junta",
    ];

    for (const c of this.clientes) {
      for (const t of tipos) {
        const hash = gerarSha256(`${c.id}_${t}_v1`);
        const isAprovado = c.percentualCompletudeCadastral >= 90;
        docs.push({
          id: `doc-${c.id}-${t}`,
          clienteId: c.id,
          clienteNome: c.razaoSocial,
          tipoDocumento: t,
          titulo: this.obterTituloDocumento(t),
          obrigatorio: true,
          categoria: this.obterCategoriaDocumento(t),
          status: isAprovado ? "aprovado" : "em_analise",
          arquivoNome: `${c.id}_${t}.pdf`,
          arquivoUrl: `/uploads/dossie/${c.id}_${t}.pdf`,
          formato: "application/pdf",
          tamanhoBytes: 1024 * (300 + Math.floor(Math.random() * 800)),
          hashSha256: hash,
          dataEnvio: "2026-11-15T10:00:00Z",
          dataAnalise: isAprovado ? "2026-11-16T14:00:00Z" : undefined,
          analisadoPor: isAprovado ? "Mesa de Compliance BancoFe" : undefined,
          validadeData: "2027-05-15",
          diasParaExpirar: 173,
        });
      }
    }

    return docs;
  }

  private gerarTermosIniciais(): TermoDigitalBancoFe[] {
    const lista: TermoDigitalBancoFe[] = [];
    for (const c of this.clientes) {
      this.gerarTermosPadraoParaCliente(c);
    }
    // Assinar digitalmente os termos das empresas homologadas
    for (const t of this.termos) {
      t.status = "assinado";
      t.dataAssinatura = "2026-11-18T10:30:00Z";
      t.signatarioNome = "Rodrigo Ribeiro Gonçalves";
      t.signatarioCpf = "123.456.789-00";
      t.signatarioIp = "177.136.240.12";
      t.certificadoDigital = "Assinatura Eletrônica Avançada Lei 14.063/20";
    }
    return this.termos;
  }
}
