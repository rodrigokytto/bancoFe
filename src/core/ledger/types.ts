export enum AccountType {
  ASSET = 'ASSET',         // Ativo (Ex: Reservas no BACEN, Caixa, Contas a Receber)
  LIABILITY = 'LIABILITY', // Passivo (Ex: Depósitos de Clientes, Contas a Pagar)
  EQUITY = 'EQUITY',       // Patrimônio Líquido (Ex: Capital Social, Lucros Acumulados)
  REVENUE = 'REVENUE',     // Receita (Ex: Tarifas Pix, Juros de Operações)
  EXPENSE = 'EXPENSE',     // Despesa (Ex: Custos de Liquidação, Despesas Administrativas)
}

export enum AccountCategory {
  RESERVE_BACEN = 'RESERVE_BACEN',         // Conta de Liquidação no Banco Central (STR/SPI)
  SETTLEMENT_PIX = 'SETTLEMENT_PIX',       // Câmara de Liquidação Pix
  SETTLEMENT_BOLETO = 'SETTLEMENT_BOLETO', // Câmara de Compensação de Boletos (CIP)
  SETTLEMENT_CIP = 'SETTLEMENT_CIP',       // Câmara Interbancária de Pagamentos
  CLIENT_CHECKING = 'CLIENT_CHECKING',     // Depósitos à vista de correntistas
  CLIENT_SAVINGS = 'CLIENT_SAVINGS',       // Poupança e depósitos a prazo
  CLIENT_AGRO = 'CLIENT_AGRO',             // Contas de Produtores e Financiamento Rural
  FEE_INCOME = 'FEE_INCOME',               // Receitas com tarifas de intermediação
  INTEREST_INCOME = 'INTEREST_INCOME',     // Receitas de juros e mora
}

export interface LedgerAccount {
  id: string;
  code: string; // Código estruturado COSIF (ex: 1.1.1.00.00-1)
  name: string;
  type: AccountType;
  category: AccountCategory;
  currency: string; // ISO 4217, default 'BRL'
  balance: number; // Em centavos de Real para precisão decimal absoluta (sem floating point errors)
  status: 'ACTIVE' | 'BLOCKED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Posting {
  accountId: string;
  amount: number; // Em centavos, sempre positivo
  direction: 'DEBIT' | 'CREDIT';
  description?: string;
}

export interface JournalEntry {
  id: string;
  referenceId: string; // ID da transação externa (Pix, Boleto, etc)
  timestamp: Date;
  description: string;
  postings: Posting[];
  metadata?: Record<string, unknown>;
  previousHash: string; // Chadeamento criptográfico para auditoria imutável
  hash: string;
}

export interface LedgerBalanceAssertion {
  isValid: boolean;
  totalDebits: number;
  totalCredits: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpense: number;
  totalEntries: number;
  accountingEquationBalanced: boolean; // Ativo = Passivo + Patrimônio + (Receitas - Despesas)
}
