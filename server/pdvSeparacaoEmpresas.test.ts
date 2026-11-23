import { describe, it, expect, beforeEach } from "vitest";
import { dataStore } from "./dataStore";

describe("PDV - Separação Estrita de Empresas (Holding Zuma)", () => {
  beforeEach(() => {
    dataStore.setOfflineMode(false);
  });

  it("deve emitir NFC-e segregada para Zuma Gastronomia com CNPJ 36.296.848/0001-57", () => {
    const doc = dataStore.emitNfce({
      customerName: "Rodrigo Ribeiro Gonçalves",
      cpf: "034.881.992-04",
      totalAmount: 101.80,
      empresa: "gastronomia",
      items: [
        { itemName: "Combo 26 Peças (Sashimis & Niguiris)", quantity: 1, unitPrice: 69.90 },
        { itemName: "Hot Filadélfia Trufado (12un)", quantity: 1, unitPrice: 31.90 }
      ],
      payments: [{ method: "pix", amount: 101.80 }]
    });

    expect(doc).toBeDefined();
    expect(doc.status).toBe("autorizada");
    expect(doc.empresa).toBe("gastronomia");
    expect(doc.cnpjEmitente).toBe("36296848000157");
    expect(doc.razaoSocialEmitente).toContain("Zuma Gastronomia Oriental");
    // Chave de 44 dígitos deve conter o CNPJ 36296848000157
    expect(doc.chaveAcesso).toContain("36296848000157");
    expect(doc.itens.length).toBe(2);
    expect(doc.itens[0].itemName).toContain("Combo 26 Peças");
  });

  it("deve emitir NFC-e segregada para Zuma Moda & Boutique com CNPJ 36.296.848/0002-38", () => {
    const doc = dataStore.emitNfce({
      customerName: "Camila Albuquerque",
      cpf: "012.345.678-90",
      totalAmount: 289.00,
      empresa: "moda",
      items: [
        { itemName: "Camisa Linho Puro Riviera (Tam M · Off-White)", quantity: 1, unitPrice: 289.00 }
      ],
      payments: [{ method: "credito", amount: 289.00 }]
    });

    expect(doc).toBeDefined();
    expect(doc.status).toBe("autorizada");
    expect(doc.empresa).toBe("moda");
    expect(doc.cnpjEmitente).toBe("36296848000238");
    expect(doc.razaoSocialEmitente).toContain("Zuma Moda & Boutique Elegance");
    // Chave de 44 dígitos deve conter o CNPJ 36296848000238 da Boutique
    expect(doc.chaveAcesso).toContain("36296848000238");
    expect(doc.itens.length).toBe(1);
    expect(doc.itens[0].itemName).toContain("Linho Puro");
  });

  it("deve gerenciar catálogo exclusivo de vestuário e grade de tamanhos P/M/G", () => {
    const clothing = dataStore.getClothingProducts();
    expect(clothing.length).toBeGreaterThan(0);

    const camisa = clothing.find(p => p.ref === "ZUM-LIN-01");
    expect(camisa).toBeDefined();
    expect(camisa?.name).toContain("Linho Puro Riviera");
    expect(camisa?.salePrice).toBe(289.00);
    expect(camisa?.grid.length).toBeGreaterThan(0);
    
    // Verifica se possui grade P, M, G
    const sizes = camisa?.grid.map(g => g.size);
    expect(sizes).toContain("P");
    expect(sizes).toContain("M");
    expect(sizes).toContain("G");
  });

  it("deve consultar e gerenciar malas condicionais de provador em casa (3 dias) da Zuma Moda", () => {
    const bags = dataStore.getClothingConditionalBags();
    expect(bags.length).toBeGreaterThan(0);

    const firstBag = bags[0];
    expect(firstBag.customerName).toBeDefined();
    expect(firstBag.items.length).toBeGreaterThan(0);
    expect(firstBag.status).toBe("em_aberto");
    // Cada item da mala tem tamanho e preço consignado
    expect(firstBag.items[0].price).toBeGreaterThan(0);
    expect(firstBag.items[0].size).toBeDefined();
  });

  it("deve registrar pedido no canal exclusivo da boutique sem misturar com a gastronomia", () => {
    const items = [
      { itemName: "Camisa Linho Puro Riviera", category: "Moda", quantity: 1, unitPrice: 289.00 }
    ];
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

    const orderModa = dataStore.createOrder({
      channel: "Balcão Zuma Boutique",
      customerName: "Camila Albuquerque",
      customerPhone: "(65) 99988-3412",
      neighborhood: "Centro",
      paymentMethod: "Cartão de Crédito",
      hasCpf: true,
      cpf: "012.345.678-90",
      deliveryNotes: "Consultora: Camila Prado (Consultora VIP Boutique)",
      items,
      subtotal: total,
      total
    });

    expect(orderModa).toBeDefined();
    expect(orderModa.channel).toBe("Balcão Zuma Boutique");
    expect(orderModa.total).toBe(289.00);
    expect(orderModa.items[0].category).toBe("Moda");
  });
});
