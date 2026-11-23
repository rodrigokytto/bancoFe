import React, { useState } from 'react';
import { Landmark, FileText, Barcode, Check, Copy } from 'lucide-react';
import { FebrabanBoletoEngine } from '../../integrations/git-abertos/boletos-cnab/febraban.engine';
import { CNAB240Engine } from '../../integrations/git-abertos/boletos-cnab/cnab240.parser';

export const BoletoTerminal: React.FC = () => {
  const [bankCode, setBankCode] = useState('799');
  const [amount, setAmount] = useState('450.00');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().substring(0, 10);
  });
  const [payerName, setPayerName] = useState('COOPERATIVA AGROPECUARIA DO CERRADO LTDA');
  const [payerDoc, setPayerDoc] = useState('11.222.333/0001-44');

  const [boletoResult, setBoletoResult] = useState<any>(null);
  const [cnabContent, setCnabContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateBoleto = () => {
    const amountCentavos = Math.round((parseFloat(amount) || 0) * 100);
    const res = FebrabanBoletoEngine.generateBoleto({
      bankCode,
      dueDate: new Date(dueDate),
      amountCentavos,
      beneficiaryBranch: '0001',
      beneficiaryAccount: '0012345',
      beneficiaryDocument: '12.345.678/0001-90',
      beneficiaryName: 'BANCOFE AGRO TECH S.A.',
      payerName,
      payerDocument: payerDoc,
      ourNumber: '10900012345',
    });
    setBoletoResult(res);
  };

  const handleGenerateCnab = () => {
    const items = [
      {
        id: '1',
        favoredName: 'AGRO INSUMOS DO BRASIL LTDA',
        favoredDocument: '11.222.333/0001-44',
        favoredBank: '001',
        favoredBranch: '1234',
        favoredAccount: '998877',
        amountCentavos: 1250000,
        paymentDate: dueDate.replace(/-/g, ''),
        referenceId: 'REF_001_FERTILIZANTE',
      },
      {
        id: '2',
        favoredName: 'DISTRIBUIDORA DE SEMENTES UISA',
        favoredDocument: '22.333.444/0001-55',
        favoredBank: '341',
        favoredBranch: '4321',
        favoredAccount: '554433',
        amountCentavos: 890000,
        paymentDate: dueDate.replace(/-/g, ''),
        referenceId: 'REF_002_SEMENTES_SOJA',
      },
    ];

    const file = CNAB240Engine.generateRemessa240(
      'COOPERATIVA BANCOFE AGRO',
      '12.345.678/0001-90',
      items
    );
    setCnabContent(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-emerald-400" />
          <span>Boletos Bancários FEBRABAN & Lotes CNAB 240 / 400</span>
        </h2>
        <p className="text-xs text-slate-400">
          Cálculo formal de Módulo 10, Módulo 11, fator de vencimento atualizado e geração de arquivos de remessa bancária para folha e fornecedores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Emissão de Boleto */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Barcode className="w-4 h-4 text-emerald-400" />
            <span>Emissor de Boleto de Cobrança</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Banco Emissor</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="799">799 - BancoFe S.A.</option>
                <option value="001">001 - Banco do Brasil</option>
                <option value="237">237 - Bradesco</option>
                <option value="341">341 - Itaú Unibanco</option>
                <option value="033">033 - Santander</option>
                <option value="756">756 - Sicoob</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valor Nominal (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">CPF/CNPJ do Sacado</label>
              <input
                type="text"
                value={payerDoc}
                onChange={(e) => setPayerDoc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome / Razão Social do Sacado</label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateBoleto}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20"
          >
            Calcular Linha Digitável e Código de Barras
          </button>

          {boletoResult && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400">Linha Digitável (47 Posições)</span>
                  <button
                    onClick={() => handleCopy(boletoResult.digitableLine)}
                    className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 select-all font-semibold">
                  {boletoResult.formattedDigitableLine}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Código de Barras Numérico (44 Posições)</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                  {boletoResult.barcode}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Fator Venc</span>
                  <span className="text-slate-200">{boletoResult.dueFactor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nosso Número</span>
                  <span className="text-slate-200">{boletoResult.ourNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Valor Formatado</span>
                  <span className="text-emerald-400 font-bold">{boletoResult.amountFormatted}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gerador de Arquivo CNAB 240 */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Gerador de Remessa CNAB 240 FEBRABAN</span>
            </h3>
            <button
              onClick={handleGenerateCnab}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-emerald-400 font-medium transition"
            >
              Gerar Remessa de Teste
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Estrutura de 240 caracteres por linha: Registro 0 (Header de Arquivo), Registro 1 (Header de Lote C20), Registros 3 (Segmento A e B de Crédito/Pix) e Registros 5 e 9 (Trailers de Controle).
          </p>

          {cnabContent ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Visualização do Arquivo (Layout 240 colunas):</span>
                <button
                  onClick={() => handleCopy(cnabContent)}
                  className="text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar Arquivo Inteiro</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre h-72">
                {cnabContent}
              </pre>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <FileText className="w-8 h-8 text-slate-600" />
              <span>Clique em "Gerar Remessa de Teste" para montar o lote bancário.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
