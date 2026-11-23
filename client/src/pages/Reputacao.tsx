import React from "react";
import { trpc } from "../lib/trpc";
import { Star, Sparkles, CheckCircle2, AlertCircle, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

export const Reputacao: React.FC = () => {
  const utils = trpc.useUtils();
  const { data: reviewsList = [], isLoading } = trpc.zuma.listReviews.useQuery();

  const replyMutation = trpc.zuma.generateAiReviewReply.useMutation({
    onSuccess: (data) => {
      utils.zuma.listReviews.invalidate();
      toast.success("Resposta gerada pela IA do Zumi e pronta para publicação!");
    },
    onError: (err) => {
      toast.error(`Erro ao gerar resposta: ${err.message}`);
    }
  });

  const avgRating = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "4.8";

  const totalReplied = reviewsList.filter(r => r.isReplied).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Reputação Online &amp; Google Meu Negócio
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Toda avaliação respondida com IA e o Zuma aparecendo em 1º no Google
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Centralize avaliações do Google e do iFood. A inteligência do Zumi redige respostas públicas acolhedoras com rapidez, resume o sentimento dos clientes e aponta melhorias de SEO local.
        </p>
      </div>

      {/* 4 KPIs de Reputação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Nota Média</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1 flex items-center gap-1.5">
            {avgRating} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 inline" />
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Google e iFood combinados</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Taxa de Resposta</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">
            {reviewsList.length ? Math.round((totalReplied / reviewsList.length) * 100) : 100}%
          </div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">{totalReplied} de {reviewsList.length} respondidas</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">NPS do Mês</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">+41</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">62% promotores vs 21% detratores</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Buscas no Google</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">+18%</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Com perfil de empresa otimizado</div>
        </div>
      </div>

      {/* Grid: Lista de Avaliações + Resumo e Auditoria SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Avaliações Recentes */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)]">Avaliações Recentes de Clientes</h2>

          <div className="space-y-3.5">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-[var(--surface2)] text-[var(--line)]"
                        }`}
                      />
                    ))}
                    <b className="text-xs text-[var(--ink)] ml-2">{rev.authorName}</b>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--muted)]">
                    {rev.platform} · {rev.dateText}
                  </span>
                </div>

                <p className="text-xs text-[var(--ink)] leading-relaxed italic">"{rev.comment}"</p>

                {rev.aiReply ? (
                  <div className="p-3 rounded-lg bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                    <span className="text-[10.5px] font-bold text-[var(--salmon)] uppercase tracking-wider block">
                      Resposta do Zuma (Zumi com IA):
                    </span>
                    <p className="text-xs text-[var(--ink)]">{rev.aiReply}</p>
                    <span className="text-[10px] text-[var(--good)] font-bold flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Publicada no perfil
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      replyMutation.mutate({
                        reviewId: rev.id,
                        platform: rev.platform,
                        rating: rev.rating,
                        comment: rev.comment,
                        authorName: rev.authorName || undefined,
                      })
                    }
                    disabled={replyMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Responder com IA (Tom do Zumi)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de Sentimento & SEO Local */}
        <div className="lg:col-span-5 space-y-6">
          {/* O que os clientes mais dizem */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-[var(--good)]" />
              Resumo Inteligente das Avaliações
            </h3>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--good)] font-bold">✓</span>
                <span><b>Elogio nº 1:</b> Hot roll crocante, peixe fresco no Combo 26 Peças e ambiente acolhedor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--bad)] font-bold">✕</span>
                <span><b>Reclamação nº 1:</b> Tempo de entrega nos horários de pico (meta: baixar para 45 min com KDS).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--bad)] font-bold">✕</span>
                <span><b>Reclamação nº 2:</b> Falta de flexibilidade para tirar ingrediente (solução: liberado sem custo na loja nova).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--salmon)] font-bold">★</span>
                <span><b>Pedido recorrente:</b> Enviar mais sachês de shoyu no delivery.</span>
              </li>
            </ul>
          </div>

          {/* Checklist de SEO Google Perfil da Empresa */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[var(--nori)]" />
              Auditoria do Perfil do Google
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { item: "Horários de funcionamento sincronizados", status: "ok", badge: "bg-[var(--nori-soft)] text-[var(--nori)]" },
                { item: "Link de pedido próprio (não apenas iFood)", status: "em falta", badge: "bg-[var(--bad)]/20 text-[var(--bad)]" },
                { item: "30+ fotos de pratos com nomes reais", status: "12 hoje", badge: "bg-[var(--warn)]/20 text-[var(--warn)]" },
                { item: "100% das avaliações respondidas em 24h", status: "em dia", badge: "bg-[var(--nori-soft)] text-[var(--nori)]" },
                { item: "Post semanal com o prato do dia", status: "agendar", badge: "bg-[var(--salmon-soft)] text-[var(--salmon)]" },
                { item: "Categorias: Restaurante Japonês + Delivery", status: "ok", badge: "bg-[var(--nori-soft)] text-[var(--nori)]" }
              ].map((seo, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface2)]">
                  <span className="text-[var(--ink)] font-medium">{seo.item}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${seo.badge}`}>
                    {seo.status}
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
