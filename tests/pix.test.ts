import { describe, it, expect } from 'vitest';
import { PixBRCodeGenerator } from '../src/integrations/git-abertos/pix/brcode.generator';
import { DictDirectoryAdapter, MedSpecialRefundAdapter } from '../src/integrations/git-abertos/pix/dict.adapter';
import { PixIntegrationAdapter } from '../src/integrations/git-abertos/pix/pix.adapter';

describe('Integração Pix & DICT (BACEN / EMVCo)', () => {
  it('deve gerar payload Pix EMVCo no padrão com CRC16 válido', () => {
    const res = PixBRCodeGenerator.generate({
      pixKey: 'financeiro@bancofe.com.br',
      merchantName: 'BancoFe Pagamentos',
      merchantCity: 'SAO PAULO',
      amount: 150.5,
      txid: 'FATURA2026',
    });

    const payload = res.payload;
    expect(payload).toContain('000201'); // Payload Format Indicator
    expect(payload).toContain('br.gov.bcb.pix'); // GUI Bacen
    expect(payload).toContain('financeiro@bancofe.com.br');
    expect(payload).toContain('SAO PAULO');
    expect(payload).toContain('6304'); // CRC ID + Length 4
    expect(payload.length).toBeGreaterThan(50);
    expect(res.txid).toBe('FATURA2026');
  });

  it('deve formatar valor monetário e sanitizar strings no EMVCo', () => {
    const res = PixBRCodeGenerator.generate({
      pixKey: '+5511999998888',
      merchantName: 'João da Silva & Cia',
      merchantCity: 'Ribeirão Preto',
      amount: 1250.0,
    });

    // Testa remoção de acentos para conformidade EMVCo
    expect(res.payload).toContain('Joao da Silva');
    expect(res.payload).toContain('Ribeirao Preto');
    expect(res.payload).toContain('54071250.00'); // 54 = valor, 07 = tamanho, 1250.00
  });

  it('deve resolver chaves no diretório DICT e detectar tipo de chave', async () => {
    const resolution = await DictDirectoryAdapter.resolveKey('06988722661');

    expect(resolution.type).toBe('CPF');
    expect(resolution.ownerName).toBe('RODRIGO RIBEIRO GONCALVES');
    expect(resolution.bankIspb).toBe('12345678');
  });

  it('deve processar reivindicação e solicitação MED (Mecanismo Especial de Devolução)', async () => {
    const medCase = MedSpecialRefundAdapter.createClaim(
      'E00000799202611221200ABCD1234EF56',
      50000,
      'SUSPECT_FRAUD'
    );

    expect(medCase.id).toContain('MED_');
    expect(medCase.status).toBe('ANALYSIS');
    expect(medCase.reason).toBe('SUSPECT_FRAUD');
    expect(medCase.transactionAmountCentavos).toBe(50000);
  });

  it('deve integrar Pix com o PixIntegrationAdapter', async () => {
    const adapter = new PixIntegrationAdapter();
    const result = await adapter.execute('generate_brcode', {
      pixKey: '11999998888',
      amount: 75.0,
      merchantName: 'BancoFe Agro',
      merchantCity: 'CUIABA',
    });

    expect(result.success).toBe(true);
    expect(result.payload).toBeDefined();
    expect(result.qrCodeData).toBeDefined();
  });
});
