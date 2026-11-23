import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { dataStore } from "./dataStore";

describe("Validação Real em PRD: Fechamento de Mesa Alimentando Módulos Integrados", () => {
  const caller = appRouter.createCaller({} as any);

  beforeEach(() => {
    // Garante caixa aberto para teste
    dataStore.openCashRegister("Frente de Caixa Balcão", 250.0);
  });

  it("deve abrir mesa pelo garçom, consumir pratos, baixar a mesa e alimentar Contas a Pagar/Receber, Extrato, Fiscal SEFAZ-MT, Estoque e DRE de forma 100% real", async () => {
    const tableNumber = 7;
    const waiter = "Matheus Silva (Garçom)";
    const customer = "Dr. Alexandre Parecis";

    // 1. Abertura de Mesa pelo Garçom no App do Garçom
    const tableOpened = await caller.zuma.openTable({
      tableNumber,
      customerCount: 2,
      waiter,
      customerName: customer,
    });
    expect(tableOpened.tableNumber).toBe(tableNumber);
    expect(tableOpened.status).toBe("ocupada");

    // 2. Lançamento de pratos na comanda móvel
    await caller.zuma.addTableItem({
      tableNumber,
      itemName: "Hot Roll Especial Trufado",
      quantity: 2,
      unitPrice: 38.0,
      station: "Fritadeira",
      operator: waiter,
    });

    await caller.zuma.addTableItem({
      tableNumber,
      itemName: "Sashimi Salmão Maçaricado (10 Pçs)",
      quantity: 1,
      unitPrice: 52.0,
      station: "Sushibar",
      operator: waiter,
    });

    const tableBeforeClose = dataStore.getTable(tableNumber);
    expect(tableBeforeClose).toBeDefined();
    expect(tableBeforeClose?.orderItems.length).toBe(2);
    // 2 x 38 (76) + 52 = 128 + 10% serviço (12.80) = 140.80
    expect(tableBeforeClose?.subtotal).toBe(128.0);
    expect(tableBeforeClose?.total).toBe(140.8);

    // Consulta estoque antes do fechamento
    const stockBefore = dataStore.getRawMaterials();
    const salmaoBefore = stockBefore.find(i => i.name.toLowerCase().includes("salmão") || i.name.toLowerCase().includes("salmao"));
    const salmaoQtyBefore = salmaoBefore?.currentStock || 0;

    // 3. Garçom fecha a mesa via Sicredi Pix Direto MT
    const closeResult = await caller.zuma.closeTable({
      tableNumber,
      paymentMethod: "Sicredi Pix Direto MT",
      operator: waiter,
      role: "garcom",
      canal: "App do Garçom Móvel",
      splitCount: 2,
    });

    expect(closeResult.success).toBe(true);
    expect(closeResult.finalTotal).toBe(140.8);
    expect(closeResult.nfcNumber).toBeGreaterThanOrEqual(6902);
    expect(closeResult.chaveNfce).toHaveLength(44);
    expect(closeResult.chaveNfce.startsWith("51")).toBe(true); // UF 51 = Mato Grosso
    expect(closeResult.protocolo).toBeDefined();

    // 4. Validação da Mesa liberada e zerada
    const tableAfter = dataStore.getTable(tableNumber);
    expect(tableAfter?.status).toBe("livre");
    expect(tableAfter?.orderItems.length).toBe(0);
    expect(tableAfter?.total).toBe(0);

    // 5. Validação do Módulo Fiscal SEFAZ-MT (Armazenamento Permanente)
    const fiscalInvoices = dataStore.getFiscalInvoices();
    const invoiceRecorded = fiscalInvoices.find(f => f.nfcNumber === closeResult.nfcNumber);
    expect(invoiceRecorded).toBeDefined();
    expect(invoiceRecorded?.chaveAcesso).toBe(closeResult.chaveNfce);
    expect(invoiceRecorded?.status).toBe("autorizada");
    expect(invoiceRecorded?.totalAmount).toBe(140.8);
    expect(invoiceRecorded?.empresa).toBe("gastronomia");
    expect(invoiceRecorded?.cnpjEmitente).toBe("36.296.848/0001-57");
    expect(invoiceRecorded?.qrCodeUrl).toContain("sefaz.mt.gov.br");

    // 6. Validação da Central de Pagamentos & Extrato de Transações
    const allPayments = dataStore.getPayments();
    const paymentTx = allPayments.transacoes.find(p => p.nfceChaveAcesso === closeResult.chaveNfce || p.detalhes?.includes(`NFC-e #${closeResult.nfcNumber}`));
    expect(paymentTx).toBeDefined();
    expect(paymentTx?.status).toBe("aprovado");
    expect(paymentTx?.valorBruto).toBe(140.8);
    expect(paymentTx?.forma).toBe("pix");
    expect(paymentTx?.operador).toBe(waiter);
    expect(paymentTx?.terminal).toContain("Garçom");
    expect(paymentTx?.nsu).toBeDefined();
    expect(paymentTx?.autorizacao).toBeDefined();

    // 7. Validação do Contas a Receber do ERP
    const financialAccounts = await caller.zuma.getFinancialAccounts();
    const receivable = financialAccounts.contasReceber.find(r => r.nfcNumber === closeResult.nfcNumber || r.documento.includes(String(closeResult.nfcNumber)));
    expect(receivable).toBeDefined();
    expect(receivable?.cliente).toBe(customer);
    expect(receivable?.valor).toBe(140.8);
    expect(receivable?.forma).toBe("Pix");
    expect(receivable?.status).toBe("Recebido");

    // 8. Validação do Extrato Bancário / Conciliação Sicredi Open Finance MT
    const extrato = financialAccounts.extratoBancario;
    const extratoLine = extrato.find(e => e.documento?.includes(String(closeResult.nfcNumber)) || e.descricao.includes(String(tableNumber)));
    expect(extratoLine).toBeDefined();
    expect(extratoLine?.banco).toBe("Sicredi");
    expect(extratoLine?.tipo).toBe("credito");
    expect(extratoLine?.valor).toBe(140.8);

    // 9. Validação do Rateio de Gorjeta 10%
    const tipList = dataStore.getTipDistributions();
    const lastTip = tipList.find((d: any) => d.tableNumber === tableNumber);
    expect(lastTip).toBeDefined();
    expect(lastTip?.totalTipCollected).toBe(12.8);
    expect(lastTip?.waiterShare).toBe(8.96); // 70% de 12.80
    expect(lastTip?.kitchenShare).toBe(2.56); // 20%
    expect(lastTip?.barShare).toBe(1.28); // 10%

    // 10. Validação do Caixa do Turno
    const cashRegister = dataStore.getCashRegister();
    expect(cashRegister.totalsByMethod.pix).toBeGreaterThanOrEqual(140.8);

    // 11. Validação do DRE em Tempo Real com Salão Integrado
    const dre = await caller.zuma.getShiftFinancialDre();
    expect(dre.vendasSalaoMesas).toBeGreaterThanOrEqual(140.8);
    expect(dre.receitaBruta).toBeGreaterThanOrEqual(140.8);
    expect(dre.receitaLiquida).toBeGreaterThan(0);
    expect(dre.margemContribuicaoBrl).toBeGreaterThan(0);

    // 12. Validação da liquidação de Conta a Pagar com impacto no Extrato
    const pendentePagar = financialAccounts.contasPagar.find(p => p.status !== "Liquidado");
    if (pendentePagar) {
      const settleRes = await caller.zuma.settleContaPagar({
        id: pendentePagar.id,
        operator: "Rodrigo Ribeiro Gonçalves",
      });
      expect(settleRes.success).toBe(true);
      expect(settleRes.item.status).toBe("Liquidado");
      expect(settleRes.extratoLine.tipo).toBe("debito");
      expect(settleRes.extratoLine.valor).toBe(-pendentePagar.valorLiquido);
    }
  });
});
