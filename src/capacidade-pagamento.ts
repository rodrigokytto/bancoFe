import type {
  BemPatrimonial,
  CapacidadePagamentoCredito,
  ProcessoJudicial,
  ProtestoCartorio,
  VinculoEmpregaticio,
  VinculoSocietario,
} from "./tipos.ts";

export interface EntradaAnaliseCredito {
  tipoPessoa: "PF" | "PJ";
  salarioEmpregoCentavos?: number;
  vinculosEmpregaticios: VinculoEmpregaticio[];
  vinculosSocietarios: VinculoSocietario[];
  patrimonio: BemPatrimonial[];
  processos: ProcessoJudicial[];
  protestos: ProtestoCartorio[];
  situacaoCadastral: string;
}

/**
 * Motor Pericial de Cálculo de Capacidade de Pagamento e Renda Presumida
 * Aplica a metodologia dos 5 Cs do Crédito e regras do CMN/BACEN
 */
export function calcularCapacidadePagamento(dados: EntradaAnaliseCredito): CapacidadePagamentoCredito {
  // 1. Renda e Faturamento
  let rendaTrabalhoCentavos = 0;
  for (const emp of dados.vinculosEmpregaticios) {
    if (emp.vinculoAtivo) {
      rendaTrabalhoCentavos += emp.salarioEstimadoCentavos;
    }
  }

  // Se não tem carteira assinada, mas tem empresas:
  let faturamentoSocietarioProporcionalCentavos = 0;
  let prolaborePresumidoCentavos = 0;

  for (const emp of dados.vinculosSocietarios) {
    if (emp.situacaoCadastralEmpresa === "ATIVA") {
      const parcelaFaturamento = Math.round(
        (emp.faturamentoPresumidoAnualCentavos * (emp.participacaoCapitalPercentual / 100)) / 12,
      );
      faturamentoSocietarioProporcionalCentavos += parcelaFaturamento;
      // Pró-labore estimado em 8% a 15% da receita operacional mensal
      prolaborePresumidoCentavos += Math.round(parcelaFaturamento * 0.12);
    }
  }

  // Renda mensal consolidada (CLT + Pró-labore/Rendimentos)
  const rendaMensalTotalCentavos =
    rendaTrabalhoCentavos > 0
      ? rendaTrabalhoCentavos + Math.round(prolaborePresumidoCentavos * 0.5)
      : Math.max(prolaborePresumidoCentavos, 350000); // Mínimo referencial de R$ 3.500,00 se tem empresa ativa

  // 2. Patrimônio Líquido Estimado
  let patrimonioCentavos = 0;
  for (const bem of dados.patrimonio) {
    patrimonioCentavos += bem.valorEstimadoCentavos;
  }
  for (const soc of dados.vinculosSocietarios) {
    if (soc.situacaoCadastralEmpresa === "ATIVA") {
      patrimonioCentavos += Math.round(soc.capitalSocialCentavos * (soc.participacaoCapitalPercentual / 100));
    }
  }

  // 3. Impacto de Restrições
  const totalProtestosCentavos = dados.protestos.reduce((acc, p) => acc + p.valorProtestadoCentavos, 0);
  const processosExecucao = dados.processos.filter(
    (p) =>
      p.polo === "REU" &&
      p.situacao === "EM_ANDAMENTO" &&
      (p.classe.includes("Execução") || p.classe.includes("Cobrança")),
  );
  const _totalProcessosRiscoCentavos = processosExecucao.reduce((acc, p) => acc + p.valorCausaCentavos, 0);

  // 4. Análise dos 5 Cs do Crédito
  // C1: Caráter (0 a 100)
  let caraterScore = 100;
  let caraterParecer = "Excelente histórico reputacional, sem registros desabonadores em cartórios ou tribunais.";
  if (dados.protestos.length > 0) {
    caraterScore -= Math.min(dados.protestos.length * 15, 50);
    caraterParecer = `Identificados ${dados.protestos.length} protesto(s) em cartório totalizando R$ ${(totalProtestosCentavos / 100).toFixed(2)}. Requer quitação ou certidão de baixa.`;
  }
  if (processosExecucao.length > 0) {
    caraterScore -= Math.min(processosExecucao.length * 20, 40);
    caraterParecer += ` Constam ${processosExecucao.length} processo(s) de execução/cobrança no polo passivo.`;
  }
  if (dados.situacaoCadastral !== "REGULAR" && dados.situacaoCadastral !== "ATIVA") {
    caraterScore -= 40;
    caraterParecer += " Situação cadastral na Receita Federal não regular.";
  }
  caraterScore = Math.max(caraterScore, 10);

  // C2: Capacidade (0 a 100)
  let capacidadeScore = 80;
  let capacidadeParecer = "Fluxo de renda compatível com compromissos e limites de crédito habituais.";
  if (rendaMensalTotalCentavos >= 1500000) {
    capacidadeScore = 95;
    capacidadeParecer = "Alta capacidade financeira com geração de caixa mensal expressiva (acima de R$ 15.000,00).";
  } else if (rendaMensalTotalCentavos < 500000) {
    capacidadeScore = 60;
    capacidadeParecer = "Renda estimada moderada; recomenda-se limitar o comprometimento de renda a 25%.";
  }

  // C3: Capital (0 a 100)
  let capitalScore = 50;
  let capitalParecer = "Patrimônio básico de suporte.";
  if (patrimonioCentavos > 200000000) {
    // Acima de 2 milhões
    capitalScore = 95;
    capitalParecer = "Excelente lastro patrimonial consolidado em imóveis e participações empresariais.";
  } else if (patrimonioCentavos > 50000000) {
    // Acima de 500 mil
    capitalScore = 80;
    capitalParecer = "Bom nível de reservas patrimoniais declaradas.";
  }

  // C4: Colateral (0 a 100)
  const bensLivres = dados.patrimonio.filter((b) => !b.alienacaoFiduciariaOuOnus);
  const colateralScore = bensLivres.length > 0 ? 85 : 45;
  const colateralParecer =
    bensLivres.length > 0
      ? `Disponibilidade de ${bensLivres.length} bem(ns) livre(s) de ônus para garantia fiduciária ou hipotecária.`
      : "Ausência de bens desembaraçados averbados diretamente sob titularidade exclusiva.";

  // C5: Condições (0 a 100)
  const condicoesScore = 85;
  const condicoesParecer =
    "Segmento econômico regional aquecido (eixo agroindustrial e imobiliário de Tangará da Serra e Médio-Norte do MT).";

  // 5. Score Kytto 360 (Ponderação: Caráter 30%, Capacidade 30%, Capital 15%, Colateral 15%, Condições 10%)
  const scoreKytto360 = Math.round(
    caraterScore * 3.0 + capacidadeScore * 3.0 + capitalScore * 1.5 + colateralScore * 1.5 + condicoesScore * 1.0,
  );

  // 6. Rating
  let classificacaoRating: CapacidadePagamentoCredito["classificacaoRating"] = "BBB";
  if (scoreKytto360 >= 900) classificacaoRating = "AAA";
  else if (scoreKytto360 >= 800) classificacaoRating = "AA";
  else if (scoreKytto360 >= 700) classificacaoRating = "A";
  else if (scoreKytto360 >= 600) classificacaoRating = "BBB";
  else if (scoreKytto360 >= 500) classificacaoRating = "BB";
  else if (scoreKytto360 >= 400) classificacaoRating = "B";
  else if (scoreKytto360 >= 300) classificacaoRating = "CCC";
  else classificacaoRating = "D";

  // 7. Limites Financeiros Sugeridos
  // Regra BACEN: Limite de locação = até 30% da renda mensal líquida
  const limiteMensalLocacaoRecomendadoCentavos = Math.round(rendaMensalTotalCentavos * 0.3);

  // Limite de financiamento imobiliário (SAC/Price em 360 meses, comprometendo até 30% da renda)
  // Fator PV aproximado para taxa média de 10% a.a. em 30 anos = ~95x a prestação mensal
  const limiteFinanciamentoImobiliarioSugeridoCentavos = Math.round(limiteMensalLocacaoRecomendadoCentavos * 95);

  const faixaRendaMensalDescricao =
    rendaMensalTotalCentavos >= 2000000
      ? "Classe A (Acima de R$ 20.000,00/mês)"
      : rendaMensalTotalCentavos >= 1000000
        ? "Classe B (R$ 10.000,00 a R$ 20.000,00/mês)"
        : rendaMensalTotalCentavos >= 500000
          ? "Classe C+ (R$ 5.000,00 a R$ 10.000,00/mês)"
          : "Classe C/D (Até R$ 5.000,00/mês)";

  const indicePontualidade = Math.max(10, Math.min(100, Math.round(caraterScore * 0.95)));

  // 8. Parecer Formal da Mesa de Crédito
  let parecerMesaCredito = "";
  if (scoreKytto360 >= 750) {
    parecerMesaCredito = `APROVADO PREFERENCIAL: Proponente com rating ${classificacaoRating} (Score ${scoreKytto360}/1000). Alta solvência e liquidez demonstrada. Capacidade de prestação mensal de até R$ ${(limiteMensalLocacaoRecomendadoCentavos / 100).toFixed(2)} e capacidade de investimento imobiliário sugerida de até R$ ${(limiteFinanciamentoImobiliarioSugeridoCentavos / 100).toFixed(2)}.`;
  } else if (scoreKytto360 >= 550) {
    parecerMesaCredito = `APROVADO COM CONDICIONANTES: Proponente com rating ${classificacaoRating} (Score ${scoreKytto360}/1000). Recomenda-se caução imobiliária, fiador idôneo ou seguro fiança locatícia para operações de locação, mantendo parcela em até R$ ${(limiteMensalLocacaoRecomendadoCentavos / 100).toFixed(2)}.`;
  } else {
    parecerMesaCredito = `RESTRITIVO / EXIGE GARANTIA ADICIONAL: Proponente com rating ${classificacaoRating} (Score ${scoreKytto360}/1000). Identificados apontamentos restritivos ou baixa comprovação de renda líquida. Exige co-devedor solidário ou garantia real hipotecária de imóvel livre de ônus.`;
  }

  return {
    rendaEstimadaMensalCentavos: rendaMensalTotalCentavos,
    faixaRendaMensalDescricao,
    faturamentoPresumidoSocietarioCentavos: faturamentoSocietarioProporcionalCentavos,
    patrimonioLiquidoEstimadoCentavos: patrimonioCentavos,
    scoreKytto360,
    classificacaoRating,
    comprometimentoRendaEstimadoPercentual: 30,
    limiteMensalLocacaoRecomendadoCentavos,
    limiteFinanciamentoImobiliarioSugeridoCentavos,
    indicePontualidadePagamento: indicePontualidade,
    cincoCsDoCredito: {
      carater: { score: caraterScore, parecer: caraterParecer },
      capacidade: { score: capacidadeScore, parecer: capacidadeParecer },
      capital: { score: capitalScore, parecer: capitalParecer },
      colateral: { score: colateralScore, parecer: colateralParecer },
      condicoes: { score: condicoesScore, parecer: condicoesParecer },
    },
    parecerMesaCredito,
  };
}
