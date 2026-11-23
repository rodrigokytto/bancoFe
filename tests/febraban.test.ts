import { describe, it, expect } from 'vitest';
import { FebrabanBoletoEngine } from '../src/integrations/git-abertos/boletos-cnab/febraban.engine';
import { CNAB240Engine } from '../src/integrations/git-abertos/boletos-cnab/cnab240.parser';
import { BoletoCnabIntegrationAdapter } from '../src/integrations/git-abertos/boletos-cnab/boleto.adapter';

describe('Integração FEBRABAN Boletos & CNAB 240', () => {
  it('deve calcular fator de vencimento FEBRABAN corretamente', () => {
    const testDate = new Date('2026-12-31T12:00:00Z');
    const factor = FebrabanBoletoEngine.calculateDueFactor(testDate);
    expect(factor.length).toBe(4);
    expect(parseInt(factor)).toBeGreaterThan(1000);
  });

  it('deve gerar código de barras de 44 dígitos e linha digitável de 47 dígitos', () => {
    const boleto = FebrabanBoletoEngine.generateBoleto({
      bankCode: '799',
      beneficiaryBranch: '0001',
      beneficiaryAccount: '1234567',
      beneficiaryDocument: '12.345.678/0001-90',
      beneficiaryName: 'BancoFe S.A.',
      payerName: 'Produtor Teste',
      payerDocument: '000.000.000-00',
      ourNumber: '00000001',
      amountCentavos: 250000, // R$ 2.500,00
      dueDate: new Date('2026-12-15T00:00:00Z'),
    });

    expect(boleto.barcode.length).toBe(44);
    expect(boleto.digitableLine.replace(/[\.\s]/g, '').length).toBe(47);
    expect(boleto.barcode.startsWith('7999')).toBe(true); // Banco 799, moeda 9 (Real)
  });

  it('deve validar e calcular dígitos verificadores Modulo 10 e Modulo 11', () => {
    const dv10 = FebrabanBoletoEngine.modulo10('001900000');
    expect(dv10).toBeGreaterThanOrEqual(0);
    expect(dv10).toBeLessThanOrEqual(9);

    const dv11 = FebrabanBoletoEngine.modulo11('0019000000000000000000000000000000000000000');
    expect(dv11).toBeGreaterThanOrEqual(1);
    expect(dv11).toBeLessThanOrEqual(9);
  });

  it('deve gerar arquivos CNAB 240 com cabeçalho de 240 posições fixas', () => {
    const remessa = CNAB240Engine.generateRemessa240(
      'Agropecuaria Futuro Ltda',
      '12345678000195',
      [
        {
          id: '1',
          favoredName: 'Fornecedor Fertilizantes',
          favoredDocument: '98765432000111',
          favoredBank: '001',
          favoredBranch: '0001',
          favoredAccount: '123456',
          amountCentavos: 150000,
          paymentDate: '20261220',
          referenceId: 'DOC001',
        },
      ]
    );

    const lines = remessa.split(/\r?\n/).filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(4);

    for (const line of lines) {
      expect(line.length).toBe(240);
    }

    expect(lines[0].substring(0, 3)).toBe('799'); // Código do banco
  });

  it('deve integrar emissão de boletos com o BoletoCnabIntegrationAdapter', async () => {
    const adapter = new BoletoCnabIntegrationAdapter();
    const res = await adapter.execute('generate_boleto', {
      payerName: 'Produtor Rural João Silva',
      payerDocument: '12345678901',
      amountCentavos: 350000,
      dueDate: '2026-11-30',
    });

    expect(res.success).toBe(true);
    expect(res.barcode).toBeDefined();
    expect(res.digitableLine).toBeDefined();
  });
});
