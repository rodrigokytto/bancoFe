import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("KyttoIA - Consultas Estratégicas de Mercado e Planos de Crescimento", () => {
  it("deve executar consulta de plano para aumentar faturamento com parâmetros reais de Tangará da Serra", async () => {
    const caller = appRouter.createCaller({
      user: { id: "test-user", name: "Rodrigo", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.zuma.consultarKyttoIA({
      tipoConsulta: "plano_aumento_faturamento",
      faturamentoAtual: 345000,
      metaFaturamento: 450000,
      ticketMedioAtual: 138,
      percentualDelivery: 45,
      pergunta: "Como expandir o faturamento em R$ 105.000 explorando o público corporativo do agro e saquês nobres?"
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.modelo).toContain("KyttoIA");
    expect(result.tipoConsulta).toBe("plano_aumento_faturamento");
    expect(result.incrementoProjetado).toBe(105000);
    expect(typeof result.analise).toBe("string");
    expect(result.analise.length).toBeGreaterThan(10);
  }, 45000);

  it("deve executar consulta de atração de mais clientes com geolocalização em Tangará da Serra", async () => {
    const caller = appRouter.createCaller({
      user: { id: "test-user", name: "Rodrigo", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.zuma.consultarKyttoIA({
      tipoConsulta: "plano_mais_clientes",
      pergunta: "Estratégia de aquisição para atrair famílias de alto padrão do Jardim Europa e Centro."
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.tipoConsulta).toBe("plano_mais_clientes");
    expect(typeof result.analise).toBe("string");
  }, 45000);

  it("deve executar análise de neutralização do concorrente Bonsai Sushi", async () => {
    const caller = appRouter.createCaller({
      user: { id: "test-user", name: "Rodrigo", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.zuma.consultarKyttoIA({
      tipoConsulta: "analise_concorrente",
      concorrenteId: "bonsai",
      concorrenteNome: "Bonsai Sushi Bar",
      pergunta: "Como neutralizar os atrasos de 68 min do Bonsai nas sextas-feiras?"
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.concorrenteAlvo).toBe("Bonsai Sushi Bar");
    expect(typeof result.analise).toBe("string");
  }, 45000);

  it("deve obter analytics do mercado de Tangará da Serra com dados demográficos e eixos táticos", async () => {
    const caller = appRouter.createCaller({
      user: { id: "test-user", name: "Rodrigo", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const analytics = await caller.zuma.getMercadoTangaraAnalytics();

    expect(analytics).toBeDefined();
    expect(analytics.demografia).toBeDefined();
    expect(analytics.demografia.municipio).toBe("Tangará da Serra - MT");
    expect(analytics.demografia.populacaoEstimada).toBe(106840);
    expect(analytics.demografia.bairrosMapeados.length).toBeGreaterThanOrEqual(3);
    expect(analytics.eixosAtaque.length).toBe(5);
  });

  it("deve disparar ação tática de ataque ao mercado com registro e canais integrados", async () => {
    const caller = appRouter.createCaller({
      user: { id: "test-user", name: "Rodrigo", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const res = await caller.zuma.dispararAtaqueMercado({
      eixoId: "anti_atraso_pico",
      alvoNome: "Bonsai Sushi Bar",
      alvoId: "bonsai",
      titulo: "Operação Cavalo de Troia no Pico de Fim de Semana",
      bairros: ["Jardim Europa", "Centro"],
      canais: ["meta_ads", "whatsapp_zumi", "google_maps"],
      estrategia: "Campanha geolocalizada no Jardim Europa e Centro: 'Seu sushi na mesa em até 30 min ou 50% de cashback no Clube Zumi'.",
      cupom: "ZUMAEXPRESS30",
      orcamentoDiario: 150,
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.actionId).toBeDefined();
    expect(res.canaisAtivados).toContain("meta_ads");
    expect(res.canaisAtivados).toContain("whatsapp_zumi");
    expect(res.canaisAtivados).toContain("google_maps");
    expect(res.projecao.receitaAdicionalMes).toBeGreaterThan(0);
  });
});
