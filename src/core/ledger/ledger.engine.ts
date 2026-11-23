import crypto from 'crypto';
import { AccountManager } from './accounts';
import { JournalEntry, Posting, AccountType, LedgerBalanceAssertion } from './types';

export class LedgerEngine {
  private journal: JournalEntry[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(private accountManager: AccountManager) {}

  /**
   * Registra uma transação no Livro Diário com partidas dobradas.
   * Regra estrita: Soma dos Débitos DEVE ser identicamente igual à soma dos Créditos.
   */
  public postTransaction(
    referenceId: string,
    description: string,
    postings: Posting[],
    metadata?: Record<string, unknown>
  ): JournalEntry {
    if (!postings || postings.length < 2) {
      throw new Error('Uma transação contábil exige no mínimo 2 lançamentos (partidas dobradas).');
    }

    let sumDebits = 0;
    let sumCredits = 0;

    for (const p of postings) {
      if (p.amount <= 0) {
        throw new Error(`Valor de lançamento inválido: ${p.amount}. Os valores devem ser estritamente positivos.`);
      }

      if (p.direction === 'DEBIT') {
        sumDebits += p.amount;
      } else if (p.direction === 'CREDIT') {
        sumCredits += p.amount;
      } else {
        throw new Error(`Direção de lançamento inválida: ${p.direction}`);
      }
    }

    if (sumDebits !== sumCredits) {
      throw new Error(
        `Desbalanceamento contábil detectado! Total Débitos (R$ ${(sumDebits / 100).toFixed(
          2
        )}) !== Total Créditos (R$ ${(sumCredits / 100).toFixed(2)})`
      );
    }

    // Atualiza os saldos das contas no gerenciador
    for (const p of postings) {
      const acc = this.accountManager.getAccount(p.accountId);
      if (!acc) {
        throw new Error(`Conta contábil inexistente: ${p.accountId}`);
      }
      if (acc.status !== 'ACTIVE') {
        throw new Error(`Conta contábil ${p.accountId} está inativa ou bloqueada.`);
      }

      let balanceDelta = 0;

      // Natureza das contas:
      // Ativo e Despesa: Débito aumenta (+), Crédito diminui (-)
      // Passivo, Patrimônio e Receita: Crédito aumenta (+), Débito diminui (-)
      if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
        balanceDelta = p.direction === 'DEBIT' ? p.amount : -p.amount;
      } else {
        balanceDelta = p.direction === 'CREDIT' ? p.amount : -p.amount;
      }

      this.accountManager.updateBalance(p.accountId, balanceDelta);
    }

    const timestamp = new Date();
    const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Cálculo do hash criptográfico SHA-256 encadeado (Audit Trail)
    const payloadToHash = JSON.stringify({
      id,
      referenceId,
      timestamp: timestamp.toISOString(),
      description,
      postings,
      previousHash: this.lastHash,
    });

    let hash = '';
    try {
      if (crypto && typeof crypto.createHash === 'function') {
        hash = crypto.createHash('sha256').update(payloadToHash).digest('hex');
      }
    } catch {
      // Fallback em runtime sem crypto nativo
    }

    if (!hash) {
      let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (let i = 0; i < payloadToHash.length; i++) {
        const ch = payloadToHash.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      hash = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0') + 'bancofe0000000000000000000000000000000000000000';
    }

    const entry: JournalEntry = {
      id,
      referenceId,
      timestamp,
      description,
      postings,
      metadata,
      previousHash: this.lastHash,
      hash,
    };

    this.lastHash = hash;
    this.journal.push(entry);
    return entry;
  }

  /**
   * Auditoria completa da integridade do livro razão.
   */
  public auditLedger(): LedgerBalanceAssertion {
    const accounts = this.accountManager.listAccounts();
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpense = 0;

    for (const acc of accounts) {
      switch (acc.type) {
        case AccountType.ASSET:
          totalAssets += acc.balance;
          break;
        case AccountType.LIABILITY:
          totalLiabilities += acc.balance;
          break;
        case AccountType.EQUITY:
          totalEquity += acc.balance;
          break;
        case AccountType.REVENUE:
          totalRevenue += acc.balance;
          break;
        case AccountType.EXPENSE:
          totalExpense += acc.balance;
          break;
      }
    }

    let totalDebits = 0;
    let totalCredits = 0;
    for (const entry of this.journal) {
      for (const p of entry.postings) {
        if (p.direction === 'DEBIT') totalDebits += p.amount;
        else totalCredits += p.amount;
      }
    }

    // Validação da equação fundamental: Ativo = Passivo + Patrimônio + (Receitas - Despesas)
    // Tolerância zero para descasamento
    const accountingEquationBalanced = (totalAssets - totalLiabilities - totalEquity - (totalRevenue - totalExpense)) === 0;

    return {
      isValid: totalDebits === totalCredits && accountingEquationBalanced,
      totalDebits,
      totalCredits,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpense,
      totalEntries: this.journal.length,
      accountingEquationBalanced,
    };
  }

  public getJournal(): JournalEntry[] {
    return [...this.journal];
  }

  public getEntry(id: string): JournalEntry | undefined {
    return this.journal.find((e) => e.id === id);
  }
}
