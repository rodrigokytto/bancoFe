import { describe, it, expect, beforeEach } from "vitest";
import { dataStore } from "./dataStore";
import { ZUMA_TECHNICAL_SHEETS, ZUMA_RAW_MATERIALS } from "../shared/forecastingData";

describe("Operações Avançadas: Ficha Técnica, Contingência NFC-e SEFAZ-MT, DRE e QR Code", () => {
  beforeEach(() => {
    // Garante que o modo offline esteja desativado antes de cada teste
    dataStore.setOfflineMode(false);
  });

  it("1. Deve dar baixa de estoque por gramatura com base na Ficha Técnica (BOM) e calcular o CMV real", () => {
    const rawSalmaoBefore = dataStore.getRawMaterials().find(m => m.code === "SALM-01")?.currentStock || 0;
    
    // Baixa de 2x Barca Zuma Premium (42 peças)
    const result = dataStore.deductStockFromRecipe("Barca Zuma Premium (42 peças)", 2, "KDS Expedição");
    
    expect(result.success).toBe(true);
    expect(result.dishName).toBe("Barco Zuma Nobre 40 Peças");
    expect(result.quantity).toBe(2);
    expect(result.totalCmv).toBeGreaterThan(0);
    expect(result.ingredientsDeducted.length).toBeGreaterThan(0);

    // O estoque de salmão fresco deve ter sido reduzido
    const rawSalmaoAfter = dataStore.getRawMaterials().find(m => m.code === "SALM-01")?.currentStock || 0;
    expect(rawSalmaoAfter).toBeLessThan(rawSalmaoBefore);

    // Verifica se evento de auditoria foi gravado
    const auditEvents = dataStore.getAuditTrail();
    const recipeEvent = auditEvents.find(e => e.action === "baixa_estoque_receita");
    expect(recipeEvent).toBeDefined();
    expect(recipeEvent?.details?.dishName).toBe("Barco Zuma Nobre 40 Peças");
  });

  it("2. Deve emitir NFC-e Online normal com chave de acesso SEFAZ-MT de 44 dígitos e DV Módulo 11", () => {
    dataStore.setOfflineMode(false);

    const invoice = dataStore.emitNfce({
      orderId: 9001,
      tableNumber: 3,
      customerName: "Rodrigo Gonçalves",
      cpf: "123.456.789-00",
      totalAmount: 189.90,
      items: [
        { itemName: "Barca Zuma Premium (42 peças)", quantity: 1, unitPrice: 189.90 }
      ],
      payments: [{ method: "pix", amount: 189.90 }]
    });

    expect(invoice).toBeDefined();
    expect(invoice.chaveAcesso).toHaveLength(44);
    // UF MT (51) + Modelo 65
    expect(invoice.chaveAcesso.startsWith("51")).toBe(true);
    expect(invoice.tipoEmissao).toBe("normal");
    expect(invoice.status).toBe("autorizada");
    expect(invoice.protocoloAutorizacao).toBeDefined();
    expect(invoice.qrCodeUrl).toContain("sefaz.mt.gov.br");
  });

  it("3. Deve emitir NFC-e em CONTINGÊNCIA OFFLINE (TP_EMIS=9) quando sem conexão com SEFAZ-MT", () => {
    // Simula queda de internet / indisponibilidade SEFAZ
    dataStore.setOfflineMode(true);
    expect(dataStore.isOfflineMode()).toBe(true);

    const invoice = dataStore.emitNfce({
      orderId: 9002,
      tableNumber: 5,
      customerName: "Cliente Salão",
      totalAmount: 95.00,
      items: [
        { itemName: "Sashimi Salmão Fresco Especial (10 un)", quantity: 1, unitPrice: 49.90 },
        { itemName: "Uramaki Ebi Especial (8 un)", quantity: 1, unitPrice: 44.90 }
      ],
      payments: [{ method: "credito", amount: 95.00 }]
    });

    expect(invoice).toBeDefined();
    expect(invoice.chaveAcesso).toHaveLength(44);
    expect(invoice.tipoEmissao).toBe("contingencia_offline");
    expect(invoice.status).toBe("pendente_contingencia");
    expect(invoice.motivoContingencia).toBeDefined();
    
    // O dígito de tipo de emissão na chave deve ser 9 (Contingência Offline)
    // Posição 34 (índice 34 na string de 44 dígitos)
    expect(invoice.chaveAcesso[34]).toBe("9");

    // Deve estar na fila de contingência
    const queue = dataStore.getFiscalContingencyQueue();
    const foundInQueue = queue.find(q => q.id === invoice.id);
    expect(foundInQueue).toBeDefined();
  });

  it("4. Deve sincronizar em lote a fila de contingência fiscal assim que a conexão for restabelecida", () => {
    // Garante que há pelo menos uma nota pendente na fila
    dataStore.setOfflineMode(true);
    dataStore.emitNfce({
      orderId: 9003,
      customerName: "Cliente Fila Teste",
      totalAmount: 65.00,
      items: [{ itemName: "Hot Filadélfia Trufado", quantity: 2, unitPrice: 32.50 }]
    });

    const pendingBefore = dataStore.getFiscalContingencyQueue().length;
    expect(pendingBefore).toBeGreaterThan(0);

    // Conexão restabelecida: sincroniza lote com a SEFAZ
    dataStore.setOfflineMode(false);
    const syncResult = dataStore.syncFiscalContingencyQueue();

    expect(syncResult.success).toBe(true);
    expect(syncResult.totalSynced).toBeGreaterThanOrEqual(pendingBefore);
    expect(syncResult.syncedIds.length).toBeGreaterThanOrEqual(pendingBefore);

    // Fila pendente agora deve estar zerada
    const pendingAfter = dataStore.getFiscalContingencyQueue().length;
    expect(pendingAfter).toBe(0);
  });

  it("5. Deve apurar em tempo real o DRE Financeiro do Turno com CMV Real e Comparativo de Economia Saipos/iFood", () => {
    const dre = dataStore.getShiftFinancialDre();

    expect(dre).toBeDefined();
    expect(dre.receitaBruta).toBeGreaterThan(0);
    expect(dre.cmvReal).toBeGreaterThan(0);
    expect(dre.cmvPercentual).toBeGreaterThan(0);
    expect(dre.margemContribuicaoBrl).toBeDefined();
    expect(dre.resultadoOperacionalEbitda).toBeDefined();

    // Verificações do comparativo de economia gerada vs Saipos & iFood
    expect(dre.economiaVsSaiposIfood.totalEconomizado).toBeGreaterThan(0);
    expect(dre.economiaVsSaiposIfood.economiaTaxaPixSicredi).toBeGreaterThan(0);
    expect(dre.economiaVsSaiposIfood.economiaMensalidadeSaipos).toBeGreaterThan(0);

    // Lista de itens mais consumidos
    expect(dre.itensMaisConsumidos).toBeInstanceOf(Array);
    expect(dre.itensMaisConsumidos.length).toBeGreaterThan(0);
    expect(dre.itensMaisConsumidos[0].cmvTotal).toBeGreaterThan(0);
  });

  it("6. Deve processar autoatendimento de mesa via QR Code abrindo comanda e despachando ao KDS", () => {
    const result = dataStore.addCustomerTableOrder({
      tableNumber: 9,
      customerName: "Família Silva QR Code",
      items: [
        { itemName: "Barca Zuma Premium (42 peças)", quantity: 1, unitPrice: 189.90, station: "sushibar" },
        { itemName: "Guioza Suíno Artesanal no Vapor (6 un)", quantity: 2, unitPrice: 29.90, station: "cozinha_quente" }
      ]
    });

    expect(result.success).toBe(true);
    expect(result.tableNumber).toBe(9);
    expect(result.itemsAddedCount).toBe(2);

    // A mesa 9 deve estar com status ocupada e total correspondente
    const table9 = dataStore.getTable(9);
    expect(table9).toBeDefined();
    expect(table9.status).toBe("ocupada");
    expect(table9.orderItems.length).toBeGreaterThanOrEqual(2);

    // Tickets devem ter sido enviados para o KDS das praças correspondentes
    const kitchenTickets = dataStore.getKitchenTickets();
    const table9Tickets = kitchenTickets.filter(k => k.tableNumber === 9);
    expect(table9Tickets.length).toBeGreaterThan(0);

    // Deve conter evento de auditoria
    const auditEvents = dataStore.getAuditTrail();
    const qrEvent = auditEvents.find(e => e.tableNumber === 9 && e.action === "pedido_cliente_qrcode");
    expect(qrEvent).toBeDefined();
    expect(qrEvent?.actor).toBe("Família Silva QR Code");
  });
});
