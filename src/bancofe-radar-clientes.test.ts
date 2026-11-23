import { describe, expect, it } from "vitest";
import { MotorRadarProspeccaoBancoFe } from "./clientes/radar-prospeccao.ts";
import {
  CLIENTES_PREQUALIFICADOS,
  obterClientePorCpf,
  listarClientesPrequalificados,
  obterEstatisticasClientes,
} from "./clientes/clientes-prequalificados.ts";
import { BASE_EMPRESAS_BANCOFE, listarEmpresasPotenciais } from "./clientes/base-empresas-tga.ts";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Radar Preditivo de Clientes & Base Pré-Qualificada BancoFé", () => {
  it("deve mapear os 16 perfis socioeconômicos regionais no Radar de Prospecção", () => {
    const todos = MotorRadarProspeccaoBancoFe.filtrar();
    expect(todos.length).toBeGreaterThanOrEqual(16);

    const agro = MotorRadarProspeccaoBancoFe.filtrar({ segmento: "agronegocio" });
    expect(agro.length).toBeGreaterThan(0);
    expect(agro.some((c) => c.nome.includes("Crestani"))).toBe(true);

    const medicos = MotorRadarProspeccaoBancoFe.filtrar({ segmento: "medicos_saude" });
    expect(medicos.length).toBeGreaterThan(0);
    expect(medicos.some((c) => c.nome.includes("Luciana") || c.nome.includes("Guimarães"))).toBe(true);

    const estatisticas = MotorRadarProspeccaoBancoFe.obterEstatisticas();
    expect(estatisticas.totalClientesRadar).toBeGreaterThanOrEqual(16);
    expect(estatisticas.volumePreAprovadoTotal).toBeGreaterThan(9000000);
    expect(estatisticas.poderCompraTotal).toBeGreaterThan(20000000);
    expect(estatisticas.rendaMedia).toBeGreaterThan(20000);
  });

  it("deve conter os CPFs reais homologados na base pré-qualificada com dossiê 360", () => {
    expect(Object.keys(CLIENTES_PREQUALIFICADOS).length).toBeGreaterThanOrEqual(15);

    // 1. Rodrigo Ribeiro Gonçalves (UISA / BancoFé)
    const rodrigo = obterClientePorCpf("30587162813");
    expect(rodrigo).not.toBeNull();
    expect(rodrigo?.nomeCompleto).toContain("RODRIGO");
    expect(rodrigo?.rendaPresumidaMensal).toBeGreaterThan(0);
    expect(rodrigo?.scoreCredito).toBeGreaterThan(800);

    // 2. Patrícia Ferrari Paulino Gonçalves (Kytto / Casanova)
    const patricia = obterClientePorCpf("32285522843");
    expect(patricia).not.toBeNull();
    expect(patricia?.nomeCompleto).toContain("PATRICIA");
    expect(patricia?.situacaoCadastral).toBe("REGULAR");

    // 3. Lucas dos Passos Silva (UISA)
    const lucas = obterClientePorCpf("06988722661");
    expect(lucas).not.toBeNull();
    expect(lucas?.nomeCompleto).toContain("LUCAS");
  });

  it("deve listar empresas locais com afinidade para crédito PJ e Maquininha BancoFé", () => {
    const empresas = listarEmpresasPotenciais();
    expect(empresas.length).toBeGreaterThanOrEqual(6);

    const ultra = empresas.find((e) => e.razaoSocial.includes("ULTRA"));
    expect(ultra).toBeDefined();
    expect(ultra?.descricaoCnae).toContain("Construção");

    const uisa = empresas.find((e) => e.razaoSocial.includes("ITAMARATI") || e.nomeFantasia.includes("UISA"));
    expect(uisa).toBeDefined();

    const dino = empresas.find((e) => e.razaoSocial.includes("DINO") || e.nomeFantasia.includes("DINO"));
    expect(dino).toBeDefined();
    expect(dino?.produtosRecomendados.some((p) => p.includes("Maquininha"))).toBe(true);
  });

  it("deve fornecer endpoints HTTP para consumo de inteligência preditiva", async () => {
    const { app } = criarServidorConsulta360(3362);

    // 1. Radar Clientes Potenciais
    const respRadar = await app.inject({
      method: "GET",
      url: "/api/v1/radar/clientes-potenciais",
    });
    expect(respRadar.statusCode).toBe(200);
    const dadosRadar = JSON.parse(respRadar.body);
    expect(dadosRadar.total).toBeGreaterThanOrEqual(16);
    expect(dadosRadar.estatisticas.volumePreAprovadoTotal).toBeGreaterThan(0);

    // 2. Empresas Locais
    const respEmpresas = await app.inject({
      method: "GET",
      url: "/api/v1/radar/empresas-locais",
    });
    expect(respEmpresas.statusCode).toBe(200);
    const dadosEmpresas = JSON.parse(respEmpresas.body);
    expect(Array.isArray(dadosEmpresas)).toBe(true);
    expect(dadosEmpresas.length).toBeGreaterThan(0);

    // 3. Clientes Pré-Qualificados por CPF
    const respCpf = await app.inject({
      method: "GET",
      url: "/api/v1/clientes-prequalificados/30587162813",
    });
    expect(respCpf.statusCode).toBe(200);
    const dadosCpf = JSON.parse(respCpf.body);
    expect(dadosCpf.cpf).toBe("30587162813");

    // 4. Tela Web HTML
    const respHtml = await app.inject({
      method: "GET",
      url: "/plataforma/clientes-potenciais",
    });
    expect(respHtml.statusCode).toBe(200);
    expect(respHtml.headers["content-type"]).toContain("text/html");
    expect(respHtml.body).toContain("Radar Preditivo de Clientes");
  });
});
