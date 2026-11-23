import React, { useState } from 'react';
import { Share2, ShieldCheck, CheckCircle2, Lock, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { OpenFinanceAdapter } from '../../integrations/git-abertos/open-finance/open-finance.adapter';

export const OpenFinanceTerminal: React.FC = () => {
  const [adapter] = useState(() => new OpenFinanceAdapter());
  const [document, setDocument] = useState('06988722661');
  const [actionType, setActionType] = useState<'create_consent' | 'list_accounts' | 'initiate_payment'>('create_consent');
  const [selectedBank, setSelectedBank] = useState('Banco do Brasil (001)');
  const [paymentAmount, setPaymentAmount] = useState('1500.00');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    setLoading(true);
    try {
      if (actionType === 'create_consent') {
        const res = await adapter.execute('create_consent', {
          document,
          permissions: ['ACCOUNTS_READ', 'RESOURCES_READ', 'PAYMENTS_INITIATE'],
          clientName: 'BancoFe Open Finance Gateway',
        });
        setResult(res);
      } else if (actionType === 'list_accounts') {
        const res = await adapter.execute('get_accounts_data', {
          consentId: result?.consent?.id || 'urn:bancofe:consent:mock-9988',
          document,
        });
        setResult(res);
      } else {
        const res = await adapter.execute('initiate_payment', {
          consentId: result?.consent?.id || 'urn:bancofe:consent:mock-9988',
          amountBrl: parseFloat(paymentAmount) || 100,
          debtorAccount: {
            bank: selectedBank,
            branch: '0001',
            account: '123456-7',
          },
          creditorAccount: {
            bank: '799 - BancoFe',
            branch: '0001',
            account: '100234-5',
          },
        });
        setResult(res);
      }
    } catch (e: any) {
      setResult({ success: false, error: e?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-indigo-400" />
          <span>Open Finance Brasil • FAPI & ITP Hub</span>
        </h2>
        <p className="text-xs text-slate-400">
          Interoperabilidade financeira regulamentada: compartilhamento seguro de dados cadastrais, extratos e Iniciação de Transação de Pagamentos (ITP).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário Operacional */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Configuração do Fluxo Open Finance</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Ação Desejada</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('create_consent')}
                  className={`p-2 rounded text-center border font-medium transition ${
                    actionType === 'create_consent'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Consentimento
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('list_accounts')}
                  className={`p-2 rounded text-center border font-medium transition ${
                    actionType === 'list_accounts'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Contas Externas
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('initiate_payment')}
                  className={`p-2 rounded text-center border font-medium transition ${
                    actionType === 'initiate_payment'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Iniciação (ITP)
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">CPF ou CNPJ do Titular</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            {actionType === 'initiate_payment' && (
              <>
                <div>
                  <label className="text-slate-400 block mb-1">Instituição Transmissora (Origem)</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                  >
                    <option value="Banco do Brasil (001)">Banco do Brasil (001)</option>
                    <option value="Itaú Unibanco (341)">Itaú Unibanco (341)</option>
                    <option value="Bradesco (237)">Bradesco (237)</option>
                    <option value="Santander (033)">Santander (033)</option>
                    <option value="Sicoob (756)">Sicoob (756)</option>
                    <option value="Sicredi (748)">Sicredi (748)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor do Pagamento ITP (R$)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando FAPI...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Executar Operação FAPI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resposta e Visualizador FAPI */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Painel de Segurança FAPI / mTLS</span>
            </h3>
            <span className="text-[11px] font-mono text-indigo-400">Padrão BACEN Open Finance v2.0</span>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Operação Open Finance Concluída</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-900 rounded border border-slate-800/80 max-h-72">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.consent && (
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-lg text-xs space-y-1">
                  <div className="text-indigo-300 font-bold">Identificador do Consentimento:</div>
                  <div className="font-mono text-slate-300 break-all">{result.consent.id}</div>
                  <div className="text-[11px] text-slate-400">
                    Status: <span className="text-emerald-400 font-semibold">{result.consent.status}</span> • Válido por 12 meses
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-xs">
              <Share2 className="w-8 h-8 opacity-40 text-indigo-400" />
              <p>Selecione uma ação e clique em "Executar Operação FAPI" para visualizar a resposta estruturada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
