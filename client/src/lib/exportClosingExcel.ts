import * as XLSX from "xlsx";

export interface ClosingDataForExcel {
  caixa: any;
  faturamento: {
    totalFaturado: number;
    totalTaxas: number;
    totalLiquido: number;
    ticketMedio: number;
    totalGorjetas: number;
  };
  resumoGaveta: {
    fundoTrocoInicial: number;
    vendasDinheiro: number;
    suprimentosExtras: number;
    sangrias: number;
    saldoEsperadoGaveta: number;
    dinheiroContado: number;
    divergenciaQuebra: number;
    statusQuebra: string;
  };
  itensConciliacao: Array<{
    forma: string;
    label: string;
    operacao: number;
    erp: number;
    diferenca: number;
    status: string;
  }>;
  movimentacoes: Array<{
    id: string;
    type: string;
    amount: number;
    reason: string;
    timestamp: string;
    operator: string;
  }>;
  pagamentos: Array<any>;
  dre?: {
    receitaBruta: number;
    taxasCartao: number;
    cmvNobre: number;
    margemContribuicao: number;
    percentualMargem: number;
  };
}

export function exportClosingToExcel(data: ClosingDataForExcel) {
  const wb = XLSX.utils.book_new();

  // 1. ABA RESUMO GERAL
  const resumoRows = [
    ["ZUMA COZINHA ORIENTAL — FECHAMENTO DIÁRIO DE CAIXA & TURNO"],
    ["CNPJ:", "36.296.848/0001-57", "Cidade:", "Tangará da Serra - MT"],
    ["Data Emissão:", new Date().toLocaleString("pt-BR")],
    [""],
    ["INFORMAÇÕES DO TURNO"],
    ["ID do Turno:", data.caixa?.id || "N/A"],
    ["Status:", (data.caixa?.status || "aberto").toUpperCase()],
    ["Operador:", data.caixa?.operator || "Operador de Caixa"],
    ["Supervisor:", "Rodrigo Ribeiro Gonçalves"],
    ["Abertura:", data.caixa?.openedAt ? new Date(data.caixa.openedAt).toLocaleString("pt-BR") : "--"],
    ["Fechamento:", data.caixa?.closedAt ? new Date(data.caixa.closedAt).toLocaleString("pt-BR") : "Turno em Andamento"],
    [""],
    ["FATURAMENTO CONSOLIDADO DO TURNO"],
    ["Total Bruto Faturado:", data.faturamento.totalFaturado],
    ["Deduções / Taxas TEF:", -data.faturamento.totalTaxas],
    ["Total Líquido TEF/Pix:", data.faturamento.totalLiquido],
    ["Ticket Médio:", data.faturamento.ticketMedio],
    ["Gorjetas Rateadas (10%):", data.faturamento.totalGorjetas],
    [""],
    ["APURAÇÃO FÍSICA DA GAVETA (DINHEIRO EM ESPÉCIE)"],
    ["(+) Fundo de Troco Inicial:", data.resumoGaveta.fundoTrocoInicial],
    ["(+) Vendas em Dinheiro (Comandas):", data.resumoGaveta.vendasDinheiro],
    ["(+) Suprimentos Extras:", data.resumoGaveta.suprimentosExtras],
    ["(-) Sangrias Realizadas (Cofre):", -data.resumoGaveta.sangrias],
    ["(=) Saldo Esperado em Gaveta:", data.resumoGaveta.saldoEsperadoGaveta],
    ["(✓) Dinheiro Físico Declarado (Contagem):", data.resumoGaveta.dinheiroContado],
    ["(Δ) Diferença / Quebra de Caixa:", data.resumoGaveta.divergenciaQuebra],
    ["Situação da Quebra:", Math.abs(data.resumoGaveta.divergenciaQuebra) <= 2.0 ? "DENTRO DA TOLERÂNCIA (R$ 2,00)" : "DIVERGENTE"]
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
  XLSX.utils.book_append_sheet(wb, wsResumo, "1. Resumo Executivo");

  // 2. ABA MATRIZ DE CONCILIAÇÃO
  const conciliacaoHeader = [
    ["MATRIZ DE CONCILIAÇÃO MULTIADQUIRENTE — CAIXA OPERAÇÃO vs ERP FINANCEIRO"],
    ["Forma de Pagamento", "Tipo / Canal", "Valor Salão (PDV)", "Valor ERP / Banco", "Diferença", "Tolerância", "Status"]
  ];
  const conciliacaoRows = data.itensConciliacao.map(item => [
    item.label,
    item.forma,
    item.operacao,
    item.erp,
    item.diferenca,
    item.forma === "dinheiro" ? 2.0 : 0.0,
    item.status.toUpperCase()
  ]);
  const wsConciliacao = XLSX.utils.aoa_to_sheet([...conciliacaoHeader, ...conciliacaoRows]);
  XLSX.utils.book_append_sheet(wb, wsConciliacao, "2. Matriz Conciliação");

  // 3. ABA TRANSAÇÕES E COMANDAS
  const transacoesHeader = [
    ["TRANSAÇÕES DETALHADAS DO TURNO (COMANDAS & PAGAMENTOS)"],
    ["ID / NSU", "Horário", "Meio de Pagamento", "Bandeira", "Valor Bruto (R$)", "Taxa MDR (R$)", "Valor Líquido (R$)", "Status", "Chave NFC-e SEFAZ-MT"]
  ];
  const transacoesRows = data.pagamentos.map(p => [
    p.nsu || p.id,
    p.timestamp ? new Date(p.timestamp).toLocaleTimeString("pt-BR") : "--",
    (p.method || "").toUpperCase(),
    p.cardBrand || "N/A",
    p.amount || 0,
    p.fee || 0,
    p.netAmount || 0,
    (p.status || "").toUpperCase(),
    p.nfceKey || "Emissão Automática"
  ]);
  const wsTransacoes = XLSX.utils.aoa_to_sheet([...transacoesHeader, ...transacoesRows]);
  XLSX.utils.book_append_sheet(wb, wsTransacoes, "3. Transações e Comandas");

  // 4. ABA SANGRIAS E SUPRIMENTOS
  const movimentosHeader = [
    ["MOVIMENTAÇÕES INTERNAS DA GAVETA DE DINHEIRO (SANGRIAS & SUPRIMENTOS)"],
    ["ID Movimento", "Horário", "Tipo", "Operador Responsável", "Motivo / Justificativa", "Valor (R$)"]
  ];
  const movimentosRows = (data.movimentacoes || []).map(m => [
    m.id,
    m.timestamp ? new Date(m.timestamp).toLocaleTimeString("pt-BR") : "--",
    m.type.toUpperCase(),
    m.operator || "Mariana",
    m.reason,
    m.type === "sangria" ? -m.amount : m.amount
  ]);
  const wsMovimentos = XLSX.utils.aoa_to_sheet([...movimentosHeader, ...movimentosRows]);
  XLSX.utils.book_append_sheet(wb, wsMovimentos, "4. Sangrias e Suprimentos");

  // 5. ABA DRE GERENCIAL E CMV
  if (data.dre) {
    const dreRows = [
      ["DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE GERENCIAL DO TURNO)"],
      ["Conta Gerencial", "Valor (R$)", "% sobre Receita Bruta"],
      ["(+) RECEITA BRUTA OPERACIONAL", data.dre.receitaBruta, "100.0%"],
      ["(-) Taxas de Cartão & Adquirentes (MDR)", -data.dre.taxasCartao, `${((data.dre.taxasCartao / data.dre.receitaBruta) * 100).toFixed(1)}%`],
      ["(=) RECEITA OPERACIONAL LÍQUIDA", data.dre.receitaBruta - data.dre.taxasCartao, `${(((data.dre.receitaBruta - data.dre.taxasCartao) / data.dre.receitaBruta) * 100).toFixed(1)}%`],
      ["(-) CMV Nobre de Insumos (Salmão Fresco / BOM)", -data.dre.cmvNobre, `${((data.dre.cmvNobre / data.dre.receitaBruta) * 100).toFixed(1)}%`],
      ["(=) MARGEM DE CONTRIBUIÇÃO LÍQUIDA", data.dre.margemContribuicao, `${data.dre.percentualMargem.toFixed(1)}%`]
    ];
    const wsDre = XLSX.utils.aoa_to_sheet(dreRows);
    XLSX.utils.book_append_sheet(wb, wsDre, "5. DRE Gerencial");
  }

  // Gera o arquivo e inicia o download
  const dateStr = new Date().toISOString().slice(0, 10);
  const shiftId = data.caixa?.id || "turno";
  XLSX.writeFile(wb, `Zuma_Fechamento_Turno_${shiftId}_${dateStr}.xlsx`);
}
