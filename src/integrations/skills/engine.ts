import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../types';
import { FinanceProSkillAdapter } from './adapters/finance-pro.skill';
import { AutomationSkillAdapter } from './adapters/automation.skill';
import { OfficeDocumentsSkillAdapter } from './adapters/office-docs.skill';
import { KeyUserSkillAdapter } from './adapters/keyuser.skill';
import { TreasuryAndAnalyticsSkillAdapter } from './adapters/stock-analysis.skill';

export class SkillsEngineIntegrationAdapter implements IIntegrationAdapter {
  public id = 'skill-agent-engine';
  public name = 'Manus Agentic Skills Engine';
  public version = '2.0.0';
  public category = IntegrationCategory.SKILL_AGENT;
  public description = 'Motor de orquestração de Skills de IA para automação bancária: Finance Pro (SAC/PRICE), Automação de Fechamento Diário, Office Docs (Extratos/Comprovantes), Key User Training e Análise de Tesouraria.';
  public tags = ['skills', 'finance-pro', 'automation', 'office-documents', 'keyuser', 'treasury', 'ai-agents'];

  public capabilities = [
    {
      name: 'Simular Amortização SAC / PRICE',
      description: 'Calcula projeção de parcelas, juros acumulados e saldo devedor para financiamento de safra e capital de giro.',
      action: 'calculate_amortization',
    },
    {
      name: 'Executar Diagnóstico Financeiro Corporativo',
      description: 'Avalia índices de liquidez corrente, liquidez seca, dívida líquida/EBITDA e emite parecer de crédito.',
      action: 'analyze_financial_health',
    },
    {
      name: 'Executar Tarefa de Automação / Agendamento',
      description: 'Dispara fechamento diário contábil, varredura de CNAB ou apropriação de rendimento CDI.',
      action: 'run_scheduled_automation',
    },
    {
      name: 'Gerar Extrato Bancário em CSV / Excel',
      description: 'Exporta extrato de conta corrente formatado para importação em ERPs.',
      action: 'generate_statement_export',
    },
    {
      name: 'Gerar Manual do Key User e Plano de Homologação',
      description: 'Cria documentação oficial de treinamento e termo de aceite para homologação de módulos bancários.',
      action: 'generate_keyuser_training',
    },
    {
      name: 'Comparar Rendimento de Renda Fixa e Tesouraria',
      description: 'Simula rentabilidade líquida de CDB, LCA Agro e Tesouro IPCA+ descontando alíquota regressiva de IR.',
      action: 'compare_treasury_investments',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[SkillsEngineIntegrationAdapter] Inicializado com 6 módulos de skills.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 4,
      message: 'Motor de Skills pronto para execução determinística e sintética.',
      details: {
        activeSkills: [
          'finance-pro-playbooks',
          'automation-and-scheduling',
          'office-documents',
          'keyuser-treinamento',
          'stock-analysis',
          'data-analysis',
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'calculate_amortization': {
        const principal = Number(payload.principalBrl || 100000);
        const rate = Number(payload.annualRatePercent || 12.0);
        const months = Number(payload.months || 12);
        const system = (payload.system || 'PRICE').toUpperCase();

        if (system === 'SAC') {
          const result = FinanceProSkillAdapter.calculateSAC(principal, rate, months);
          return { success: true, system: 'SAC', ...result };
        } else {
          const result = FinanceProSkillAdapter.calculatePRICE(principal, rate, months);
          return { success: true, system: 'PRICE', ...result };
        }
      }

      case 'analyze_financial_health': {
        const result = FinanceProSkillAdapter.analyzeFinancialHealth({
          currentAssetsBrl: Number(payload.currentAssetsBrl || 1500000),
          inventoryBrl: Number(payload.inventoryBrl || 400000),
          currentLiabilitiesBrl: Number(payload.currentLiabilitiesBrl || 800000),
          ebitdaBrl: Number(payload.ebitdaBrl || 600000),
          netDebtBrl: Number(payload.netDebtBrl || 500000),
          equityBrl: Number(payload.equityBrl || 2000000),
        });
        return { success: true, ...result };
      }

      case 'run_scheduled_automation': {
        const taskId = payload.taskId || 'task_eod_closing';
        const result = await AutomationSkillAdapter.executeTask(taskId);
        return result;
      }

      case 'generate_statement_export': {
        const mockTransactions = [
          { date: '2026-11-20', description: 'Pix Recebido - Venda de Grãos', category: 'Receita Operacional', type: 'CREDIT' as const, amountBrl: 45000.0, balanceAfterBrl: 184520.50 },
          { date: '2026-11-21', description: 'Boleto Pago - Fornecedor UISA', category: 'Custo de Produção', type: 'DEBIT' as const, amountBrl: 12800.0, balanceAfterBrl: 139520.50 },
          { date: '2026-11-22', description: 'Tarifa Mensal Manutenção de Conta', category: 'Tarifas Bancárias', type: 'DEBIT' as const, amountBrl: 49.90, balanceAfterBrl: 126670.60 },
          { date: '2026-11-23', description: 'Rendimento Aplicação CDB Agro', category: 'Rendimento Financeiro', type: 'CREDIT' as const, amountBrl: 1250.0, balanceAfterBrl: 127920.60 },
        ];

        const csv = OfficeDocumentsSkillAdapter.generateStatementCSV(
          payload.accountNumber || '000100234-5',
          payload.holderName || 'RODRIGO RIBEIRO GONCALVES',
          mockTransactions
        );

        return {
          success: true,
          fileName: `extrato_bancofe_${new Date().toISOString().substring(0, 10)}.csv`,
          csvContent: csv,
          linesCount: mockTransactions.length,
        };
      }

      case 'generate_keyuser_training': {
        const manual = KeyUserSkillAdapter.generateManual(
          payload.moduleName || 'Módulo de Integrações & Pix',
          payload.author || 'Rodrigo Ribeiro Gonçalves'
        );
        return {
          success: true,
          moduleName: payload.moduleName || 'Módulo de Integrações & Pix',
          manualMarkdown: manual,
        };
      }

      case 'compare_treasury_investments': {
        const principal = Number(payload.principalBrl || 100000);
        const termDays = Number(payload.termDays || 365);
        const yields = TreasuryAndAnalyticsSkillAdapter.compareTreasuryYields(principal, termDays);
        return {
          success: true,
          principalBrl: principal,
          termDays,
          comparison: yields,
        };
      }

      default:
        throw new Error(`Ação não suportada no SkillsEngineIntegrationAdapter: ${action}`);
    }
  }
}
