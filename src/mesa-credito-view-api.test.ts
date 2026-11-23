import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";
import { registerPlataformaWebAndApis } from "./server/plataforma-routes";
import { ServicoMesaCredito } from "./credito/servico-mesa-credito";
import { renderizarHtmlMesaCredito } from "./views/mesa-credito-html";

describe("Mesa de Crédito & Financiamentos BancoFé (Web & APIs)", () => {
  let server: http.Server;
  let baseUrl: string;
  let servicoMesa: ServicoMesaCredito;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    // Bypass auth em ambiente de teste
    app.use((req, _res, next) => {
      req.headers["x-bypass-auth"] = "true";
      next();
    });
    registerPlataformaWebAndApis(app);
    servicoMesa = ServicoMesaCredito.getInstance();

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

  it("deve renderizar a interface HTML da Mesa de Crédito com o Design System Verde", () => {
    const html = renderizarHtmlMesaCredito();
    expect(html).toContain("Mesa de Crédito & Financiamentos");
    expect(html).toContain("Rating Algorítmico CMN 2.682");
    expect(html).toContain("bg-bancofe-dark");
    expect(html).toContain("#071510");
    expect(html).toContain("Dr. Carlos Eduardo Mendonça");
    expect(html).toContain("Cooperativa Agro Industrial dos Parecis");
  });

  it("deve carregar a tela SSR /admin/mesa-credito via HTTP com status 200", async () => {
    const res = await fetch(`${baseUrl}/admin/mesa-credito`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Mesa de Crédito & Financiamentos");
    expect(text).toContain("Casa Nova Imóveis");
  });

  it("deve retornar métricas consolidadas em /api/v1/mesa-credito/metricas", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/metricas`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.metricas.volumeTotalEmAnalise).toBeGreaterThan(0);
    expect(data.metricas.volumeTotalAprovado).toBeGreaterThan(0);
    expect(data.metricas.totalPropostasFila).toBeGreaterThanOrEqual(12);
    expect(data.metricas.integridadeBureaus).toContain("48/48");
  });

  it("deve listar propostas com filtros por status e empresa em /api/v1/mesa-credito/propostas", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/propostas`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.propostas.length).toBeGreaterThanOrEqual(12);

    // Filtro por empresa casanova
    const resCasaNova = await fetch(`${baseUrl}/api/v1/mesa-credito/propostas?empresa=casanova`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(resCasaNova.status).toBe(200);
    const dataCasaNova = await resCasaNova.json();
    expect(dataCasaNova.propostas.every((p: any) => p.empresaOrigemId === "casanova")).toBe(true);
  });

  it("deve obter detalhes completos de uma proposta por ID", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/proposta/mc-prop-001`, {
      headers: { "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.proposta.clienteNome).toBe("Dr. Carlos Eduardo Mendonça");
    expect(data.proposta.parecerAlgoritmico).toBeDefined();
    expect(data.proposta.parecerAlgoritmico.scoreBancoFe).toBeGreaterThan(700);
  });

  it("deve deliberar alteração de status e taxa de juros na proposta", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/deliberar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-auth": "true" },
      body: JSON.stringify({
        id: "mc-prop-004",
        novoStatus: "APROVADO_MESA",
        taxaMensal: 0.89,
        parecerOperador: "Aprovado com taxa bonificada pelo Comitê de Financiamentos",
        operadorNome: "Rodrigo Gonçalves",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.proposta.status).toBe("APROVADO_MESA");
    expect(data.proposta.taxaMensalPercentual).toBe(0.89);
  });

  it("deve emitir CCB Digital com hash SHA-256 oficial", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/emitir-ccb/mc-prop-001`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-auth": "true" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.proposta.status).toBe("FORMALIZADO_CCB");
    expect(data.proposta.numeroCcbDigital).toContain("CCB-BFE");
    expect(data.proposta.hashCcbSha256).toBeDefined();
    expect(data.proposta.hashCcbSha256.length).toBe(64);
  });

  it("deve criar e calcular nova proposta avulsa instantaneamente", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mesa-credito/nova-proposta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-auth": "true" },
      body: JSON.stringify({
        clienteNome: "Fazenda Santa Lúcia Agroindustrial",
        clienteDocumento: "11.222.333/0001-44",
        clienteTipo: "PJ",
        rendaMensalDeclarada: 320000,
        patrimonioDeclarado: 6500000,
        empresaOrigemId: "agro_uisa",
        empresaOrigemNome: "Agro & Crédito Rural (UISA Biorrefinaria)",
        produtoId: "cpr_verde_barter",
        produtoNome: "CPR Verde de Soja e Milho",
        finalidadeCredito: "Custeio de plantio",
        valorSolicitado: 800000,
        prazoMeses: 24,
        sistemaAmortizacao: "SAC",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sucesso).toBe(true);
    expect(data.proposta.codigoProtocolo).toContain("MC-2026");
    expect(data.proposta.ratingBancoFe).toBeDefined();
    expect(data.proposta.primeiraParcela).toBeGreaterThan(0);
  });
});
