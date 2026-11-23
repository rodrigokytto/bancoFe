import React, { useState } from 'react';
import { Sparkles, Calculator, FileCheck, DollarSign, ArrowRight, BookOpen } from 'lucide-react';
import { FinanceProSkillAdapter } from '../../integrations/skills/adapters/finance-pro.skill';
import { KeyUserSkillAdapter } from '../../integrations/skills/adapters/keyuser.skill';
import { TreasuryAndAnalyticsSkillAdapter } from '../../integrations/skills/adapters/stock-analysis.skill';

export const SkillRunner: React.FC = () => {
  const [activeSkill, setActiveSkill] = useState<'finance' | 'treasury' | 'keyuser'>('finance');

  // Amortization state
  const [principal, setPrincipal] = useState('150000');
  const [rate, setRate] = useState('11.5');
  const [months, setMonths] = useState('12');
  const [amortResult, setAmortResult] = useState<any>(null);

  // Key User state
  const [keyUserManual, setKeyUserManual] = useState<string | null>(null);

  // Treasury state
  const [treasuryComparison, setTreasuryComparison] = useState<any[] | null>(null);

  const handleSimulateFinance = () => {
    const p = parseFloat(principal) || 100000;
    const r = parseFloat(rate) || 12;
    const m = parseInt(months, 10) || 12;

    const sac = FinanceProSkillAdapter.calculateSAC(p, r, m);
    const price = FinanceProSkillAdapter.calculatePRICE(p, r, m);

    setAmortResult({
      sac,
      price,
      principal: p,
      rate: r,
      months: m,
    });
  };

  const handleGenerateKeyUser = () => {
    const manual = KeyUserSkillAdapter.generateManual('Módulo de Integrações, Pix e Boletos', 'Rodrigo Ribeiro Gonçalves');
    setKeyUserManual(manual);
  };

  const handleCompareTreasury = () => {
    const p = parseFloat(principal) || 100000;
    const res = TreasuryAndAnalyticsSkillAdapter.compareTreasuryYields(p, 365);
    setTreasuryComparison(res);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Executor de Skills de IA (Manus Agent Core)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Orquestração das skills de modelagem financeira, tesouraria, conformidade regulatória e homologação Key User.
        </p>
      </div>

      {/* Seletor de Skills */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSkill('finance')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSkill === 'finance'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Finance Pro (SAC vs PRICE)</span>
        </button>

        <button
          onClick={() => {
            setActiveSkill('treasury');
            if (!treasuryComparison) handleCompareTreasury();
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSkill === 'treasury'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tesouraria & Indexadores</span>
        </button>

        <button
          onClick={() => {
            setActiveSkill('keyuser');
            if (!keyUserManual) handleGenerateKeyUser();
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSkill === 'keyuser'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Key User & Homologação</span>
        </button>
      </div>

      {/* Conteúdo da Skill: Finance Pro */}
      {activeSkill === 'finance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Simulador de Financiamento Corporativo e Agro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor do Crédito (R$)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Taxa de Juros Anual (% a.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prazo (Meses)</label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateFinance}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/20"
            >
              Calcular Comparativo SAC vs PRICE
            </button>
          </div>

          {amortResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card SAC */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Sistema SAC (Amortização Constante)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Menor Custo Total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">1ª Parcela</span>
                    <span className="text-white font-bold">R$ {amortResult.sac.rows[0].paymentBrl.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Última Parcela</span>
                    <span className="text-white font-bold">R$ {amortResult.sac.rows[amortResult.sac.rows.length - 1].paymentBrl.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Juros Totais</span>
                    <span className="text-emerald-400 font-bold">R$ {amortResult.sac.totalInterestBrl.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Parcelas decrescentes ideais para empresas agrícolas com fluxo de caixa forte no início do ciclo.
                </p>
              </div>

              {/* Card PRICE */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Sistema PRICE (Parcelas Fixas)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">Previsibilidade</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Parcela Fixa</span>
                    <span className="text-white font-bold">R$ {amortResult.price.fixedPaymentBrl.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Total Pago</span>
                    <span className="text-white font-bold">R$ {amortResult.price.totalPaidBrl.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Juros Totais</span>
                    <span className="text-amber-400 font-bold">R$ {amortResult.price.totalInterestBrl.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Valores fixos mensais ideais para orçamento previsível e controle de capital de giro.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Skill: Tesouraria */}
      {activeSkill === 'treasury' && treasuryComparison && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Comparativo de Rentabilidade Líquida de Tesouraria (Prazo: 1 Ano)
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">CDI Base: 11,15% a.a.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Instrumento Financeiro</th>
                  <th className="p-3">Taxa Bruta (% a.a.)</th>
                  <th className="p-3">Alíquota IR</th>
                  <th className="p-3">Rentabilidade Líquida</th>
                  <th className="p-3">Ganho Líquido Projetado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {treasuryComparison.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-200">{item.instrument}</td>
                    <td className="p-3 text-slate-400">{item.grossYieldAnnualPercent}%</td>
                    <td className="p-3 text-slate-400">{item.taxRatePercent === 0 ? 'ISENTO' : `${item.taxRatePercent}%`}</td>
                    <td className="p-3 text-emerald-400 font-bold">{item.netYieldAnnualPercent}% a.a.</td>
                    <td className="p-3 text-white font-bold">R$ {item.netYieldBrlAtMaturity.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo da Skill: Key User */}
      {activeSkill === 'keyuser' && keyUserManual && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Manual do Key User & Termo de Aceite Gerado
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(keyUserManual);
                alert('Manual copiado para a área de transferência!');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Copiar Manual em Markdown
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-96">
            {keyUserManual}
          </pre>
        </div>
      )}
    </div>
  );
};
