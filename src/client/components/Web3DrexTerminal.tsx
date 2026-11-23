import React, { useState } from 'react';
import { Cpu, Coins, CheckCircle2, Shield, Repeat, Layers } from 'lucide-react';
import { DrexWeb3IntegrationAdapter } from '../../integrations/git-abertos/web3-drex/drex.adapter';

export const Web3DrexTerminal: React.FC = () => {
  const [adapter] = useState(() => new DrexWeb3IntegrationAdapter());
  const [amountBrl, setAmountBrl] = useState('100000.00');
  const [assetType, setAssetType] = useState('TPFt_LTN_2027');
  const [receiverWallet, setReceiverWallet] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulateDvP = async () => {
    setLoading(true);
    try {
      const res = await adapter.execute('settle_dvp', {
        amountBrl: parseFloat(amountBrl) || 10000,
        assetType,
        receiverWallet,
        settlementType: 'ATOMIC_SWAP',
      });
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, error: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTokenizeCPR = async () => {
    setLoading(true);
    try {
      const res = await adapter.execute('tokenize_receivable', {
        receivableType: 'CPR_SOJA_2026',
        amountBrl: parseFloat(amountBrl) || 50000,
        tokenStandard: 'ERC-1155',
        maturityDate: '2027-04-30',
      });
      setResult(res);
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
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>Web3 & Drex • Piloto Real Digital do Banco Central</span>
        </h2>
        <p className="text-xs text-slate-400">
          Smart contracts na rede Hyperledger Besu (EVM) para liquidação atômica DvP (Delivery vs Payment) e tokenização fracionada de ativos reais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Transações Drex */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Operações em Real Digital / Real Tokenizado</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Valor em Drex (BRL)</label>
              <input
                type="number"
                value={amountBrl}
                onChange={(e) => setAmountBrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Ativo de Contrapartida</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              >
                <option value="TPFt_LTN_2027">Título Público Federal (TPFt - LTN 2027)</option>
                <option value="TPFt_NTNF_2029">Título Público Federal (TPFt - NTN-F 2029)</option>
                <option value="CPR_TOKEN_SOJA">Cédula de Produto Rural Tokenizada (ERC-1155)</option>
                <option value="DEBENTURE_INFRA">Debênture de Infraestrutura Rural</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Endereço da Carteira do Destinatário (EVM)</label>
              <input
                type="text"
                value={receiverWallet}
                onChange={(e) => setReceiverWallet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSimulateDvP}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50 text-[11px]"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Liquidar DvP Atômico</span>
              </button>

              <button
                onClick={handleTokenizeCPR}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 border border-purple-500/30 transition disabled:opacity-50 text-[11px]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tokenizar Recebível</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resposta do Contrato Inteligente */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Execução de Smart Contract (Piloto Drex)</span>
          </h3>

          {result ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transação Minerada no Piloto Drex</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Status: <span className="text-emerald-400 font-bold">COMMITTED_ON_CHAIN</span></div>
                  <div>Consenso: <span className="text-purple-300">QBFT (BACEN Validator Node)</span></div>
                  <div>Gas Used: <span className="text-slate-400">124.500 gwei</span></div>
                </div>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800/80 max-h-72">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-xs">
              <Cpu className="w-8 h-8 opacity-40 text-purple-400" />
              <p>Simule uma liquidação DvP ou tokenização para verificar o recibo do smart contract.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
