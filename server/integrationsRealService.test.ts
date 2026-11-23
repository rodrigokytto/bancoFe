import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { dataStore } from "./dataStore";

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

describe("Central de Integrações & APIs de TI (Sem Fake)", () => {
  const caller = appRouter.createCaller(createMockContext());

  it("deve carregar as configurações reais de integração do dataStore", async () => {
    const config = await caller.zuma.getIntegrationsConfig();
    expect(config).toBeDefined();
    expect(config.ifood).toBeDefined();
    expect(config.waha).toBeDefined();
    expect(config.sicrediPix).toBeDefined();
    expect(config.sefazNfce).toBeDefined();
    expect(config.openDelivery).toBeDefined();
    expect(config.keeto).toBeDefined();
  });

  it("deve salvar e atualizar credenciais de canais com persistência segura", async () => {
    const creds = await caller.zuma.getIntegrationsCredentials();
    expect(creds).toBeDefined();
    expect(creds.ifood).toBeDefined();
    expect(creds.ifood.clientId).toBeDefined();

    const saveResult = await caller.zuma.saveIntegrationCredentials({
      channel: "ifood",
      credentials: {
        clientId: "kytto_zuma_ifood_oauth_prod",
        merchantId: "83921-zuma-tga"
      }
    });

    expect(saveResult.success).toBe(true);
    expect(saveResult.channel).toBe("ifood");
  });

  it("deve testar a conexão com um canal e retornar latência e protocolo reais", async () => {
    const testResult = await caller.zuma.testIntegrationConnection({ channel: "iFood" });
    expect(testResult.status).toBe("HEALTHY");
    expect(testResult.latencyMs).toBeGreaterThan(0);
    expect(testResult.protocol).toBeDefined();
    expect(testResult.message).toContain("iFood");
  });

  it("deve sincronizar uma plataforma individualmente e registrar log de auditoria", async () => {
    const syncRes = await caller.zuma.syncIntegrationPlatform({ channel: "WAHA" });
    expect(syncRes.success).toBe(true);
    expect(syncRes.channel).toBe("WAHA");
    expect(syncRes.latencyMs).toBeGreaterThan(0);
  });

  it("deve sincronizar todas as 7 plataformas simultaneamente", async () => {
    const syncAllRes = await caller.zuma.syncAllIntegrations();
    expect(syncAllRes.success).toBe(true);
    expect(syncAllRes.syncedCount).toBeGreaterThanOrEqual(7);
    expect(syncAllRes.results.length).toBe(syncAllRes.syncedCount);
  });

  it("deve carregar dados reais da ponte Saipos Sync e permitir exportação do cardápio em JSON", async () => {
    const saiposData = await caller.zuma.getSaiposSyncData();
    expect(saiposData.skus).toBeGreaterThan(50);
    expect(saiposData.clientes).toBeGreaterThan(1000);
    expect(saiposData.pedidosMigrados).toBeGreaterThan(1000);
    expect(saiposData.historicoVendasBrl).toBeGreaterThan(10000);

    const exportedMenu = await caller.zuma.exportSaiposMenuJson();
    expect(Array.isArray(exportedMenu)).toBe(true);
    expect(exportedMenu.length).toBe(saiposData.skus);
    expect(exportedMenu[0].codigo).toBeDefined();
    expect(exportedMenu[0].nome).toBeDefined();
    expect(exportedMenu[0].precoVenda).toBeGreaterThan(0);
  });

  it("deve executar sincronização real com Saipos e registrar histórico", async () => {
    const execResult = await caller.zuma.executeSaiposSync({
      type: "FULL_SYNC",
      operator: "Teste Automatizado"
    });

    expect(execResult.success).toBe(true);
    expect(execResult.data.skus).toBeGreaterThan(50);
    expect(execResult.data.syncHistory.length).toBeGreaterThan(0);
    expect(execResult.data.syncHistory[0].operator).toBe("Teste Automatizado");
  });

  it("deve importar itens de backup legado Saipos e atualizar histórico", async () => {
    const testItems = [
      { codigo: "TEST-01", nome: "Combo Teste Saipos", preco: 79.9, categoria: "Combinados" }
    ];

    const importRes = await caller.zuma.importSaiposData({
      items: testItems,
      operator: "Auditor"
    });

    expect(importRes.success).toBe(true);
    expect(importRes.count).toBe(1);
  });

  it("deve simular evento interno de Nossa Gente e integrar com o Ultra Vision AI", async () => {
    const eventRes = await caller.zuma.simulateInternalEvent({
      eventType: "COLABORADOR_ENTRADA_DETECTADA",
      colaboradorNome: "Takeshi Sato",
      camera: "CAM-01 (Entrada Cozinha)",
      detalhes: "Reconhecimento facial com 99.4% de confiança."
    });

    expect(eventRes.success).toBe(true);
    expect(eventRes.item.event).toBe("COLABORADOR_ENTRADA_DETECTADA");
    expect(eventRes.item.colaboradorNome).toBe("Takeshi Sato");
    expect(eventRes.event).toBeDefined();
  });
});
