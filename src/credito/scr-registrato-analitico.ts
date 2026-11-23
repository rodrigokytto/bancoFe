/**
 * Módulo Analítico SCR / Registrato Bacen — BancoFé
 * Simulação e processamento do Sistema de Informações de Créditos do Banco Central (SCR),
 * conforme Resolução CMN nº 2.682/1999 e Circular Bacen nº 3.870/2017.
 *
 * Mapeia dívidas a vencer por faixa temporal, créditos vencidos, prejuízo registrado,
 * coobrigações prestadas, limites rotativos e Rating Regulatório Bacen (AA a H).
 */

export type RatingRegulatorioBacen = "AA" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface OperacaoCreditoSCR {
  instituicaoFinanceira: string;
  codigoCompensacao: string;
  modalidadeOperacao:
    | "Empréstimo Pessoal / CDC"
    | "Financiamento Imobiliário"
    | "Crédito Rural e Agroindustrial"
    | "Cartão de Crédito Rotativo"
    | "Cartão de Crédito Parcelado"
    | "Cheque Especial / Conta Garantida"
    | "Capital de Giro PJ"
    | "Consignado em Folha";
  valorContratado: number;
  saldoDevedorTotal: number;
  saldoAVencerAte30Dias: number;
  saldoAVencer31a60Dias: number;
  saldoAVencer61a90Dias: number;
  saldoAVencerAcima360Dias: number;
  saldoVencido: number;
  prejuizoRegistrado: number;
  ratingBacen: RatingRegulatorioBacen;
  garantiasConstituidas: string;
}

export interface DossiêSCRBacen {
  cpfCnpj: string;
  titularNome: string;
  dataBaseConsulta: string;
  protocoloBacenSCR: string;
  ratingConsolidadoBacen: RatingRegulatorioBacen;
  saldoDevedorTotalSFN: number;
  limitesCreditoDisponiveisSFN: number;
  totalAVencerSFN: number;
  totalVencidoSFN: number;
  totalPrejuizoSFN: number;
  percentualPontualidadeHistorica: number; // Ex: 99.8%
  operacoesDetalhadas: OperacaoCreditoSCR[];
  instituicoesComRelacionamentoAtivo: string[];
  chavesPixCadastradasDICT: Array<{ chave: string; tipo: "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA"; banco: string }>;
  parecerCapacidadeEndividamento: {
    margemComprometimentoAtualPercentual: number;
    margemLivreParaNovasOperacoesMensal: number;
    recomendacaoMesa: "APROVAR_SEM_RESTRICAO" | "APROVAR_COM_CONDICIONANTES" | "RECUSAR_EXCESSO_ALAVANCAGEM";
    observacaoAuditoria: string;
  };
}

export const BASE_SCR_BACEN_HOMOLOGADA: Record<string, Partial<DossiêSCRBacen>> = {
  // Rodrigo Ribeiro Gonçalves
  "30587162813": {
    cpfCnpj: "30587162813",
    titularNome: "RODRIGO RIBEIRO GONÇALVES",
    ratingConsolidadoBacen: "AA",
    saldoDevedorTotalSFN: 145000,
    limitesCreditoDisponiveisSFN: 380000,
    totalAVencerSFN: 145000,
    totalVencidoSFN: 0,
    totalPrejuizoSFN: 0,
    percentualPontualidadeHistorica: 100,
    instituicoesComRelacionamentoAtivo: [
      "001 - Banco do Brasil S.A.",
      "748 - Banco Cooperativo Sicredi S.A.",
      "033 - Banco Santander (Brasil) S.A.",
      "341 - Itaú Unibanco S.A.",
    ],
    operacoesDetalhadas: [
      {
        instituicaoFinanceira: "748 - Banco Cooperativo Sicredi S.A. (Agência Tangará)",
        codigoCompensacao: "748",
        modalidadeOperacao: "Crédito Rural e Agroindustrial",
        valorContratado: 250000,
        saldoDevedorTotal: 95000,
        saldoAVencerAte30Dias: 0,
        saldoAVencer31a60Dias: 0,
        saldoAVencer61a90Dias: 0,
        saldoAVencerAcima360Dias: 95000,
        saldoVencido: 0,
        prejuizoRegistrado: 0,
        ratingBacen: "AA",
        garantiasConstituidas: "Penhor Agrícola de Safra & CPR Financeira",
      },
      {
        instituicaoFinanceira: "001 - Banco do Brasil S.A. (Nova Olímpia)",
        codigoCompensacao: "001",
        modalidadeOperacao: "Financiamento Imobiliário",
        valorContratado: 380000,
        saldoDevedorTotal: 50000,
        saldoAVencerAte30Dias: 2800,
        saldoAVencer31a60Dias: 2800,
        saldoAVencer61a90Dias: 2800,
        saldoAVencerAcima360Dias: 41600,
        saldoVencido: 0,
        prejuizoRegistrado: 0,
        ratingBacen: "AA",
        garantiasConstituidas: "Alienação Fiduciária de Imóvel Residencial",
      },
    ],
    chavesPixCadastradasDICT: [
      { chave: "30587162813", tipo: "CPF", banco: "748 - Sicredi" },
      { chave: "rodrigo.goncalves@uisa.com.br", tipo: "EMAIL", banco: "001 - Banco do Brasil" },
      { chave: "+5565999812239", tipo: "TELEFONE", banco: "341 - Itaú" },
    ],
    parecerCapacidadeEndividamento: {
      margemComprometimentoAtualPercentual: 6.8,
      margemLivreParaNovasOperacoesMensal: 21500,
      recomendacaoMesa: "APROVAR_SEM_RESTRICAO",
      observacaoAuditoria: "Excelente histórico no SCR Bacen. Dívidas rurais com amortização rigorosamente em dia. Ampla margem livre para alavancagem.",
    },
  },

  // Patrícia Ferrari Paulino Gonçalves
  "32285522843": {
    cpfCnpj: "32285522843",
    titularNome: "PATRÍCIA FERRARI PAULINO GONÇALVES",
    ratingConsolidadoBacen: "A",
    saldoDevedorTotalSFN: 38000,
    limitesCreditoDisponiveisSFN: 195000,
    totalAVencerSFN: 38000,
    totalVencidoSFN: 0,
    totalPrejuizoSFN: 0,
    percentualPontualidadeHistorica: 99.9,
    instituicoesComRelacionamentoAtivo: [
      "237 - Banco Bradesco S.A.",
      "033 - Banco Santander (Brasil) S.A.",
      "260 - Nu Pagamentos S.A.",
    ],
    operacoesDetalhadas: [
      {
        instituicaoFinanceira: "237 - Banco Bradesco S.A. (Mirante do Paranapanema)",
        codigoCompensacao: "237",
        modalidadeOperacao: "Capital de Giro PJ",
        valorContratado: 80000,
        saldoDevedorTotal: 38000,
        saldoAVencerAte30Dias: 2100,
        saldoAVencer31a60Dias: 2100,
        saldoAVencer61a90Dias: 2100,
        saldoAVencerAcima360Dias: 31700,
        saldoVencido: 0,
        prejuizoRegistrado: 0,
        ratingBacen: "A",
        garantiasConstituidas: "Aval dos Sócios e Recebíveis de Cartão",
      },
    ],
    chavesPixCadastradasDICT: [
      { chave: "32285522843", tipo: "CPF", banco: "237 - Bradesco" },
      { chave: "patricia.goncalves@kytto.com.br", tipo: "EMAIL", banco: "033 - Santander" },
    ],
    parecerCapacidadeEndividamento: {
      margemComprometimentoAtualPercentual: 5.0,
      margemLivreParaNovasOperacoesMensal: 10500,
      recomendacaoMesa: "APROVAR_SEM_RESTRICAO",
      observacaoAuditoria: "Excelente pontualidade em operações bancárias PJ/PF. Saldo devedor baixo frente à capacidade de geração de caixa.",
    },
  },

  // Lucas dos Passos Silva
  "06988722661": {
    cpfCnpj: "06988722661",
    titularNome: "LUCAS DOS PASSOS SILVA",
    ratingConsolidadoBacen: "AA",
    saldoDevedorTotalSFN: 15200,
    limitesCreditoDisponiveisSFN: 160000,
    totalAVencerSFN: 15200,
    totalVencidoSFN: 0,
    totalPrejuizoSFN: 0,
    percentualPontualidadeHistorica: 100,
    instituicoesComRelacionamentoAtivo: [
      "033 - Banco Santander (Brasil) S.A.",
      "341 - Itaú Unibanco S.A.",
    ],
    operacoesDetalhadas: [
      {
        instituicaoFinanceira: "033 - Banco Santander (Brasil) S.A.",
        codigoCompensacao: "033",
        modalidadeOperacao: "Empréstimo Pessoal / CDC",
        valorContratado: 45000,
        saldoDevedorTotal: 15200,
        saldoAVencerAte30Dias: 950,
        saldoAVencer31a60Dias: 950,
        saldoAVencer61a90Dias: 950,
        saldoAVencerAcima360Dias: 12350,
        saldoVencido: 0,
        prejuizoRegistrado: 0,
        ratingBacen: "AA",
        garantiasConstituidas: "Alienação Fiduciária Veicular",
      },
    ],
    chavesPixCadastradasDICT: [
      { chave: "06988722661", tipo: "CPF", banco: "033 - Santander" },
      { chave: "lucas.silva@uisa.com.br", tipo: "EMAIL", banco: "341 - Itaú" },
    ],
    parecerCapacidadeEndividamento: {
      margemComprometimentoAtualPercentual: 2.7,
      margemLivreParaNovasOperacoesMensal: 12550,
      recomendacaoMesa: "APROVAR_SEM_RESTRICAO",
      observacaoAuditoria: "Comprometimento mínimo do orçamento. Margem consignável e habitacional totalmente livre.",
    },
  },
};

/**
 * Consulta o dossiê analítico do SCR Bacen
 */
export function consultarSCRBacen(cpfCnpj: string, nomeProponente?: string, rendaDeclarada: number = 10000): DossiêSCRBacen {
  const limpo = cpfCnpj.replace(/\D/g, "");
  const base = BASE_SCR_BACEN_HOMOLOGADA[limpo];

  if (base) {
    return {
      cpfCnpj: limpo,
      titularNome: base.titularNome || nomeProponente || "TITULAR SCR",
      dataBaseConsulta: "10/2026 (Competência Oficial Bacen Fechada)",
      protocoloBacenSCR: `BACEN-SCR-${limpo.slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
      ratingConsolidadoBacen: base.ratingConsolidadoBacen || "A",
      saldoDevedorTotalSFN: base.saldoDevedorTotalSFN || 0,
      limitesCreditoDisponiveisSFN: base.limitesCreditoDisponiveisSFN || 50000,
      totalAVencerSFN: base.totalAVencerSFN || 0,
      totalVencidoSFN: base.totalVencidoSFN || 0,
      totalPrejuizoSFN: base.totalPrejuizoSFN || 0,
      percentualPontualidadeHistorica: base.percentualPontualidadeHistorica || 100,
      operacoesDetalhadas: base.operacoesDetalhadas || [],
      instituicoesComRelacionamentoAtivo: base.instituicoesComRelacionamentoAtivo || ["Banco do Brasil", "Itaú"],
      chavesPixCadastradasDICT: base.chavesPixCadastradasDICT || [
        { chave: limpo, tipo: "CPF", banco: "Instituição Principal" },
      ],
      parecerCapacidadeEndividamento: base.parecerCapacidadeEndividamento || {
        margemComprometimentoAtualPercentual: 5.0,
        margemLivreParaNovasOperacoesMensal: rendaDeclarada * 0.25,
        recomendacaoMesa: "APROVAR_SEM_RESTRICAO",
        observacaoAuditoria: "Excelente perfil no SCR Bacen com zero histórico de inadimplência.",
      },
    };
  }

  // Geração preditiva com base na renda
  const comprometimentoEstimado = Math.min(rendaDeclarada * 0.08, 2500);
  const limiteEstimado = Math.max(rendaDeclarada * 2.5, 15000);

  return {
    cpfCnpj: limpo,
    titularNome: nomeProponente || "CLIENTE PESQUISADO",
    dataBaseConsulta: "10/2026 (Competência Oficial Bacen Fechada)",
    protocoloBacenSCR: `BACEN-SCR-${limpo.slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
    ratingConsolidadoBacen: "A",
    saldoDevedorTotalSFN: comprometimentoEstimado * 12,
    limitesCreditoDisponiveisSFN: limiteEstimado,
    totalAVencerSFN: comprometimentoEstimado * 12,
    totalVencidoSFN: 0,
    totalPrejuizoSFN: 0,
    percentualPontualidadeHistorica: 99.5,
    operacoesDetalhadas: [
      {
        instituicaoFinanceira: "Sistema Financeiro Nacional (Consolidado)",
        codigoCompensacao: "SFN",
        modalidadeOperacao: "Cartão de Crédito Parcelado",
        valorContratado: comprometimentoEstimado * 12,
        saldoDevedorTotal: comprometimentoEstimado * 6,
        saldoAVencerAte30Dias: comprometimentoEstimado,
        saldoAVencer31a60Dias: comprometimentoEstimado,
        saldoAVencer61a90Dias: comprometimentoEstimado,
        saldoAVencerAcima360Dias: 0,
        saldoVencido: 0,
        prejuizoRegistrado: 0,
        ratingBacen: "A",
        garantiasConstituidas: "Sem garantias reais exigidas",
      },
    ],
    instituicoesComRelacionamentoAtivo: ["Bancos e Cooperativas do SFN"],
    chavesPixCadastradasDICT: [{ chave: limpo, tipo: "CPF", banco: "Banco Conveniado" }],
    parecerCapacidadeEndividamento: {
      margemComprometimentoAtualPercentual: 8.0,
      margemLivreParaNovasOperacoesMensal: rendaDeclarada * 0.22,
      recomendacaoMesa: "APROVAR_SEM_RESTRICAO",
      observacaoAuditoria: "Regularidade no SCR Bacen. Capacidade de pagamento plenamente preservada.",
    },
  };
}
