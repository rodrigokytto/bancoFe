import { LedgerAccount, AccountType, AccountCategory } from './types';

export class AccountManager {
  private accounts: Map<string, LedgerAccount> = new Map();

  constructor() {
    this.seedDefaultCOSIFAccounts();
  }

  private seedDefaultCOSIFAccounts() {
    const defaultAccounts: Omit<LedgerAccount, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'acc_bacen_reserve',
        code: '1.1.1.00.00-1',
        name: 'Reserva Bancária BACEN (STR/SPI)',
        type: AccountType.ASSET,
        category: AccountCategory.RESERVE_BACEN,
        currency: 'BRL',
        balance: 8000000000, // R$ 80.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_pix_clearing',
        code: '1.1.2.10.00-5',
        name: 'Câmara de Liquidação Instantânea Pix',
        type: AccountType.ASSET,
        category: AccountCategory.SETTLEMENT_PIX,
        currency: 'BRL',
        balance: 1000000000, // R$ 10.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_boleto_clearing',
        code: '1.1.2.20.00-8',
        name: 'Câmara de Compensação CIP/Boleto',
        type: AccountType.ASSET,
        category: AccountCategory.SETTLEMENT_BOLETO,
        currency: 'BRL',
        balance: 500000000, // R$ 5.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_loan_portfolio',
        code: '1.6.1.10.00-4',
        name: 'Carteira de Crédito Rural e Cédulas Agro (CPR)',
        type: AccountType.ASSET,
        category: AccountCategory.SETTLEMENT_CIP,
        currency: 'BRL',
        balance: 1500000000, // R$ 15.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_client_deposits',
        code: '4.1.1.10.00-2',
        name: 'Depósitos à Vista de Clientes (Conta Corrente)',
        type: AccountType.LIABILITY,
        category: AccountCategory.CLIENT_CHECKING,
        currency: 'BRL',
        balance: 6000000000, // R$ 60.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_client_agro',
        code: '4.1.1.20.00-6',
        name: 'Depósitos e Cédulas Agro BancoFe (CPR/Safra)',
        type: AccountType.LIABILITY,
        category: AccountCategory.CLIENT_AGRO,
        currency: 'BRL',
        balance: 3000000000, // R$ 30.000.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_share_capital',
        code: '6.1.1.00.00-0',
        name: 'Capital Social Realizado BancoFe',
        type: AccountType.EQUITY,
        category: AccountCategory.CLIENT_CHECKING,
        currency: 'BRL',
        balance: 1825000000, // R$ 18.250.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_fee_income',
        code: '7.1.5.10.00-3',
        name: 'Receitas com Tarifas Bancárias e Intercâmbio',
        type: AccountType.REVENUE,
        category: AccountCategory.FEE_INCOME,
        currency: 'BRL',
        balance: 25000000, // R$ 250.000,00
        status: 'ACTIVE',
      },
      {
        id: 'acc_interest_income',
        code: '7.1.1.10.00-9',
        name: 'Receitas com Juros e Crédito Rural',
        type: AccountType.REVENUE,
        category: AccountCategory.INTEREST_INCOME,
        currency: 'BRL',
        balance: 150000000, // R$ 1.500.000,00
        status: 'ACTIVE',
      },
    ];

    const now = new Date();
    for (const acc of defaultAccounts) {
      this.accounts.set(acc.id, {
        ...acc,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  public getAccount(id: string): LedgerAccount | undefined {
    return this.accounts.get(id);
  }

  public listAccounts(): LedgerAccount[] {
    return Array.from(this.accounts.values());
  }

  public updateBalance(id: string, amountDeltaCentavos: number): LedgerAccount {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`Conta COSIF não encontrada: ${id}`);
    }

    account.balance += amountDeltaCentavos;
    account.updatedAt = new Date();
    this.accounts.set(id, account);
    return account;
  }
}
