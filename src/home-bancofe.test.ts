import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";
import { registerPlataformaWebAndApis } from "./server/plataforma-routes";
import { renderizarHtmlHomeBancoFe } from "./views/home-bancofe-html";

describe("Tela Inicial & Portal Executivo do BancoFé", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    // Bypass auth em ambiente de teste
    app.use((req, _res, next) => {
      req.headers["x-bypass-auth"] = "true";
      next();
    });
    registerPlataformaWebAndApis(app);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("deve renderizar a interface HTML com os elementos essenciais da Holding e Layout Verde", () => {
    const html = renderizarHtmlHomeBancoFe({
      nome: "Rodrigo Ribeiro Gonçalves",
      email: "rrodrigogon@gmail.com",
    });

    // 1. Identidade e Layout Verde
    expect(html).toContain("Banco<span class=\"text-emerald-400\">Fé</span>");
    expect(html).toContain("Holding 360°");
    expect(html).toContain("#071510");
    expect(html).toContain("CMN 2.682/99");

    // 2. Governança e Diretoria
    expect(html).toContain("53.338.003/0001-04");
    expect(html).toContain("Rodrigo Ribeiro Gonçalves");
    expect(html).toContain("Patrícia Ferrari");

    // 3. KPIs Globais
    expect(html).toContain("R$ 18.010.000");
    expect(html).toContain("R$ 9.480.000");
    expect(html).toContain("R$ 8.530.000");
    expect(html).toContain("4.820 clientes");

    // 4. As 12 Empresas da Holding
    expect(html).toContain("1. BancoFé Digital &amp; Banking Core");
    expect(html).toContain("2. BancoFé Operações Financeiras");
    expect(html).toContain("3. BancoFé Cadastro 360 &amp; Vault");
    expect(html).toContain("4. Casa Nova Imóveis &amp; Financiamentos");
    expect(html).toContain("5. Agropecuária UISA &amp; Biorrefinaria");
    expect(html).toContain("6. Construtora Ultra &amp; Incorporadora");
    expect(html).toContain("7. Dino Barbearia &amp; Varejo Multi-Negócio");
    expect(html).toContain("8. Zuma Cozinha Oriental &amp; Gastronomia");
    expect(html).toContain("9. Zuma Moda, Roupas &amp; Boutique");
    expect(html).toContain("10. Dr. Clima &amp; Engenharia Térmica");
    expect(html).toContain("11. Stallone Franquias &amp; Fitness");
    expect(html).toContain("12. Kytto Tech &amp; Inovação Digital");

    // 5. Motores Centrais & Simulador
    expect(html).toContain("/admin/mesa-credito");
    expect(html).toContain("/admin/crm-financeira");
    expect(html).toContain("/admin/cadastro-360");
    expect(html).toContain("/plataforma/consulta-cpf");
    expect(html).toContain("Simulador Rápido de Financiamento SAC vs PRICE");
  });

  it("deve responder HTTP 200 na rota GET /", async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("BancoFé • Holding S/A");
    expect(text).toContain("Mesa de Crédito 360°");
  });

  it("deve responder HTTP 200 nas rotas alternativas /home e /bancofe", async () => {
    const resHome = await fetch(`${baseUrl}/home`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(resHome.status).toBe(200);

    const resBancofe = await fetch(`${baseUrl}/bancofe`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(resBancofe.status).toBe(200);
  });
});
