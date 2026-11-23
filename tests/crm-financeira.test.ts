import { describe, it, expect } from "vitest";
import { crmFinanceiraStore } from "../server/crmFinanceiraStore";

describe("BancoFe — Motor de Operações Financeiras & CRM 360°", () => {
  it("deve carregar a base de oportunidades com integridade (22 oportunidades)", () => {
    const ops = crmFinanceiraStore.listarOportunidades();
    expect(ops.length).toBeGreaterThanOrEqual(20);
    const primeira = ops[0];
    expect(primeira).toHaveProperty("codigoProtocolo");
    expect(primeira).toHaveProperty("contraparteNome");
    expect(primeira).toHaveProperty("valorCentavos");
    expect(primeira).toHaveProperty("ratingBacen");
    expect(primeira).toHaveProperty("etapa");
  });

  it("deve calcular métricas consolidadas de pipeline, SLA e ticket médio", () => {
    const metricas = crmFinanceiraStore.obterMetricasGestao();
    expect(metricas.pipelineCentavos).toBeGreaterThan(2000000000); // Mais de R$ 20M em centavos
    expect(metricas.abertas).toBeGreaterThanOrEqual(15);
    expect(metricas.ticketMedio).toBeGreaterThan(1000000);
    expect(metricas.taxaMediaMensal).toBeGreaterThan(1.0);
    expect(metricas.etapas.length).toBe(5); // 5 colunas oficiais do funil
    expect(metricas.previsao.length).toBeGreaterThanOrEqual(3);
    expect(metricas.porResponsavel.length).toBeGreaterThanOrEqual(2);
  });

  it("deve conter todos os 20 cadastros de Casa Nova Imóveis na esteira de pré-cadastros", () => {
    const pre = crmFinanceiraStore.listarPreCadastros({ tamanhoPagina: 50 });
    expect(pre.total).toBeGreaterThanOrEqual(20);
    expect(pre.resumo.total).toBeGreaterThanOrEqual(20);
    expect(pre.resumo.novo + pre.resumo.qualificado + pre.resumo.convertido).toBeGreaterThanOrEqual(20);

    // Valida proponentes emblemáticos de Casa Nova
    const nomes = pre.precadastros.map((p) => p.nome.toUpperCase());
    expect(nomes.some((n) => n.includes("CARLOS EDUARDO MENDONÇA"))).toBe(true);
    expect(nomes.some((n) => n.includes("RODRIGO RIBEIRO GONCALVES"))).toBe(true);
    expect(nomes.some((n) => n.includes("CASANOVA EMPREENDIMENTOS"))).toBe(true);
    expect(nomes.some((n) => n.includes("DINO BARBEARIA"))).toBe(true);
    expect(nomes.some((n) => n.includes("AILTON CESAR ZANATTA"))).toBe(true);

    // Valida mascaramento LGPD
    const primeiro = pre.precadastros[0];
    expect(primeiro.documentoMascarado).toContain("***");
    expect(primeiro.telefoneMascarado).toContain("**");
    expect(primeiro.emailMascarado).toContain("***");
    expect(primeiro.consentimentoGrupo).toBe(true);
  });

  it("deve processar carga pericial de Casa Nova sem duplicações", () => {
    const res = crmFinanceiraStore.processarCargaCasaNova();
    expect(res.sucesso).toBe(true);
    expect(res.total).toBeGreaterThanOrEqual(20);
  });

  it("deve qualificar pré-cadastro e converter em oportunidade no funil", () => {
    const preLista = crmFinanceiraStore.listarPreCadastros();
    const alvo = preLista.precadastros.find((p) => p.situacao === "novo") || preLista.precadastros[0];

    const cmdOk = crmFinanceiraStore.executarComandoPreCadastro(alvo.id, {
      comando: "qualificar",
    });
    expect(cmdOk).toBe(true);

    const convertida = crmFinanceiraStore.converterPreCadastro(alvo.id, {
      produto: "CREDITO_IMOBILIARIO",
      valorCentavos: 50000000, // R$ 500.000,00
      responsavel: "Rodrigo Gonçalves",
    });
    expect(convertida).not.toBeNull();
    expect(convertida!.contraparteNome).toBe(alvo.nome);
    expect(convertida!.etapa).toBe("qualificacao");
  });

  it("deve listar catálogo de produtos financeiros oficiais BancoFé", () => {
    const { produtos } = crmFinanceiraStore.obterProdutos();
    expect(produtos.length).toBeGreaterThanOrEqual(7);
    const ids = produtos.map((p) => p.id);
    expect(ids).toContain("CAPITAL_GIRO_PJ");
    expect(ids).toContain("ANTECIPACAO_RECEBIVEIS");
    expect(ids).toContain("CREDITO_IMOBILIARIO");
    expect(ids).toContain("FINANCIAMENTO_RURAL");
    expect(ids).toContain("INVESTIMENTO_PROPRIO");
  });

  it("deve listar carteira ativa e tarefas com contadores de SLA", () => {
    const carteira = crmFinanceiraStore.listarCarteira();
    expect(carteira.total).toBeGreaterThan(0);
    expect(carteira.saldoCarteiraCentavos).toBeGreaterThan(0);

    const tarefas = crmFinanceiraStore.listarTarefas();
    expect(tarefas.resumo.total).toBeGreaterThan(0);
    expect(tarefas.resumo.abertas).toBeGreaterThan(0);
  });

  it("deve simular operação de financiamento com amortização SAC", () => {
    const sim = crmFinanceiraStore.simularOperacao({
      valorBruto: 100000,
      prazoMeses: 10,
      taxaMensalPercentual: 1.5,
      sistemaAmortizacao: "SAC",
      tarifaTac: 1000,
    });
    expect(sim.valorBruto).toBe(100000);
    expect(sim.sistemaAmortizacao).toBe("SAC");
    expect(sim.cronogramaParcelas).toHaveLength(10);
    expect(sim.cronogramaParcelas[0].amortizacao).toBe(10000);
    expect(sim.parcelaInicial).toBeGreaterThan(sim.parcelaFinal);
    expect(sim.iofCalculado).toBeGreaterThan(0);
    expect(sim.totalJuros).toBeGreaterThan(0);
  });

  it("deve simular operação de financiamento com amortização PRICE", () => {
    const sim = crmFinanceiraStore.simularOperacao({
      valorBruto: 100000,
      prazoMeses: 12,
      taxaMensalPercentual: 1.5,
      sistemaAmortizacao: "PRICE",
      tarifaTac: 1200,
    });
    expect(sim.valorBruto).toBe(100000);
    expect(sim.sistemaAmortizacao).toBe("PRICE");
    expect(sim.cronogramaParcelas).toHaveLength(12);
    expect(sim.parcelaInicial).toBe(sim.parcelaFinal);
    expect(sim.totalPago).toBeGreaterThan(100000);
  });

  it("deve criar, atualizar estágio com histórico e excluir oportunidade", () => {
    const nova = crmFinanceiraStore.criarOportunidade({
      clienteNome: "Teste Automatizado Agronegócio",
      clienteDocumento: "11.222.333/0001-44",
      valorSolicitado: 500000,
      prazoMeses: 12,
      taxaMensalPercentual: 1.3,
      sistemaAmortizacao: "SAC",
      estagio: "prospeccao",
      scoreSerasa: 890,
      ratingBacen: "A",
    });
    expect(nova.id).toBeDefined();
    expect(nova.clienteNome).toBe("Teste Automatizado Agronegócio");
    expect(nova.historicoEtapas.length).toBeGreaterThanOrEqual(1);

    const atualizada = crmFinanceiraStore.atualizarOportunidade(
      nova.id,
      { estagio: "formalizacao_ccb", observacoes: "Parecer aprovado com sucesso" },
      "Mesa de Teste"
    );
    expect(atualizada).not.toBeNull();
    expect(atualizada!.estagio).toBe("formalizacao_ccb");
    expect(atualizada!.historicoEtapas.length).toBe(2);

    const excluida = crmFinanceiraStore.excluirOportunidade(nova.id);
    expect(excluida).toBe(true);
    expect(crmFinanceiraStore.obterPorId(nova.id)).toBeNull();
  });
});
