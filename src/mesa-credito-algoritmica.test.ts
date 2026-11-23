import { describe, expect, it } from "vitest";
import { executarAnaliseMesaCredito } from "./credito/mesa-credito-algoritmica.js";

describe("Mesa de Crédito Algorítmica BancoFé", () => {
  it("deve emitir parecer APROVADO_AUTOMATICO com Rating AAA/AA para perfil executivo com alto score", () => {
    const parecer = executarAnaliseMesaCredito({
      cpfCnpj: "30587162813",
      nomeCliente: "RODRIGO RIBEIRO GONÇALVES",
      rendaMensalDeclarada: 85000,
      scoreBureauReferencia: 960,
    });

    expect(parecer).toBeDefined();
    expect(parecer.scoreBancoFe).toBeGreaterThanOrEqual(900);
    expect(["AAA", "AA"]).toContain(parecer.ratingBancoFe);
    expect(parecer.probabilidadeInadimplenciaPD).toBeLessThan(1.0); // Menos de 1% PD
    expect(parecer.decisaoFinal).toBe("SUBMETIDO_COMITE_RISCO"); // Devido ao patrimônio elevado (> R$ 3M), submetido formalmente
    expect(parecer.limiteGlobalPreAprovado).toBeGreaterThanOrEqual(1500000);

    // Limites setoriais
    expect(parecer.limitesPorProduto.financiamentoHabitacionalMaximo).toBeGreaterThan(2000000);
    expect(parecer.limitesPorProduto.creditoRuralCPRMaximo).toBeGreaterThan(2000000);
    expect(parecer.limitesPorProduto.cartaoCreditoBlackMaximo).toBe(127500);

    expect(parecer.taxaJurosMensalRecomendadaPercentual).toBeLessThan(1.0); // Juros VIP
    expect(parecer.fatoresPositivos.length).toBeGreaterThanOrEqual(3);
    expect(parecer.hashDecisaoSha256).toBeDefined();
  });

  it("deve calcular condições e limites consistentes para titular Kytto Tecnologia", () => {
    const parecer = executarAnaliseMesaCredito({
      cpfCnpj: "32285522843",
      nomeCliente: "PATRÍCIA FERRARI PAULINO GONÇALVES",
      rendaMensalDeclarada: 42000,
      scoreBureauReferencia: 940,
    });

    expect(parecer.scoreBancoFe).toBeGreaterThanOrEqual(850);
    expect(["AAA", "AA", "A"]).toContain(parecer.ratingBancoFe);
    expect(parecer.limitesPorProduto.capitalGiroPJMaximo).toBeGreaterThan(250000);
    expect(parecer.limitesPorProduto.homeEquityMaximo).toBeGreaterThan(1000000);
  });

  it("deve enquadrar proposta com score regular exigindo avalista ou garantia real", () => {
    const parecer = executarAnaliseMesaCredito({
      cpfCnpj: "98765432100",
      nomeCliente: "Proponente Score Moderado",
      rendaMensalDeclarada: 5000,
      scoreBureauReferencia: 520,
    });

    expect(["BB", "B", "BBB"]).toContain(parecer.ratingBancoFe);
    expect(parecer.decisaoFinal).toBe("CONDICIONADO_AVALISTA_OU_GARANTIA");
    expect(parecer.condicionantesAprovacao.length).toBeGreaterThan(0);
  });
});
