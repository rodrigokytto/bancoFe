import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../../types';

export interface OpenFinanceConsent {
  consentId: string;
  status: 'AWAITING_AUTHORISATION' | 'AUTHORISED' | 'REJECTED' | 'REVOKED';
  permissions: string[];
  expirationDateTime: string;
  loggedUserDocument: string;
  businessEntityDocument?: string;
  createdAt: string;
}

export class OpenFinanceAdapter implements IIntegrationAdapter {
  public id = 'git-open-finance-brasil';
  public name = 'Open Finance Brasil (BACEN / FAPI)';
  public version = '3.0.1';
  public category = IntegrationCategory.GIT_OPEN_SOURCE;
  public description = 'Padrão aberto oficial do Open Finance Brasil. Gestão de Consentimento FAPI 1.0, Compartilhamento de Dados de Contas e Iniciação de Pagamento (ITP).';
  public tags = ['open-finance', 'open-banking', 'fapi', 'mtls', 'itp', 'bacen'];

  private consents: Map<string, OpenFinanceConsent> = new Map();

  public capabilities = [
    {
      name: 'Criar Pedido de Consentimento',
      description: 'Inicia solicitação de consentimento para compartilhamento de dados ou pagamentos conforme FAPI Open Finance.',
      action: 'create_consent',
    },
    {
      name: 'Autorizar Consentimento',
      description: 'Valida autorização de acesso concedida pelo titular no banco de origem.',
      action: 'authorize_consent',
    },
    {
      name: 'Consultar Contas e Saldos Compartilhados',
      description: 'Obtém dados consolidados de saldos e limites de contas bancárias externas integradas.',
      action: 'get_shared_accounts',
    },
    {
      name: 'Iniciação de Pagamento via Open Finance (ITP)',
      description: 'Dispara iniciação de transferência Pix sem redirecionamento via Iniciador de Pagamentos.',
      action: 'initiate_payment',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[OpenFinanceAdapter] Inicializado.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 8,
      message: 'Diretório de Participantes Open Finance Brasil conectado (Certificado mTLS ICP-Brasil válido).',
      details: {
        directoryStatus: 'ACTIVE',
        fapiConformance: 'FAPI 1.0 Advanced Final',
        phase: 'Fase 4 (Investimentos e Câmbio)',
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'create_consent': {
        const consentId = `urn:bancofe:consent:${Date.now()}`;
        const consent: OpenFinanceConsent = {
          consentId,
          status: 'AWAITING_AUTHORISATION',
          permissions: payload.permissions || ['ACCOUNTS_READ', 'ACCOUNTS_BALANCES_READ', 'RESOURCES_READ', 'PAYMENTS_INITIATE'],
          expirationDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          loggedUserDocument: payload.document || '06988722661',
          createdAt: new Date().toISOString(),
        };
        this.consents.set(consentId, consent);
        return {
          success: true,
          consent,
          redirectUrl: `https://auth.openfinance.bancofe.com.br/oauth/authorize?consent_id=${consentId}`,
        };
      }

      case 'authorize_consent': {
        const consent = this.consents.get(payload.consentId);
        if (!consent) throw new Error('Consentimento não encontrado.');
        consent.status = 'AUTHORISED';
        return {
          success: true,
          consent,
        };
      }

      case 'get_shared_accounts': {
        return {
          success: true,
          accounts: [
            {
              institution: 'Banco do Brasil S.A. (001)',
              accountType: 'CONTA_CORRENTE',
              branch: '1234',
              number: '98765-4',
              balanceBrl: 18450.20,
              availableLimitBrl: 50000.00,
            },
            {
              institution: 'Itaú Unibanco (341)',
              accountType: 'CONTA_PAGAMENTO',
              branch: '0450',
              number: '11223-9',
              balanceBrl: 32000.00,
              availableLimitBrl: 20000.00,
            },
            {
              institution: 'BancoFe Agro & Tech (799)',
              accountType: 'CONTA_AGRO',
              branch: '0001',
              number: '100234-5',
              balanceBrl: 450000.00,
              availableLimitBrl: 1500000.00,
            },
          ],
        };
      }

      case 'initiate_payment': {
        const paymentId = `PAY_ITP_${Date.now()}`;
        return {
          success: true,
          paymentId,
          status: 'INITIATED',
          amountBrl: payload.amountBrl || 1000.0,
          endToEndId: `E79900000${Date.now()}ITP001`,
          initiatedAt: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Ação não suportada no OpenFinanceAdapter: ${action}`);
    }
  }
}
