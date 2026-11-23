import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { dataStore } from "./dataStore";

describe("Turno Completo do Zuma (Garçom -> Cozinha -> Caixa -> Fechamento & Auditoria)", () => {
  const caller = appRouter.createCaller({} as any);

  beforeEach(() => {
    // Garante que o caixa esteja aberto para os testes
    dataStore.openCashRegister("Mariana (Frente de Caixa)", 200.0);
  });

  it("deve executar o ciclo de vida completo de um turno com 2 praças, alteração, conferência, estorno, pagamento misto e auditoria ponta a ponta", async () => {
    const tableNumber = 5;
    const waiter = "Matheus (Salão)";
    const cashier = "Mariana (Frente de Caixa)";
    const manager = "Carlos (Gerente Operacional)";

    // 1. ABERTURA DE COMANDA / MESA PELO GARÇOM
    const openedTable = await caller.zuma.openTable({
      tableNumber,
      customerCount: 3,
      waiter,
      customerName: "Família Yamamoto",
    });

    expect(openedTable.tableNumber).toBe(tableNumber);
    expect(openedTable.status).toBe("ocupada");
    expect(openedTable.customerCount).toBe(3);
    expect(openedTable.waiter).toBe(waiter);

    // 2. LANÇAMENTO DE ITENS COM ADICIONAIS, OBSERVAÇÕES E 2 PRAÇAS DIFERENTES
    // Praça 1: Sushibar
    const itemSushi = await caller.zuma.addTableItem({
      tableNumber,
      itemName: "Barca Especial 50 Pçs",
      quantity: 1,
      unitPrice: 148.0,
      station: "sushibar",
      adicionais: [{ nome: "Wasabi Extra Artesanal", preco: 5.0 }],
      observacoes: "Salmão com corte bem fino e fresco",
      operator: waiter,
    });

    // Praça 2: Cozinha Quente (Wok)
    const itemQuente = await caller.zuma.addTableItem({
      tableNumber,
      itemName: "Yakissoba de Mignon Grande",
      quantity: 1,
      unitPrice: 58.0,
      station: "cozinha_quente",
      observacoes: "Sem cebolinha e molho leve",
      operator: waiter,
    });

    // Item de Bar
    const itemBebida = await caller.zuma.addTableItem({
      tableNumber,
      itemName: "Soda Italiana Maçã Verde",
      quantity: 2,
      unitPrice: 18.0,
      station: "bar",
      operator: waiter,
    });

    expect(itemBebida.orderItems.length).toBe(3);
    // Subtotal esperado: (148 + 5) + 58 + (2 * 18) = 153 + 58 + 36 = 247.00
    expect(itemBebida.subtotal).toBe(247.0);

    // 3. ENCAMINHAMENTO DOS PEDIDOS AO KDS POR PRAÇA
    const sendResult = await caller.zuma.sendTableToKitchen({
      tableNumber,
      operator: waiter,
    });

    expect(sendResult.success).toBe(true);
    expect(sendResult.tickets.length).toBeGreaterThanOrEqual(2);

    const ticketsSushi = await caller.zuma.getKitchenTickets({ station: "sushibar" });
    const ticketSushiMesa = ticketsSushi.find(t => t.tableNumber === tableNumber);
    expect(ticketSushiMesa).toBeDefined();
    expect(ticketSushiMesa?.items.some(i => i.itemName.includes("Barca Especial"))).toBe(true);

    const ticketsQuente = await caller.zuma.getKitchenTickets({ station: "cozinha_quente" });
    const ticketQuenteMesa = ticketsQuente.find(t => t.tableNumber === tableNumber);
    expect(ticketQuenteMesa).toBeDefined();
    expect(ticketQuenteMesa?.items.some(i => i.itemName.includes("Yakissoba"))).toBe(true);

    // 4. ALTERAÇÃO / CANCELAMENTO APÓS ENVIO À COZINHA (COM MOTIVO AUDITADO)
    const tablesBeforeCancel = await caller.zuma.listTables();
    const currentTable = tablesBeforeCancel.find(t => t.tableNumber === tableNumber);
    const bebidaItem = currentTable?.orderItems.find(i => i.itemName.includes("Soda Italiana"));
    expect(bebidaItem).toBeDefined();

    const cancelResult = await caller.zuma.cancelTableItem({
      tableNumber,
      itemId: bebidaItem!.id!,
      reason: "Cliente preferiu pedir suco natural mais tarde",
      cancelledBy: waiter,
    });

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.item.status).toBe("cancelado");
    expect(cancelResult.item.cancelReason).toBe("Cliente preferiu pedir suco natural mais tarde");
    // Subtotal após cancelamento de R$ 36 da bebida: 247 - 36 = 211.00
    const tablesAfterCancel = await caller.zuma.listTables();
    const tableAfterCancel = tablesAfterCancel.find(t => t.tableNumber === tableNumber);
    expect(tableAfterCancel?.subtotal).toBe(211.0);

    // 5. CONFERÊNCIA DE EXPEDIÇÃO ANTES DA ENTREGA
    const expeditionResult = await caller.zuma.checkExpedition({
      tableNumber,
      checkedBy: "Expedidor Kenji",
    });

    expect(expeditionResult.success).toBe(true);
    expect(expeditionResult.checkedBy).toBe("Expedidor Kenji");

    // 6. ESTORNO / DESCONTO COM AUTORIZAÇÃO GERENCIAL
    const discountResult = await caller.zuma.applyTableDiscount({
      tableNumber,
      discountAmount: 15.0,
      reason: "Cortesia fidelidade Clube Zumi",
      authorizedBy: manager,
    });

    expect(discountResult.success).toBe(true);
    expect(discountResult.discountAmount).toBe(15.0);
    // Subtotal 211.00 + 10% serviço (21.10) - 15.00 desconto = 217.10
    expect(discountResult.newTotal).toBe(217.1);

    // 7. FECHAMENTO DE COMANDA NO CAIXA COM MEIOS MISTOS
    // Total a pagar: R$ 217,10 -> R$ 100 Pix + R$ 100 Cartão de Crédito + R$ 17,10 Dinheiro
    const closeResult = await caller.zuma.closeTable({
      tableNumber,
      payments: [
        { method: "pix", amount: 100.0, reference: "Sicredi Pix TX991" },
        { method: "credito", amount: 100.0, reference: "Stone Visa Crédito" },
        { method: "dinheiro", amount: 17.1, reference: "Pagamento em Espécie" },
      ],
      discountAmount: 15.0,
      discountReason: "Cortesia fidelidade Clube Zumi",
      discountAuthorizedBy: manager,
      operator: cashier,
      splitCount: 3,
    });

    expect(closeResult.success).toBe(true);
    expect(closeResult.finalTotal).toBe(217.1);
    expect(closeResult.payments.length).toBe(3);
    expect(closeResult.nfcNumber).toBeGreaterThan(0);

    // A mesa deve estar livre agora
    const tablesAfterClose = await caller.zuma.listTables();
    const closedTableState = tablesAfterClose.find(t => t.tableNumber === tableNumber);
    expect(closedTableState?.status).toBe("livre");
    expect(closedTableState?.orderItems.length).toBe(0);

    // 8. SANGRIA DE CAIXA AUDITADA
    const sangriaResult = await caller.zuma.addCashMovement({
      type: "sangria",
      amount: 50.0,
      reason: "Sangria para despesa de transporte da equipe",
      operator: cashier,
    });

    expect(sangriaResult.type).toBe("sangria");
    expect(sangriaResult.amount).toBe(50.0);

    // 9. FECHAMENTO CEGO DE TURNO POR OPERADOR
    // O sistema espera: Caixa inicial (200) + Venda em dinheiro (17.10) - Sangria (50) = 167.10
    const closeCashResult = await caller.zuma.closeCashRegister({
      operator: cashier,
      countedCash: 167.1,
      notes: "Conferência cega bateu perfeitamente com todas as notas fiscais",
    });

    expect(closeCashResult.status).toBe("fechado");
    expect(closeCashResult.operator).toBe(cashier);
    expect(closeCashResult.blindCount?.countedCash).toBe(167.1);
    expect(closeCashResult.blindCount?.difference).toBe(0);

    // 10. AUDITORIA PONTA A PONTA
    const auditTrail = await caller.zuma.getAuditTrail({ tableNumber });
    expect(auditTrail.length).toBeGreaterThanOrEqual(6);

    const actions = auditTrail.map(a => a.action);
    expect(actions).toContain("abertura_comanda");
    expect(actions).toContain("item_adicionado");
    expect(actions).toContain("pedido_enviado_kds");
    expect(actions).toContain("item_cancelado");
    expect(actions).toContain("conferencia_expedicao");
    expect(actions).toContain("desconto_aplicado");
    expect(actions).toContain("fechamento_comanda");

    // Verifica que cada registro auditado contém o responsável correto
    const cancelEvent = auditTrail.find(a => a.action === "item_cancelado");
    expect(cancelEvent?.actor).toBe(waiter);
    expect(cancelEvent?.reason).toBe("Cliente preferiu pedir suco natural mais tarde");

    const discountEvent = auditTrail.find(a => a.action === "desconto_aplicado");
    expect(discountEvent?.actor).toBe(manager);

    const closeComandaEvent = auditTrail.find(a => a.action === "fechamento_comanda");
    expect(closeComandaEvent?.actor).toBe(cashier);
  });
});
