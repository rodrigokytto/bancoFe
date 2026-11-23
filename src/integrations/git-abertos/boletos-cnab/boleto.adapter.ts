import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../../types';
import { FebrabanBoletoEngine, BoletoInput } from './febraban.engine';
import { CNAB240Engine, CNABPaymentItem } from './cnab240.parser';
import { IntegrationEventBus } from '../../event-bus';

export class BoletoCnabIntegrationAdapter implements IIntegrationAdapter {
  public id = 'git-boletos-cnab';
  public name = 'Boletos & CNAB FEBRABAN Engine';
  public version = '3.1.0';
  public category = IntegrationCategory.GIT_OPEN_SOURCE;
  public description = 'Emissão e validação de Boletos de Cobrança FEBRABAN, Linha Digitável, Código de Barras e Remessa/Retorno CNAB 240/400.';
  public tags = ['boleto', 'cnab240', 'cnab400', 'febraban', 'clearing', 'cip'];

  public capabilities = [
    {
      name: 'Emitir Boleto Bancário',
      description: 'Gera linha digitável de 47 dígitos, código de barras de 44 dígitos e cálculo de fator de vencimento.',
      action: 'generate_boleto',
    },
    {
      name: 'Gerar Remessa CNAB 240',
      description: 'Cria arquivo padronizado FEBRABAN de pagamentos a fornecedores e folha em lote.',
      action: 'generate_cnab_remessa',
    },
    {
      name: 'Processar Retorno CNAB 240',
      description: 'Lê arquivo de retorno bancário e concilia pagamentos e liquidações.',
      action: 'parse_cnab_retorno',
    },
    {
      name: 'Simular Liquidação de Boleto',
      description: 'Simula pagamento na rede bancária e liquidação em câmara CIP/CIP-SILOC.',
      action: 'simulate_settlement',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[BoletoCnabIntegrationAdapter] Inicializado com sucesso.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 2,
      message: 'Motor FEBRABAN e validador CIP operando normalmente.',
      details: {
        supportedBanks: ['799 BancoFe', '001 BB', '237 Bradesco', '341 Itaú', '033 Santander', '756 Sicoob'],
        cnabVersions: ['CNAB 240 v10.3', 'CNAB 400'],
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'generate_boleto': {
        const dueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        const amountCentavos = payload.amountCentavos || Math.round(Number(payload.amount || 150) * 100);
        
        const input: BoletoInput = {
          bankCode: payload.bankCode || '799',
          dueDate,
          amountCentavos,
          beneficiaryBranch: payload.beneficiaryBranch || '0001',
          beneficiaryAccount: payload.beneficiaryAccount || '0012345',
          beneficiaryDocument: payload.beneficiaryDocument || '12.345.678/0001-90',
          beneficiaryName: payload.beneficiaryName || 'BANCOFE INSTITUICAO DE PAGAMENTO',
          payerName: payload.payerName || 'CLIENTE SACADO LTDA',
          payerDocument: payload.payerDocument || '98.765.432/0001-10',
          ourNumber: payload.ourNumber || `${Date.now()}`.substring(4, 15),
        };

        const result = FebrabanBoletoEngine.generateBoleto(input);
        return {
          success: true,
          ...result,
          input,
        };
      }

      case 'generate_cnab_remessa': {
        const items: CNABPaymentItem[] = payload.items || [
          {
            id: '1',
            favoredName: 'AGRO INSUMOS DO BRASIL LTDA',
            favoredDocument: '11.222.333/0001-44',
            favoredBank: '001',
            favoredBranch: '1234',
            favoredAccount: '998877',
            amountCentavos: 1250000,
            paymentDate: new Date().toISOString().replace(/\D/g, '').substring(0, 8),
            referenceId: 'DOC_AGRO_001',
          },
          {
            id: '2',
            favoredName: 'FERTILIZANTES E SEMENTES UISA',
            favoredDocument: '22.333.444/0001-55',
            favoredBank: '341',
            favoredBranch: '4321',
            favoredAccount: '554433',
            amountCentavos: 890000,
            paymentDate: new Date().toISOString().replace(/\D/g, '').substring(0, 8),
            referenceId: 'DOC_AGRO_002',
          },
        ];

        const remessaContent = CNAB240Engine.generateRemessa240(
          payload.companyName || 'COOPERATIVA BANCOFE AGRO',
          payload.companyDocument || '12.345.678/0001-90',
          items
        );

        return {
          success: true,
          totalItems: items.length,
          totalAmountCentavos: items.reduce((acc, i) => acc + i.amountCentavos, 0),
          fileContent: remessaContent,
        };
      }

      case 'parse_cnab_retorno': {
        if (!payload.fileContent) throw new Error('Campo "fileContent" é obrigatório.');
        const result = CNAB240Engine.parseRetorno240(payload.fileContent);
        return {
          success: true,
          ...result,
        };
      }

      case 'simulate_settlement': {
        const ourNumber = payload.ourNumber || '10900012345';
        const amountCentavos = payload.amountCentavos || 15000;
        const eventBus = IntegrationEventBus.getInstance();

        await eventBus.publish('boleto.settled', this.id, {
          ourNumber,
          amountCentavos,
          settledAt: new Date().toISOString(),
          clearingHouse: 'CIP-SILOC',
        });

        return {
          success: true,
          message: `Boleto nosso número ${ourNumber} liquidado com sucesso na CIP.`,
          ourNumber,
          amountCentavos,
        };
      }

      default:
        throw new Error(`Ação não suportada no BoletoCnabIntegrationAdapter: ${action}`);
    }
  }
}
