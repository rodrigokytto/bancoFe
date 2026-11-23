import { describe, it, expect } from "vitest";
import { dataStore } from "./dataStore";

describe("PDV Enhanced Operations", () => {
  it("deve permitir editar detalhes da mesa (nome, clientes, garçom, status, observações)", () => {
    const tableNumber = 3;
    const updated = dataStore.updateTableDetails(
      tableNumber,
      {
        customerName: "Rodrigo Gonçalves & Convidados",
        customerCount: 4,
        waiter: "Matheus (Salão VIP)",
        status: "ocupada",
        notes: "Mesa reservada para comemoração especial - aniversariante",
        serviceFeePercent: 10,
      },
      "Mariana Costa (Caixa)"
    );

    expect(updated).toBeDefined();
    expect(updated.customerName).toBe("Rodrigo Gonçalves & Convidados");
    expect(updated.customerCount).toBe(4);
    expect(updated.waiter).toBe("Matheus (Salão VIP)");
    expect(updated.notes).toBe("Mesa reservada para comemoração especial - aniversariante");
  });

  it("deve permitir adicionar, modificar e corrigir itens na mesa com adicionais e observações", () => {
    const tableNumber = 3;
    const uniqueItemName = `Carpaccio Trufado Teste ${Date.now()}`;
    // 1. Adicionar item
    dataStore.addTableItem(
      tableNumber,
      {
        itemName: uniqueItemName,
        quantity: 2,
        unitPrice: 48.90,
        station: "sushibar",
        adicionais: [{ nome: "Azeite Trufado Extra", preco: 6.00 }],
        observacoes: "Sem gergelim",
      },
      "Matheus (Salão)"
    );

    const table = dataStore.getTable(tableNumber);
    expect(table).toBeDefined();
    const item = table!.orderItems.find(i => i.itemName === uniqueItemName);
    expect(item).toBeDefined();
    expect(item!.quantity).toBeGreaterThanOrEqual(2);

    // 2. Modificar item (corrigir quantidade, valor e observação)
    const modified = dataStore.updateTableItem(
      tableNumber,
      item!.id!,
      {
        quantity: 3,
        unitPrice: 45.00, // desconto comercial
        observacoes: "Sem gergelim e sem cebolinha",
      },
      "Mariana (Caixa)",
      "Ajuste de quantidade e desconto concedido pelo gerente"
    );

    const updatedItem = modified.orderItems.find(i => i.id === item!.id);
    expect(updatedItem).toBeDefined();
    expect(updatedItem!.quantity).toBe(3);
    expect(updatedItem!.unitPrice).toBe(45.00);
    expect(updatedItem!.observacoes).toBe("Sem gergelim e sem cebolinha");
  });

  it("deve salvar a mesa e manter a consistência de totais e auditoria", () => {
    const saveRes = dataStore.saveTable(3, "Rodrigo (Gerente)");
    expect(saveRes.success).toBe(true);
    expect(saveRes.tableNumber).toBe(3);
    expect(saveRes.table.total).toBeGreaterThan(0);
    expect(saveRes.savedAt).toBeDefined();
  });

  it("deve gerar payload Pix dinâmico com chave Sicredi MT e EMV Banco Central", () => {
    const pixRes = dataStore.generatePixPayload({
      tableNumber: 3,
      amount: 175.50,
      reference: "Mesa 03 Salão Zuma",
    });

    expect(pixRes.success).toBe(true);
    expect(pixRes.chavePix).toBe("36.296.848/0001-57");
    expect(pixRes.banco).toContain("Sicredi MT");
    expect(pixRes.valor).toBe(175.50);
    expect(pixRes.emvPayload).toContain("00020126580014br.gov.bcb.pix");
    expect(pixRes.txid).toBeDefined();
    expect(pixRes.endToEndId).toContain("E36296848");
  });

  it("deve processar e autorizar transação SmartPOS TEF com NSU e comprovante", () => {
    const posRes = dataStore.processSmartPosTransaction({
      tableNumber: 3,
      amount: 150.00,
      method: "credito",
      installments: 2,
      posTerminal: "SmartPOS Stone P2",
      cardBrand: "Mastercard",
      operator: "Mariana Costa",
    });

    expect(posRes.success).toBe(true);
    expect(posRes.status).toBe("aprovado");
    expect(posRes.nsu).toBeDefined();
    expect(posRes.authCode).toBeDefined();
    expect(posRes.receiptText).toContain("COMPROVANTE SMARTPOS TEF");
    expect(posRes.receiptText).toContain("Stone P2");
    expect(posRes.receiptText).toContain("TANGARA DA SERRA - MT");
  });

  it("deve emitir NFC-e com CPF do consumidor, chave de 44 dígitos e cálculo de tributos", () => {
    const nfce = dataStore.emitNfce({
      tableNumber: 3,
      customerName: "Rodrigo Gonçalves",
      cpf: "019.283.471-00",
      totalAmount: 235.29,
      items: [
        { itemName: "Barca Especial 56 Peças", quantity: 1, unitPrice: 189.90 },
        { itemName: "Cerveja Heineken Long Neck", quantity: 2, unitPrice: 12.00 },
      ],
      payments: [
        { method: "pix", amount: 100.00 },
        { method: "credito", amount: 135.29 },
      ],
    });

    expect(nfce).toBeDefined();
    expect(nfce.cpf).toBe("019.283.471-00");
    expect(nfce.chaveAcesso).toHaveLength(44);
    expect(nfce.chaveAcesso.startsWith("51")).toBe(true); // UF MT
    expect(nfce.status).toBe("autorizada");
    expect(nfce.protocoloAutorizacao).toBeDefined();
    expect(nfce.icmsBase).toBeGreaterThan(0);
    expect(nfce.icmsValor).toBeGreaterThan(0);
    expect(nfce.qrCodeUrl).toContain("sefaz.mt.gov.br");
  });

  it("deve processar lote de sincronizacao offline com persistencia e auditoria no cloud run", () => {
    const batchResult = dataStore.processOfflineSyncBatch({
      deviceId: "WIN-CAIXA-01",
      operator: "Mariana (PDV Caixa Offline)",
      operations: [
        {
          id: "OP-OFF-1",
          type: "abrir_mesa",
          tableNumber: 15,
          payload: { customerName: "Cliente Offline Deck", waiter: "João Garçom", customerCount: 3 }
        },
        {
          id: "OP-OFF-2",
          type: "adicionar_item",
          tableNumber: 15,
          payload: {
            item: {
              itemName: "Combo 18 Peças",
              quantity: 1,
              unitPrice: 69.90,
              station: "sushibar"
            }
          }
        },
        {
          id: "OP-OFF-3",
          type: "editar_mesa",
          tableNumber: 15,
          payload: {
            details: { notes: "Pedido anotado em contingencia offline sem internet" }
          }
        },
        {
          id: "OP-OFF-4",
          type: "salvar_mesa",
          tableNumber: 15
        }
      ]
    });

    expect(batchResult.success).toBe(true);
    expect(batchResult.processedCount).toBe(4);
    expect(batchResult.failedCount).toBe(0);
    expect(batchResult.deviceId).toBe("WIN-CAIXA-01");

    const mesa15 = dataStore.getTable(15);
    expect(mesa15).toBeDefined();
    expect(mesa15!.customerName).toBe("Cliente Offline Deck");
    expect(mesa15!.notes).toBe("Pedido anotado em contingencia offline sem internet");
    expect(mesa15!.orderItems.length).toBeGreaterThanOrEqual(1);
  });

  it("deve refletir bairros de Tangara da Serra e cidades de MT com valores de referencia e CRUD completo", () => {
    const bairros = dataStore.getDeliveryNeighborhoods();
    expect(bairros.length).toBeGreaterThanOrEqual(50);

    // Verificar Tangará da Serra
    const centroTga = bairros.find(b => b.name === "Centro" && b.cep === "78300-000");
    expect(centroTga).toBeDefined();
    expect(centroTga!.fee).toBe(6.0);
    expect(centroTga!.distanceKm).toBe(1.0);

    // Verificar Cidades Vizinhas & Chapadão
    const novaOlimpia = bairros.find(b => b.cidade === "Nova Olímpia");
    expect(novaOlimpia).toBeDefined();
    expect(novaOlimpia!.cep).toBe("78370-000");
    expect(novaOlimpia!.fee).toBeGreaterThanOrEqual(35.0);

    // Verificar Cuiabá e Polos MT
    const cuiaba = bairros.find(b => b.cidade === "Cuiabá");
    expect(cuiaba).toBeDefined();
    expect(cuiaba!.fee).toBeGreaterThanOrEqual(60.0);

    // Testar CRUD: Criar novo bairro específico
    const created = dataStore.createDeliveryNeighborhood({
      name: "Residencial Jardins de Tangará",
      cidade: "Tangará da Serra",
      zone: "Zona Norte",
      cep: "78301-950",
      distanceKm: 3.8,
      fee: 9.50,
      avgTimeMin: 27,
      freeShippingMin: 130.0,
      rainSurcharge: 3.0,
      active: true,
      notes: "Bairro de teste cadastrado especificamente"
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe("Residencial Jardins de Tangará");

    // Atualizar
    const updated = dataStore.updateDeliveryNeighborhood(created.id, { fee: 10.00 });
    expect(updated.fee).toBe(10.00);

    // Excluir
    const deleted = dataStore.deleteDeliveryNeighborhood(created.id);
    expect(deleted.success).toBe(true);
  });

  it("deve conceder frete gratis para clientes VIP com busca por codigo, nome ou telefone", () => {
    // 1. Busca por código VIP
    const vipResults = dataStore.searchCustomers("VIP-01");
    expect(vipResults.length).toBeGreaterThanOrEqual(1);
    expect(vipResults[0].isVip).toBe(true);
    expect(vipResults[0].name).toContain("Rodrigo");

    // 2. Lookup de frete com cliente VIP
    const lookupVip = dataStore.lookupCepTangara("78300-200", 50.0, { code: "VIP-01", isVip: true });
    expect(lookupVip.isFreeShipping).toBe(true);
    expect(lookupVip.fee).toBe(0.0);
    expect(lookupVip.message).toContain("VIP");
  });
});
