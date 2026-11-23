import { describe, expect, it } from "vitest";
import { criarModuloConsulta360 } from "./index.ts";

describe("Módulo Consulta360 Enterprise (Contrato e Ferramentas)", () => {
  it("deve instanciar o módulo conforme o contrato corporativo oficial", () => {
    const { modulo, router, servico } = criarModuloConsulta360();

    expect(modulo.nome).toBe("consulta360");
    expect(modulo.versao).toBe("2.1.0");
    expect(modulo.dependeDe).toContain("core");
    expect(modulo.permissoes).toContain("consulta360.consultar");
    expect(modulo.permissoes).toContain("consulta360.ler");
    expect(modulo.permissoes).toContain("consulta360.exportar");
    expect(modulo.eventosPublicados).toContain("consulta360.consulta.realizada");
    expect(modulo.ferramentas?.length).toBe(3);
    expect(router).toBeDefined();
    expect(servico).toBeDefined();
  });

  it("deve disponibilizar ferramentas de IA com schema Zod e controle de permissões", { timeout: 15000 }, async () => {
    const { modulo } = criarModuloConsulta360({ apiKeyGemini: "" });
    const ferramentas = modulo.ferramentas || [];

    const ferramentaBuscar = ferramentas.find((f) => f.nome === "consulta360_buscar");
    expect(ferramentaBuscar).toBeDefined();
    expect(ferramentaBuscar?.permissao).toBe("consulta360.consultar");
    expect(ferramentaBuscar?.efeitoColateral).toBe(false);

    const resultado = (await ferramentaBuscar?.executar(
      { tenantId: "casanova-ultra", permissoes: ["consulta360.consultar"] } as any,
      { documentoOuNome: "00000000191", profundidadeGrafo: 2 },
    )) as any;

    expect(resultado).toBeDefined();
    expect(resultado.protocolo).toContain("KYTTO-360");
    expect(resultado.scoreKytto360).toBeGreaterThanOrEqual(700);
    expect(resultado.propensaoSetorial).toBeDefined();
  });

  it("deve executar a ferramenta de expansão de grafo relacional", { timeout: 15000 }, async () => {
    const { modulo } = criarModuloConsulta360({ apiKeyGemini: "" });
    const ferramentaGrafo = modulo.ferramentas?.find((f) => f.nome === "consulta360_expandir_grafo");
    expect(ferramentaGrafo).toBeDefined();

    const resultado = (await ferramentaGrafo?.executar(
      { tenantId: "casanova-ultra", permissoes: ["consulta360.ler"] } as any,
      { documentoOuNome: "00000000191", profundidade: 2 },
    )) as any;

    expect(resultado).toBeDefined();
    expect(resultado.totalNos).toBeGreaterThan(0);
    expect(resultado.metricas.densidadeRede).toBeDefined();
    expect(resultado.hubPrincipal).toBeDefined();
  });

  it("deve executar a ferramenta de exportação de dossiê", { timeout: 15000 }, async () => {
    const { modulo } = criarModuloConsulta360({ apiKeyGemini: "" });
    const ferramentaExportar = modulo.ferramentas?.find((f) => f.nome === "consulta360_exportar_dossie");
    expect(ferramentaExportar).toBeDefined();

    const resultado = (await ferramentaExportar?.executar(
      { tenantId: "casanova-ultra", permissoes: ["consulta360.exportar"] } as any,
      { documentoOuNome: "00000000191", formato: "AMBOS" },
    )) as any;

    expect(resultado.sucesso).toBe(true);
    expect(resultado.excelGeradoBytes).toBeGreaterThan(1000);
    expect(resultado.pdfGeradoBytes).toBeGreaterThan(1000);
  });
});
