import { describe, expect, it } from "vitest";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Servidor Fastify - Endpoints de Carteira Digital, HTML e Novas Integrações Completas", () => {
  const { app } = criarServidorConsulta360();

  // 1. Healthcheck e Versão
  it("GET /health deve listar a versão 2.7.0 e todas as novas integrações", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.versao).toBe("2.7.0-enterprise");
    expect(body.integracoesAtivas).toContain("Carteira Digital Multi-Métodos (Cartões Luhn / Tokenização PCI-DSS)");
    expect(body.integracoesAtivas).toContain("PIX Instantâneo DICT Bacen (QR Code Dinâmico e Copia e Cola CNPJ Kytto)");
    expect(body.integracoesAtivas).toContain("CGU / Portal da Transparência (CEIS, CNEP, CEPIM)");
    expect(body.integracoesAtivas).toContain("TSE (Quitação Eleitoral para Imóveis e Financiamento)");
    expect(body.integracoesAtivas).toContain("INSS / Dataprev (Benefícios Previdenciários e Margem Consignável 35%)");
    expect(body.integracoesAtivas).toContain("PGFN / Regularize (Dívida Ativa da União)");
  });

  // 2. Interface Web da Carteira Digital
  it("GET /plataforma/carteira-creditos deve servir a interface web HTML da carteira", async () => {
    const res = await app.inject({ method: "GET", url: "/plataforma/carteira-creditos" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.body).toContain("Carteira Digital");
    expect(res.body).toContain(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
    expect(res.body).toContain(CONFIG_OFICIAL_KYTTO.empresa.cnpj);
    expect(res.body).toContain("Carga de Créditos (Opção 3)");
    expect(res.body).toContain("Cartões de Crédito (Opção 1)");
    expect(res.body).toContain("Chaves PIX Bacen (Opção 2)");
  });

  // 3. Carteira Digital: Saldo e Resumo
  it("GET /api/v1/carteira/saldo deve retornar o resumo completo da carteira", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/carteira/saldo" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.saldoReais).toBeGreaterThanOrEqual(100.0);
    expect(body.pacotesDisponiveis.length).toBeGreaterThanOrEqual(4);
    expect(body.consultasEstimadasRestantes).toBeGreaterThan(0);
  });

  // 4. Opção 1: Cadastrar e Listar Cartão de Crédito
  let cartaoIdCriado = "";
  it("POST /api/v1/carteira/cartoes deve cadastrar e tokenizar cartão de crédito com Luhn", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/cartoes",
      payload: {
        numeroCartao: "4532 0151 1283 0366",
        nomeTitular: "PATRICIA FERRARI PAULINO GONCALVES",
        mesExpiracao: 12,
        anoExpiracao: 2030,
        cvv: "123",
        definirComoPadrao: true,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.cartao.bandeira).toBe("VISA");
    expect(body.cartao.ultimos4Digitos).toBe("0366");
    expect(body.cartao.tokenSeguro).toMatch(/^tok_live_/);
    cartaoIdCriado = body.cartao.id;
  });

  it("GET /api/v1/carteira/cartoes deve retornar a lista de cartões cadastrados", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/carteira/cartoes" });
    expect(res.statusCode).toBe(200);
    const cartoes = JSON.parse(res.body);
    expect(cartoes.length).toBeGreaterThanOrEqual(1);
    expect(cartoes[0].id).toBe(cartaoIdCriado);
  });

  // 5. Opção 2: Cadastrar e Listar Chave PIX
  let pixIdCriado = "";
  it("POST /api/v1/carteira/pix-chaves deve cadastrar e validar chave PIX no DICT Bacen", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/pix-chaves",
      payload: {
        chave: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        descricao: "Chave CNPJ Matriz Kytto",
        definirComoPadrao: true,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.chavePix.tipo).toBe("CNPJ");
    pixIdCriado = body.chavePix.id;
  });

  it("GET /api/v1/carteira/pix-chaves deve retornar as chaves cadastradas", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/carteira/pix-chaves" });
    expect(res.statusCode).toBe(200);
    const chaves = JSON.parse(res.body);
    expect(chaves.length).toBeGreaterThanOrEqual(1);
    expect(chaves[0].id).toBe(pixIdCriado);
  });

  // 6. Opção 3: Carga via Cartão de Crédito
  it("POST /api/v1/carteira/recargas/cartao deve executar recarga instantânea de créditos", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/recargas/cartao",
      payload: {
        cartaoId: cartaoIdCriado,
        valorReais: 100.0,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.valorRecargaReais).toBe(100.0);
    expect(body.comprovanteHash).toBeDefined();
  });

  // 7. Opção 3: Carga via PIX e Liquidação
  let transacaoPixId = "";
  it("POST /api/v1/carteira/recargas/pix deve gerar cobrança PIX com Copia e Cola para Kytto", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/recargas/pix",
      payload: { valorReais: 50.0 },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
    expect(body.chavePixCopiaECola).toContain(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo);
    expect(body.beneficiario).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
    transacaoPixId = body.transacaoId;
  });

  it("POST /api/v1/carteira/recargas/pix/confirmar deve liquidar a transação e liberar saldo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/recargas/pix/confirmar",
      payload: { transacaoId: transacaoPixId },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sucesso).toBe(true);
  });

  // 8. Extrato e Auto-Recarga
  it("GET /api/v1/carteira/extrato deve listar o histórico completo da carteira", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/carteira/extrato" });
    expect(res.statusCode).toBe(200);
    const extrato = JSON.parse(res.body);
    expect(extrato.length).toBeGreaterThanOrEqual(3);
  });

  it("POST /api/v1/carteira/auto-recarga deve salvar as configurações de auto-recarga", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/carteira/auto-recarga",
      payload: {
        ativa: true,
        gatilhoSaldoMinimoReais: 25.0,
        valorRecargaReais: 150.0,
        cartaoIdDestino: cartaoIdCriado,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ativa).toBe(true);
    expect(body.gatilhoSaldoMinimoReais).toBe(25.0);
  });

  // 9. Endpoints das Novas Integrações (CGU, TSE, INSS, PGFN)
  it("GET /api/v1/compliance/cgu/:documento deve consultar sanções da CGU", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/compliance/cgu/${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.fonteOficial).toBe("PORTAL_TRANSPARENCIA_CGU");
    expect(body.situacaoGeral).toBe("NADA_CONSTA_REGULAR");
  });

  it("GET /api/v1/eleitoral/tse/:cpf deve consultar quitação eleitoral no TSE", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/eleitoral/tse/52998224725?nome=CARLOS%20EDUARDO",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.fonteOficial).toBe("TRIBUNAL_SUPERIOR_ELEITORAL_TSE");
    expect(body.quitacaoEleitoralValida).toBe(true);
  });

  it("GET /api/v1/previdencia/inss/:cpf deve consultar benefícios e margem consignável no INSS", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/previdencia/inss/00000000191",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.fonteOficial).toBe("INSS_DATAPREV_PREVIDENCIA");
    expect(body.margemConsignavelTotalCentavos).toBeGreaterThan(0);
  });

  it("GET /api/v1/fiscal/pgfn-regularize/:documento deve consultar DAU no Regularize", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/fiscal/pgfn-regularize/${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.fonteOficial).toBe("PGFN_REGULARIZE_DAU");
    expect(body.situacaoFiscalFederal).toBe("REGULAR_SEM_DEBITOS");
  });
});
