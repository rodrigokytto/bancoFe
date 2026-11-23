import { describe, it, expect, beforeEach } from 'vitest';
import { AccountManager } from '../src/core/ledger/accounts';
import { LedgerEngine } from '../src/core/ledger/ledger.engine';

describe('Motor Contábil BancoFe (COSIF & Partidas Dobradas)', () => {
  let accountManager: AccountManager;
  let ledgerEngine: LedgerEngine;

  beforeEach(() => {
    accountManager = new AccountManager();
    ledgerEngine = new LedgerEngine(accountManager);
  });

  it('deve inicializar com o plano de contas COSIF padrão', () => {
    const accounts = accountManager.listAccounts();
    expect(accounts.length).toBeGreaterThanOrEqual(6);
    expect(accountManager.getAccount('acc_bacen_reserve')).toBeDefined();
    expect(accountManager.getAccount('acc_client_deposits')).toBeDefined();
  });

  it('deve registrar transação válida onde débitos equivalem a créditos', () => {
    const initialPixClearing = accountManager.getAccount('acc_pix_clearing')!.balance;
    const initialDeposits = accountManager.getAccount('acc_client_deposits')!.balance;

    const entry = ledgerEngine.postTransaction(
      'TX_TEST_001',
      'Depósito Pix de cliente',
      [
        { accountId: 'acc_pix_clearing', amount: 100000, direction: 'DEBIT' },
        { accountId: 'acc_client_deposits', amount: 100000, direction: 'CREDIT' },
      ]
    );

    expect(entry.id).toBeDefined();
    expect(entry.hash).toBeDefined();
    expect(entry.postings).toHaveLength(2);

    const pixClearing = accountManager.getAccount('acc_pix_clearing')!;
    const deposits = accountManager.getAccount('acc_client_deposits')!;

    expect(pixClearing.balance).toBe(initialPixClearing + 100000);
    expect(deposits.balance).toBe(initialDeposits + 100000);
  });

  it('deve lançar erro se a soma dos débitos for diferente da soma dos créditos', () => {
    expect(() => {
      ledgerEngine.postTransaction(
        'TX_INVALID',
        'Lançamento desbalanceado',
        [
          { accountId: 'acc_pix_clearing', amount: 100000, direction: 'DEBIT' },
          { accountId: 'acc_client_deposits', amount: 95000, direction: 'CREDIT' },
        ]
      );
    }).toThrow(/Desbalanceamento contábil detectado/);
  });

  it('deve manter integridade criptográfica da cadeia de hashes SHA-256', () => {
    const tx1 = ledgerEngine.postTransaction('TX_CHAIN_1', 'Lançamento 1', [
      { accountId: 'acc_bacen_reserve', amount: 50000, direction: 'DEBIT' },
      { accountId: 'acc_client_deposits', amount: 50000, direction: 'CREDIT' },
    ]);

    const tx2 = ledgerEngine.postTransaction('TX_CHAIN_2', 'Lançamento 2', [
      { accountId: 'acc_client_deposits', amount: 20000, direction: 'DEBIT' },
      { accountId: 'acc_bacen_reserve', amount: 20000, direction: 'CREDIT' },
    ]);

    expect(tx2.previousHash).toBe(tx1.hash);

    const audit = ledgerEngine.auditLedger();
    expect(audit.isValid).toBe(true);
    expect(audit.totalEntries).toBe(2);
    expect(audit.totalDebits).toBe(audit.totalCredits);
  });
});
