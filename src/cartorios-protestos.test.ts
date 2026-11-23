import { describe, expect, it } from "vitest";
import { consultarCartoriosEProtestos } from "./credito/cartorios-protestos-onr.js";

describe("Módulo Central de Protestos (IEPTB) & Matrículas ONR BancoFé", () => {
  it("deve confirmar certidão negativa de protestos nacional e localizar matrículas urbanas e rurais", () => {
    const res = consultarCartoriosEProtestos("30587162813", "RODRIGO RIBEIRO GONÇALVES");

    expect(res).toBeDefined();
    expect(res.certidaoNegativaProtestosNacional).toBe(true);
    expect(res.totalProtestosAtivos).toBe(0);
    expect(res.valorTotalProtestado).toBe(0);

    // Matrículas Registradas
    expect(res.matriculasLocalizadas.length).toBeGreaterThanOrEqual(2);

    const matriculaRural = res.matriculasLocalizadas.find((m) => m.tipoImovel === "Fazenda / Imóvel Rural");
    expect(matriculaRural).toBeDefined();
    expect(matriculaRural?.cartorioRegistroImoveis).toContain("Nova Olímpia");
    expect(matriculaRural?.valorAvaliacaoMercado).toBeGreaterThanOrEqual(10000000);
    expect(matriculaRural?.onusEGravames[0].tipoGravame).toContain("Desimpedido");

    // Elegibilidade para Home Equity e Garantias Reais
    expect(res.patrimonioDesimpedidoParaGarantia).toBeGreaterThan(10000000);
    expect(res.parecerGarantiasReais.elegivelParaHomeEquity).toBe(true);
    expect(res.parecerGarantiasReais.elegivelParaCreditoRuralComGarantia).toBe(true);
    expect(res.parecerGarantiasReais.ltvMaximoRecomendadoPercentual).toBe(60);
  });

  it("deve verificar patrimônio comercial desimpedido da Kytto Tecnologia", () => {
    const res = consultarCartoriosEProtestos("32285522843", "PATRÍCIA FERRARI PAULINO GONÇALVES");

    expect(res.certidaoNegativaProtestosNacional).toBe(true);
    expect(res.totalProtestosAtivos).toBe(0);
    expect(res.matriculasLocalizadas.length).toBeGreaterThanOrEqual(1);

    const comercial = res.matriculasLocalizadas.find((m) => m.tipoImovel === "Comercial Urbano");
    expect(comercial?.municipio).toBe("Mirante do Paranapanema");
    expect(res.parecerGarantiasReais.elegivelParaHomeEquity).toBe(true);
  });
});
