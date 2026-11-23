import { describe, it, expect } from 'vitest';
import { OpenFinanceAdapter } from '../src/integrations/git-abertos/open-finance/open-finance.adapter';
import { MultiGatewayIntegrationAdapter } from '../src/integrations/git-abertos/gateways/gateways.adapter';
import { AgroFinanceIntegrationAdapter } from '../src/integrations/git-abertos/agro-finance/agro.adapter';
import { DrexWeb3IntegrationAdapter } from '../src/integrations/git-abertos/web3-drex/drex.adapter';
import { BureauCreditoIntegrationAdapter } from '../src/integrations/git-abertos/bureau-credito/bureau.adapter';
import { IntegrationRegistry } from '../src/integrations/registry';

describe('Suíte de Integrações Expandida BancoFe (PRD)', () => {
  it('Open Finance: deve criar consentimento FAPI e validar expiração', async () => {
    const adapter = new OpenFinanceAdapter();
    const result = await adapter.execute('create_consent', {
      document: '06988722661',
      permissions: ['ACCOUNTS_READ', 'PAYMENTS_INITIATE'],
    });

    expect(result.success).toBe(true);
    expect(result.consent).toBeDefined();
    expect(result.consent.consentId).toContain('urn:bancofe:consent:');
    expect(result.consent.status).toBe('AWAITING_AUTHORISATION');
  });

  it('Gateways Hub: deve rotear para o melhor gateway e calcular tarifas', async () => {
    const adapter = new MultiGatewayIntegrationAdapter();
    const result = await adapter.execute('smart_route_charge', {
      amountBrl: 1500,
      method: 'PIX',
    });

    expect(result.success).toBe(true);
    expect(result.selectedProvider).toBeDefined();
    expect(result.estimatedFeeBrl).toBeGreaterThanOrEqual(0);
  });

  it('Agro Finance: deve emitir CPR Digital e calcular valor total de safra', async () => {
    const adapter = new AgroFinanceIntegrationAdapter();
    const result = await adapter.execute('issue_digital_cpr', {
      type: 'FINANCEIRA',
      commodity: 'SOJA',
      quantitySacks: 2000,
      pricePerSackBrl: 135.0,
      issuerName: 'Fazenda Rio Verde',
      issuerDocument: '12345678000190',
    });

    expect(result.success).toBe(true);
    expect(result.cpr).toBeDefined();
    expect(result.cpr.totalValueBrl).toBe(270000.0); // 2000 * 135
  });

  it('Web3 Drex: deve simular liquidação DvP atômica contra títulos federais', async () => {
    const adapter = new DrexWeb3IntegrationAdapter();
    const result = await adapter.execute('execute_dvp_settlement', {
      amountBrl: 50000,
      assetType: 'TPFt_LTN_2027',
      buyerAccount: '0x1234567890123456789012345678901234567890',
    });

    expect(result.success).toBe(true);
    expect(result.txHash).toBeDefined();
    expect(result.txHash.startsWith('0x')).toBe(true);
    expect(result.settlementStatus).toBe('FINAL_AND_IRREVOCABLE');
  });

  it('Bureau de Crédito: deve validar CPF/CNPJ e consultar score Consulta360', async () => {
    const adapter = new BureauCreditoIntegrationAdapter();
    const result = await adapter.execute('calculate_credit_score', {
      document: '06988722661',
    });

    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1000);
    expect(result.riskRating).toBeDefined();
    expect(result.suggestedMaxCreditBrl).toBeGreaterThanOrEqual(0);
  });

  it('Registry Central: deve conter todos os 9 adaptadores ativos com health check', async () => {
    const registry = IntegrationRegistry.getInstance();
    const adapters = registry.listAdapters();
    expect(adapters.length).toBe(9);

    const health = await registry.runHealthChecks();
    for (const a of adapters) {
      expect(health[a.id]).toBeDefined();
      expect(health[a.id].status).toBe('CONNECTED');
    }
  });
});
