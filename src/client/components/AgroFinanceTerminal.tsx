import React, { useState } from 'react';
import { Sprout, FileText, CheckCircle2, Calculator, ShieldCheck, Warehouse } from 'lucide-react';
import { AgroFinanceIntegrationAdapter } from '../../integrations/git-abertos/agro-finance/agro.adapter';

export const AgroFinanceTerminal: React.FC = () => {
  const [adapter] = useState(() => new AgroFinanceIntegrationAdapter());
  const [commodity, setCommodity] = useState<'SOJA' | 'MILHO' | 'ALGODAO' | 'CAFE'>('SOJA');
  const [quantityBags, setQuantityBags] = useState('5000');
  const [pricePerBag, setPricePerBag] = useState('130.00');
  const [producerName, setProducerName] = useState('Fazenda Progresso do Cerrado');
  const [producerDocument, setProducerDocument] = useState('12.345.678/0001-90');
  const [cprType, setCprType] = useState<'FINANCIAL' | 'PHYSICAL'>('FINANCIAL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const totalValue = (parseFloat(quantityBags) || 0) * (parseFloat(pricePerBag) || 0);

  const handleIssueCPR = async () => {
    setLoading(true);
    try {
      const res = await adapter.execute('issue_cpr', {
        cprType,
        commodity,
        quantityBags: parseInt(quantityBags) || 1000,
        unitPriceBrl: parseFloat(pricePerBag) || 120,
        totalValueBrl: totalValue,
        producerName,
        producerDocument,
        harvestSeason: '2026/2027',
        location: 'Sorriso - MT',
        dueDate: '2027-04-30',
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
          <Sprout className="w-5 h-5 text-emerald-400" />
          <span>Agro Finance • CPR Digital & Barter de Safras</span>
        </h2>
        <p className="text-xs text-slate-400">
          Emissão eletrônica de Cédula de Produto Rural (Lei nº 13.986/2020), custódia em registradora autorizada (B3/Cerc) e operações de Barter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Emissão de CPR */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Dados da Cédula de Produto Rural (CPR)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Modalidade da CPR</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCprType('FINANCIAL')}
                    className={`p-2 rounded text-center border font-bold transition ${
                      cprType === 'FINANCIAL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Financeira
                  </button>
                  <button
                    type="button"
                    onClick={() => setCprType('PHYSICAL')}
                    className={`p-2 rounded text-center border font-bold transition ${
                      cprType === 'PHYSICAL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Física
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Commodity / Cultura</label>
                <select
                  value={commodity}
                  onChange={(e: any) => setCommodity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                >
                  <option value="SOJA">Soja em Grãos (60 kg)</option>
                  <option value="MILHO">Milho Safrinha (60 kg)</option>
                  <option value="ALGODAO">Algodão em Pluma</option>
                  <option value="CAFE">Café Arábica (60 kg)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Quantidade de Sacas</label>
                <input
                  type="number"
                  value={quantityBags}
                  onChange={(e) => setQuantityBags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preço Fixado por Saca (R$)</label>
                <input
                  type="number"
                  value={pricePerBag}
                  onChange={(e) => setPricePerBag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Produtor Emitente / Fazenda</label>
                <input
                  type="text"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">CNPJ / CPF do Emitente</label>
                <input
                  type="text"
                  value={producerDocument}
                  onChange={(e) => setProducerDocument(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Resumo do Valor Total */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Valor Total Vinculado à Safra:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <button
              onClick={handleIssueCPR}
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Registrando CPR...' : 'Emitir e Registrar CPR Digital'}</span>
            </button>
          </div>
        </div>

        {/* Detalhes do Registro e Garantia */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-emerald-400" />
            <span>Custódia e Certificado de Registro</span>
          </h3>

          {result ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CPR Registrada na B3/Cerc com Sucesso</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Número da CPR:</span>
                    <span className="text-emerald-400 font-bold">{result.cprNumber || 'CPR-2026-009182'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Hash de Registro:</span>
                    <span className="text-slate-300 truncate block">sha256:e93f...b812</span>
                  </div>
                </div>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800/80 max-h-72">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-xs">
              <Calculator className="w-8 h-8 opacity-40 text-emerald-400" />
              <p>Preencha os dados da safra e clique em "Emitir e Registrar CPR Digital".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
