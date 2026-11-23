/**
 * Adaptador da Skill finance-pro-playbooks para o BancoFe.
 * Cálculos corporativos: SAC, PRICE, Capital de Giro, Índices de Liquidez e VPL.
 */

export interface AmortizationScheduleRow {
  month: number;
  paymentBrl: number;
  principalBrl: number;
  interestBrl: number;
  remainingBalanceBrl: number;
}

export class FinanceProSkillAdapter {
  /**
   * Tabela SAC (Sistema de Amortização Constante)
   */
  public static calculateSAC(principalBrl: number, annualRatePercent: number, months: number): {
    rows: AmortizationScheduleRow[];
    totalInterestBrl: number;
    totalPaidBrl: number;
  } {
    const monthlyRate = Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
    const amortization = principalBrl / months;
    let balance = principalBrl;
    const rows: AmortizationScheduleRow[] = [];
    let totalInterest = 0;

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      const payment = amortization + interest;
      balance = Math.max(0, balance - amortization);
      totalInterest += interest;

      rows.push({
        month: m,
        paymentBrl: Number(payment.toFixed(2)),
        principalBrl: Number(amortization.toFixed(2)),
        interestBrl: Number(interest.toFixed(2)),
        remainingBalanceBrl: Number(balance.toFixed(2)),
      });
    }

    return {
      rows,
      totalInterestBrl: Number(totalInterest.toFixed(2)),
      totalPaidBrl: Number((principalBrl + totalInterest).toFixed(2)),
    };
  }

  /**
   * Tabela PRICE (Sistema Francês de Amortização - Parcelas Fixas)
   */
  public static calculatePRICE(principalBrl: number, annualRatePercent: number, months: number): {
    rows: AmortizationScheduleRow[];
    fixedPaymentBrl: number;
    totalInterestBrl: number;
    totalPaidBrl: number;
  } {
    const monthlyRate = Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
    const fixedPayment = (principalBrl * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
    let balance = principalBrl;
    const rows: AmortizationScheduleRow[] = [];
    let totalInterest = 0;

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      const amortization = fixedPayment - interest;
      balance = Math.max(0, balance - amortization);
      totalInterest += interest;

      rows.push({
        month: m,
        paymentBrl: Number(fixedPayment.toFixed(2)),
        principalBrl: Number(amortization.toFixed(2)),
        interestBrl: Number(interest.toFixed(2)),
        remainingBalanceBrl: Number(balance.toFixed(2)),
      });
    }

    return {
      rows,
      fixedPaymentBrl: Number(fixedPayment.toFixed(2)),
      totalInterestBrl: Number(totalInterest.toFixed(2)),
      totalPaidBrl: Number((fixedPayment * months).toFixed(2)),
    };
  }

  /**
   * Diagnóstico de Liquidez e Indicadores Financeiros da Empresa / Cooperativa
   */
  public static analyzeFinancialHealth(data: {
    currentAssetsBrl: number; // Ativo Circulante
    inventoryBrl: number;     // Estoques
    currentLiabilitiesBrl: number; // Passivo Circulante
    ebitdaBrl: number;
    netDebtBrl: number;
    equityBrl: number;
  }): {
    currentLiquidity: number; // Liquidez Corrente
    quickLiquidity: number;   // Liquidez Seca
    debtToEbitda: number;     // Alavancagem Dívida Líquida / EBITDA
    status: 'EXCELLENT' | 'STABLE' | 'ATTENTION' | 'CRITICAL';
    recommendation: string;
  } {
    const currentLiquidity = Number((data.currentAssetsBrl / data.currentLiabilitiesBrl).toFixed(2));
    const quickLiquidity = Number(((data.currentAssetsBrl - data.inventoryBrl) / data.currentLiabilitiesBrl).toFixed(2));
    const debtToEbitda = Number((data.netDebtBrl / (data.ebitdaBrl || 1)).toFixed(2));

    let status: 'EXCELLENT' | 'STABLE' | 'ATTENTION' | 'CRITICAL' = 'STABLE';
    let recommendation = 'Capacidade de pagamento equilibrada para operações de crédito padrão.';

    if (currentLiquidity > 1.8 && debtToEbitda < 1.5) {
      status = 'EXCELLENT';
      recommendation = 'Empresa com excelente liquidez e baixa alavancagem. Elegível a taxas Prime do BancoFe.';
    } else if (currentLiquidity < 1.0 || debtToEbitda > 3.5) {
      status = 'CRITICAL';
      recommendation = 'Alerta de capital de giro insuficiente ou endividamento elevado. Requer garantia real (penhor/CPR).';
    } else if (currentLiquidity < 1.2) {
      status = 'ATTENTION';
      recommendation = 'Margem de segurança reduzida no curto prazo. Sugere-se alongamento de passivos.';
    }

    return {
      currentLiquidity,
      quickLiquidity,
      debtToEbitda,
      status,
      recommendation,
    };
  }
}
