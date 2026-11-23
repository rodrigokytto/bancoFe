import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { formatBrl, ALL_ITEMS, BAIRROS_TANGARA } from "../../../shared/zumaData";
import { WhatsAppMessageBubble } from "../components/chat/WhatsAppMessageBubble";
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
  ShoppingBag,
  CheckCircle,
  Plus,
  Flame,
  CreditCard,
  Tag,
  Maximize2,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Zap,
  Info,
  Clock,
  ChevronRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Mic,
  Receipt,
  ChefHat,
  Bike,
  Activity,
  Award,
  TrendingUp,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export const AtendimentoCockpit: React.FC = () => {
  const [filter, setFilter] = useState<string>("todas");
  const [search, setSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string>("demo-livia");
  const [writeMode, setWriteMode] = useState<"cli" | "hum">("hum");
  const [inputText, setInputText] = useState("");
  const [activeSideTab, setActiveSideTab] = useState<"perfil" | "carrinho" | "historico">("perfil");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Fechamento de Venda Rápida
  const [selectedDish, setSelectedDish] = useState<string>("Hot Filadélfia (12un)");
  const [dishQty, setDishQty] = useState<number>(1);
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [deliveryFeeVal, setDeliveryFeeVal] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("Pix");
  const [showSalesBar, setShowSalesBar] = useState<boolean>(true);

  const utils = trpc.useUtils();
  const { data: convs = [], isLoading } = trpc.zuma.listConversations.useQuery(undefined, {
    refetchInterval: 3500,
  });
  const { data: aiMetrics } = trpc.zuma.getAiMetrics.useQuery();
  const { data: allOrders = [] } = trpc.zuma.listOrders.useQuery(undefined, {
    refetchInterval: 4000,
  });

  const currentConv = convs.find(c => c.id === selectedConvId) || convs[0];
  const { data: customerProfile } = trpc.zuma.getCustomerProfile.useQuery(
    { customerName: currentConv?.customerName || "" },
    { enabled: !!currentConv?.customerName }
  );

  // Pedido ativo do cliente na cozinha
  const activeCustomerOrder = allOrders.find(
    (o: any) =>
      (o.customerName || "").toLowerCase() === (currentConv?.customerName || "").toLowerCase() &&
      o.status !== "entregue"
  );

  // Bip suave de alerta com Web Audio API
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("AudioContext not allowed or supported", e);
    }
  };

  const sendMsgMutation = trpc.zuma.sendWhatsAppMessage.useMutation({
    onSuccess: () => {
      utils.zuma.listConversations.invalidate();
      utils.zuma.getCustomerProfile.invalidate();
      setInputText("");
    },
    onError: (err) => {
      toast.error(`Erro ao enviar mensagem: ${err.message}`);
    }
  });

  const updateStatusMutation = trpc.zuma.updateConversationStatus.useMutation({
    onSuccess: () => {
      utils.zuma.listConversations.invalidate();
      utils.zuma.getCustomerProfile.invalidate();
    }
  });

  const closeSaleMutation = trpc.zuma.closeSaleAndHandover.useMutation({
    onSuccess: (data) => {
      utils.zuma.listConversations.invalidate();
      utils.zuma.getCustomerProfile.invalidate();
      utils.zuma.listOrders.invalidate();
      toast.success(`🎉 Venda fechada com sucesso! Pedido #${data.orderNumber} enviado à cozinha (${formatBrl(data.total)})`);
    },
    onError: (err) => {
      toast.error(`Erro ao fechar venda: ${err.message}`);
    }
  });

  const createConvMutation = trpc.zuma.createCustomerConversation.useMutation({
    onSuccess: (data) => {
      utils.zuma.listConversations.invalidate();
      setSelectedConvId(data.conversationId);
      if (soundEnabled) playAlertChime();
      toast.success("Novo cliente chamando no WhatsApp!");
    }
  });

  // Métricas
  const totalConvs = convs.length;
  const inQueue = convs.filter(c => c.status === "fila").length;
  const withHuman = convs.filter(c => c.status === "humano").length;
  const aiHandling = convs.filter(c => c.status === "ia").length;
  const resolved = convs.filter(c => c.status === "resolvida").length;

  // Filtragem
  const filteredConvs = convs.filter((c) => {
    if (filter === "fila") return c.status === "fila";
    if (filter === "humano") return c.status === "humano";
    if (filter === "ia") return c.status === "ia";
    if (filter === "resolvida") return c.status === "resolvida";
    return true;
  }).filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.customerName.toLowerCase().includes(term) ||
      (c.neighborhood || "").toLowerCase().includes(term) ||
      c.customerPhone.includes(term)
    );
  });

  // Assumir Atendimento
  const handleAssumeConversation = (convId: string) => {
    updateStatusMutation.mutate({
      conversationId: convId,
      action: "assume",
      agentName: "Ana (equipe)",
    });
    setWriteMode("hum");
    setSelectedConvId(convId);
    toast.success(`Você assumiu o atendimento de ${currentConv?.customerName || "cliente"}!`);
  };

  // Devolver para a IA
  const handleReturnToAi = () => {
    if (!currentConv) return;
    updateStatusMutation.mutate({
      conversationId: currentConv.id,
      action: "backToAi",
    });
    toast.success("Atendimento devolvido com sucesso para a IA Zumi!");
  };

  // Encerrar e Resolver Conversa
  const handleResolveConversation = () => {
    if (!currentConv) return;
    updateStatusMutation.mutate({
      conversationId: currentConv.id,
      action: "resolve",
    });
    toast.success("Conversa marcada como resolvida!");
  };

  // Fechar Venda Rápida
  const handleExecuteCloseSale = (returnToAiAfter: boolean = true) => {
    if (!currentConv) return;
    const dish = ALL_ITEMS.find(i => i.nome === selectedDish) || { nome: selectedDish, preco: 39.9, cat: "Combinados" };

    closeSaleMutation.mutate({
      conversationId: currentConv.id,
      customerName: currentConv.customerName,
      items: [{ nome: dish.nome, preco: dish.preco, cat: dish.cat || "Combinados", q: dishQty }],
      discount: discountVal,
      deliveryFee: deliveryFeeVal,
      paymentMethod: payMethod,
      attendantNotes: `Venda rápida fechada pelo Cockpit com ${dish.nome}.`,
      returnToAi: returnToAiAfter,
      resolveConversation: false,
    });
  };

  // Enviar Mensagem Manual
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentConv) return;

    sendMsgMutation.mutate({
      conversationId: currentConv.id,
      authorType: writeMode,
      authorName: writeMode === "hum" ? "Ana (equipe)" : undefined,
      content: inputText.trim(),
    });
  };

  // Disparo de Áudio Simulado do Cliente
  const handleSimulateAudioMessage = () => {
    if (!currentConv) return;
    sendMsgMutation.mutate({
      conversationId: currentConv.id,
      authorType: "cli",
      content: "🎤 Mensagem de voz (0:14)",
      messageType: "audio",
      audioDurationSeconds: 14,
      audioTranscription: "Boa noite Zumi! Quero pedir um combo de 26 peças e um hot filadélfia com shoyu extra aqui pro Centro, por favor!",
    });
    toast.info("Áudio de voz enviado! Zumi AI transcreverá e responderá em instantes.");
  };

  // Disparo de Comprovante PIX Simulado
  const handleSimulatePixReceipt = () => {
    if (!currentConv) return;
    sendMsgMutation.mutate({
      conversationId: currentConv.id,
      authorType: "cli",
      content: "Segue o comprovante do Pix Sicredi que acabei de pagar!",
      messageType: "receipt",
      receiptDetails: {
        amount: 79.9,
        bank: "Sicredi",
        txId: "E847192038192847",
        status: "validado",
        verifiedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    });
    toast.info("Comprovante PIX enviado! IA Zumi autenticará e avançará o pedido.");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      {/* HEADER EXCLUSIVO DO COCKPIT */}
      <header className="h-14 border-b border-[var(--line)] bg-[var(--surface)] px-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ZumiMascot size={32} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-[var(--ink)]">
                  Cockpit do Atendente · WhatsApp Zuma
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Monitoramento ao Vivo
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)] hidden sm:block">
                A IA atende automaticamente. Quando precisa de ajuda, o box pisca em vermelho para você assumir, fechar a venda e devolver para a IA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Som de Alerta Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
              toast.info(soundEnabled ? "Som de alerta desativado" : "Som de alerta ativado (bip suave)");
            }}
            title={soundEnabled ? "Alerta sonoro ativo" : "Alerta sonoro mudo"}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              soundEnabled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{soundEnabled ? "Som Ativo" : "Mudo"}</span>
          </button>

          {inQueue > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{inQueue} {inQueue === 1 ? "conversa precisa" : "conversas precisam"} de você!</span>
            </div>
          )}

          <Link
            href="/zumi"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:border-[var(--salmon)] transition-all"
          >
            <span>Painel Zuma</span>
            <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
          </Link>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO COCKPIT EM 3 COLUNAS */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* ================= COLUNA 1: LISTAGEM DE CONVERSAS (BOXES) ================= */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3 flex flex-col shadow-xs space-y-3 overflow-hidden">
          {/* Filtros em Pílula */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "todas", label: `Todas (${totalConvs})` },
              { id: "fila", label: `🚨 Urgentes (${inQueue})`, alert: inQueue > 0 },
              { id: "ia", label: `🤖 IA (${aiHandling})` },
              { id: "humano", label: `👤 Equipe (${withHuman})` },
              { id: "resolvida", label: `✅ Resolvidas (${resolved})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f.id
                    ? f.alert
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-[var(--ink)] text-white shadow-xs"
                    : f.alert
                    ? "bg-red-500/10 text-red-600 border border-red-500/30"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Buscar cliente, bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)] transition-all"
            />
          </div>

          {/* Lista de Boxes de Conversa */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConvs.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const isNeedsHelp = conv.status === "fila";
              const isHuman = conv.status === "humano";
              const isAi = conv.status === "ia";
              const isResolved = conv.status === "resolvida";
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isNeedsHelp
                      ? "box-alert-pulsing-red bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                      : isSelected
                      ? "border-[var(--salmon)] bg-[var(--salmon-soft)]/20 shadow-xs"
                      : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {/* Badge de Alerta Vermelho quando IA não consegue atender */}
                  {isNeedsHelp && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-red-500/20 text-red-600">
                      <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                        <span>🚨 IA PRECISA DE AJUDA</span>
                      </div>
                      <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded font-mono-nums">
                        URGENTE
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <b className="text-xs font-bold text-[var(--ink)] truncate">{conv.customerName}</b>
                    <span className="text-[10px] text-[var(--muted)] font-mono-nums shrink-0">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[var(--muted)] line-clamp-1 mt-0.5">
                    {(lastMsg as any)?.messageType === "audio" ? "🎤 Nota de voz do cliente" : (lastMsg as any)?.messageType === "receipt" ? "🧾 Comprovante Pix enviado" : lastMsg?.content || "Conversa iniciada"}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--line)]/50">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isNeedsHelp
                          ? "bg-red-600 text-white"
                          : isHuman
                          ? "bg-[var(--warn)]/20 text-[var(--warn)]"
                          : isAi
                          ? "bg-[var(--nori-soft)] text-[var(--nori)]"
                          : "bg-[var(--surface2)] text-[var(--muted)]"
                      }`}
                    >
                      {isNeedsHelp
                        ? conv.handoffReason || "Transbordo"
                        : isHuman
                        ? `Com ${conv.assignedAgent || "Ana"}`
                        : isAi
                        ? "Zumi atendendo"
                        : "Resolvida"}
                    </span>
                    <span className="text-[10.5px] text-[var(--muted)]">{conv.neighborhood}</span>
                  </div>

                  {/* Botão de Ação Direta no Card Pulsando */}
                  {isNeedsHelp && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssumeConversation(conv.id);
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>🚨 Pegar Atendimento Agora</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* SIMULADOR DE CHAMADOS NO WHATSAPP */}
          <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Simular Chamados no WhatsApp:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  createConvMutation.mutate({
                    name: "Renata Vasconcelos",
                    neighborhood: "Centro",
                    customMessage: "Boa noite! Meu pedido veio completamente frio e demorou mais de 1 hora! Quero meu dinheiro de volta ou cancelamento!",
                  })
                }
                className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 text-[11px] font-bold hover:bg-red-500/20 text-center transition-all truncate"
              >
                ⚠️ Reclamação (Frio)
              </button>
              <button
                type="button"
                onClick={() =>
                  createConvMutation.mutate({
                    name: "Lucas Mendonça (Empresa)",
                    neighborhood: "Jardim Europa",
                    customMessage: "Olá Zuma! Gostaríamos de fazer uma confraternização para 35 pessoas na próxima quinta. Como funciona o buffet e rodízio?",
                  })
                }
                className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 text-[11px] font-bold hover:bg-amber-500/20 text-center transition-all truncate"
              >
                🎉 Evento 35 Pessoas
              </button>
              <button
                type="button"
                onClick={() =>
                  createConvMutation.mutate({
                    name: "Priscila Siqueira",
                    neighborhood: "Jardim Tarumã",
                    customMessage: "Oi! Sou gestante e não posso comer nada de peixe cru. O que vocês recomendam de hot rolls e grelhados seguros?",
                    dietary: "Gestante - sem peixe cru",
                  })
                }
                className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[11px] font-bold hover:bg-emerald-500/20 text-center transition-all truncate"
              >
                🍣 Sem Peixe Cru
              </button>
              <button
                type="button"
                onClick={() =>
                  createConvMutation.mutate({
                    name: "Fernando Dias",
                    neighborhood: "Vila Alta",
                    customMessage: "Boa noite, o Combo 26 peças vem com sashimi de salmão? Qual o tempo de entrega para a Vila Alta hoje?",
                  })
                }
                className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] text-[11px] font-bold hover:border-[var(--salmon)] text-center transition-all truncate"
              >
                💬 Dúvida Cardápio
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUNA 2: CHAT DO ATENDIMENTO COM BARRA TÁTICA ================= */}
        <div className="lg:col-span-5 xl:col-span-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex flex-col shadow-xs overflow-hidden">
          {/* Header da Conversa Ativa */}
          <div className="p-3.5 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ZumiMascot size={28} />
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-sm font-bold text-[var(--ink)]">{currentConv?.customerName}</b>
                  <span className="text-xs text-[var(--muted)] font-mono-nums">{currentConv?.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {currentConv?.status === "fila" ? (
                    <span className="text-red-600 font-extrabold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Precisa de atendente humano! ({currentConv.handoffReason})
                    </span>
                  ) : currentConv?.status === "humano" ? (
                    <span className="text-[var(--warn)] font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Em atendimento por {currentConv.assignedAgent || "Ana (equipe)"}
                    </span>
                  ) : currentConv?.status === "ia" ? (
                    <span className="text-[var(--nori)] font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      IA Zumi respondendo automaticamente
                    </span>
                  ) : (
                    <span className="text-[var(--muted)] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Atendimento Encerrado / Resolvido
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação no Topo do Chat */}
            <div className="flex items-center gap-1.5">
              {currentConv?.status === "fila" && (
                <button
                  type="button"
                  onClick={() => handleAssumeConversation(currentConv.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assumir Atendimento</span>
                </button>
              )}

              {currentConv?.status === "humano" && (
                <>
                  <button
                    type="button"
                    onClick={handleReturnToAi}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--nori)] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    title="Devolve o cliente para o Zumi continuar o atendimento automaticamente"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Devolver para IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResolveConversation}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold flex items-center gap-1 border border-[var(--line)] transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--good)]" />
                    <span>Encerrar</span>
                  </button>
                </>
              )}

              {currentConv?.status === "ia" && (
                <button
                  type="button"
                  onClick={() => handleAssumeConversation(currentConv.id)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assumir Atendimento</span>
                </button>
              )}
            </div>
          </div>

          {/* STATUS DO PEDIDO NA COZINHA KDS (QUANDO ATIVO) */}
          {activeCustomerOrder && (
            <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-600 animate-spin" />
                <span className="font-bold text-amber-800 dark:text-amber-200">
                  Pedido #{activeCustomerOrder.orderNumber} na Cozinha KDS:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono-nums font-bold text-[10px] uppercase">
                  {activeCustomerOrder.status}
                </span>
                <span className="text-[11px] text-[var(--muted)] hidden sm:inline">
                  {formatBrl(Number(activeCustomerOrder.total))} · {activeCustomerOrder.neighborhood}
                </span>
              </div>
              <Link
                href="/kds"
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
              >
                <span>Ver no KDS</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* BARRA TÁTICA: FECHAMENTO RÁPIDO DE VENDA */}
          {currentConv?.status === "humano" && showSalesBar && (
            <div className="p-3 bg-gradient-to-r from-[var(--salmon-soft)]/40 via-[var(--surface2)] to-[var(--surface)] border-b border-[var(--salmon)]/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                <span className="flex items-center gap-1.5 text-[var(--salmon)] font-extrabold text-[11px] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  Fechamento Rápido de Venda &amp; Pedido
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  Feche a venda aqui e devolva o cliente para a IA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                {/* Selecionar Prato */}
                <div className="md:col-span-5">
                  <select
                    value={selectedDish}
                    onChange={(e) => setSelectedDish(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-medium"
                  >
                    {ALL_ITEMS.slice(0, 30).map((it, idx) => (
                      <option key={idx} value={it.nome}>
                        {it.nome} ({formatBrl(it.preco)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantidade & Cortesias */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={dishQty}
                    onChange={(e) => setDishQty(Number(e.target.value))}
                    className="w-12 text-xs p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-center font-bold"
                  />
                  <select
                    value={discountVal}
                    onChange={(e) => setDiscountVal(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  >
                    <option value={0}>Sem desc</option>
                    <option value={10}>- R$ 10 (Cortesia)</option>
                    <option value={15}>- R$ 15 (VIP)</option>
                    <option value={20}>- R$ 20 (Compensação)</option>
                  </select>
                </div>

                {/* Forma de Pagamento */}
                <div className="md:col-span-2">
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-bold"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                {/* Botão Fechar Venda */}
                <div className="md:col-span-2">
                  <button
                    onClick={() => handleExecuteCloseSale(true)}
                    disabled={closeSaleMutation.isPending}
                    className="w-full py-1.5 rounded-lg bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Fechar Venda
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Área de Mensagens com Componente Dedicado WhatsAppMessageBubble */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--chat-bg)]">
            {currentConv?.messages.map((m, idx) => (
              <WhatsAppMessageBubble
                key={m.id || idx}
                message={m as any}
                customerName={currentConv.customerName}
              />
            ))}

            {sendMsgMutation.isPending && (
              <div className="flex items-end justify-end">
                <div className="bg-[var(--bubble-out)] p-2.5 rounded-2xl rounded-tr-xs text-xs text-[var(--muted)] flex items-center gap-2">
                  <ZumiMascot size={20} />
                  <span>Zumi processando resposta inteligente...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chips de Resposta Rápida do Atendente */}
          <div className="px-3 pt-2 bg-[var(--surface)] border-t border-[var(--line)] flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              "Oi! Já assumi seu atendimento e vou resolver agora mesmo.",
              "Preparei um cupom de frete grátis e cortesia para compensar!",
              "Pode deixar que a nossa cozinha vai preparar o seu pedido com prioridade.",
              "Vou gerar a chave Pix do pedido para você acertar: zuma@kytto.com.br",
              "Tudo resolvido! O Zumi volta para acompanhar sua entrega 🍣",
            ].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(q)}
                className="px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--surface2)] text-[11px] text-[var(--ink)] whitespace-nowrap hover:border-[var(--salmon)] transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Barra de Simulação de Áudio & Comprovante PIX */}
          <div className="px-3 py-1 bg-[var(--surface)] flex items-center justify-between text-xs border-t border-[var(--line)]/40 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSimulateAudioMessage}
                disabled={sendMsgMutation.isPending}
                className="px-2 py-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] text-[var(--ink)] hover:border-[var(--salmon)] font-medium flex items-center gap-1"
                title="Simular cliente enviando áudio no WhatsApp com transcrição"
              >
                <Mic className="w-3 h-3 text-[var(--salmon)]" />
                <span>Simular Áudio</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePixReceipt}
                disabled={sendMsgMutation.isPending}
                className="px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] hover:bg-emerald-500/20 font-medium flex items-center gap-1"
                title="Simular envio de comprovante PIX autenticado"
              >
                <Receipt className="w-3 h-3 text-emerald-600" />
                <span>Simular Pix</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] text-[var(--muted)] font-medium hidden sm:inline">Modo:</span>
              <div className="flex rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface2)] p-0.5">
                <button
                  type="button"
                  onClick={() => setWriteMode("cli")}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                    writeMode === "cli" ? "bg-[var(--ink)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setWriteMode("hum")}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                    writeMode === "hum" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Atendente
                </button>
              </div>
            </div>
          </div>

          {/* Input de Envio */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[var(--surface)] border-t border-[var(--line)] flex gap-2">
            <input
              type="text"
              placeholder={writeMode === "cli" ? "Simular o que o cliente falaria..." : "Responda como atendente humano (ensina a IA Zumi)..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
            />
            <button
              type="submit"
              disabled={sendMsgMutation.isPending || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </button>
          </form>
        </div>

        {/* ================= COLUNA 3: DOSSIÊ DO CLIENTE & AUDITORIA DE IA ================= */}
        <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs space-y-4">
          {/* Abas */}
          <div className="flex border-b border-[var(--line)]">
            {[
              { id: "perfil", label: "Perfil & IA" },
              { id: "carrinho", label: "Carrinho" },
              { id: "historico", label: "Auditoria" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSideTab(t.id as any)}
                className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition-all ${
                  activeSideTab === t.id
                    ? "border-[var(--salmon)] text-[var(--salmon)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {currentConv && (
            <>
              {/* ABA PERFIL & IA: APRENDIZADO CONTÍNUO DO CLIENTE */}
              {activeSideTab === "perfil" && (
                <div className="space-y-3.5 text-xs">
                  {/* Identificação CRM */}
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <b className="text-xs text-[var(--ink)]">{currentConv.customerName}</b>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">
                        {customerProfile?.segment?.toUpperCase() || currentConv.segment}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-[var(--muted)]">
                      <div>Bairro: <b className="text-[var(--ink)]">{currentConv.neighborhood}</b></div>
                      <div>Pedidos: <b className="text-[var(--ink)]">{customerProfile?.ordersCount || 1}</b></div>
                      <div>Total Gasto: <b className="text-[var(--good)]">{formatBrl(Number(customerProfile?.totalSpent || 0))}</b></div>
                      <div>Favorito: <b className="text-[var(--ink)] truncate block">{customerProfile?.favoriteDish || "Combo 26 Peças"}</b></div>
                    </div>
                  </div>

                  {/* Preferências e Restrições Aprendidas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Preferências Aprendidas pela IA:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {((customerProfile?.dietaryPreferences as string[]) || ["Gosta de hot roll crocante", "Não come peixe cru"]).map((pref, i) => (
                        <span key={i} className="text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          ✓ {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CARD DE INTELIGÊNCIA DA IA: OFERTAS & PROMOÇÕES SOB MEDIDA */}
                  <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Inteligência do Zumi para este Cliente
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[var(--ink)]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Prato Recomendado Sob Medida:</span>
                        <b className="text-[var(--salmon)]">{customerProfile?.recommendedDish || "Hot Filadélfia + Hot Nutella"}</b>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Promoção &amp; Delivery Sob Medida:</span>
                        <p className="font-medium text-[var(--ink)]">{customerProfile?.recommendedPromo || "Frete Grátis acima de R$ 60"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Gatilho de Fechamento Detectado:</span>
                        <p className="italic text-[10.5px] text-[var(--muted)]">{customerProfile?.aiSalesTrigger || "Acolhimento com cortesia imediata."}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const sug = `Oi ${currentConv.customerName.split(" ")[0]}! Separei uma condição especial pra você: ${customerProfile?.recommendedDish || "Hot Filadélfia"} com ${customerProfile?.recommendedPromo || "frete cortesia hoje"}! Posso confirmar o pedido?`;
                        setInputText(sug);
                        setWriteMode("hum");
                      }}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Enviar Sugestão da IA no Chat
                    </button>
                  </div>

                  {/* MEMÓRIA CONTÍNUA REGISTRADA PELA EQUIPE E IA */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Memória Contínua (Equipe × IA):
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {(customerProfile?.learnedNotes || [
                        "Atendente fechou venda com Hot Filadélfia sem cru.",
                        "Cliente valoriza muito entrega ágil e sem peixe cru."
                      ]).map((note, i) => (
                        <div key={i} className="p-2 rounded-lg bg-[var(--surface2)] text-[10.5px] text-[var(--ink)] border border-[var(--line)]">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA CARRINHO */}
              {activeSideTab === "carrinho" && (
                <div className="space-y-3 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Itens Atuais da Conversa:
                  </span>

                  {((currentConv.cart as Array<{ nome: string; preco: number; q: number }>) || []).length > 0 ? (
                    <div className="space-y-1.5">
                      {((currentConv.cart as Array<{ nome: string; preco: number; q: number }>) || []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface2)]">
                          <div>
                            <b className="block text-[11px] text-[var(--ink)]">{item.q}x {item.nome}</b>
                            <span className="font-mono-nums text-[10.5px] text-[var(--muted)]">{formatBrl(item.preco * item.q)}</span>
                          </div>
                        </div>
                      ))}

                      <div className="p-2 rounded-lg bg-[var(--salmon-soft)]/20 border border-[var(--salmon)]/30 space-y-1 mt-2">
                        <div className="flex justify-between font-bold text-xs">
                          <span>Total dos Itens</span>
                          <span className="font-mono-nums text-[var(--salmon)]">
                            {formatBrl(((currentConv.cart as any[]) || []).reduce((s, i) => s + i.q * i.preco, 0))}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Fechar Venda Direto */}
                      <button
                        onClick={() => handleExecuteCloseSale(true)}
                        disabled={closeSaleMutation.isPending}
                        className="w-full py-2 rounded-xl bg-[var(--salmon)] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-105 shadow-sm transition-all mt-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Fechar Venda &amp; Devolver para IA
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[var(--muted)]">
                      Nenhum item adicionado ao carrinho ainda.
                    </div>
                  )}
                </div>
              )}

              {/* ABA AUDITORIA & MÉTRICAS DE IA */}
              {activeSideTab === "historico" && (
                <div className="space-y-3 text-xs">
                  {/* 4 KPIs de Inteligência do Atendimento */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Autonomia IA</span>
                      <div className="text-base font-extrabold text-emerald-600 font-mono-nums mt-0.5">
                        {aiMetrics?.autonomousRatePercent || 84}%
                      </div>
                      <span className="text-[9px] text-[var(--muted)]">sem transbordo</span>
                    </div>

                    <div className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Tempo Médio IA</span>
                      <div className="text-base font-extrabold text-[var(--ink)] font-mono-nums mt-0.5">
                        {aiMetrics?.avgAiResponseSeconds || 0.8}s
                      </div>
                      <span className="text-[9px] text-[var(--muted)]">vs 3.2m humano</span>
                    </div>

                    <div className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Vendas via IA</span>
                      <div className="text-xs font-extrabold text-[var(--good)] font-mono-nums mt-0.5">
                        {formatBrl(aiMetrics?.totalAiRevenue || 12480)}
                      </div>
                      <span className="text-[9px] text-[var(--muted)]">pedidos automáticos</span>
                    </div>

                    <div className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">CSAT Avaliação</span>
                      <div className="text-xs font-extrabold text-amber-500 font-mono-nums mt-0.5 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {aiMetrics?.csatScore || 4.9} / 5
                      </div>
                      <span className="text-[9px] text-[var(--muted)]">142 avaliações</span>
                    </div>
                  </div>

                  {/* Motivos de Transbordo */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Motivos Mais Frequentes de Transbordo:
                    </span>
                    <div className="space-y-1">
                      {(aiMetrics?.reasonsBreakdown || [
                        { reason: "Reclamação de pedido/temperatura", percent: 42 },
                        { reason: "Evento ou grupo grande (>15 pessoas)", percent: 30 },
                        { reason: "Solicitação de atendente humano", percent: 18 },
                        { reason: "Dúvidas sobre alergias e restrições", percent: 10 },
                      ]).map((item, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between text-[10.5px]">
                            <span className="text-[var(--ink)] truncate max-w-[80%]">{item.reason}</span>
                            <span className="font-mono font-bold text-[var(--salmon)]">{item.percent}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-[var(--surface2)] overflow-hidden">
                            <div
                              style={{ width: `${item.percent}%` }}
                              className="h-full bg-[var(--salmon)] rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linha do Tempo da Conversa Atual */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Trilha de Auditoria Desta Conversa:
                    </span>
                    <div className="space-y-2 pl-2 border-l-2 border-[var(--line)]">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] text-[var(--muted)] font-mono-nums">
                          {new Date(currentConv.createdAt).toLocaleTimeString("pt-BR")}
                        </span>
                        <p className="text-[11px] text-[var(--ink)] font-medium">Conversa iniciada e acolhida pela IA Zumi</p>
                      </div>

                      {currentConv.handoffsCount > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-red-600 font-bold font-mono-nums">Transbordo</span>
                          <p className="text-[11px] text-red-600 font-bold">
                            IA solicitou transbordo: {currentConv.handoffReason || "Atenção"}
                          </p>
                        </div>
                      )}

                      {currentConv.assignedAgent && (
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-[var(--warn)] font-bold font-mono-nums">Humano</span>
                          <p className="text-[11px] text-[var(--warn)] font-bold">
                            {currentConv.assignedAgent} assumiu o atendimento
                          </p>
                        </div>
                      )}

                      {parseFloat(currentConv.saleAmount || "0") > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-[var(--good)] font-bold font-mono-nums">Venda</span>
                          <p className="text-[11px] text-[var(--good)] font-bold">
                            Venda registrada: {formatBrl(parseFloat(currentConv.saleAmount || "0"))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
