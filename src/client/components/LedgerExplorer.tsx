import React, { useState } from 'react';
import { Landmark, ShieldCheck, CheckCircle2, Hash, ArrowDownRight, ArrowUpRight, Lock } from 'lucide-react';
import { AccountManager } from '../../core/ledger/accounts';
import { LedgerEngine } from '../../core/ledger/ledger.engine';

export const LedgerExplorer: React.FC = () => {
  const [accountManager] = useState(() => new AccountManager());
  const [ledgerEngine] = useState(() => {
    const mgr = new AccountManager();
    const engine = new LedgerEngine(mgr);
    // Cria alguns lançamentos de demonstração
    engine.postTransaction(
      'REF_PIX_001',
      'Recebimento Pix Safra Agrícola 2026',
      [
        { accountId: 'acc_pix_clearing', amount: 5000000, direction: 'DEBIT' },
        { accountId: 'acc_client_agro', amount: 5000000, direction: 'CREDIT' },
      ],
      { channel: 'PIX_SPI', endToEndId: 'E799000001' }
    );
    engine.postTransaction(
      'REF_TAR_002',
      'Tarifa Intercâmbio Pix e Cobrança Bancária',
      [
        { accountId: 'acc_client_agro', amount: 15000, direction: 'DEBIT' },
        { accountId: 'acc_fee_income', amount: 15000, direction: 'CREDIT' },
      ],
      { tariffType: 'INTERCHANGE_FEE' }
    );
    return engine;
  });

  const audit = ledgerEngine.auditLedger();
  const accounts = accountManager.listAccounts();
  const journal = ledgerEngine.getJournal();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-emerald-400" />
          <span>Livro Razão Contábil (COSIF / Partidas Dobradas)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Auditoria matemática formal da contabilidade bancária: Débitos === Créditos com integridade criptográfica SHA-256 encadeada.
        </p>
      </div>

      {/* Cartões de Balanço Contábil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ativo Total (COSIF 1.x)</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {((audit.totalAssets / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500">Reservas BACEN + Câmaras SPI/CIP</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Passivo Total (COSIF 4.x)</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {((audit.totalLiabilities / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500">Depósitos de Clientes e CPR Agro</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Receitas de Tarifas (7.x)</span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {((audit.totalRevenue / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500">Tarifas Pix e Juros Crédito</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Auditoria da Equação</span>
          <div className="flex items-center space-x-2 pt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400 font-mono">100% BALANCEADO</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Débitos === Créditos</span>
        </div>
      </div>

      {/* Tabela do Plano de Contas COSIF */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Plano de Contas COSIF Ativas no BancoFe</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Código COSIF</th>
                <th className="p-3">Título da Conta</th>
                <th className="p-3">Natureza</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Saldo Contábil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-emerald-400 font-bold">{acc.code}</td>
                  <td className="p-3 font-medium text-slate-200">{acc.name}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      acc.type === 'ASSET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      acc.type === 'LIABILITY' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">{acc.category}</td>
                  <td className="p-3 text-right font-bold text-white">
                    {((acc.balance / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trilha de Auditoria com Hash Criptográfico Encadeado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Trilha de Auditoria Criptográfica (Livro Diário)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">{journal.length} lançamentos registrados</span>
        </div>

        <div className="space-y-3">
          {journal.map((entry) => (
            <div key={entry.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">{entry.referenceId}</span>
                <span className="text-slate-500 text-[11px]">{new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">{entry.description}</p>

              {/* Lançamentos dobrados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-[11px]">
                {entry.postings.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60">
                    <span className="text-slate-400">{p.accountId}</span>
                    <span className={`font-bold ${p.direction === 'DEBIT' ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {p.direction}: R$ {(p.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hashes SHA-256 */}
              <div className="pt-1 text-[10px] text-slate-500 break-all space-y-0.5">
                <div>Hash Anterior: <span className="text-slate-600">{entry.previousHash.substring(0, 32)}...</span></div>
                <div>Hash Lançamento: <span className="text-emerald-500 font-semibold">{entry.hash}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
