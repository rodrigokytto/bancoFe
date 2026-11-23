import React, { useState } from "react";
import {
  FileSpreadsheet,
  HardDrive,
  Database,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Download,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  ShieldCheck,
  Building2,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

export const GoogleEcosystemHub: React.FC = () => {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const googleQuery = trpc.zuma.getGoogleHubData.useQuery(undefined, {
    refetchInterval: 6000,
  });

  const exportMutation = trpc.zuma.triggerGoogleExport.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `Latência de streaming: ${data.latencyMs}ms`
      });
      setIsExporting(null);
      googleQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Falha na exportação: ${err.message}`);
      setIsExporting(null);
    }
  });

  const replyMutation = trpc.zuma.respondGoogleReview.useMutation({
    onSuccess: (data) => {
      toast.success(`Resposta enviada para a avaliação de ${data.review.authorName}!`);
      setSelectedReviewId(null);
      setReplyText("");
      googleQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao responder: ${err.message}`);
    }
  });

  const data = googleQuery.data;

  const handleExport = (type: "sheets_dre" | "sheets_kardex" | "drive_xml_backup" | "bigquery_stream") => {
    setIsExporting(type);
    exportMutation.mutate({ type });
  };

  const handleReplyReview = (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Digite o texto da resposta para o cliente.");
      return;
    }
    replyMutation.mutate({ reviewId, replyText });
  };

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Google Cloud, Workspace & Local Intelligence
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API v4 & BigQuery Streaming Ativo
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Sincronização contínua com Google Sheets (DRE/Kardex), Google Drive (Backups XML SEFAZ-MT), BigQuery, Looker Studio e Google Maps Reserve.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => googleQuery.refetch()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${googleQuery.isFetching ? "animate-spin" : ""}`} />
              Atualizar Dados
            </button>
            <button
              onClick={() => handleExport("bigquery_stream")}
              disabled={isExporting !== null}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              Sincronizar Pipeline BI
            </button>
          </div>
        </div>

        {/* METRIC CARDS GOOGLE */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Google Sheets
            </div>
            <div className="text-lg font-bold text-white">4 Planilhas</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Bi-direcional D+0</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              Drive Backup
            </div>
            <div className="text-lg font-bold text-white">342.8 MB</div>
            <div className="text-[11px] text-blue-400 mt-0.5">148 Backups XML</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              BigQuery Stream
            </div>
            <div className="text-lg font-bold text-white">42ms</div>
            <div className="text-[11px] text-purple-400 mt-0.5">Dataset Tangará</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Google Reviews
            </div>
            <div className="text-lg font-bold text-white">4.9 ★</div>
            <div className="text-[11px] text-amber-400 mt-0.5">384 Avaliações (96% +)</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              Google Reserve
            </div>
            <div className="text-lg font-bold text-white">8 Mesas</div>
            <div className="text-[11px] text-red-400 mt-0.5">Hoje via Maps</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Google Calendar
            </div>
            <div className="text-lg font-bold text-white">14 Eventos</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Escalas & Salmão</div>
          </div>
        </div>
      </div>

      {/* GRADE EM 2 COLUNAS: SHEETS/DRIVE E REVIEWS/CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: GOOGLE SHEETS & BIGQUERY BI */}
        <div className="space-y-6">
          {/* PAINEL GOOGLE SHEETS BI-DIRECIONAL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Google Sheets Bi-direcional</h3>
                  <p className="text-xs text-slate-400">Exportação e sincronização com DRE, Kardex e Vendas</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                Sync automático D+0
              </span>
            </div>

            <div className="space-y-3">
              {data?.sheets.spreadsheets.map((s, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Intervalo: {s.range} • {s.rowsCount} linhas preenchidas
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {s.lastUpdate}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/50">
                    <button
                      onClick={() => handleExport(idx === 0 ? "sheets_dre" : "sheets_kardex")}
                      disabled={isExporting !== null}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sincronizar
                    </button>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir no Sheets
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Compatível com fórmulas Excel/Google Sheets e pivot tables dinâmicas.
              </span>
            </div>
          </div>

          {/* PAINEL GOOGLE DRIVE BACKUP SEFAZ */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Google Drive Cloud Backup</h3>
                  <p className="text-xs text-slate-400">Armazenamento em nuvem de XMLs fiscais e bancos de dados</p>
                </div>
              </div>
              <button
                onClick={() => handleExport("drive_xml_backup")}
                disabled={isExporting !== null}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Backup Imediato
              </button>
            </div>

            <div className="space-y-2.5">
              {data?.drive.recentBackups.map((b, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center text-blue-400 font-mono text-[10px]">
                      {b.type.split("_")[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{b.fileName}</div>
                      <div className="text-slate-500 text-[11px]">{b.sizeKb} KB • {new Date(b.createdAt).toLocaleTimeString("pt-BR")}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Criptografado SHA-256
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: REVIEWS, GOOGLE MAPS RESERVE & CALENDAR */}
        <div className="space-y-6">
          {/* PAINEL GOOGLE REVIEWS & RESPOSTA POR IA */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Google Meu Negócio & Reviews</h3>
                  <p className="text-xs text-slate-400">Classificação 4.9★ no Google Maps de Tangará da Serra</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                IA Zumi Copilot Ativa
              </div>
            </div>

            <div className="space-y-3">
              {data?.reviews.items.map((r) => (
                <div key={r.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-sm">{r.authorName}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <p className="text-xs text-slate-300 italic mb-3">"{r.comment}"</p>

                  {r.replied && r.replyText ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        Resposta do Zuma Cozinha Oriental:
                      </div>
                      <p className="text-slate-400">{r.replyText}</p>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-slate-800/80">
                      {selectedReviewId === r.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escreva a resposta personalizada ou gere com a IA Zumi..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedReviewId(null);
                                setReplyText("");
                              }}
                              className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReplyReview(r.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Publicar no Google
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReviewId(r.id);
                            setReplyText("Olá! Agradecemos imensamente o seu carinho e feedback. Nossa equipe se dedica para entregar o melhor da alta gastronomia oriental em Tangará da Serra. Até breve!");
                          }}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Responder com IA Zumi
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PAINEL GOOGLE RESERVE & CALENDAR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Google Maps Reserve & Agenda</h3>
                  <p className="text-xs text-slate-400">Reserva de mesas via Google Maps e agenda da brigada</p>
                </div>
              </div>
              <a
                href={data?.reserve.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg border border-red-500/30 flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ficha Maps
              </a>
            </div>

            <div className="space-y-2.5">
              {data?.calendar.nextEvents.map((ev, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200">{ev.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{ev.sector}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
