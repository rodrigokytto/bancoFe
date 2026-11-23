import { describe, it, expect } from "vitest";
import { dataStore } from "./dataStore";

describe("Zuma Ultra System & Sincronização Nossa Gente", () => {
  it("deve carregar visão geral do Ultra com KPIs, postos e telemetria de frio (-40°C)", () => {
    const overview = dataStore.getUltraOverview();
    expect(overview).toBeDefined();
    expect(overview.kpis).toBeDefined();
    expect(overview.kpis.faturamentoDia).toBeGreaterThan(10000);
    expect(overview.kpis.pedidosHoje).toBeGreaterThan(100);
    expect(overview.kpis.taxaAssertividadePct).toBeGreaterThan(98);
    expect(overview.stations.length).toBeGreaterThanOrEqual(5);
    expect(overview.equipments.length).toBeGreaterThanOrEqual(5);

    // Valida o ultracongelador de salmão (-40°C de choque)
    const ultracongelador = overview.equipments.find(e => e.id === "eq_ultracongelador");
    expect(ultracongelador).toBeDefined();
    expect(ultracongelador?.temperaturaMaxima).toBe(-36.0);
    expect(ultracongelador?.temperaturaAtual).toBeLessThanOrEqual(-36.0);
  });

  it("deve priorizar sincronização por evento interno entre Ultra e Nossa Gente", () => {
    const initialEventsCount = dataStore.getUltraSyncEvents().length;

    // Dispara evento interno de entrada de turno
    const event = dataStore.emitUltraSyncEvent({
      type: "ESCALA_ENTRADA_TURNO",
      originSystem: "NOSSA_GENTE",
      targetSystem: "ULTRA_SISTEMA",
      summary: "Kenji Sato iniciou turno no Sushibar Nobre",
      collaboratorName: "Kenji Sato",
      payload: {
        station: "st_sushibar",
        shift: "Jantar (17:30 - 23:30)",
        badge: "COL-01",
      },
    });

    expect(event).toBeDefined();
    expect(event.id).toMatch(/^evt_/);
    expect(event.originSystem).toBe("NOSSA_GENTE");
    expect(event.targetSystem).toBe("ULTRA_SISTEMA");
    expect(event.status).toBe("PROCESSADO");
    expect(event.internalChecksum).toBeDefined();
    expect(event.internalChecksum).toContain("sha256");

    const newEventsCount = dataStore.getUltraSyncEvents().length;
    expect(newEventsCount).toBe(initialEventsCount + 1);

    // Posto correspondente
    const station = dataStore.getUltraStations().find(s => s.id === "st_sushibar");
    expect(station).toBeDefined();
    expect(station?.leadName).toBe("Kenji Sato");
  });

  it("deve permitir armazenamento seguro de fotos e dados de auditoria com hash SHA-256", () => {
    const initialInspectionsCount = dataStore.getUltraInspections().length;

    const inspection = dataStore.createUltraInspection({
      category: "RECEBIMENTO_PEIXE",
      itemEvaluated: "Lote Salmão Chileno Premium Lote #SALM-2026-11",
      stationId: "st_sushibar",
      inspectorName: "Mariana Alencar",
      status: "CONFORME",
      valueMeasured: "1.2°C",
      targetStandard: "0.0°C a +2.0°C",
      notes: "Peixe com olhos convexos brilhantes, guelras vermelhas e odor fresco. Aprovado.",
      photoUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80",
      photoDescription: "Registro seguro de recebimento de filé de salmão fresco",
    });

    expect(inspection).toBeDefined();
    expect(inspection.id).toMatch(/^insp_/);
    expect(inspection.status).toBe("CONFORME");
    expect(inspection.secureStorageHash).toBeDefined();
    expect(inspection.secureStorageHash).toContain("sec_anvisa");
    expect(inspection.anvisaStandardCode).toBe("RDC 216 / CVS 5");

    const newInspectionsCount = dataStore.getUltraInspections().length;
    expect(newInspectionsCount).toBe(initialInspectionsCount + 1);

    // Registro da auditoria deve ter emitido automaticamente evento de sincronização interna
    const latestEvent = dataStore.getUltraSyncEvents()[0];
    expect(latestEvent.type).toBe("CHECKLIST_CONFORME_ANVISA");
    expect(latestEvent.targetSystem).toBe("NOSSA_GENTE");
  });

  it("deve permitir atualizar status e alocação de postos de trabalho", () => {
    const updated = dataStore.updateUltraStation("st_sushibar", {
      status: "ALERTA",
      cargaTrabalhoPct: 88,
    });

    expect(updated.status).toBe("ALERTA");
    expect(updated.cargaTrabalhoPct).toBe(88);

    // Restaura o posto para NORMAL
    const restored = dataStore.updateUltraStation("st_sushibar", {
      status: "NORMAL",
      cargaTrabalhoPct: 78,
    });
    expect(restored.status).toBe("NORMAL");
  });

  it("deve gerenciar Passaporte do Salmão 360° com rastreabilidade completa e laudo criptográfico SHA-256", () => {
    const list = dataStore.getSalmonPassports();
    expect(list.length).toBeGreaterThanOrEqual(2);

    const ativo = list.find(p => p.status === "ATIVO_EM_CONSUMO");
    expect(ativo).toBeDefined();
    expect(ativo?.codigoLote).toBe("CL-REL-8842-ZUMA");
    expect(ativo?.paisOrigem).toBe("Chile");
    expect(ativo?.certificacoes).toContain("ASC (Aquaculture Stewardship Council)");
    expect(ativo?.cicloUltracongelamentoChoque.temperaturaMinimaAlcancada).toBeLessThanOrEqual(-40.0);
    expect(ativo?.inspecaoOrganoleptica.classificacaoGeral).toBe("PADRÃO OURO SASHIMI GRADE A+");
    expect(ativo?.hashSha256Laudo).toBeDefined();
    expect(ativo?.hashSha256Laudo.length).toBe(64);

    // Busca por lote
    const byCode = dataStore.getSalmonPassport("CL-REL-8842-ZUMA");
    expect(byCode).toBeDefined();
    expect(byCode?.id).toBe(ativo?.id);
  });

  it("deve gerenciar e disparar Gatilhos Inteligentes (Smart Triggers) com emissão de eventos em tempo real", () => {
    const triggers = dataStore.getSmartTriggers();
    expect(triggers.length).toBeGreaterThanOrEqual(6);

    const frioRule = triggers.find(t => t.id === "trig_frio_critico");
    expect(frioRule).toBeDefined();
    expect(frioRule?.categoria).toBe("FRIO");
    expect(frioRule?.severidade).toBe("CRITICA");

    // Toggle trigger
    const toggled = dataStore.toggleSmartTrigger("trig_frio_critico", false);
    expect(toggled.ativo).toBe(false);
    const restored = dataStore.toggleSmartTrigger("trig_frio_critico", true);
    expect(restored.ativo).toBe(true);

    // Simular disparo da regra
    const beforeEventsCount = dataStore.getUltraSyncEvents().length;
    const res = dataStore.simulateSmartTrigger("trig_dr_clima_chuva");
    expect(res).toBeDefined();
    expect(res.rule.totalDisparosHoje).toBeGreaterThanOrEqual(1);
    expect(res.event.type).toBe("TRIGGER_METEOROLOGIA_DR_CLIMA");
    expect(res.event.targetSystem).toBe("NOSSA_GENTE");

    const afterEventsCount = dataStore.getUltraSyncEvents().length;
    expect(afterEventsCount).toBe(beforeEventsCount + 1);
  });
});
