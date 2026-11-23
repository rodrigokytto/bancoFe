import { describe, expect, it } from "vitest";
import { consultarSCRBacen } from "./credito/scr-registrato-analitico.js";

describe("Módulo SCR / Registrato Bacen Analítico BancoFé", () => {
  it("deve consultar histórico SCR com rating regulatório AA e zero prejuízo", () => {
    const res = consultarSCRBacen("30587162813", "RODRIGO RIBEIRO GONÇALVES", 85000);

    expect(res).toBeDefined();
    expect(res.ratingConsolidadoBacen).toBe("AA");
    expect(res.percentualPontualidadeHistorica).toBe(100);
    expect(res.totalPrejuizoSFN).toBe(0);
    expect(res.totalVencidoSFN).toBe(0);
    expect(res.operacoesDetalhadas.length).toBeGreaterThanOrEqual(2);

    const operacaoAgro = res.operacoesDetalhadas.find((op) => op.modalidadeOperacao.includes("Rural"));
    expect(operacaoAgro).toBeDefined();
    expect(operacaoAgro?.instituicaoFinanceira).toContain("Sicredi");
    expect(operacaoAgro?.ratingBacen).toBe("AA");

    // Validação de Chaves PIX no DICT
    expect(res.chavesPixCadastradasDICT.length).toBeGreaterThanOrEqual(3);
    const chaveCpf = res.chavesPixCadastradasDICT.find((c) => c.tipo === "CPF");
    expect(chaveCpf?.chave).toBe("30587162813");

    // Margem livre para novas operações
    expect(res.parecerCapacidadeEndividamento.recomendacaoMesa).toBe("APROVAR_SEM_RESTRICAO");
    expect(res.parecerCapacidadeEndividamento.margemLivreParaNovasOperacoesMensal).toBeGreaterThan(15000);
  });

  it("deve validar perfil executivo com pontualidade 100% e CDC veicular em dia", () => {
    const res = consultarSCRBacen("06988722661", "LUCAS DOS PASSOS SILVA", 28500);

    expect(res.ratingConsolidadoBacen).toBe("AA");
    expect(res.totalPrejuizoSFN).toBe(0);
    expect(res.parecerCapacidadeEndividamento.margemComprometimentoAtualPercentual).toBeLessThan(5);
    expect(res.parecerCapacidadeEndividamento.recomendacaoMesa).toBe("APROVAR_SEM_RESTRICAO");
  });

  it("deve gerar projeção preditiva SCR consistente para novos cadastros", () => {
    const res = consultarSCRBacen("99988877766", "Novo Proponente", 12000);

    expect(res.ratingConsolidadoBacen).toBe("A");
    expect(res.totalVencidoSFN).toBe(0);
    expect(res.totalPrejuizoSFN).toBe(0);
    expect(res.parecerCapacidadeEndividamento.recomendacaoMesa).toBe("APROVAR_SEM_RESTRICAO");
  });
});
