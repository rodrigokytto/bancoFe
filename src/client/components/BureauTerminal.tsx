import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Search, Activity } from 'lucide-react';
import { BureauCreditoIntegrationAdapter } from '../../integrations/git-abertos/bureau-credito/bureau.adapter';

export const BureauTerminal: React.FC = () => {
  const [adapter] = useState(() => new BureauCreditoIntegrationAdapter());
  const [document, setDocument] = useState('06988722661');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidateAndScore = async () => {
    setLoading(true);
    try {
      const cleanDoc = document.replace(/\D/g, '');
      const isCpf = cleanDoc.length <= 11;
      const isValid = isCpf
        ? BureauCreditoIntegrationAdapter.isValidCPF(cleanDoc)
        : BureauCreditoIntegrationAdapter.isValidCNPJ(cleanDoc);

      const consultRes = await adapter.execute('consult_credit_score', {
        document: cleanDoc,
      });

      setResult({
        document: cleanDoc,
        type: isCpf ? 'CPF' : 'CNPJ',
        validChecksum: isValid,
        ...consultRes,
      });
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
          <UserCheck className="w-5 h-5 text-teal-400" />
          <span>Bureau de Crédito & Compliance Cadastral</span>
        </h2>
        <p className="text-xs text-slate-400">
          Validação algorítmica de CPF e CNPJ, consulta de restrições na Receita Federal e motor de score Consulta360 para limites pré-aprovados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Consulta */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <Search className="w-4 h-4 text-teal-400" />
            <span>Consulta de Documento</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Informe o CPF ou CNPJ (somente números ou formatado)</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="Ex: 069.887.226-61 ou 12.345.678/0001-90"
              />
            </div>

            <button
              onClick={handleValidateAndScore}
              disabled={loading}
              className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              <span>{loading ? 'Consultando Bases...' : 'Validar & Analisar Score'}</span>
            </button>
          </div>
        </div>

        {/* Resposta do Parecer Cadastral */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resultado Cadastral & Rating de Risco</span>
          </h3>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Validação Numérica</span>
                  <div className="text-sm font-bold font-mono mt-1 flex items-center space-x-1">
                    {result.validChecksum ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">VÁLIDO</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400">INVÁLIDO</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Score de Crédito</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {result.score || 845} <span className="text-xs text-slate-400">/ 1000</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Rating de Risco</span>
                  <div className="text-lg font-bold font-mono text-teal-400 mt-0.5">
                    {result.riskRating || 'A - EXCELENTE'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Limite Pré-Aprovado pelo BancoFe:</div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {result.approvedPreCreditLimitBrl
                    ? (result.approvedPreCreditLimitBrl).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'R$ 150.000,00'}
                </div>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800/80 max-h-56">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-xs">
              <UserCheck className="w-8 h-8 opacity-40 text-teal-400" />
              <p>Informe um CPF ou CNPJ e clique em "Validar & Analisar Score" para inspecionar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
