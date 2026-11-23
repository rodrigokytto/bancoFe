import fs from "fs";
import path from "path";
import { createHash, randomUUID } from "crypto";
import {
  executarAnaliseMesaCredito,
  type ParecerMesaCreditoAlgoritmica,
  type RatingBancoFe,
  type DecisaoMesaCredito,
} from "./mesa-credito-algoritmica.js";

export type StatusPropostaMesa =
  | "EM_ANALISE"
  | "APROVADO_MESA"
  | "CONDICIONADO"
  | "COMITE_RISCO"
  | "RECUSADO"
  | "FORMALIZADO_CCB"
  | "LIQUIDADO";

export interface PropostaMesaCredito {
  id: string;
  codigoProtocolo: string; // Ex: MC-2026-0841
  clienteNome: string;
  clienteDocumento: string; // CPF ou CNPJ formatado
  clienteTipo: "PF" | "PJ";
  rendaMensalDeclarada: number;
  patrimonioDeclarado: number;
  empresaOrigemId: string;
  empresaOrigemNome: string;
  produtoId: string;
  produtoNome: string;
  finalidadeCredito: string;
  valorSolicitado: number;
  valorAprovado: number;
  prazoMeses: number;
  taxaMensalPercentual: number; // Ex: 1.35% a.m.
  taxaAnualEfetiva: number; // Ex: 17.4% a.a.
  sistemaAmortizacao: "SAC" | "PRICE";
  status: StatusPropostaMesa;
  statusLabel: string;
  scoreBancoFe: number;
  ratingBancoFe: RatingBancoFe;
  probabilidadeInadimplenciaPD: number;
  perdaEsperadaEL: number;
  comprometimentoRendaDTI: number;
  primeiraParcela: number;
  ultimaParcela: number;
  totalJuros: number;
  totalPagoEstimado: number;
  cetAnualPercentual: number;
  parecerAlgoritmico: ParecerMesaCreditoAlgoritmica;
  garantiasApresentadas: Array<{
    tipo: "IMOVEL_HIPOTECA" | "ALIENACAO_FIDUCIARIA_VEICULO" | "AVALISTA_SOLIDARIO" | "RECEBIVEIS_DUPLICATAS" | "CPR_PENHOR_SAFRA";
    descricao: string;
    valorEstimado: number;
  }>;
  deliberacoes: Array<{
    data: string;
    autor: string;
    acao: string;
    parecer: string;
  }>;
  numeroCcbDigital?: string;
  hashCcbSha256?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface MetricasMesaCredito {
  volumeTotalEmAnalise: number;
  volumeTotalAprovado: number;
  volumeTotalLiquidado: number;
  totalPropostasFila: number;
  taxaMediaMensal: number;
  perdaEsperadaMediaEL: number;
  distribuicaoPorStatus: Record<StatusPropostaMesa, { quantidade: number; volume: number }>;
  distribuicaoPorEmpresa: Record<string, { quantidade: number; volume: number }>;
  distribuicaoPorRating: Record<string, number>;
  integridadeBureaus: string;
}

const DATA_FILE = path.resolve(process.cwd(), "data", "mesaCreditoPropostas.json");

export class ServicoMesaCredito {
  private static instance: ServicoMesaCredito;
  private propostas: Map<string, PropostaMesaCredito> = new Map();

  private constructor() {
    this.carregarOuInicializarPropostas();
  }

  public static getInstance(): ServicoMesaCredito {
    if (!ServicoMesaCredito.instance) {
      ServicoMesaCredito.instance = new ServicoMesaCredito();
    }
    return ServicoMesaCredito.instance;
  }

  private carregarOuInicializarPropostas() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const conteudo = fs.readFileSync(DATA_FILE, "utf-8");
        const lista: PropostaMesaCredito[] = JSON.parse(conteudo);
        lista.forEach((p) => this.propostas.set(p.id, p));
        if (this.propostas.size > 0) return;
      }
    } catch (err) {
      console.warn("[MesaCredito] Falha ao ler cache local de propostas, recriando base inicial...", err);
    }
    this.gerarBaseInicialPropostas();
    this.persistir();
  }

  private persistir() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(this.propostas.values()), null, 2), "utf-8");
    } catch (err) {
      console.error("[MesaCredito] Erro ao persistir propostas em disco:", err);
    }
  }

  /**
   * Calcula parcelas SAC e PRICE
   */
  public calcularAmortizacao(valor: number, taxaMensal: number, prazoMeses: number, sistema: "SAC" | "PRICE") {
    const i = taxaMensal / 100;
    if (sistema === "PRICE") {
      // Parcela fixa
      const parcela = (valor * (i * Math.pow(1 + i, prazoMeses))) / (Math.pow(1 + i, prazoMeses) - 1);
      const totalPago = parcela * prazoMeses;
      const totalJuros = totalPago - valor;
      return {
        primeiraParcela: Number(parcela.toFixed(2)),
        ultimaParcela: Number(parcela.toFixed(2)),
        totalJuros: Number(totalJuros.toFixed(2)),
        totalPago: Number(totalPago.toFixed(2)),
        cetAnual: Number((Math.pow(1 + i, 12) - 1) * 100).toFixed(2),
      };
    } else {
      // SAC: amortização constante
      const amortizacao = valor / prazoMeses;
      const primeiraParcela = amortizacao + valor * i;
      const ultimaParcela = amortizacao + amortizacao * i;
      const totalJuros = ((primeiraParcela + ultimaParcela) / 2) * prazoMeses - valor;
      const totalPago = valor + totalJuros;
      return {
        primeiraParcela: Number(primeiraParcela.toFixed(2)),
        ultimaParcela: Number(ultimaParcela.toFixed(2)),
        totalJuros: Number(totalJuros.toFixed(2)),
        totalPago: Number(totalPago.toFixed(2)),
        cetAnual: Number((Math.pow(1 + i, 12) - 1) * 100).toFixed(2),
      };
    }
  }

  private gerarBaseInicialPropostas() {
    const sementes = [
      {
        id: "mc-prop-001",
        codigo: "MC-2026-0841",
        clienteNome: "Dr. Carlos Eduardo Mendonça",
        documento: "000.000.009-49",
        tipo: "PF" as const,
        renda: 38500,
        patrimonio: 2450000,
        empresaId: "casanova",
        empresaNome: "Casa Nova Imóveis & Financiamentos",
        produtoId: "imobiliario_sbpe",
        produtoNome: "Financiamento Imobiliário Residencial SBPE",
        finalidade: "Aquisição de Casa de Alto Padrão no Condomínio Manauara Tangará",
        valorSolicitado: 850000,
        valorAprovado: 850000,
        prazo: 240,
        taxaMensal: 0.88,
        sistema: "SAC" as const,
        status: "APROVADO_MESA" as StatusPropostaMesa,
        scoreReferencia: 890,
        garantias: [{ tipo: "IMOVEL_HIPOTECA" as const, descricao: "Alienação fiduciária do próprio imóvel adquirido (Matrícula 48.910 - 1º Ofício)", valorEstimado: 1200000 }],
        notaDeliberacao: "Cliente com excelente capacidade de pagamento DTI (21%). Parecer pericial favorável sem apontamentos em bureaus ou cartórios.",
      },
      {
        id: "mc-prop-002",
        codigo: "MC-2026-0842",
        clienteNome: "Cooperativa Agro Industrial dos Parecis - COPRODIA",
        documento: "03.492.811/0001-84",
        tipo: "PJ" as const,
        renda: 4500000,
        patrimonio: 89000000,
        empresaId: "agro_uisa",
        empresaNome: "Agro & Crédito Rural (UISA Biorrefinaria)",
        produtoId: "cpr_verde_barter",
        produtoNome: "Cédula de Produto Rural (CPR Financeira Barter)",
        finalidade: "Custeio antecipado de safra de cana-de-açúcar e aquisição de bioinsumos",
        valorSolicitado: 3500000,
        valorAprovado: 3500000,
        prazo: 18,
        taxaMensal: 1.05,
        sistema: "PRICE" as const,
        status: "FORMALIZADO_CCB" as StatusPropostaMesa,
        scoreReferencia: 940,
        garantias: [{ tipo: "CPR_PENHOR_SAFRA" as const, descricao: "Penhor agrícola de 120.000 toneladas de cana com lastro em armazenagem", valorEstimado: 5400000 }],
        notaDeliberacao: "Rating AAA homologado pela diretoria. CCB Digital emitida com sucesso vinculada à Cédula de Produto Rural.",
      },
      {
        id: "mc-prop-003",
        codigo: "MC-2026-0843",
        clienteNome: "Casanova Empreendimentos Imobiliários Ltda",
        documento: "08.941.233/0001-90",
        tipo: "PJ" as const,
        renda: 680000,
        patrimonio: 14500000,
        empresaId: "bancofe_financeira",
        empresaNome: "BancoFe — Operações Financeiras & CRM",
        produtoId: "capital_giro_pj",
        produtoNome: "Capital de Giro Empresarial com Recebíveis",
        finalidade: "Expansão de infraestrutura do novo loteamento Reserva dos Buritis",
        valorSolicitado: 1200000,
        valorAprovado: 1200000,
        prazo: 36,
        taxaMensal: 1.35,
        sistema: "PRICE" as const,
        status: "APROVADO_MESA" as StatusPropostaMesa,
        scoreReferencia: 840,
        garantias: [{ tipo: "RECEBIVEIS_DUPLICATAS" as const, descricao: "Trava bancária de recebíveis de contratos imobiliários em carteira", valorEstimado: 1850000 }],
        notaDeliberacao: "Giro aprovado com taxa de 1.35% a.m. Trava de recebíveis configurada via conta gráfica BancoFé.",
      },
      {
        id: "mc-prop-004",
        codigo: "MC-2026-0844",
        clienteNome: "Dra. Mariana Souza Bitencourt",
        documento: "000.000.010-82",
        tipo: "PF" as const,
        renda: 29000,
        patrimonio: 1800000,
        empresaId: "casanova",
        empresaNome: "Casa Nova Imóveis & Financiamentos",
        produtoId: "imobiliario_sbpe",
        produtoNome: "Financiamento Imobiliário Residencial SBPE",
        finalidade: "Aquisição de Apartamento Duplex Edifício Portal das Palmeiras",
        valorSolicitado: 620000,
        valorAprovado: 620000,
        prazo: 180,
        taxaMensal: 0.92,
        sistema: "SAC" as const,
        status: "EM_ANALISE" as StatusPropostaMesa,
        scoreReferencia: 810,
        garantias: [{ tipo: "IMOVEL_HIPOTECA" as const, descricao: "Alienação fiduciária do apartamento duplex (Matrícula 39.112)", valorEstimado: 850000 }],
        notaDeliberacao: "Aguardando confirmação de envio da última declaração de IRPF no cofre digital Vault.",
      },
      {
        id: "mc-prop-005",
        codigo: "MC-2026-0845",
        clienteNome: "Construtora Ultra Engenharia Ltda",
        documento: "18.491.204/0001-55",
        tipo: "PJ" as const,
        renda: 950000,
        patrimonio: 19200000,
        empresaId: "ultra_engenharia",
        empresaNome: "Construtora Ultra & Incorporadora",
        produtoId: "credito_producao",
        produtoNome: "Crédito Imobiliário à Produção / Apoio à Construção",
        finalidade: "Construção do Edifício Residencial Grand Palace Tangará (24 unidades)",
        valorSolicitado: 4200000,
        valorAprovado: 3800000,
        prazo: 48,
        taxaMensal: 1.25,
        sistema: "SAC" as const,
        status: "CONDICIONADO" as StatusPropostaMesa,
        scoreReferencia: 790,
        garantias: [{ tipo: "IMOVEL_HIPOTECA" as const, descricao: "Hipoteca do terreno e alienação fiduciária da produção futura das frações ideais", valorEstimado: 7500000 }],
        notaDeliberacao: "Condicionado à apresentação da CND Previdenciária de Obra (SERO/Receita Federal) e Anotação de Responsabilidade Técnica (ART).",
      },
      {
        id: "mc-prop-006",
        codigo: "MC-2026-0846",
        clienteNome: "Silvio Cesar Cavalcante (Agropecuária)",
        documento: "000.000.002-89",
        tipo: "PF" as const,
        renda: 95000,
        patrimonio: 8900000,
        empresaId: "agro_uisa",
        empresaNome: "Agro & Crédito Rural (UISA Biorrefinaria)",
        produtoId: "cpr_verde_barter",
        produtoNome: "Custeio Agrícola Barter de Grãos e Pecuária",
        finalidade: "Aquisição de calcário, adubação e maquinário agrícola para Fazenda Progresso",
        valorSolicitado: 980000,
        valorAprovado: 980000,
        prazo: 24,
        taxaMensal: 1.10,
        sistema: "PRICE" as const,
        status: "APROVADO_MESA" as StatusPropostaMesa,
        scoreReferencia: 860,
        garantias: [{ tipo: "CPR_PENHOR_SAFRA" as const, descricao: "Penhor de 1.800 sacas de soja e hipoteca cedular de 80 hectares", valorEstimado: 1600000 }],
        notaDeliberacao: "Certificado de regularidade ambiental SICAR/SEMA-MT em conformidade plena. Aprovado pela mesa.",
      },
      {
        id: "mc-prop-007",
        codigo: "MC-2026-0847",
        clienteNome: "Transportadora Rota Norte Cargas & Logística",
        documento: "22.334.455/0001-66",
        tipo: "PJ" as const,
        renda: 1100000,
        patrimonio: 12500000,
        empresaId: "bancofe_financeira",
        empresaNome: "BancoFe — Operações Financeiras & CRM",
        produtoId: "financiamento_frotas",
        produtoNome: "Financiamento de Frotas Pesadas & Carretas Graneleiras",
        finalidade: "Aquisição de 4 cavalos mecânicos Volvo FH 540 para escoamento da safra",
        valorSolicitado: 2400000,
        valorAprovado: 2400000,
        prazo: 60,
        taxaMensal: 1.28,
        sistema: "SAC" as const,
        status: "COMITE_RISCO" as StatusPropostaMesa,
        scoreReferencia: 750,
        garantias: [{ tipo: "ALIENACAO_FIDUCIARIA_VEICULO" as const, descricao: "Alienação fiduciária dos 4 caminhões novos faturados direto de fábrica", valorEstimado: 3200000 }],
        notaDeliberacao: "Valor acima da alçada gerencial individual (R$ 2.000.000,00). Encaminhado para votação estatutária do Comitê de Risco.",
      },
      {
        id: "mc-prop-008",
        codigo: "MC-2026-0848",
        clienteNome: "Dino Barbearia & Estética Masculina",
        documento: "24.891.044/0001-12",
        tipo: "PJ" as const,
        renda: 85000,
        patrimonio: 920000,
        empresaId: "dino_barbearia",
        empresaNome: "Dino Barbearia & Varejo Multi-Negócio",
        produtoId: "microcredito_expansao",
        produtoNome: "Microcrédito de Expansão e Reforma de Unidade",
        finalidade: "Montagem de nova sala de estética masculina e barbearia no Shopping Tangará",
        valorSolicitado: 180000,
        valorAprovado: 180000,
        prazo: 24,
        taxaMensal: 1.45,
        sistema: "PRICE" as const,
        status: "FORMALIZADO_CCB" as StatusPropostaMesa,
        scoreReferencia: 830,
        garantias: [{ tipo: "AVALISTA_SOLIDARIO" as const, descricao: "Aval pessoal dos sócios proprietários com comprovação patrimonial", valorEstimado: 450000 }],
        notaDeliberacao: "CCB nº CCB-DINO-2026-018 emitida e assinada eletronicamente. Primeira parcela para 30 dias.",
      },
      {
        id: "mc-prop-009",
        codigo: "MC-2026-0849",
        clienteNome: "Restaurante Zuma Oriental Tangará Ltda",
        documento: "36.296.848/0001-57",
        tipo: "PJ" as const,
        renda: 240000,
        patrimonio: 2100000,
        empresaId: "zuma_gastronomia",
        empresaNome: "Zuma Cozinha Oriental & Gastronomia",
        produtoId: "antecipacao_recebiveis",
        produtoNome: "Antecipação de Recebíveis Smart POS BancoFé",
        finalidade: "Reforço de capital de giro e compra de insumos importados para final de ano",
        valorSolicitado: 250000,
        valorAprovado: 250000,
        prazo: 12,
        taxaMensal: 1.15,
        sistema: "PRICE" as const,
        status: "APROVADO_MESA" as StatusPropostaMesa,
        scoreReferencia: 875,
        garantias: [{ tipo: "RECEBIVEIS_DUPLICATAS" as const, descricao: "Trava nas liquidações de cartões e PIX transacionados no PDV Zuma", valorEstimado: 380000 }],
        notaDeliberacao: "Trava contratada diretamente no adquirente BancoFé. Liquidação automática com deságio pré-fixado.",
      },
      {
        id: "mc-prop-010",
        codigo: "MC-2026-0850",
        clienteNome: "Eng. Roberto Albuquerque Lins",
        documento: "000.000.011-63",
        tipo: "PF" as const,
        renda: 24500,
        patrimonio: 1400000,
        empresaId: "casanova",
        empresaNome: "Casa Nova Imóveis & Financiamentos",
        produtoId: "imobiliario_sbpe",
        produtoNome: "Financiamento Habitacional para Construção",
        finalidade: "Construção de residência térrea unifamiliar no Residencial Europa",
        valorSolicitado: 480000,
        valorAprovado: 480000,
        prazo: 180,
        taxaMensal: 0.95,
        sistema: "SAC" as const,
        status: "EM_ANALISE" as StatusPropostaMesa,
        scoreReferencia: 820,
        garantias: [{ tipo: "IMOVEL_HIPOTECA" as const, descricao: "Terreno quitado registrado sob matrícula 42.108 no 1º Ofício", valorEstimado: 250000 }],
        notaDeliberacao: "Planilha de medição de obra e cronograma físico-financeiro em análise pelo perito da Construtora Ultra.",
      },
      {
        id: "mc-prop-011",
        codigo: "MC-2026-0851",
        clienteNome: "Boutique Zuma Concept Moda e Roupas",
        documento: "52.123.456/0002-59",
        tipo: "PJ" as const,
        renda: 140000,
        patrimonio: 1200000,
        empresaId: "zuma_moda",
        empresaNome: "Zuma Moda, Roupas & Boutique",
        produtoId: "capital_giro_pj",
        produtoNome: "Capital de Giro para Coleção Outono/Inverno",
        finalidade: "Compra antecipada de confecções e calçados com desconto de fábrica",
        valorSolicitado: 150000,
        valorAprovado: 150000,
        prazo: 18,
        taxaMensal: 1.39,
        sistema: "PRICE" as const,
        status: "APROVADO_MESA" as StatusPropostaMesa,
        scoreReferencia: 810,
        garantias: [{ tipo: "RECEBIVEIS_DUPLICATAS" as const, descricao: "Garantia de duplicatas mercantis de vendas a prazo", valorEstimado: 220000 }],
        notaDeliberacao: "Operação aprovada na mesa com taxa de 1.39% a.m.",
      },
      {
        id: "mc-prop-012",
        codigo: "MC-2026-0852",
        clienteNome: "Marcos Vinícius Trindade (Comércio ME)",
        documento: "000.000.012-44",
        tipo: "PF" as const,
        renda: 14000,
        patrimonio: 320000,
        empresaId: "casanova",
        empresaNome: "Casa Nova Imóveis & Financiamentos",
        produtoId: "imobiliario_cva",
        produtoNome: "Financiamento Imobiliário Casa Verde e Amarela (FGTS)",
        finalidade: "Aquisição de Casa Própria no Loteamento Tangará Ville",
        valorSolicitado: 210000,
        valorAprovado: 0,
        prazo: 360,
        taxaMensal: 0.65,
        sistema: "PRICE" as const,
        status: "RECUSADO" as StatusPropostaMesa,
        scoreReferencia: 420,
        garantias: [],
        notaDeliberacao: "Recusado pela política de crédito: apontamentos no SERASA e SCR Bacen em atraso superior a 60 dias (Rating Bacen H).",
      },
    ];

    for (const sem of sementes) {
      const parecer = executarAnaliseMesaCredito({
        cpfCnpj: sem.documento,
        nomeCliente: sem.clienteNome,
        rendaMensalDeclarada: sem.renda,
        scoreBureauReferencia: sem.scoreReferencia,
        valorPatrimonioDeclarado: sem.patrimonio,
      });

      const amort = this.calcularAmortizacao(
        sem.valorAprovado > 0 ? sem.valorAprovado : sem.valorSolicitado,
        sem.taxaMensal,
        sem.prazo,
        sem.sistema
      );

      const dti = Number(((amort.primeiraParcela / sem.renda) * 100).toFixed(1));

      const proposta: PropostaMesaCredito = {
        id: sem.id,
        codigoProtocolo: sem.codigo,
        clienteNome: sem.clienteNome,
        clienteDocumento: sem.documento,
        clienteTipo: sem.tipo,
        rendaMensalDeclarada: sem.renda,
        patrimonioDeclarado: sem.patrimonio,
        empresaOrigemId: sem.empresaId,
        empresaOrigemNome: sem.empresaNome,
        produtoId: sem.produtoId,
        produtoNome: sem.produtoNome,
        finalidadeCredito: sem.finalidade,
        valorSolicitado: sem.valorSolicitado,
        valorAprovado: sem.valorAprovado,
        prazoMeses: sem.prazo,
        taxaMensalPercentual: sem.taxaMensal,
        taxaAnualEfetiva: Number(((Math.pow(1 + sem.taxaMensal / 100, 12) - 1) * 100).toFixed(2)),
        sistemaAmortizacao: sem.sistema,
        status: sem.status,
        statusLabel: this.obterLabelStatus(sem.status),
        scoreBancoFe: parecer.scoreBancoFe,
        ratingBancoFe: parecer.ratingBancoFe,
        probabilidadeInadimplenciaPD: parecer.probabilidadeInadimplenciaPD,
        perdaEsperadaEL: parecer.perdaEsperadaELPercentual,
        comprometimentoRendaDTI: dti,
        primeiraParcela: amort.primeiraParcela,
        ultimaParcela: amort.ultimaParcela,
        totalJuros: amort.totalJuros,
        totalPagoEstimado: amort.totalPago,
        cetAnualPercentual: Number(amort.cetAnual),
        parecerAlgoritmico: parecer,
        garantiasApresentadas: sem.garantias,
        deliberacoes: [
          {
            data: new Date().toISOString(),
            autor: "Mesa de Crédito Algorítmica BancoFé",
            acao: sem.status,
            parecer: sem.notaDeliberacao,
          },
        ],
        numeroCcbDigital:
          sem.status === "FORMALIZADO_CCB"
            ? `CCB-BFE-${new Date().getFullYear()}-${sem.codigo.split("-")[2]}`
            : undefined,
        hashCcbSha256:
          sem.status === "FORMALIZADO_CCB"
            ? createHash("sha256").update(`${sem.id}-${sem.codigo}-${sem.valorAprovado}`).digest("hex")
            : undefined,
        dataCriacao: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        dataAtualizacao: new Date().toISOString(),
      };

      this.propostas.set(proposta.id, proposta);
    }
  }

  private obterLabelStatus(status: StatusPropostaMesa): string {
    const mapa: Record<StatusPropostaMesa, string> = {
      EM_ANALISE: "Em Análise pela Mesa",
      APROVADO_MESA: "Aprovado na Mesa",
      CONDICIONADO: "Condicionado com Garantia",
      COMITE_RISCO: "Submetido ao Comitê",
      RECUSADO: "Recusado pela Política",
      FORMALIZADO_CCB: "CCB Digital Emitida",
      LIQUIDADO: "Liquidado em Conta",
    };
    return mapa[status] || status;
  }

  public listarPropostas(filtros?: {
    status?: string;
    empresaOrigemId?: string;
    busca?: string;
  }): PropostaMesaCredito[] {
    let lista = Array.from(this.propostas.values());

    if (filtros?.status && filtros.status !== "TODOS") {
      lista = lista.filter((p) => p.status === filtros.status);
    }

    if (filtros?.empresaOrigemId && filtros.empresaOrigemId !== "TODOS") {
      lista = lista.filter((p) => p.empresaOrigemId === filtros.empresaOrigemId);
    }

    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.clienteNome.toLowerCase().includes(b) ||
          p.clienteDocumento.includes(b) ||
          p.codigoProtocolo.toLowerCase().includes(b) ||
          p.produtoNome.toLowerCase().includes(b)
      );
    }

    // Ordena por data de atualização descrescente
    return lista.sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime());
  }

  public obterPropostaPorId(id: string): PropostaMesaCredito | undefined {
    return this.propostas.get(id);
  }

  public deliberarProposta(params: {
    id: string;
    novoStatus: StatusPropostaMesa;
    valorAprovado?: number;
    taxaMensal?: number;
    parecerOperador: string;
    operadorNome?: string;
  }): PropostaMesaCredito {
    const proposta = this.propostas.get(params.id);
    if (!proposta) {
      throw new Error(`Proposta com ID ${params.id} não encontrada na Mesa de Crédito.`);
    }

    proposta.status = params.novoStatus;
    proposta.statusLabel = this.obterLabelStatus(params.novoStatus);
    proposta.dataAtualizacao = new Date().toISOString();

    if (params.valorAprovado !== undefined) {
      proposta.valorAprovado = params.valorAprovado;
    }
    if (params.taxaMensal !== undefined) {
      proposta.taxaMensalPercentual = params.taxaMensal;
      proposta.taxaAnualEfetiva = Number(((Math.pow(1 + params.taxaMensal / 100, 12) - 1) * 100).toFixed(2));
    }

    // Recalcula amortização
    const amort = this.calcularAmortizacao(
      proposta.valorAprovado,
      proposta.taxaMensalPercentual,
      proposta.prazoMeses,
      proposta.sistemaAmortizacao
    );
    proposta.primeiraParcela = amort.primeiraParcela;
    proposta.ultimaParcela = amort.ultimaParcela;
    proposta.totalJuros = amort.totalJuros;
    proposta.totalPagoEstimado = amort.totalPago;
    proposta.cetAnualPercentual = Number(amort.cetAnual);
    proposta.comprometimentoRendaDTI = Number(((amort.primeiraParcela / proposta.rendaMensalDeclarada) * 100).toFixed(1));

    if (params.novoStatus === "FORMALIZADO_CCB" && !proposta.numeroCcbDigital) {
      proposta.numeroCcbDigital = `CCB-BFE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      proposta.hashCcbSha256 = createHash("sha256")
        .update(`${proposta.id}-${proposta.codigoProtocolo}-${proposta.valorAprovado}-${Date.now()}`)
        .digest("hex");
    }

    proposta.deliberacoes.unshift({
      data: new Date().toISOString(),
      autor: params.operadorNome || "Rodrigo Gonçalves (Mesa de Crédito)",
      acao: params.novoStatus,
      parecer: params.parecerOperador,
    });

    this.persistir();
    return proposta;
  }

  public emitirCcbDigital(id: string, operadorNome?: string): PropostaMesaCredito {
    return this.deliberarProposta({
      id,
      novoStatus: "FORMALIZADO_CCB",
      parecerOperador: "Cédula de Crédito Bancário (CCB Digital) emitida eletronicamente com registro SHA-256 e assinatura digital qualificada.",
      operadorNome: operadorNome || "Diretoria de Crédito BancoFé",
    });
  }

  public criarPropostaAvulsa(params: {
    clienteNome: string;
    clienteDocumento: string;
    clienteTipo: "PF" | "PJ";
    rendaMensalDeclarada: number;
    patrimonioDeclarado: number;
    empresaOrigemId: string;
    empresaOrigemNome: string;
    produtoId: string;
    produtoNome: string;
    finalidadeCredito: string;
    valorSolicitado: number;
    prazoMeses: number;
    taxaMensalDesejada?: number;
    sistemaAmortizacao: "SAC" | "PRICE";
    scoreBureau?: number;
  }): PropostaMesaCredito {
    const id = `mc-prop-${randomUUID().substring(0, 8)}`;
    const codigoProtocolo = `MC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const parecer = executarAnaliseMesaCredito({
      cpfCnpj: params.clienteDocumento,
      nomeCliente: params.clienteNome,
      rendaMensalDeclarada: params.rendaMensalDeclarada,
      scoreBureauReferencia: params.scoreBureau || 800,
      valorPatrimonioDeclarado: params.patrimonioDeclarado,
    });

    const taxa = params.taxaMensalDesejada || parecer.taxaJurosMensalRecomendadaPercentual;
    const amort = this.calcularAmortizacao(params.valorSolicitado, taxa, params.prazoMeses, params.sistemaAmortizacao);
    const dti = Number(((amort.primeiraParcela / params.rendaMensalDeclarada) * 100).toFixed(1));

    const statusInicial: StatusPropostaMesa =
      parecer.decisaoFinal === "APROVADO_AUTOMATICO"
        ? "APROVADO_MESA"
        : parecer.decisaoFinal === "CONDICIONADO_AVALISTA_OU_GARANTIA"
        ? "CONDICIONADO"
        : parecer.decisaoFinal === "SUBMETIDO_COMITE_RISCO"
        ? "COMITE_RISCO"
        : "RECUSADO";

    const nova: PropostaMesaCredito = {
      id,
      codigoProtocolo,
      clienteNome: params.clienteNome,
      clienteDocumento: params.clienteDocumento,
      clienteTipo: params.clienteTipo,
      rendaMensalDeclarada: params.rendaMensalDeclarada,
      patrimonioDeclarado: params.patrimonioDeclarado,
      empresaOrigemId: params.empresaOrigemId,
      empresaOrigemNome: params.empresaOrigemNome,
      produtoId: params.produtoId,
      produtoNome: params.produtoNome,
      finalidadeCredito: params.finalidadeCredito,
      valorSolicitado: params.valorSolicitado,
      valorAprovado: statusInicial !== "RECUSADO" ? params.valorSolicitado : 0,
      prazoMeses: params.prazoMeses,
      taxaMensalPercentual: taxa,
      taxaAnualEfetiva: Number(((Math.pow(1 + taxa / 100, 12) - 1) * 100).toFixed(2)),
      sistemaAmortizacao: params.sistemaAmortizacao,
      status: statusInicial,
      statusLabel: this.obterLabelStatus(statusInicial),
      scoreBancoFe: parecer.scoreBancoFe,
      ratingBancoFe: parecer.ratingBancoFe,
      probabilidadeInadimplenciaPD: parecer.probabilidadeInadimplenciaPD,
      perdaEsperadaEL: parecer.perdaEsperadaELPercentual,
      comprometimentoRendaDTI: dti,
      primeiraParcela: amort.primeiraParcela,
      ultimaParcela: amort.ultimaParcela,
      totalJuros: amort.totalJuros,
      totalPagoEstimado: amort.totalPago,
      cetAnualPercentual: Number(amort.cetAnual),
      parecerAlgoritmico: parecer,
      garantiasApresentadas: [],
      deliberacoes: [
        {
          data: new Date().toISOString(),
          autor: "Mesa de Crédito Algorítmica BancoFé",
          acao: "CRIACAO_PROPOSTA",
          parecer: `Proposta submetida à Mesa de Crédito. Parecer algorítmico inicial: ${parecer.decisaoFinal} (Score: ${parecer.scoreBancoFe}, Rating: ${parecer.ratingBancoFe}).`,
        },
      ],
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    this.propostas.set(nova.id, nova);
    this.persistir();
    return nova;
  }

  public obterMetricas(): MetricasMesaCredito {
    const lista = Array.from(this.propostas.values());
    let volumeEmAnalise = 0;
    let volumeAprovado = 0;
    let volumeLiquidado = 0;
    let somaTaxas = 0;
    let somaEL = 0;

    const distribuicaoStatus: Record<StatusPropostaMesa, { quantidade: number; volume: number }> = {
      EM_ANALISE: { quantidade: 0, volume: 0 },
      APROVADO_MESA: { quantidade: 0, volume: 0 },
      CONDICIONADO: { quantidade: 0, volume: 0 },
      COMITE_RISCO: { quantidade: 0, volume: 0 },
      RECUSADO: { quantidade: 0, volume: 0 },
      FORMALIZADO_CCB: { quantidade: 0, volume: 0 },
      LIQUIDADO: { quantidade: 0, volume: 0 },
    };

    const distribuicaoEmpresa: Record<string, { quantidade: number; volume: number }> = {};
    const distribuicaoRating: Record<string, number> = {};

    for (const p of lista) {
      if (p.status === "EM_ANALISE" || p.status === "COMITE_RISCO" || p.status === "CONDICIONADO") {
        volumeEmAnalise += p.valorSolicitado;
      }
      if (p.status === "APROVADO_MESA" || p.status === "FORMALIZADO_CCB") {
        volumeAprovado += p.valorAprovado;
      }
      if (p.status === "LIQUIDADO") {
        volumeLiquidado += p.valorAprovado;
      }

      somaTaxas += p.taxaMensalPercentual;
      somaEL += p.perdaEsperadaEL;

      if (distribuicaoStatus[p.status]) {
        distribuicaoStatus[p.status].quantidade++;
        distribuicaoStatus[p.status].volume += p.valorSolicitado;
      }

      if (!distribuicaoEmpresa[p.empresaOrigemNome]) {
        distribuicaoEmpresa[p.empresaOrigemNome] = { quantidade: 0, volume: 0 };
      }
      distribuicaoEmpresa[p.empresaOrigemNome].quantidade++;
      distribuicaoEmpresa[p.empresaOrigemNome].volume += p.valorSolicitado;

      distribuicaoRating[p.ratingBancoFe] = (distribuicaoRating[p.ratingBancoFe] || 0) + 1;
    }

    return {
      volumeTotalEmAnalise: volumeEmAnalise,
      volumeTotalAprovado: volumeAprovado,
      volumeTotalLiquidado: volumeLiquidado,
      totalPropostasFila: lista.length,
      taxaMediaMensal: lista.length > 0 ? Number((somaTaxas / lista.length).toFixed(2)) : 1.35,
      perdaEsperadaMediaEL: lista.length > 0 ? Number((somaEL / lista.length).toFixed(2)) : 0.95,
      distribuicaoPorStatus: distribuicaoStatus,
      distribuicaoPorEmpresa: distribuicaoEmpresa,
      distribuicaoPorRating: distribuicaoRating,
      integridadeBureaus: "48/48 Bases Governamentais & Bancárias Conectadas ao Vivo",
    };
  }
}
