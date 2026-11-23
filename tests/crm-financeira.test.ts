import { describe, it, expect } from "vitest";
import { crmFinanceiraStore } from "../server/crmFinanceiraStore";

describe("BancoFe — Motor de Operações Financeiras & CRM 360°", () => {
  it("deve carregar a base de oportunidades com integridade", () => {
    const ops = crmFinanceiraStore.listarOportunidades();
    expect(ops.length).toBeGreaterThanOrEqual(7);
    const primeira = ops[0];
    expect(primeira).toHaveProperty("codigoProtocolo");
    expect(primeira).toHaveProperty("clienteNome");
    expect(primeira).toHaveProperty("valorSolicitado");
    expect(primeira).toHaveProperty("ratingBacen");
  });

  it("deve calcular métricas consolidadas de pipeline e ticket médio", () => {
    const metricas = crmFinanceiraStore.obterMetricasGestao();
    expect(metricas.volumeTotalPipeline).toBeGreaterThan(20000000); // Mais de 20M em pipeline
    expect(metricas.ticketMedio).toBeGreaterThan(1000000);
    expect(metricas.taxaMediaMensal).toBeGreaterThan(1.0);
    expect(metricas.distribuicaoPorEstagio).toBeDefined();
    expect(metricas.distribuicaoPorEmpresa).toBeDefined();
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
    expect(sim.cronogramaParcelas[0].amortizacao).toBe(10000); // 100k / 10 = 10k constante
    expect(sim.parcelaInicial).toBeGreaterThan(sim.parcelaFinal); // No SAC parcela é decrescente
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
    // Na tabela PRICE as parcelas são fixas (iguais)
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

    // Atualizar estágio
    const atualizada = crmFinanceiraStore.atualizarOportunidade(
      nova.id,
      { estagio: "formalizacao_ccb", observacoes: "Parecer aprovado com sucesso" },
      "Mesa de Teste"
    );
    expect(atualizada).not.toBeNull();
    expect(atualizada!.estagio).toBe("formalizacao_ccb");
    expect(atualizada!.historicoEtapas.length).toBe(2);

    // Excluir
    const excluida = crmFinanceiraStore.excluirOportunidade(nova.id);
    expect(excluida).toBe(true);
    expect(crmFinanceiraStore.obterPorId(nova.id)).toBeNull();
  });
});
