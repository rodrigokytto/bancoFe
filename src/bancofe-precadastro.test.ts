import { describe, expect, it } from "vitest";
import { ServicoPreCadastroBancoFe } from "./precadastro/servico-precadastro.ts";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Esteira de Pré-Cadastro 360 & Onboarding BancoFé", () => {
  it("deve carregar a esteira com registros iniciais homologados", () => {
    const servico = new ServicoPreCadastroBancoFe();
    const cadastros = servico.listar();
    expect(cadastros.length).toBeGreaterThanOrEqual(5);

    const drCarlos = servico.obterPorCpf("00000000949");
    expect(drCarlos).not.toBeNull();
    expect(drCarlos?.titular.nomeCompleto).toContain("CARLOS EDUARDO MENDONÇA");
    expect(drCarlos?.status).toBe("aprovado_autonomo");
    expect(drCarlos?.simulacao?.certificado).toBeDefined();
    expect(drCarlos?.simulacao?.certificado?.hashSha256).toMatch(/^SHA256:/);
  });

  it("deve calcular corretamente a simulação SAC com enquadramento de margem de 30%", () => {
    const servico = new ServicoPreCadastroBancoFe();
    // Financiamento de R$ 300.000 em 360 meses, renda de R$ 15.000
    const sim = servico.calcularSimulacaoCredito(300000, 360, "SAC", 15000, 850);

    expect(sim.sistemaAmortizacao).toBe("SAC");
    expect(sim.valorPrimeiraParcela).toBeGreaterThan(0);
    expect(sim.capacidadeParcela30Pct).toBe(4500); // 30% de 15.000
    expect(sim.aprovadoAutomaticamente).toBe(true);
    expect(sim.certificado).toBeDefined();
    expect(sim.certificado?.codigoCertificado).toContain("CERT-BFE-");
  });

  it("deve recusar aprovação autônoma quando a parcela estourar a margem prudencial de 30%", () => {
    const servico = new ServicoPreCadastroBancoFe();
    // Financiamento de R$ 500.000 em 60 meses, renda de R$ 5.000 (parcela muito maior que 1.500)
    const sim = servico.calcularSimulacaoCredito(500000, 60, "PRICE", 5000, 650);

    expect(sim.aprovadoAutomaticamente).toBe(false);
    expect(sim.comprometimentoRendaPct).toBeGreaterThan(30);
    expect(sim.certificado).toBeUndefined();
    expect(sim.motivoStatus).toContain("excede a margem de 30%");
  });

  it("deve registrar novo proponente na esteira e emitir pendências documentais", () => {
    const servico = new ServicoPreCadastroBancoFe();
    const novo = servico.criar({
      nomeCompleto: "RODRIGO RIBEIRO GONÇALVES",
      cpfOuCnpj: "305.871.628-13",
      email: "rodrigo.goncalves@kytto.com.br",
      telefone: "(18) 99712-4411",
      rendaMensalDeclarada: 35000,
      cidade: "Tangará da Serra",
      uf: "MT",
      produtoPretendido: "financiamento_imobiliario",
      empresaParceira: "Casa Nova Imóveis",
      valorPretendido: 650000,
      prazoMeses: 360,
      sistemaAmortizacao: "SAC",
      autorizacaoLgpd: true,
    });

    expect(novo.id).toMatch(/^pre-/);
    expect(novo.codigoProtocolo).toContain("BFE-PRE-");
    expect(novo.status).toBe("aprovado_autonomo");
    expect(novo.pendencias.length).toBeGreaterThan(0);

    const cnh = novo.pendencias.find((p) => p.descricao.includes("Identificação"));
    expect(cnh).toBeDefined();
  });

  it("deve resolver pendência documental e atualizar status para concluído", () => {
    const servico = new ServicoPreCadastroBancoFe();
    const cadastros = servico.listar();
    const proponente = cadastros[0];

    const pendenciaId = proponente.pendencias[0].id;
    servico.resolverPendencia(proponente.id, pendenciaId, "aprovado");

    const atualizado = servico.obterPorId(proponente.id);
    const pendResolvida = atualizado?.pendencias.find((p) => p.id === pendenciaId);
    expect(pendResolvida?.status).toBe("aprovado");

    servico.atualizarStatus(proponente.id, "concluido", "Documentação aprovada em comitê");
    const concluido = servico.obterPorId(proponente.id);
    expect(concluido?.status).toBe("concluido");
  });

  it("deve responder corretamente aos endpoints HTTP de simulação e onboarding", async () => {
    const { app } = criarServidorConsulta360(3361);

    // 1. Simulação via API
    const respSimulacao = await app.inject({
      method: "POST",
      url: "/api/v1/precadastro/simular",
      payload: {
        valor: 400000,
        prazoMeses: 240,
        sistema: "SAC",
        rendaMensal: 25000,
        score: 920,
      },
    });
    expect(respSimulacao.statusCode).toBe(200);
    const corpoSim = JSON.parse(respSimulacao.body);
    expect(corpoSim.aprovadoAutomaticamente).toBe(true);
    expect(corpoSim.certificado.hashSha256).toBeDefined();

    // 2. Métricas da esteira
    const respMetricas = await app.inject({
      method: "GET",
      url: "/api/v1/precadastro/metricas",
    });
    expect(respMetricas.statusCode).toBe(200);
    const corpoMetricas = JSON.parse(respMetricas.body);
    expect(corpoMetricas.totalPreCadastros).toBeGreaterThan(0);
    expect(corpoMetricas.volumeTotalSolicitado).toBeGreaterThan(0);

    // 3. Tela Web HTML
    const respHtml = await app.inject({
      method: "GET",
      url: "/plataforma/precadastro",
    });
    expect(respHtml.statusCode).toBe(200);
    expect(respHtml.headers["content-type"]).toContain("text/html");
    expect(respHtml.body).toContain("Pré-Cadastro 360 BancoFé");
  });
});
