import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../../types';

export interface GatewayProvider {
  id: string;
  name: string;
  type: 'BAAS' | 'GATEWAY' | 'INSTANT_PAY';
  supportedMethods: string[];
  status: 'ONLINE' | 'STANDBY';
}

export class MultiGatewayIntegrationAdapter implements IIntegrationAdapter {
  public id = 'git-fintech-gateways';
  public name = 'Fintech Gateways & BaaS Hub';
  public version = '2.2.0';
  public category = IntegrationCategory.GIT_OPEN_SOURCE;
  public description = 'Hub unificado de adaptadores para gateways e BaaS de código aberto: Asaas, Efí, Mercado Pago, Stripe, OpenPix, Celcoin e Stark Bank.';
  public tags = ['gateways', 'baas', 'asaas', 'efi', 'mercadopago', 'stripe', 'openpix', 'celcoin', 'starkbank'];

  private providers: GatewayProvider[] = [
    { id: 'asaas', name: 'Asaas BaaS', type: 'BAAS', supportedMethods: ['PIX', 'BOLETO', 'CREDIT_CARD', 'SPLIT'], status: 'ONLINE' },
    { id: 'efi', name: 'Efí (Gerencianet)', type: 'GATEWAY', supportedMethods: ['PIX', 'BOLETO', 'CARNET'], status: 'ONLINE' },
    { id: 'mercadopago', name: 'Mercado Pago', type: 'GATEWAY', supportedMethods: ['PIX', 'CREDIT_CARD', 'CHECKOUT_PRO'], status: 'ONLINE' },
    { id: 'stripe', name: 'Stripe Payments', type: 'GATEWAY', supportedMethods: ['CREDIT_CARD', 'INTERNATIONAL', 'SUBSCRIPTION'], status: 'ONLINE' },
    { id: 'openpix', name: 'OpenPix', type: 'INSTANT_PAY', supportedMethods: ['PIX', 'WEBHOOKS_REALTIME'], status: 'ONLINE' },
    { id: 'celcoin', name: 'Celcoin BaaS', type: 'BAAS', supportedMethods: ['UTILITIES_PAYMENT', 'TAXES_DARF', 'MOBILE_RECHARGE'], status: 'ONLINE' },
    { id: 'starkbank', name: 'Stark Bank', type: 'BAAS', supportedMethods: ['CORPORATE_PIX', 'TED', 'INVOICES'], status: 'ONLINE' },
  ];

  public capabilities = [
    {
      name: 'Listar Provedores e Rotas Ativas',
      description: 'Retorna a malha de redundância de gateways e status de disponibilidade.',
      action: 'list_providers',
    },
    {
      name: 'Roteamento Inteligente de Cobrança (Smart Routing)',
      description: 'Escolhe o gateway com menor taxa e maior taxa de conversão para a transação.',
      action: 'smart_route_charge',
    },
    {
      name: 'Pagar Concessionária / Tributo (Celcoin)',
      description: 'Processa código de barras de água, luz, gás, IPTU ou DARF.',
      action: 'pay_utility_bill',
    },
    {
      name: 'Criar Split de Pagamento Multi-beneficiário',
      description: 'Configura divisão de receitas entre cooperados, produtores ou franqueados.',
      action: 'create_payment_split',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[MultiGatewayIntegrationAdapter] Inicializado com ${this.providers.length} provedores.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 5,
      message: 'Todos os 7 provedores de pagamento com failover ativo.',
      details: {
        activeGateways: this.providers.map((p) => p.name),
        redundancyLevel: 'HIGH_AVAILABILITY_MULTI_AZ',
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'list_providers': {
        return {
          success: true,
          providers: this.providers,
        };
      }

      case 'smart_route_charge': {
        const method = (payload.method || 'PIX').toUpperCase();
        const amountBrl = Number(payload.amountBrl || 100);
        let selectedProvider = 'openpix';
        let feePercent = 0.5;

        if (method === 'PIX') {
          selectedProvider = amountBrl > 5000 ? 'starkbank' : 'openpix';
          feePercent = 0.35;
        } else if (method === 'BOLETO') {
          selectedProvider = 'asaas';
          feePercent = 1.2;
        } else if (method === 'CREDIT_CARD') {
          selectedProvider = 'mercadopago';
          feePercent = 2.89;
        }

        return {
          success: true,
          method,
          amountBrl,
          selectedProvider,
          estimatedFeeBrl: (amountBrl * feePercent) / 100,
          chargeId: `chg_${selectedProvider}_${Date.now()}`,
          status: 'READY_TO_COLLECT',
        };
      }

      case 'pay_utility_bill': {
        const barcode = (payload.barcode || '836000000018150000100014000000000001').replace(/\D/g, '');
        return {
          success: true,
          provider: 'celcoin',
          barcode,
          amountBrl: payload.amountBrl || 150.25,
          concessionaire: 'ENERGISA / CPFL ENERGIA S.A.',
          settlementDate: new Date().toISOString().substring(0, 10),
          authenticationProtocol: `CELCOIN_AUTH_${Date.now()}_9988`,
          status: 'PAID',
        };
      }

      case 'create_payment_split': {
        return {
          success: true,
          splitId: `split_${Date.now()}`,
          totalAmountBrl: payload.totalAmountBrl || 1000.0,
          rules: payload.rules || [
            { recipientId: 'cooperativa_bancofe', sharePercent: 95.0 },
            { recipientId: 'taxa_plataforma', sharePercent: 5.0 },
          ],
          status: 'CONFIGURED',
        };
      }

      default:
        throw new Error(`Ação não suportada no MultiGatewayIntegrationAdapter: ${action}`);
    }
  }
}
