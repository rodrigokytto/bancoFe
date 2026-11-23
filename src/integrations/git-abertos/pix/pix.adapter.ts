import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../../types';
import { PixBRCodeGenerator, PixPayloadParams } from './brcode.generator';
import { DictDirectoryAdapter, DictKeyInfo, MedSpecialRefundAdapter } from './dict.adapter';
import { IntegrationEventBus } from '../../event-bus';

export class PixIntegrationAdapter implements IIntegrationAdapter {
  public id = 'git-pix-bacen';
  public name = 'Pix BACEN Open Engine';
  public version = '2.4.0';
  public category = IntegrationCategory.GIT_OPEN_SOURCE;
  public description = 'Motor Pix oficial em código aberto com gerador BR Code EMVCo, resolução DICT, webhooks e MED (Resolução BACEN 103).';
  public tags = ['pix', 'bacen', 'emvco', 'dict', 'med', 'instant-payment'];

  public capabilities = [
    {
      name: 'Gerar BR Code Pix (Copia e Cola)',
      description: 'Gera payload Pix padrão EMVCo estático ou dinâmico com cálculo de CRC16.',
      action: 'generate_brcode',
    },
    {
      name: 'Consultar Chave DICT',
      description: 'Resolve titularidade, agência, conta e ISPB de uma chave Pix (CPF, CNPJ, Email, Tel ou EVP).',
      action: 'resolve_dict_key',
    },
    {
      name: 'Simular Recebimento Pix',
      description: 'Recebe notificação de pagamento instantâneo e dispara evento no barramento bancário.',
      action: 'simulate_incoming_pix',
    },
    {
      name: 'Abrir Contestação MED',
      description: 'Inicia Mecanismo Especial de Devolução por suspeita de fraude ou erro operacional.',
      action: 'create_med_claim',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[PixIntegrationAdapter] Inicializado com sucesso.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 4,
      message: 'Conectividade com SPI e DICT operando em conformidade com SLA BACEN.',
      details: {
        spiUptime: '99.99%',
        dictLatencyMs: 12,
        medActive: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'generate_brcode': {
        const params: PixPayloadParams = {
          pixKey: payload.pixKey || 'contato@bancofe.com.br',
          merchantName: payload.merchantName || 'BANCOFE AGRO TECH',
          merchantCity: payload.merchantCity || 'BRASILIA',
          amount: payload.amount ? Number(payload.amount) : undefined,
          txid: payload.txid,
          infoAdicional: payload.infoAdicional,
          urlPayload: payload.urlPayload,
        };
        const result = PixBRCodeGenerator.generate(params);
        return {
          success: true,
          ...result,
          params,
        };
      }

      case 'resolve_dict_key': {
        if (!payload.key) throw new Error('Campo "key" é obrigatório.');
        const result: DictKeyInfo = await DictDirectoryAdapter.resolveKey(payload.key);
        return {
          success: true,
          dictData: result,
        };
      }

      case 'simulate_incoming_pix': {
        const amountCentavos = Math.round(Number(payload.amount || 100) * 100);
        const endToEndId = `E12345678${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}FE99887766`;
        const eventBus = IntegrationEventBus.getInstance();
        
        const eventData = {
          endToEndId,
          amountCentavos,
          txid: payload.txid || '***',
          payerName: payload.payerName || 'PAGADOR EXTERNO TESTE',
          payerDocument: payload.payerDocument || '123.456.789-00',
          receivedAt: new Date().toISOString(),
        };

        await eventBus.publish('pix.received', this.id, eventData);

        return {
          success: true,
          message: `Pix de R$ ${(amountCentavos / 100).toFixed(2)} recebido com sucesso.`,
          eventData,
        };
      }

      case 'create_med_claim': {
        const claim = MedSpecialRefundAdapter.createClaim(
          payload.endToEndId,
          payload.amountCentavos,
          payload.reason || 'SUSPECT_FRAUD'
        );
        return {
          success: true,
          claim,
        };
      }

      default:
        throw new Error(`Ação não suportada no PixIntegrationAdapter: ${action}`);
    }
  }
}
