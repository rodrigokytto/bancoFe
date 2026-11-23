import { describe, expect, it } from "vitest";
import { consultarComplianceAmbiental } from "./compliance/sicar-compliance-ambiental.js";

describe("Módulo de Compliance Ambiental & SICAR ESG BancoFé", () => {
  it("deve auditar imóvel rural no CAR e validar Desmatamento Zero para produtor homologado", () => {
    const res = consultarComplianceAmbiental("30587162813", "RODRIGO RIBEIRO GONÇALVES");

    expect(res).toBeDefined();
    expect(res.cpfCnpjConsultado).toBe("30587162813");
    expect(res.statusGeral).toBe("CONFORME_ESG_APROVADO");
    expect(res.scoreESG).toBeGreaterThanOrEqual(95);
    expect(res.moratoriaSojaConforme).toBe(true);
    expect(res.trabalhoAnalogoEscravoCGFE).toBe(false);

    // Validação de Imóveis Rurais no SICAR
    expect(res.imoveisRuraisIdentificados.length).toBeGreaterThanOrEqual(2);
    const estanca = res.imoveisRuraisIdentificados.find((i) => i.codigoImovel.includes("ESTANCIA"));
    expect(estanca).toBeDefined();
    expect(estanca?.municipio).toBe("Nova Olímpia");
    expect(estanca?.areaTotalHectares).toBe(850.4);
    expect(estanca?.reservaLegalHectares).toBe(297.6);
    expect(estanca?.condicaoCAR).toBe("ATIVO");
    expect(estanca?.sobreposicaoTerraIndigena).toBe(false);

    // Parecer para Crédito Rural e CPR
    expect(res.parecerConcessaoCreditoRural.aprovadoParaCPR).toBe(true);
    expect(res.parecerConcessaoCreditoRural.limiteMaximoRecomendadoHectares).toBeGreaterThan(1000);
    expect(res.hashAuditoriaSha256).toBeDefined();
  });

  it("deve auditar produtor de grãos dos Parecis sem embargos ambientais", () => {
    const res = consultarComplianceAmbiental("00000001244", "AILTON CESAR ZANATTA");

    expect(res.statusGeral).toBe("CONFORME_ESG_APROVADO");
    expect(res.scoreESG).toBe(95);
    expect(res.imoveisRuraisIdentificados.length).toBe(1);
    expect(res.imoveisRuraisIdentificados[0].municipio).toBe("Campo Novo do Parecis");
    expect(res.embargosIdentificados.length).toBe(0);
    expect(res.parecerConcessaoCreditoRural.aprovadoParaCPR).toBe(true);
  });

  it("deve gerar auditoria preditiva sintética para proponentes urbanos sem imóvel rural", () => {
    const res = consultarComplianceAmbiental("12345678901", "Cliente Urbano");

    expect(res.statusGeral).toBe("CONFORME_ESG_APROVADO");
    expect(res.scoreESG).toBe(88);
    expect(res.embargosIdentificados.length).toBe(0);
    expect(res.parecerConcessaoCreditoRural.aprovadoParaFinanciamentoHabitacional).toBe(true);
  });
});
