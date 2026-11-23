import React, { useState } from 'react';
import { CreditCard, ArrowLeftRight, CheckCircle2, Zap, Shield, TrendingDown } from 'lucide-react';
import { MultiGatewayIntegrationAdapter } from '../../integrations/git-abertos/gateways/gateways.adapter';

export const GatewaysTerminal: React.FC = () => {
  const [adapter] = useState(() => new MultiGatewayIntegrationAdapter());
  const [amount, setAmount] = useState('500.00');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [selectedGateway, setSelectedGateway] = useState('AUTO');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const gateways = [
    { id: 'asaas', name: 'Asaas', feePix: '0,99%', feeCard: '2,99%', sla: '99.98%' },
    { id: 'efi', name: 'Efí Bank (Gerencianet)', feePix: '0,89%', feeCard: '3,10%', sla: '99.99%' },
    { id: 'mercadopago', name: 'Mercado Pago', feePix: '0,99%', feeCard: '3,49%', sla: '99.95%' },
    { id: 'stripe', name: 'Stripe Brasil', feePix: '1,19%', feeCard: '3,99%', sla: '99.999%' },
    { id: 'openpix', name: 'OpenPix', feePix: '0,79%', feeCard: 'N/A', sla: '99.99%' },
    { id: 'celcoin', name: 'Celcoin BaaS', feePix: '0,85%', feeCard: '2,80%', sla: '99.97%' },
    { id: 'starkbank', name: 'Stark Bank', feePix: '0,65%', feeCard: 'N/A', sla: '99.99%' },
  ];

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await adapter.execute('route_payment', {
        amountBrl: parseFloat(amount) || 100,
        paymentMethod,
        preferredGateway: selectedGateway === 'AUTO' ? undefined : selectedGateway,
        customer: {
          name: 'Rodrigo Ribeiro Gonçalves',
          document: '069.887.226-61',
          email: 'rodrigo@bancofe.com.br',
        },
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
          <CreditCard className="w-5 h-5 text-amber-400" />
          <span>Hub de Gateways & Roteamento Inteligente</span>
        </h2>
        <p className="text-xs text-slate-400">
          Orquestração multigateway com menor custo por transação, failover automático e liquidação unificada no BancoFe.
        </p>
      </div>

      {/* Tabela Comparativa de Gateways */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {gateways.map((g) => (
          <div
            key={g.id}
            onClick={() => setSelectedGateway(g.id)}
            className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
              selectedGateway === g.id
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold truncate">{g.name}</div>
            <div className="text-[10px] text-slate-400">
              Pix: <span className="font-mono text-emerald-400">{g.feePix}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              SLA: <span className="font-mono text-cyan-400">{g.sla}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Disparo */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span>Simulador de Cobrança Multi-Gateway</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Valor da Operação (R$)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Método de Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                {(['PIX', 'CREDIT_CARD', 'BOLETO'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`p-2 rounded text-center border font-semibold transition ${
                      paymentMethod === m
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m === 'PIX' ? 'Pix' : m === 'CREDIT_CARD' ? 'Cartão' : 'Boleto'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Roteamento</label>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
              >
                <option value="AUTO">Automático (Menor Taxa & Maior SLA)</option>
                {gateways.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Calculando Rota...' : 'Rotear & Executar Pagamento'}</span>
            </button>
          </div>
        </div>

        {/* Resposta do Roteador */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resultado da Rota Escolhida</span>
          </h3>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Gateway Selecionado</div>
                  <div className="text-base font-bold text-amber-400 font-mono">
                    {result.gateway?.toUpperCase() || result.selectedGateway?.toUpperCase() || 'ASAAS'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Economia Estimada</div>
                  <div className="text-base font-bold text-emerald-400 font-mono flex items-center space-x-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>R$ {((parseFloat(amount) || 100) * 0.015).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800/80 max-h-72">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-xs">
              <Shield className="w-8 h-8 opacity-40 text-amber-400" />
              <p>Configure a simulação ao lado para calcular o menor custo de intercâmbio e gateway.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
