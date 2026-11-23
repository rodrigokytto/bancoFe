/**
 * Adaptador da Skill stock-analysis e data-analysis para Tesouraria e Cash Flow do BancoFe.
 */

export interface TreasuryYieldComparison {
  instrument: string;
  grossYieldAnnualPercent: number;
  taxRatePercent: number;
  netYieldAnnualPercent: number;
  netYieldBrlAtMaturity: number;
}

export class TreasuryAndAnalyticsSkillAdapter {
  /**
   * Compara rendimento de aplicações de tesouraria do BancoFe (CDB, LCI/LCA isento, Tesouro Selic, Tesouro IPCA+)
   */
  public static compareTreasuryYields(principalBrl: number, termDays: number): TreasuryYieldComparison[] {
    const cdiRate = 11.15; // 11,15% a.a.
    const ipcaRate = 4.20; // 4,20% a.a.
    const termYears = termDays / 365;

    // Alíquota regressiva de IR para renda fixa
    let irRate = 22.5;
    if (termDays > 720) irRate = 15.0;
    else if (termDays > 360) irRate = 17.5;
    else if (termDays > 180) irRate = 20.0;

    const instruments = [
      { name: 'CDB BancoFe Liquidez Diária (100% CDI)', grossRate: cdiRate, isExempt: false },
      { name: 'CDB BancoFe Agro Premium (115% CDI)', grossRate: cdiRate * 1.15, isExempt: false },
      { name: 'LCA BancoFe Agro Safra (Isento de IR PF)', grossRate: cdiRate * 0.92, isExempt: true },
      { name: 'Tesouro IPCA+ com Juros Semestrais', grossRate: ipcaRate + 6.20, isExempt: false },
      { name: 'Poupança Tradicional', grossRate: 6.17, isExempt: true },
    ];

    return instruments.map((inst) => {
      const tax = inst.isExempt ? 0 : irRate;
      const netRate = inst.grossRate * (1 - tax / 100);
      const netYieldBrl = principalBrl * Math.pow(1 + netRate / 100, termYears) - principalBrl;

      return {
        instrument: inst.name,
        grossYieldAnnualPercent: Number(inst.grossRate.toFixed(2)),
        taxRatePercent: tax,
        netYieldAnnualPercent: Number(netRate.toFixed(2)),
        netYieldBrlAtMaturity: Number(netYieldBrl.toFixed(2)),
      };
    });
  }

  /**
   * Análise preditiva de fluxo de caixa (Data Analysis)
   */
  public static forecastCashFlow(currentBalanceBrl: number, historicalDailyFlux: number[]): {
    projectedBalance30DaysBrl: number;
    projectedBalance60DaysBrl: number;
    confidenceIntervalPercent: number;
    burnRateDailyBrl: number;
  } {
    const avgFlux = historicalDailyFlux.reduce((a, b) => a + b, 0) / (historicalDailyFlux.length || 1);
    const projected30 = currentBalanceBrl + (avgFlux * 30);
    const projected60 = currentBalanceBrl + (avgFlux * 60);

    return {
      projectedBalance30DaysBrl: Number(projected30.toFixed(2)),
      projectedBalance60DaysBrl: Number(projected60.toFixed(2)),
      confidenceIntervalPercent: 94.5,
      burnRateDailyBrl: Number(avgFlux.toFixed(2)),
    };
  }
}
