/**
 * Motor de Cálculo FEBRABAN para Boletos Bancários e Código de Barras.
 * Em conformidade com o layout oficial da FEBRABAN e Banco Central do Brasil.
 */

export interface BoletoInput {
  bankCode: string; // Ex: '799' (BancoFe), '001' (BB), '237' (Bradesco), '341' (Itaú), '033' (Santander)
  currencyCode?: string; // Padrão '9' (Real BRL)
  dueDate: Date; // Data de vencimento
  amountCentavos: number; // Valor em centavos
  beneficiaryBranch: string; // Agência (4 dígitos)
  beneficiaryAccount: string; // Conta (5 a 7 dígitos)
  beneficiaryDocument: string; // CPF ou CNPJ
  beneficiaryName: string;
  payerName: string;
  payerDocument: string;
  ourNumber: string; // Nosso Número
}

export class FebrabanBoletoEngine {
  /**
   * Cálculo de Módulo 10 (pesos alternados 2 e 1 da direita para a esquerda)
   */
  public static modulo10(input: string): number {
    let sum = 0;
    let weight = 2;

    for (let i = input.length - 1; i >= 0; i--) {
      let product = parseInt(input[i], 10) * weight;
      if (product > 9) {
        product = Math.floor(product / 10) + (product % 10);
      }
      sum += product;
      weight = weight === 2 ? 1 : 2;
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Cálculo de Módulo 11 (pesos de 2 a 9 da direita para a esquerda)
   */
  public static modulo11(input: string, base: number = 9): number {
    let sum = 0;
    let weight = 2;

    for (let i = input.length - 1; i >= 0; i--) {
      sum += parseInt(input[i], 10) * weight;
      weight = weight === base ? 2 : weight + 1;
    }

    const remainder = sum % 11;
    const dv = 11 - remainder;

    // Regra FEBRABAN para código de barras: se DV for 0, 10 ou 11 -> DV é 1
    if (dv === 0 || dv === 10 || dv === 11) {
      return 1;
    }
    return dv;
  }

  /**
   * Fator de Vencimento FEBRABAN: dias decorridos desde a data base.
   * Data base original: 07/10/1997.
   * A partir de 22/02/2025, entrou em vigor o novo ciclo do fator de vencimento.
   */
  public static calculateDueFactor(date: Date): string {
    const baseDate = new Date('1997-10-07T00:00:00Z');
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const diffTime = targetDate.getTime() - baseDate.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Ajuste de ciclo após atingir 9999 (ocorrido em 21/02/2025)
    if (diffDays >= 10000) {
      diffDays = (diffDays - 10000) + 1000;
    }

    return diffDays.toString().padStart(4, '0');
  }

  /**
   * Gera o Código de Barras (44 dígitos) e a Linha Digitável (47 dígitos) formatada
   */
  public static generateBoleto(input: BoletoInput): {
    barcode: string;
    digitableLine: string;
    formattedDigitableLine: string;
    dueFactor: string;
    amountFormatted: string;
    ourNumber: string;
  } {
    const bank = input.bankCode.padStart(3, '0');
    const currency = (input.currencyCode || '9').substring(0, 1);
    const dueFactor = this.calculateDueFactor(input.dueDate);
    const amountStr = input.amountCentavos.toString().padStart(10, '0');
    const branch = input.beneficiaryBranch.replace(/\D/g, '').padStart(4, '0');
    const account = input.beneficiaryAccount.replace(/\D/g, '').padStart(7, '0');
    const ourNumber = input.ourNumber.replace(/\D/g, '').padStart(11, '0');

    // Campo Livre (25 posições)
    // Modelo padrão BancoFe: Agência (4) + Conta (7) + Carteira (3: '109') + Nosso Número (11)
    const freeField = `${branch}${account}109${ourNumber}`;

    // Monta os 43 dígitos para calcular o DV geral do código de barras
    // Posições: 01-03 (Banco), 04 (Moeda), 06-09 (Fator Venc), 10-19 (Valor), 20-44 (Campo Livre)
    const barcodeWithoutDV = `${bank}${currency}${dueFactor}${amountStr}${freeField}`;
    const generalDV = this.modulo11(barcodeWithoutDV);

    // Código de barras completo (44 posições) com o DV na posição 5
    const barcode = `${bank}${currency}${generalDV}${dueFactor}${amountStr}${freeField}`;

    // Montagem da Linha Digitável (3 campos com DV módulo 10 + 1 campo DV geral + 1 campo fator e valor)
    // Campo 1: Banco (3) + Moeda (1) + 5 primeiros dígitos do campo livre + DV1
    const field1Data = `${bank}${currency}${freeField.substring(0, 5)}`;
    const dv1 = this.modulo10(field1Data);
    const field1 = `${field1Data}${dv1}`;

    // Campo 2: Posições 6 a 15 do campo livre + DV2
    const field2Data = freeField.substring(5, 15);
    const dv2 = this.modulo10(field2Data);
    const field2 = `${field2Data}${dv2}`;

    // Campo 3: Posições 16 a 25 do campo livre + DV3
    const field3Data = freeField.substring(15, 25);
    const dv3 = this.modulo10(field3Data);
    const field3 = `${field3Data}${dv3}`;

    // Campo 4: DV Geral do Código de Barras
    const field4 = `${generalDV}`;

    // Campo 5: Fator de Vencimento (4) + Valor (10)
    const field5 = `${dueFactor}${amountStr}`;

    const digitableLine = `${field1}${field2}${field3}${field4}${field5}`;

    // Formatação visual clássica: 00000.00000 00000.000000 00000.000000 0 00000000000000
    const formattedDigitableLine = `${field1.substring(0, 5)}.${field1.substring(5, 10)} ${field2.substring(0, 5)}.${field2.substring(5, 11)} ${field3.substring(0, 5)}.${field3.substring(5, 11)} ${field4} ${field5}`;

    const amountFormatted = (input.amountCentavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return {
      barcode,
      digitableLine,
      formattedDigitableLine,
      dueFactor,
      amountFormatted,
      ourNumber,
    };
  }
}
