import { describe, it, expect } from "vitest";

const BASE_URL = "http://127.0.0.1:3000";

describe("BancoFé - Validação E-Commerce Admin, Operações, Termos e Consulta 360", () => {
  it("GET /api/admin/commerce/storefronts deve retornar os 6 storefronts do ecossistema", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/commerce/storefronts`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sucesso).toBe(true);
    expect(Array.isArray(body.storefronts)).toBe(true);
    expect(body.storefronts.length).toBe(6);

    const nomes = body.storefronts.map((s: any) => s.nome);
    expect(nomes).toContain("Zuma Cozinha Oriental");
    expect(nomes).toContain("Casa Nova Imóveis & Construtora");
    expect(nomes).toContain("Zuma Moda & Boutique");
    expect(nomes).toContain("Agropecuária UISA / Agro Open");
  });

  it("GET /api/admin/commerce/catalog/products deve listar catálogo multi-loja", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/commerce/catalog/products`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sucesso).toBe(true);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.products[0]).toHaveProperty("price");
    expect(body.products[0]).toHaveProperty("stock");
  });

  it("GET /api/admin/commerce/orders deve listar pedidos com split D+0 BancoFé Pay", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/commerce/orders`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sucesso).toBe(true);
    expect(Array.isArray(body.orders)).toBe(true);
    expect(body.orders.length).toBeGreaterThan(0);
    expect(body.orders[0].paymentMethod).toContain("PIX BancoFé D+0");
  });

  it("GET /api/bancofe/cadastro360/termos deve listar os termos regulatórios", async () => {
    const res = await fetch(`${BASE_URL}/api/bancofe/cadastro360/termos`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(133);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("POST /api/consulta360/consultar deve executar dossiê pericial com 11 fontes oficiais", async () => {
    const res = await fetch(`${BASE_URL}/api/consulta360/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentoOuNome: "00.000.000/0001-91" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sucesso).toBe(true);
    expect(body.dossie).toBeDefined();
    expect(body.dossie.protocoloConsulta).toBeDefined();
    expect(body.dossie.conformidadeLgpd.baseLegalPrincipal).toBeDefined();
  }, 25000);

  it("GET /admin/ecommerce deve responder 200 no SSR com layout verde BancoFé", async () => {
    const res = await fetch(`${BASE_URL}/admin/ecommerce`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("E-Commerce Admin");
    expect(html).toContain("BancoFé");
    expect(html).toContain("emerald");
  });

  it("GET /admin deve responder 200 com a interface administrativa", async () => {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: "follow" });
    expect(res.status).toBe(200);
  });

  it("GET /consulta-360 e /admin/operacoes-financeiras devem responder 200 no SPA", async () => {
    const resC360 = await fetch(`${BASE_URL}/consulta-360`);
    expect(resC360.status).toBe(200);

    const resOp = await fetch(`${BASE_URL}/admin/operacoes-financeiras`);
    expect(resOp.status).toBe(200);
  });
});
