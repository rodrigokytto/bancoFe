import React, { useState } from 'react';
import { QrCode, Copy, Check, Send, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PixBRCodeGenerator } from '../../integrations/git-abertos/pix/brcode.generator';
import { DictDirectoryAdapter } from '../../integrations/git-abertos/pix/dict.adapter';

export const PixTerminal: React.FC = () => {
  const [pixKey, setPixKey] = useState('contato@bancofe.com.br');
  const [amount, setAmount] = useState('150.00');
  const [merchantName, setMerchantName] = useState('BANCOFE AGRO TECH');
  const [merchantCity, setMerchantCity] = useState('BRASILIA');
  const [txid, setTxid] = useState('SAFRA2026');
  const [infoAdicional, setInfoAdicional] = useState('Pagamento Insumos Agro');

  const [generatedPayload, setGeneratedPayload] = useState('');
  const [copied, setCopied] = useState(false);

  // DICT Query
  const [dictSearchKey, setDictSearchKey] = useState('06988722661');
  const [dictResult, setDictResult] = useState<any>(null);
  const [dictLoading, setDictLoading] = useState(false);

  // Simulation status
  const [simStatus, setSimStatus] = useState<string | null>(null);

  const handleGenerate = () => {
    const res = PixBRCodeGenerator.generate({
      pixKey,
      amount: parseFloat(amount) || 0,
      merchantName,
      merchantCity,
      txid,
      infoAdicional,
    });
    setGeneratedPayload(res.payload);
  };

  const handleCopy = () => {
    if (!generatedPayload) return;
    navigator.clipboard.writeText(generatedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolveDict = async () => {
    setDictLoading(true);
    try {
      const res = await DictDirectoryAdapter.resolveKey(dictSearchKey);
      setDictResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDictLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    setSimStatus('Liquidando no SPI BACEN...');
    setTimeout(() => {
      setSimStatus(`Pagamento de R$ ${amount} liquidado instantaneamente com sucesso no SPI! EndToEndId: E79900000${Date.now()}P9988`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <span>Terminal Pix & Diretório DICT (BACEN)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Gerador de BR Code EMVCo, cálculo de redundância cíclica CRC16-CCITT e resolução de chaves no Diretório de Identificadores de Contas Transacionais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Geração */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
            Parâmetros da Cobrança Pix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Chave Pix de Destino</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Recebedor (Beneficiário)</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cidade do Recebedor</label>
              <input
                type="text"
                value={merchantCity}
                onChange={(e) => setMerchantCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Identificador da Transação (TXID)</label>
              <input
                type="text"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Informações Adicionais</label>
              <input
                type="text"
                value={infoAdicional}
                onChange={(e) => setInfoAdicional(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20"
          >
            Gerar BR Code & Pix Copia e Cola
          </button>

          {/* Resultado do Payload */}
          {generatedPayload && (
            <div className="pt-4 space-y-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Payload EMVCo Gerado (com CRC16)</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                {generatedPayload}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSimulatePayment}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-emerald-400 font-medium transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simular Confirmação no SPI</span>
                </button>
              </div>

              {simStatus && (
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  {simStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resolução de Chaves DICT & MED */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Consulta de Titularidade (DICT)</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="CPF, CNPJ, Email, Tel ou EVP"
                value={dictSearchKey}
                onChange={(e) => setDictSearchKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleResolveDict}
                disabled={dictLoading}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-medium"
              >
                {dictLoading ? 'Consultando...' : 'Consultar'}
              </button>
            </div>

            {dictResult && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="text-slate-400 text-[11px]">Tipo de Chave: <span className="text-emerald-400 font-semibold">{dictResult.type}</span></div>
                <div className="text-slate-200 font-semibold">{dictResult.ownerName}</div>
                <div className="text-slate-400">Documento: {dictResult.ownerDocument}</div>
                <div className="text-slate-400">Instituição: {dictResult.bankName} (ISPB {dictResult.bankIspb})</div>
                <div className="text-slate-400">Agência: {dictResult.branch} | Conta: {dictResult.accountNumber}</div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Mecanismo Especial de Devolução (MED)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Módulo de contestação por suspeita de fraude ou erro operacional conforme Resolução BACEN nº 103. Bloqueio cautelar de fundos automático e análise de infração.
            </p>
            <div className="text-[11px] font-mono p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-between">
              <span>Status Módulo MED:</span>
              <span className="text-emerald-400 font-bold">OPERACIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
