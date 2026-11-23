import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { 
  calculatePurchaseForecast, 
  ZUMA_RAW_MATERIALS, 
  ZUMA_TECHNICAL_SHEETS, 
  ZUMA_SUPPLIERS 
} from "../shared/forecastingData";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-admin",
      email: "admin@zuma.com.br",
      name: "Administrador Zuma",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Motor de Previsão de Compras & BOM (Bill of Materials)", () => {
  it("deve carregar os insumos críticos e fichas técnicas corretamente", () => {
    expect(ZUMA_RAW_MATERIALS.length).toBeGreaterThan(5);
    expect(ZUMA_TECHNICAL_SHEETS.length).toBeGreaterThan(5);
    expect(ZUMA_SUPPLIERS.length).toBeGreaterThan(3);

    const salmao = ZUMA_RAW_MATERIALS.find(m => m.code === "SALM-01");
    expect(salmao).toBeDefined();
    expect(salmao?.name).toContain("Salmão");
    expect(salmao?.purchaseUnit).toContain("kg");
    expect(salmao?.yieldPercent).toBe(58);
  });

  it("deve calcular a explosão de demanda preditiva para 7 dias com cenário realista", () => {
    const forecast = calculatePurchaseForecast(ZUMA_RAW_MATERIALS, 7, 1.0, 680);
    expect(forecast).toBeDefined();
    expect(forecast.projectedOrders).toBe(680);
    expect(forecast.requirements.length).toBeGreaterThan(5);

    // Salmão Chileno deve ter consumo previsto alto e recomendação de fornecedor
    const salmaoForecast = forecast.requirements.find(i => i.material.code === "SALM-01");
    expect(salmaoForecast).toBeDefined();
    expect(salmaoForecast?.grossRequirementRecipeUnit).toBeGreaterThan(10);
    expect(salmaoForecast?.recommendedSupplier.name).toBeDefined();

    // Orçamento total estimado deve ser positivo
    expect(forecast.totalEstimatedBudget).toBeGreaterThan(0);
    expect(forecast.criticalCount).toBeGreaterThanOrEqual(0);
  });

  it("deve amplificar a demanda com multiplicador de cenário otimista (ex: 1.35x)", () => {
    const baseForecast = calculatePurchaseForecast(ZUMA_RAW_MATERIALS, 7, 1.0, 680);
    const rushForecast = calculatePurchaseForecast(ZUMA_RAW_MATERIALS, 7, 1.35, 680);

    const baseSalmao = baseForecast.requirements.find(i => i.material.code === "SALM-01")!;
    const rushSalmao = rushForecast.requirements.find(i => i.material.code === "SALM-01")!;

    expect(rushSalmao.grossRequirementRecipeUnit).toBeGreaterThan(baseSalmao.grossRequirementRecipeUnit);
    expect(rushForecast.totalEstimatedBudget).toBeGreaterThan(baseForecast.totalEstimatedBudget);
  });
});

describe("tRPC Endpoints: Previsão de Compras e Ordens de Compra", () => {
  it("zuma.getPurchaseForecast retorna a previsão completa", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.zuma.getPurchaseForecast({ horizonDays: 7, scenarioMultiplier: 1.0 });
    expect(result).toHaveProperty("projectedOrders");
    expect(result).toHaveProperty("requirements");
    expect(result).toHaveProperty("totalEstimatedBudget");
    expect(result).toHaveProperty("ordersBySupplier");
    expect(result.requirements.length).toBeGreaterThan(0);
  });

  it("zuma.listTechnicalSheets retorna as fichas técnicas cadastradas", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const sheets = await caller.zuma.listTechnicalSheets();
    expect(sheets.length).toBeGreaterThan(0);
    
    // Verifica se os itens têm composição de insumos (BOM)
    const combo = sheets.find(s => s.category.includes("Combinado") || s.category.includes("Chef"));
    expect(combo).toBeDefined();
    expect(combo?.ingredients.length).toBeGreaterThan(0);
    expect(combo?.ingredients[0]).toHaveProperty("rawMaterialCode");
    expect(combo?.ingredients[0]).toHaveProperty("quantityRecipeUnit");
  });

  it("fluxo completo de criação e recebimento de Ordem de Compra com atualização de estoque", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // 1. Obter estoque inicial de Salmão
    const initialMaterials = await caller.zuma.listRawMaterials();
    const initialSalm = initialMaterials.find(m => m.code === "SALM-01")!;
    const initialStock = initialSalm.currentStock;

    // 2. Criar nova Ordem de Compra de 25 kg de Salmão
    const createRes = await caller.zuma.createPurchaseOrder({
      supplierId: "sup_pantanal",
      supplierName: "Pescados Pantanal Cuiabá",
      supplierPhone: "(65) 99981-4400",
      paymentMethod: "Boleto 21 dias (Sicredi)",
      expectedDeliveryDate: "2026-11-23",
      items: [
        {
          rawMaterialCode: "SALM-01",
          rawMaterialName: "Salmão Chileno Fresco Premium",
          purchaseUnit: "kg",
          quantity: 25,
          unitPrice: 84.50,
          totalPrice: 2112.50,
          notes: "Filés limpos e resfriados a 2°C",
        }
      ],
      notes: "Entrega urgente Tangará da Serra via van frigorificada",
    });

    expect(createRes.success).toBe(true);
    expect(createRes.order.id).toBeDefined();
    expect(createRes.order.status).toBe("enviado");
    expect(createRes.order.totalAmount).toBe(2112.50);

    // 3. Receber a Ordem de Compra
    const receiveResult = await caller.zuma.receivePurchaseOrder({ orderId: createRes.order.id });
    expect(receiveResult.success).toBe(true);
    expect(receiveResult.order?.status).toBe("recebido");

    // 4. Verificar se o estoque físico foi incrementado em 25 kg
    const updatedMaterials = await caller.zuma.listRawMaterials();
    const updatedSalm = updatedMaterials.find(m => m.code === "SALM-01")!;
    expect(updatedSalm.currentStock).toBeCloseTo(initialStock + 25, 1);
  });
});

describe("tRPC Endpoints: Administração de TI, Conectores & Superioridade Saipos", () => {
  it("deve realizar ping de conectores oficiais com sucesso e baixa latência", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const pingIfood = await caller.zuma.testIntegrationPing({ channel: "ifood" });
    expect(pingIfood.status).toBe("HEALTHY");
    expect(pingIfood.latencyMs).toBeGreaterThan(0);

    const pingSicredi = await caller.zuma.testIntegrationPing({ channel: "sicredi" });
    expect(pingSicredi.status).toBe("HEALTHY");

    const pingWaha = await caller.zuma.testIntegrationPing({ channel: "waha" });
    expect(pingWaha.status).toBe("HEALTHY");

    const pingSefaz = await caller.zuma.testIntegrationPing({ channel: "sefaz" });
    expect(pingSefaz.status).toBe("HEALTHY");
  });

  it("deve simular pausa automática de produtos no iFood por ruptura de estoque (recurso exclusivo Zuma)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Ativar auto-pausa
    await caller.zuma.toggleAutoStockPauseIfood({ enabled: true });
    const config = await caller.zuma.getAutoStockPauseIfood();
    expect(config.enabled).toBe(true);

    // Simular esgotamento de Salmão e auto-pausa
    const outageResult = await caller.zuma.simulateStockOutagePause({ rawMaterialCode: "SALM-01" });
    expect(outageResult.success).toBe(true);
    expect(outageResult.triggeredAction).toBe("PAUSE_ITEM_ONLINE_IFOOD");
    expect(outageResult.pausedDishes.length).toBeGreaterThan(0);

    // Verificar se gerou webhook log de auditoria
    const logs = await caller.zuma.listWebhookLogs();
    const pauseLog = logs.find(l => l.source === "iFood Merchant API" && l.event.includes("AUTO_PAUSE_STOCK_OUTAGE"));
    expect(pauseLog).toBeDefined();
    expect(pauseLog?.statusCode).toBe(200);
  });
});
