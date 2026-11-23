import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl, ALL_ITEMS } from "../../../shared/zumaData";
import { Send, Sparkles, Target, DollarSign, Users, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Campanhas: React.FC = () => {
  const [segment, setSegment] = useState("Todos com opt-in (1.240 clientes)");
  const [goal, setGoal] = useState("Encher terça à noite");
  const [dish, setDish] = useState("Combo 26 Peças");
  const [offer, setOffer] = useState("Frete grátis acima de R$ 80");
  const [copy, setCopy] = useState(
    "🍣 Terça é dia de sushi no Zuma! Hoje o Combo 26 Peças sai com frete grátis em toda Tangará da Serra. Peça direto no nosso link oficial com o Zumi e receba quentinho!"
  );

  const utils = trpc.useUtils();
  const { data: rawCampaigns = [] } = trpc.zuma.listCampaigns.useQuery();

  const writeCopyMutation = trpc.zuma.generateCampaignCopy.useMutation({
    onSuccess: (data) => {
      setCopy(data.copy);
      toast.success("Mensagem criada com sucesso pelo copywriter do Zumi!");
    },
    onError: (err) => {
      toast.error(`Erro ao gerar texto: ${err.message}`);
    }
  });

  const launchMutation = trpc.zuma.launchCampaign.useMutation({
    onSuccess: () => {
      utils.zuma.listCampaigns.invalidate();
      toast.success("Campanha agendada e salva com sucesso!");
    },
    onError: (err) => {
      toast.error(`Erro ao salvar campanha: ${err.message}`);
    }
  });

  // Cálculos de Projeção
  const reach = segment.includes("1.240") ? 1240 : segment.includes("540") ? 540 : 420;
  const convRate = 0.08; // 8%
  const extraOrders = Math.round(reach * convRate);
  const ticket = 98;
  const projectedRevenue = extraOrders * ticket;
  const whatsappCost = reach * 0.12; // custo disparador WhatsApp
  const productCost = projectedRevenue * 0.32; // CMV 32%
  const projectedProfit = projectedRevenue - productCost - whatsappCost;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          WhatsApp Segmentado &amp; Disparos
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Campanha certa, para o cliente certo, no horário vazio
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Escolha o público e o objetivo. A IA escreve a mensagem na voz do Zumi e mostra quanto ela deve render. Nada sai daqui sem a sua aprovação.
        </p>
      </div>

      {/* Grid: Editor + Previsão */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor da Campanha */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--salmon)]" />
            Configurar Nova Campanha
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Público */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--ink)]">Público Alvo</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-medium"
              >
                <option value="Todos com opt-in (1.240 clientes)">Todos com opt-in (1.240 clientes)</option>
                <option value="Sumidos há 60+ dias (540 clientes)">Sumidos há 60+ dias (540 clientes)</option>
                <option value="Fãs de Salmão Cru (420 clientes)">Fãs de Salmão Cru (420 clientes)</option>
                <option value="Fãs de Hot Roll (610 clientes)">Fãs de Hot Roll (610 clientes)</option>
                <option value="Famílias e Grupos (210 clientes)">Famílias e Grupos (210 clientes)</option>
              </select>
            </div>

            {/* Objetivo */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--ink)]">Objetivo Comercial</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-medium"
              >
                <option value="Encher terça à noite">Encher terça à noite</option>
                <option value="Encher quarta à noite">Encher quarta à noite</option>
                <option value="Vender almoço executivo">Vender almoço executivo</option>
                <option value="Trazer de volta quem sumiu">Trazer de volta quem sumiu</option>
                <option value="Vender Clube Zumi">Vender Clube Zumi</option>
                <option value="Sexta da Barca Especial">Sexta da Barca Especial</option>
              </select>
            </div>

            {/* Prato em Destaque */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--ink)]">Prato em Destaque</label>
              <select
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-medium"
              >
                {ALL_ITEMS.slice(0, 15).map(i => (
                  <option key={i.nome} value={i.nome}>{i.nome} ({formatBrl(i.preco)})</option>
                ))}
              </select>
            </div>

            {/* Oferta */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--ink)]">Oferta ou Gancho</label>
              <select
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-medium"
              >
                <option value="Frete grátis acima de R$ 80">Frete grátis acima de R$ 80</option>
                <option value="Hot Roll em dobro até 20h">Hot Roll em dobro até 20h</option>
                <option value="Cupom de R$ 15 válido até domingo">Cupom de R$ 15 válido até domingo</option>
                <option value="Refrigerante grátis no combo">Refrigerante grátis no combo</option>
                <option value="Raspadinha do Zumi no pedido">Raspadinha do Zumi no pedido</option>
                <option value="Sem desconto, só prato novo">Sem desconto, só prato novo</option>
              </select>
            </div>
          </div>

          {/* Botão de Escrever com IA */}
          <button
            onClick={() => writeCopyMutation.mutate({ goal, segment, dish, offer })}
            disabled={writeCopyMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-[var(--nori)] text-white text-xs font-bold hover:brightness-105 flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            {writeCopyMutation.isPending ? "Escrevendo mensagem com tom do Zumi..." : "Pedir para IA escrever o texto perfeito"}
          </button>

          {/* Preview no WhatsApp */}
          <div className="space-y-1.5 pt-2">
            <label className="font-bold text-xs text-[var(--ink)] block">
              Mensagem que o cliente receberá no WhatsApp:
            </label>
            <div className="p-3.5 rounded-xl bg-[var(--bubble-out)] border border-[var(--line)] text-xs text-[var(--ink)] leading-relaxed space-y-2">
              <textarea
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-0 focus:outline-none resize-none text-xs text-[var(--ink)] leading-relaxed"
              />
              <div className="text-[10px] text-[var(--muted)] border-t border-[var(--line)]/40 pt-1.5 flex justify-between">
                <span>Link direto com rastreio de conversão</span>
                <span>"Para não receber mais, responda SAIR"</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() =>
                launchMutation.mutate({
                  segment,
                  goal,
                  dish,
                  offer,
                  message: copy,
                  recipientsCount: reach,
                  expectedOrders: extraOrders,
                  expectedRevenue: projectedRevenue,
                })
              }
              disabled={launchMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Aprovar e Agendar Disparo
            </button>
          </div>
        </div>

        {/* Previsão de Impacto Financeiro (ROI) */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--good)]" />
            Previsão Financeira da Campanha
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">Clientes impactados</span>
              <b className="font-mono-nums text-[var(--ink)]">{reach} pessoas</b>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">Conversão estimada</span>
              <b className="font-mono-nums text-[var(--ink)]">8% (~{extraOrders} pedidos)</b>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">Ticket médio esperado</span>
              <b className="font-mono-nums text-[var(--ink)]">{formatBrl(ticket)}</b>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">Faturamento bruto estimado</span>
              <b className="font-mono-nums text-[var(--salmon)] font-bold">{formatBrl(projectedRevenue)}</b>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">Custo de envio WhatsApp (R$ 0,12/msg)</span>
              <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(whatsappCost)}</span>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
              <span className="text-[var(--muted)]">CMV estimado da comida (32%)</span>
              <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(productCost)}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-[var(--nori-soft)] border border-[var(--nori)]/20 font-bold text-xs text-[var(--nori)]">
              <span>Lucro Líquido Previsto no Bolso</span>
              <span className="font-mono-nums text-sm">{formatBrl(projectedProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campanhas Ativas e Histórico */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--salmon)]" />
          Campanhas Agendadas e Recentes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-4 font-bold">Objetivo</th>
                <th className="py-2 px-3 font-bold">Público</th>
                <th className="py-2 px-3 font-bold">Oferta</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Disparos</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Pedidos Gerados</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Faturamento</th>
                <th className="py-2 pl-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rawCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface2)]/50">
                  <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">{c.goal} - {c.dish}</td>
                  <td className="py-2.5 px-3 text-[var(--muted)]">{c.segment}</td>
                  <td className="py-2.5 px-3 text-[var(--ink)]">{c.offer}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--ink)] font-bold">{c.recipientsCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--good)] font-bold">
                    {c.expectedOrders}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--salmon)] font-bold">
                    {formatBrl(parseFloat(c.expectedRevenue || "0"))}
                  </td>
                  <td className="py-2.5 pl-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--nori-soft)] text-[var(--nori)]">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
