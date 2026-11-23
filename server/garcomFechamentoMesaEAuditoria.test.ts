import { describe, it, expect, beforeEach } from "vitest";
import { dataStore } from "./dataStore";

describe("Fluxo Ponta a Ponta: Fechamento de Mesa pelo App do Garçom com Baixa Automática e Auditoria", () => {
  beforeEach(() => {
    const tables = dataStore.getTables();
    expect(tables.length).toBeGreaterThanOrEqual(1);
  });

  it("deve abrir comanda de mesa, adicionar pratos e calcular totais com taxa de serviço 10%", () => {
    const tableNumber = 4;
    
    // Abre mesa: tableNumber, customerCount, waiter, customerName
    const table = dataStore.openTable(
      tableNumber,
      3,
      "Matheus Silva (Garçom)",
      "Dr. Roberto Tangará"
    );

    expect(table.tableNumber).toBe(4);
    expect(table.status).toBe("ocupada");
    expect(table.waiter).toContain("Garçom");

    // Adiciona pratos
    dataStore.addTableItem(
      tableNumber,
      {
        itemName: "Hot Roll Especial Trufado",
        quantity: 2,
        unitPrice: 38.0,
        station: "Fritadeira",
        observacoes: "Sem cebolinha",
      },
      "Matheus Silva (Garçom)"
    );

    dataStore.addTableItem(
      tableNumber,
      {
        itemName: "Sashimi Salmão Maçaricado (10 Pçs)",
        quantity: 1,
        unitPrice: 52.0,
        station: "Sushibar",
      },
      "Matheus Silva (Garçom)"
    );

    const tableAtualizada = dataStore.getTable(tableNumber);
    expect(tableAtualizada).toBeDefined();
    expect(tableAtualizada?.orderItems.length).toBe(2);
    expect(tableAtualizada?.subtotal).toBe(128.0);
    // Subtotal 128 + 10% serviço (12.80) = 140.80
    expect(tableAtualizada?.total).toBe(140.8);
  });

  it("ao garçom pedir a conta e confirmar pagamento, deve liquidar, gerar NFC-e e baixar a mesa para LIVRE", () => {
    const tableNumber = 4;
    
    const result = dataStore.closeTable(tableNumber, {
      paymentMethod: "Sicredi Pix Direto MT",
      operator: "Matheus Silva (Garçom)",
      role: "garcom",
      canal: "App do Garçom Móvel",
      splitCount: 2,
    });

    expect(result.success).toBe(true);
    expect(result.tableNumber).toBe(4);
    expect(result.finalTotal).toBe(140.8);
    expect(result.nfcNumber).toBeGreaterThan(6000);
    expect(result.payments[0].method).toBe("pix");
    expect(result.payments[0].amount).toBe(140.8);

    // Mesa deve estar livre e desocupada no Salão e no PDV
    const tableAposBaixa = dataStore.getTable(tableNumber);
    expect(tableAposBaixa).toBeDefined();
    expect(tableAposBaixa?.status).toBe("livre");
    expect(tableAposBaixa?.orderItems.length).toBe(0);
    expect(tableAposBaixa?.subtotal).toBe(0);
    expect(tableAposBaixa?.total).toBe(0);
  });

  it("deve conter registro fiel na Trilha de Auditoria detalhando quem fechou, como foi pago e NFC-e", () => {
    const tableNumber = 4;
    const trilha = dataStore.getAuditTrail({ tableNumber });

    expect(trilha.length).toBeGreaterThan(0);

    // Encontra o log de fechamento
    const logFechamento = trilha.find(
      (e) => e.action === "fechamento_comanda" || e.action === ("MESA_ENCERRADA" as any)
    );

    expect(logFechamento).toBeDefined();
    expect(logFechamento?.actor).toContain("Matheus Silva (Garçom)");
    expect(logFechamento?.role).toBe("garcom");
    expect(logFechamento?.details?.finalTotal).toBe(140.8);
    expect(logFechamento?.details?.paymentMethod).toBe("Sicredi Pix Direto MT");
    expect(logFechamento?.details?.nfcNumber).toBeDefined();
    expect(logFechamento?.details?.canal).toContain("App do Garçom");
  });

  it("deve atualizar os totais consolidados no Caixa Operador com o recebimento via Pix Sicredi", () => {
    const cashRegister = dataStore.getCashRegister();
    expect(cashRegister).toBeDefined();
    expect(cashRegister.totalsByMethod.pix).toBeGreaterThan(0);
  });
});
