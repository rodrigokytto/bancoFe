import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Mapa de Calor Analítico Multidimensional & Sazonalidade (getHeatmapAnalytics)", () => {
  const caller = appRouter.createCaller({} as any);

  it("deve calcular o mapa de calor para o período Mês (30 dias) com matriz 7x11 e 27 mesas", async () => {
    const res = await caller.zuma.getHeatmapAnalytics({
      periodo: "mes",
      mes: "2026-11",
      canal: "all",
      setor: "all",
      metrica: "revenue",
    });

    expect(res.success).toBe(true);
    expect(res.periodoInfo.tipo).toBe("mes");
    expect(res.periodoInfo.totalDias).toBe(30);
    expect(res.periodoInfo.multiplier).toBe(4.33);

    // Matriz 7x11
    expect(res.matrix).toHaveLength(7); // 7 dias
    expect(res.matrix[0]).toHaveLength(11); // 11 faixas horárias

    // Resumo executivo consolidado
    expect(res.summary.totalRevenue).toBeGreaterThan(150000);
    expect(res.summary.totalOrders).toBeGreaterThan(1500);
    expect(res.summary.avgTicket).toBeGreaterThan(50);
    expect(res.summary.cmvRealPerc).toBe(31.2);
    expect(res.summary.totalSalmonKg).toBeGreaterThan(500);

    // Calendário contínuo de 30 dias
    expect(res.calendarDays).toHaveLength(30);

    // 27 mesas físicas da Zuma distribuídas por setor
    expect(res.mesasHeatmap).toHaveLength(27);
    const salaoNobre = res.mesasHeatmap.filter(m => m.ambiance === "SALAO_NOBRE");
    const deck = res.mesasHeatmap.filter(m => m.ambiance === "DECK_JARDIM");
    const tatames = res.mesasHeatmap.filter(m => m.ambiance === "TATAMES_VIP");
    const balcao = res.mesasHeatmap.filter(m => m.ambiance === "BALCAO_OMAKASE");

    expect(salaoNobre).toHaveLength(12);
    expect(deck).toHaveLength(6);
    expect(tatames).toHaveLength(4);
    expect(balcao).toHaveLength(5);

    // Oportunidades preditivas da Zumi IA
    expect(res.topOpportunities.length).toBeGreaterThanOrEqual(3);
  });

  it("deve recalcular valores para Trimestre (Q4 · 90 dias, multiplicador 13)", async () => {
    const res = await caller.zuma.getHeatmapAnalytics({
      periodo: "trimestre",
      trimestre: "Q4",
      canal: "all",
      setor: "all",
      metrica: "revenue",
    });

    expect(res.periodoInfo.tipo).toBe("trimestre");
    expect(res.periodoInfo.totalDias).toBe(90);
    expect(res.periodoInfo.multiplier).toBe(13.0);
    expect(res.calendarDays).toHaveLength(90);
    expect(res.summary.totalRevenue).toBeGreaterThan(500000);
  });

  it("deve recalcular valores para Semestre (SEM2 · 180 dias, multiplicador 26)", async () => {
    const res = await caller.zuma.getHeatmapAnalytics({
      periodo: "semestre",
      semestre: "SEM2",
      canal: "all",
      setor: "all",
      metrica: "orders",
    });

    expect(res.periodoInfo.tipo).toBe("semestre");
    expect(res.periodoInfo.totalDias).toBe(180);
    expect(res.periodoInfo.multiplier).toBe(26.0);
    expect(res.calendarDays).toHaveLength(180);
    expect(res.summary.totalOrders).toBeGreaterThan(10000);
  });

  it("deve recalcular valores para Anual (2026 · 365 dias, multiplicador 52)", async () => {
    const res = await caller.zuma.getHeatmapAnalytics({
      periodo: "anual",
      ano: "2026",
      canal: "all",
      setor: "all",
      metrica: "revenue",
    });

    expect(res.periodoInfo.tipo).toBe("anual");
    expect(res.periodoInfo.totalDias).toBe(365);
    expect(res.periodoInfo.multiplier).toBe(52.0);
    expect(res.calendarDays).toHaveLength(365);
    expect(res.summary.totalRevenue).toBeGreaterThan(2000000);
    expect(res.summary.economiaSaiposIfood).toBeGreaterThan(150000);
  });

  it("deve filtrar corretamente por canal de venda (ex: delivery próprio vs salão)", async () => {
    const resAll = await caller.zuma.getHeatmapAnalytics({ periodo: "mes", canal: "all" });
    const resDelivery = await caller.zuma.getHeatmapAnalytics({ periodo: "mes", canal: "delivery" });

    expect(resDelivery.summary.totalRevenue).toBeLessThan(resAll.summary.totalRevenue);
    expect(resDelivery.periodoInfo.canal).toBe("delivery");
  });

  it("deve filtrar corretamente por setor físico do salão (ex: apenas Balcão Omakase VIP)", async () => {
    const resBalcao = await caller.zuma.getHeatmapAnalytics({
      periodo: "mes",
      setor: "BALCAO_OMAKASE",
    });

    expect(resBalcao.mesasHeatmap).toHaveLength(5);
    expect(resBalcao.mesasHeatmap.every(m => m.ambiance === "BALCAO_OMAKASE")).toBe(true);
    expect(resBalcao.mesasHeatmap[0].taxaOcupacao).toBeGreaterThanOrEqual(90);
  });
});
