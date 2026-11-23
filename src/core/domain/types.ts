export interface Customer {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ formatado ou desformatado
  type: 'PF' | 'PJ';
  email: string;
  phone: string;
  kycLevel: 'BASIC' | 'ENHANCED' | 'COMPLETE';
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  pixKeys: string[];
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  branch: string; // Ex: '0001'
  bankCode: string; // '799' (Código reservado BancoFe)
  customerId: string;
  customerName: string;
  type: 'CHECKING' | 'SAVINGS' | 'PAYMENT' | 'AGRO';
  balanceCentavos: number;
  availableLimitCentavos: number;
  status: 'ACTIVE' | 'BLOCKED' | 'CLOSED';
  createdAt: Date;
}

export interface BankingTransaction {
  id: string;
  accountId: string;
  amountCentavos: number;
  type: 'PIX_IN' | 'PIX_OUT' | 'BOLETO_PAY' | 'BOLETO_SETTLEMENT' | 'TED_OUT' | 'FEE' | 'LOAN_DISBURSEMENT';
  direction: 'INCOMING' | 'OUTGOING';
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
  counterparty?: {
    name: string;
    document: string;
    bank: string;
    branch: string;
    account: string;
    pixKey?: string;
  };
  description: string;
  journalEntryId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
