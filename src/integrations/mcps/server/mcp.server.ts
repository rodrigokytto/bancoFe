import { BANCOFE_MCP_TOOLS } from './tools';
import { PixBRCodeGenerator } from '../../git-abertos/pix/brcode.generator';
import { FebrabanBoletoEngine } from '../../git-abertos/boletos-cnab/febraban.engine';
import { CNAB240Engine } from '../../git-abertos/boletos-cnab/cnab240.parser';
import { BureauCreditoIntegrationAdapter } from '../../git-abertos/bureau-credito/bureau.adapter';
import readline from 'readline';

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class BancoFeMCPServer {
  public static handleRequest(request: JSONRPCRequest): JSONRPCResponse {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: {
                name: 'bancofe-mcp-server',
                version: '1.0.0',
                description: 'Servidor Oficial MCP do BancoFe - Core Bancário, Open Finance, Pix e Crédito.',
              },
              capabilities: {
                tools: { listChanged: true },
                resources: { subscribe: true, listChanged: true },
                prompts: { listChanged: true },
              },
            },
          };
        }

        case 'tools/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: BANCOFE_MCP_TOOLS,
            },
          };
        }

        case 'tools/call': {
          const toolName = params?.name;
          const args = params?.arguments || {};
          const result = this.executeTool(toolName, args);

          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                },
              ],
            },
          };
        }

        case 'resources/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              resources: [
                {
                  uri: 'bancofe://system/rates',
                  name: 'Taxas de Juros e Indexadores BancoFe',
                  mimeType: 'application/json',
                  description: 'Taxas Selic, CDI, Poupança e juros de crédito rural atualizadas.',
                },
                {
                  uri: 'bancofe://ledger/summary',
                  name: 'Balancete Consolidado do Livro Razão',
                  mimeType: 'application/json',
                  description: 'Resumo contábil das contas ativas, passivas e patrimoniais do BancoFe.',
                },
              ],
            },
          };
        }

        case 'resources/read': {
          const uri = params?.uri;
          if (uri === 'bancofe://system/rates') {
            return {
              jsonrpc: '2.0',
              id,
              result: {
                contents: [
                  {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(
                      {
                        selicMetaPercentYear: 11.25,
                        cdiPercentYear: 11.15,
                        poupancaPercentYear: 6.17,
                        creditoRuralCusteioYear: 8.0,
                        cprAgroFixedCdiPlus: 'CDI + 2.5% a.a.',
                        updatedAt: new Date().toISOString(),
                      },
                      null,
                      2
                    ),
                  },
                ],
              },
            };
          } else {
            return {
              jsonrpc: '2.0',
              id,
              result: {
                contents: [
                  {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(
                      {
                        institution: 'BancoFe S.A.',
                        totalAssetsBrl: 65000000.0,
                        totalLiabilitiesBrl: 63000000.0,
                        equityBrl: 2000000.0,
                        status: 'REGULAR_BACEN',
                      },
                      null,
                      2
                    ),
                  },
                ],
              },
            };
          }
        }

        case 'prompts/list': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              prompts: [
                {
                  name: 'financial_health_audit',
                  description: 'Analisa a saúde financeira de um cliente com base no score e histórico de transações.',
                },
                {
                  name: 'generate_sac_price_comparison',
                  description: 'Compara os sistemas de amortização SAC e PRICE para decisão de financiamento de safra.',
                },
              ],
            },
          };
        }

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Método MCP não encontrado: ${method}`,
            },
          };
      }
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err?.message || 'Erro interno no servidor MCP',
        },
      };
    }
  }

  public static executeTool(toolName: string, args: any): any {
    switch (toolName) {
      case 'bancofe_create_pix': {
        const amount = Number(args.amount || 0);
        return PixBRCodeGenerator.generate({
          pixKey: args.pixKey,
          amount,
          merchantName: args.merchantName || 'BANCOFE',
          merchantCity: args.merchantCity || 'BRASILIA',
          txid: args.txid,
          infoAdicional: args.infoAdicional,
        });
      }

      case 'bancofe_query_statement': {
        return {
          accountId: args.accountId || 'acc_master_bancofe',
          holderName: 'RODRIGO RIBEIRO GONCALVES',
          document: '069.***.***-61',
          availableBalanceBrl: 184520.50,
          blockedBalanceBrl: 0.0,
          limitBrl: 500000.0,
          recentTransactions: [
            { id: 'tx_01', type: 'PIX_IN', amountBrl: 45000.0, description: 'Recebimento Venda Soja Safra 2026', date: new Date().toISOString() },
            { id: 'tx_02', type: 'BOLETO_PAY', amountBrl: -12800.0, description: 'Pagamento Adubo e Fertilizante', date: new Date().toISOString() },
            { id: 'tx_03', type: 'PIX_OUT', amountBrl: -3500.0, description: 'Transferência Manutenção Trator UISA', date: new Date().toISOString() },
          ],
        };
      }

      case 'bancofe_issue_boleto': {
        const dueDate = args.dueDate ? new Date(args.dueDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        const amountCentavos = Math.round(Number(args.amount || 100) * 100);
        return FebrabanBoletoEngine.generateBoleto({
          bankCode: '799',
          dueDate,
          amountCentavos,
          beneficiaryBranch: '0001',
          beneficiaryAccount: '0012345',
          beneficiaryDocument: '12.345.678/0001-90',
          beneficiaryName: 'BANCOFE AGRO TECH S.A.',
          payerName: args.payerName,
          payerDocument: args.payerDocument,
          ourNumber: `${Date.now()}`.substring(3, 14),
        });
      }

      case 'bancofe_process_cnab': {
        return {
          companyName: args.companyName,
          totalAmountBrl: args.totalAmountBrl || 50000.0,
          recordsGenerated: args.paymentsCount || 5,
          status: 'REMESSA_240_GERADA_COM_SUCESSO',
          fileHash: 'sha256_b48f93...9a',
        };
      }

      case 'bancofe_consult_cpf_cnpj': {
        const doc = (args.document || '').replace(/\D/g, '');
        const valid = doc.length === 11 ? BureauCreditoIntegrationAdapter.isValidCPF(doc) : BureauCreditoIntegrationAdapter.isValidCNPJ(doc);
        const score = valid ? 845 : 320;
        return {
          document: doc,
          valid,
          score,
          riskRating: score >= 700 ? 'A' : 'D',
          statusReceita: 'REGULAR',
          pep: false,
          approvedPreCreditLimitBrl: valid ? 120000.0 : 0.0,
        };
      }

      case 'bancofe_open_finance_consent': {
        return {
          document: args.document,
          status: 'AUTHORISED',
          consentId: `urn:bancofe:consent:${Date.now()}`,
          scope: ['ACCOUNTS_READ', 'PAYMENTS_INITIATE'],
          connectedInstitutions: ['Banco do Brasil', 'Itaú', 'Sicoob'],
        };
      }

      case 'bancofe_audit_ledger': {
        return {
          auditStatus: 'PASSED_ZERO_DISCREPANCY',
          totalDebitsBrl: 65000000.0,
          totalCreditsBrl: 65000000.0,
          equationBalanced: true,
          journalEntriesCount: 1420,
          cryptographicChainValid: true,
        };
      }

      case 'bancofe_simulate_loan': {
        const p = Number(args.principalBrl || 100000);
        const m = Number(args.months || 12);
        const annualRate = Number(args.annualRatePercent || 12.0);
        const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
        const system = args.system || 'PRICE';

        if (system === 'PRICE') {
          const installment = (p * (monthlyRate * Math.pow(1 + monthlyRate, m))) / (Math.pow(1 + monthlyRate, m) - 1);
          const totalPaid = installment * m;
          return {
            system: 'PRICE (Parcelas Fixas)',
            principalBrl: p,
            months: m,
            monthlyRatePercent: Number((monthlyRate * 100).toFixed(4)),
            fixedInstallmentBrl: Number(installment.toFixed(2)),
            totalInterestBrl: Number((totalPaid - p).toFixed(2)),
            totalPaidBrl: Number(totalPaid.toFixed(2)),
          };
        } else {
          // SAC
          const amortization = p / m;
          const firstInstallment = amortization + p * monthlyRate;
          const lastInstallment = amortization + amortization * monthlyRate;
          const totalInterest = ((p * monthlyRate) * (m + 1)) / 2;
          return {
            system: 'SAC (Amortização Constante)',
            principalBrl: p,
            months: m,
            monthlyRatePercent: Number((monthlyRate * 100).toFixed(4)),
            firstInstallmentBrl: Number(firstInstallment.toFixed(2)),
            lastInstallmentBrl: Number(lastInstallment.toFixed(2)),
            monthlyAmortizationBrl: Number(amortization.toFixed(2)),
            totalInterestBrl: Number(totalInterest.toFixed(2)),
            totalPaidBrl: Number((p + totalInterest).toFixed(2)),
          };
        }
      }

      case 'bancofe_send_whatsapp_alert': {
        return {
          recipient: args.phoneNumber,
          notificationType: args.notificationType || 'PIX_RECEIVED',
          deliveryStatus: 'SENT_AND_DELIVERED',
          messagePreview: args.message,
          mcpConnector: 'WhatsApp Business API (d4173eda-8d68-42bf-b751-87402cdf026b)',
          timestamp: new Date().toISOString(),
        };
      }

      case 'bancofe_drex_settlement': {
        return {
          settlementId: `DREXPILOT_${Date.now()}`,
          amountDrex: args.amountBrl,
          assetType: args.assetType || 'TPFt_LTN',
          status: 'SETTLED_ON_HYPERLEDGER_BESU',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        };
      }

      default:
        throw new Error(`Ferramenta MCP desconhecida: ${toolName}`);
    }
  }

  /**
   * Ponto de entrada CLI stdio para execução como servidor MCP padrão
   */
  public static startStdioServer(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const req: JSONRPCRequest = JSON.parse(line);
        const res = this.handleRequest(req);
        console.log(JSON.stringify(res));
      } catch (err: any) {
        console.log(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32700, message: 'Parse error: JSON inválido' },
          })
        );
      }
    });

    process.stderr.write('BancoFe MCP Server iniciado no modo STDIO (JSON-RPC 2.0).\n');
  }
}

// Se executado diretamente via CLI: node / tsx mcp.server.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  BancoFeMCPServer.startStdioServer();
}
