import { describe, expect, it } from "vitest";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Servidor Fastify - Endpoints de Bureaus, Carga de Créditos e Conectores Gratuitos", () => {
  const { app } = criarServidorConsulta360();

  it("GET /health deve listar as novas integrações ativas de bureaus e carga de créditos", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.versao).toBe("2.7.0-enterprise");
    expect(body.integracoesAtivas).toContain("Gateway Pré-Pago InfoSimples / Serasa (Carga de Créditos)");
    expect(body.integracoesAtivas).toContain("IEPTB / CENPROT Nacional (Protestos Cartorários 27 UFs - Gratuito)");
    expect(body.integracoesAtivas).toContain("TST / BNDT (Certidão Negativa Débitos Trabalhistas - Gratuito)");
  });

  it("GET /api/v1/bureaus/creditos/saldo deve retornar o saldo em tempo real e chave Pix da Kytto", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/bureaus/creditos/saldo",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.provedor).toBe("INFOSIMPLES_SERASA");
    expect(body.saldoReais).toBeGreaterThanOrEqual(0);
    expect(body.chavePixDestino).toBe(CONFIG_OFICIAL_KYTTO.empresa.cnpj);
    expect(body.razaoSocialDestino).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
  });

  it("POST /api/v1/bureaus/creditos/recarregar deve gerar ordem Pix Copia e Cola instantânea", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/bureaus/creditos/recarregar",
      payload: { valorReais: 75.5 },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ordemId).toMatch(/^REC-/);
    expect(body.valorReais).toBe(75.5);
    expect(body.chavePixCopiaECola).toContain(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo);
    expect(body.beneficiario).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
  });

  it("POST /api/v1/bureaus/infosimples/consultar deve executar consulta pré-paga ao Serasa", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/bureaus/infosimples/consultar",
      payload: { documento: "53338003000104", tipo: "CNPJ" },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.provedor).toContain("InfoSimples Gateway Serasa Experian");
    expect(body.creditosConsumidosReais).toBe(2.5);
    expect(body.dados.scoreSerasa).toBeGreaterThanOrEqual(900);
  });

  it("GET /api/v1/bureaus/protestos-nacionais/:documento deve consultar cartórios nos 27 estados gratuitamente", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/bureaus/protestos-nacionais/53338003000104",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.fonteOficial).toBe("IEPTB_CENPROT_NACIONAL");
    expect(body.gratuito).toBe(true);
    expect(body.situacaoNacional).toBe("NADA_CONSTA_ADIMPLENTE");
    expect(body.totalCartoriosPesquisados).toBeGreaterThan(2000);
  });

  it("GET /api/v1/bureaus/cndt-trabalhista/:documento deve emitir CNDT gratuita oficial do TST", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/bureaus/cndt-trabalhista/53338003000104",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.orgaoExpedidor).toBe("TRIBUNAL_SUPERIOR_DO_TRABALHO_TST");
    expect(body.gratuito).toBe(true);
    expect(body.situacao).toBe("CERTIDAO_NEGATIVA");
    expect(body.numeroCertidao).toContain("CNDT/");
  });
});
