import { describe, it, expect } from 'vitest';
import { SkillsEngineIntegrationAdapter } from '../src/integrations/skills/engine';
import { FinanceProSkillAdapter } from '../src/integrations/skills/adapters/finance-pro.skill';

describe('Integração de Skills de IA Bancárias', () => {
  it('deve orquestrar e registrar todas as capabilities especializadas', () => {
    const adapter = new SkillsEngineIntegrationAdapter();
    expect(adapter.capabilities.length).toBeGreaterThanOrEqual(6);

    const actionNames = adapter.capabilities.map((c) => c.action);
    expect(actionNames).toContain('calculate_amortization');
    expect(actionNames).toContain('analyze_financial_health');
    expect(actionNames).toContain('run_scheduled_automation');
    expect(actionNames).toContain('generate_statement_export');
    expect(actionNames).toContain('generate_keyuser_training');
  });

  it('deve executar a skill de finanças e gerar amortização SAC vs PRICE', async () => {
    const adapter = new SkillsEngineIntegrationAdapter();
    const result = await adapter.execute('calculate_amortization', {
      principalBrl: 50000,
      annualRatePercent: 14.5,
      months: 24,
      system: 'SAC',
    });

    expect(result.success).toBe(true);
    expect(result.system).toBe('SAC');
    expect(result.rows.length).toBe(24);
    expect(result.totalInterestBrl).toBeGreaterThan(0);
  });

  it('deve gerar extrato CSV formatado via skill Office', async () => {
    const adapter = new SkillsEngineIntegrationAdapter();
    const result = await adapter.execute('generate_statement_export', {
      accountNumber: '100234-5',
      holderName: 'RODRIGO RIBEIRO GONCALVES',
    });

    expect(result.success).toBe(true);
    expect(result.csvContent).toContain('Data;Historico;Categoria;Tipo;Valor (R$);Saldo (R$)');
    expect(result.csvContent).toContain('Pix Recebido');
    expect(result.linesCount).toBe(4);
  });

  it('deve gerar manual de treinamento e plano de homologação de Key User', async () => {
    const adapter = new SkillsEngineIntegrationAdapter();
    const result = await adapter.execute('generate_keyuser_training', {
      moduleName: 'Pix & DICT Operacional',
      author: 'Rodrigo Ribeiro Gonçalves',
    });

    expect(result.success).toBe(true);
    expect(result.manualMarkdown).toContain('MANUAL DO KEY USER');
    expect(result.manualMarkdown).toContain('PLANO DE TESTES DE HOMOLOGAÇÃO');
    expect(result.manualMarkdown).toContain('TERMO DE ACEITE E HOMOLOGAÇÃO');
  });

  it('deve calcular índices financeiros corporativos', () => {
    const health = FinanceProSkillAdapter.analyzeFinancialHealth({
      currentAssetsBrl: 2000000,
      inventoryBrl: 500000,
      currentLiabilitiesBrl: 1000000,
      ebitdaBrl: 800000,
      netDebtBrl: 600000,
      equityBrl: 2500000,
    });

    expect(health.currentLiquidity).toBe(2.0); // 2.000.000 / 1.000.000
    expect(health.quickLiquidity).toBe(1.5);   // (2.000.000 - 500.000) / 1.000.000
    expect(health.status).toBe('EXCELLENT');
  });
});
