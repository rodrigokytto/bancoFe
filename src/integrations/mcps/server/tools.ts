export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const BANCOFE_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'bancofe_create_pix',
    description: 'Gera uma cobrança Pix com código Copia e Cola padrão EMVCo, chave Pix e QR Code para pagamento instantâneo.',
    inputSchema: {
      type: 'object',
      properties: {
        pixKey: { type: 'string', description: 'Chave Pix de destino (CPF, CNPJ, Email, Tel ou EVP)' },
        amount: { type: 'number', description: 'Valor da transferência ou cobrança em Reais (BRL)' },
        merchantName: { type: 'string', description: 'Nome do recebedor/beneficiário' },
        merchantCity: { type: 'string', description: 'Cidade do recebedor (padrão BRASILIA)' },
        txid: { type: 'string', description: 'Identificador único da transação (opcional)' },
        infoAdicional: { type: 'string', description: 'Mensagem informativa anexada ao Pix' },
      },
      required: ['pixKey', 'amount'],
    },
  },
  {
    name: 'bancofe_query_statement',
    description: 'Consulta saldo consolidado e extrato de lançamentos em conta do BancoFe.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'ID da conta bancária (ou omitir para conta master)' },
        days: { type: 'number', description: 'Número de dias retroativos de extrato (padrão 30)' },
      },
    },
  },
  {
    name: 'bancofe_issue_boleto',
    description: 'Emite um Boleto Bancário registrado FEBRABAN com código de barras de 44 dígitos e linha digitável de 47 posições.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Valor nominal do boleto em Reais (BRL)' },
        dueDate: { type: 'string', description: 'Data de vencimento no formato AAAA-MM-DD' },
        payerName: { type: 'string', description: 'Nome completo ou Razão Social do pagador' },
        payerDocument: { type: 'string', description: 'CPF ou CNPJ do pagador' },
      },
      required: ['amount', 'payerName', 'payerDocument'],
    },
  },
  {
    name: 'bancofe_process_cnab',
    description: 'Gera arquivo de Remessa CNAB 240 FEBRABAN para folha de pagamento, fornecedores e liquidação em lote.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Razão social da empresa pagadora' },
        companyDocument: { type: 'string', description: 'CNPJ da empresa pagadora' },
        paymentsCount: { type: 'number', description: 'Quantidade de pagamentos no lote' },
        totalAmountBrl: { type: 'number', description: 'Somatório total dos pagamentos' },
      },
      required: ['companyName', 'companyDocument'],
    },
  },
  {
    name: 'bancofe_consult_cpf_cnpj',
    description: 'Executa validação cadastral e consulta score de crédito e situação na Receita Federal via Consulta360.',
    inputSchema: {
      type: 'object',
      properties: {
        document: { type: 'string', description: 'CPF ou CNPJ para consulta' },
      },
      required: ['document'],
    },
  },
  {
    name: 'bancofe_open_finance_consent',
    description: 'Cria ou verifica status de consentimento Open Finance Brasil para compartilhamento de dados ou iniciação de pagamento.',
    inputSchema: {
      type: 'object',
      properties: {
        document: { type: 'string', description: 'CPF ou CNPJ do titular correntista' },
        actionType: { type: 'string', enum: ['CREATE', 'CHECK', 'LIST_ACCOUNTS'], description: 'Ação desejada' },
      },
      required: ['document'],
    },
  },
  {
    name: 'bancofe_audit_ledger',
    description: 'Executa auditoria matemática do Livro Razão em partidas dobradas (Ativo, Passivo, Débitos e Créditos).',
    inputSchema: {
      type: 'object',
      properties: {
        detailed: { type: 'boolean', description: 'Retornar relatório analítico conta por conta' },
      },
    },
  },
  {
    name: 'bancofe_simulate_loan',
    description: 'Simula tabela de amortização de crédito rural ou empresarial pelos sistemas SAC e PRICE.',
    inputSchema: {
      type: 'object',
      properties: {
        principalBrl: { type: 'number', description: 'Valor financiado em Reais' },
        annualRatePercent: { type: 'number', description: 'Taxa de juros anual (ex: 12.5 para 12,5% a.a.)' },
        months: { type: 'number', description: 'Prazo em meses' },
        system: { type: 'string', enum: ['SAC', 'PRICE'], description: 'Sistema de amortização' },
      },
      required: ['principalBrl', 'months'],
    },
  },
  {
    name: 'bancofe_send_whatsapp_alert',
    description: 'Dispara notificação bancária oficial (comprovante Pix, alerta de segurança ou cobrança) via MCP WhatsApp Business.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', description: 'Número do destinatário com DDI e DDD (ex: 5565999887766)' },
        message: { type: 'string', description: 'Texto da notificação bancária' },
        notificationType: { type: 'string', enum: ['PIX_RECEIVED', 'BOLETO_ISSUED', 'SECURITY_2FA', 'STATEMENT_ALERT'] },
      },
      required: ['phoneNumber', 'message'],
    },
  },
  {
    name: 'bancofe_drex_settlement',
    description: 'Simula liquidação financeira atômica DVP em Real Digital Drex contra títulos públicos ou recebíveis.',
    inputSchema: {
      type: 'object',
      properties: {
        amountBrl: { type: 'number', description: 'Valor a liquidar em Drex' },
        assetType: { type: 'string', description: 'Tipo do ativo (ex: TPFt_LTN, RECEIVABLE_CPR)' },
      },
      required: ['amountBrl'],
    },
  },
];
