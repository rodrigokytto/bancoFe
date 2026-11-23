import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import {
  FileText,
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Send,
  ExternalLink,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ContingenciaFiscalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: isOffline, refetch: refetchOffline } = trpc.zuma.isOfflineMode.useQuery();
  const { data: invoices, refetch: refetchInvoices } = trpc.zuma.getFiscalInvoices.useQuery();
  const { data: queue, refetch: refetchQueue } = trpc.zuma.getFiscalContingencyQueue.useQuery();

  const setOfflineMutation = trpc.zuma.setOfflineMode.useMutation({
    onSuccess: (newStatus) => {
      refetchOffline();
      toast.success(
        newStatus
          ? "Modo Contingência Offline SEFAZ-MT ATIVADO. Novas notas serão impressas com TP_EMIS=9 sem travar o caixa!"
          : "Conexão SEFAZ restabelecida. Modo Online normal ativado!"
      );
    }
  });

  const syncMutation = trpc.zuma.syncFiscalContingencyQueue.useMutation({
    onSuccess: (res) => {
      refetchInvoices();
      refetchQueue();
      if (res.totalSynced > 0) {
        toast.success(`Sucesso! Lote de ${res.totalSynced} NFC-e transmitido e homologado na SEFAZ-MT!`);
      } else {
        toast.info("Nenhuma nota pendente na fila de contingência.");
      }
    },
    onError: (err) => {
      toast.error(`Falha ao sincronizar contingência: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  const pendingCount = queue?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOffline ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
              {isOffline ? <WifiOff className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Central Fiscal NFC-e (SEFAZ-MT)</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isOffline ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}>
                  {isOffline ? "Contingência Offline Ativa" : "SEFAZ Online"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modelo 65 (NFC-e) • UF 51 (Mato Grosso) • Chaves com DV Módulo 11 e Contingência Tipo 9
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium">Simular Queda de Internet:</span>
            <button
              onClick={() => setOfflineMutation.mutate({ enabled: !isOffline })}
              disabled={setOfflineMutation.isPending}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isOffline
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              {isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOffline ? "Reconectar Internet (Modo Online)" : "Forçar Queda de Internet (Contingência)"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">
              Fila Pendente: <strong className="text-amber-400 font-bold">{pendingCount} notas</strong>
            </div>
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || pendingCount === 0}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{syncMutation.isPending ? "Transmitindo Lote..." : `Sincronizar Lote c/ SEFAZ (${pendingCount})`}</span>
            </button>
          </div>
        </div>

        {/* Conteúdo: Lista de Notas e Visualizador de Chave */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Notas Fiscais Emitidas */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Últimas Notas Fiscais Emitidas no Turno ({invoices?.length || 0})
              </h3>

              {(!invoices || invoices.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  Nenhuma nota emitida neste turno ainda. Finalize um pedido no caixa para gerar a NFC-e.
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedInvoice?.id === inv.id
                        ? "bg-orange-500/10 border-orange-500/50"
                        : "bg-slate-800/40 hover:bg-slate-800/80 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">NFC-e #{inv.nfcNumber}</span>
                        <span className="text-xs text-slate-400">Série {inv.serie}</span>
                        {inv.tableNumber && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                            Mesa {inv.tableNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-black text-emerald-400 text-sm">{formatBrl(inv.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center gap-2">
                        {inv.tipoEmissao === "contingencia_offline" ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                            <WifiOff className="w-2.5 h-2.5" />
                            Contingência Offline (TP_EMIS=9)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            SEFAZ-MT Autorizada
                          </span>
                        )}

                        <span className="text-slate-500 text-[11px]">
                          {new Date(inv.dataEmissao).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold ${inv.status === "pendente_contingencia" ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                        {inv.status === "pendente_contingencia" ? "Aguardando Envio SEFAZ" : `Protocolo: ${inv.protocoloAutorizacao?.slice(-8) || "OK"}`}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500 truncate mt-2">
                      Chave: {inv.chaveAcesso}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Painel Lateral: Detalhes da Nota Selecionada / DANFE NFC-e */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              {selectedInvoice ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400">DANFE NFC-e Detalhado</span>
                    <h4 className="text-base font-black text-white">NFC-e #{selectedInvoice.nfcNumber}</h4>
                    <p className="text-xs text-slate-400">{selectedInvoice.customerName || "Consumidor Final Não Identificado"}</p>
                    {selectedInvoice.cpf && <p className="text-xs text-slate-300">CPF: {selectedInvoice.cpf}</p>}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Valor dos Produtos:</span>
                      <strong className="text-white">{formatBrl(selectedInvoice.totalAmount)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Base de Cálculo ICMS:</span>
                      <strong className="text-white">{formatBrl(selectedInvoice.icmsBase)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Valor ICMS (Simples):</span>
                      <strong className="text-emerald-400">{formatBrl(selectedInvoice.icmsValor)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                      <span className="font-bold text-white">TOTAL A PAGAR:</span>
                      <strong className="font-black text-emerald-400 text-sm">{formatBrl(selectedInvoice.totalAmount)}</strong>
                    </div>
                  </div>

                  {/* Chave de Acesso Oficial SEFAZ-MT 44 Dígitos */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Chave de Acesso (44 dígitos):</p>
                    <p className="font-mono text-[11px] text-orange-400 break-all select-all mt-1">
                      {selectedInvoice.chaveAcesso}
                    </p>
                  </div>

                  {/* QR Code Oficial SEFAZ-MT */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-950" />
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-white">Consulta Via QR Code SEFAZ-MT</p>
                      <a
                        href={selectedInvoice.qrCodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-400 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                      >
                        <span>Abrir Consulta MT</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {selectedInvoice.motivoContingencia && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      <strong>Motivo da Contingência:</strong> {selectedInvoice.motivoContingencia}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                  <FileText className="w-8 h-8 text-slate-600 mb-2" />
                  Selecione uma nota fiscal ao lado para visualizar a chave de acesso oficial de 44 dígitos e o QR Code SEFAZ-MT.
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                Garantia de conformidade fiscal Art. 51-A RICMS/MT.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
