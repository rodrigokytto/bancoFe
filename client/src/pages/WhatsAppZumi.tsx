import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { WhatsAppMessageBubble } from "../components/chat/WhatsAppMessageBubble";
import { formatBrl, ALL_ITEMS, BAIRROS_TANGARA } from "../../../shared/zumaData";
import {
  MessageSquare,
  Search,
  User,
  Plus,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  ShoppingBag,
  ListOrdered,
  Tag,
  ArrowRightLeft,
  AlertTriangle,
  ExternalLink,
  UserCheck,
  Flame,
  Zap,
  CreditCard,
  Maximize2,
  Mic,
  Receipt,
  Server
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export const WhatsAppZumi: React.FC = () => {
  const [filter, setFilter] = useState<string>("todas");
  const [search, setSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string>("demo-livia");
  const [writeMode, setWriteMode] = useState<"cli" | "hum">("cli");
  const [inputText, setInputText] = useState("");
  const [activeSideTab, setActiveSideTab] = useState<"perfil" | "ped" | "hist">("perfil");
  const [manualQ, setManualQ] = useState("");
  const [manualA, setManualA] = useState("");

  // Fechamento Rápido de Venda
  const [selectedDish, setSelectedDish] = useState<string>("Hot Filadélfia (12un)");
  const [dishQty, setDishQty] = useState<number>(1);
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("Pix");

  const utils = trpc.useUtils();
  const { data: convs = [], isLoading } = trpc.zuma.listConversations.useQuery();
  const { data: kbList = [] } = trpc.zuma.listKnowledgeBase.useQuery();

  const currentConv = convs.find(c => c.id === selectedConvId) || convs[0];
  const { data: customerProfile } = trpc.zuma.getCustomerProfile.useQuery(
    { customerName: currentConv?.customerName || "" },
    { enabled: !!currentConv?.customerName }
  );

  const sendMsgMutation = trpc.zuma.sendWhatsAppMessage.useMutation({
    onSuccess: () => {
      utils.zuma.listConversations.invalidate();
      utils.zuma.getCustomerProfile.invalidate();
      utils.zuma.listKnowledgeBase.invalidate();
      setInputText("");
    },
    onError: (err) => {
      toast.error(`Erro ao enviar: ${err.message}`);
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
      toast.success(`🎉 Venda fechada com sucesso! Pedido #${data.orderNumber} (${formatBrl(data.total)})`);
    },
    onError: (err) => {
      toast.error(`Erro ao fechar venda: ${err.message}`);
    }
  });

  const createConvMutation = trpc.zuma.createCustomerConversation.useMutation({
    onSuccess: (data) => {
      utils.zuma.listConversations.invalidate();
      setSelectedConvId(data.conversationId);
      toast.success("Novo cliente simulado chamando no WhatsApp!");
    }
  });

  const approveKbMutation = trpc.zuma.approveKnowledge.useMutation({
    onSuccess: () => {
      utils.zuma.listKnowledgeBase.invalidate();
      toast.success("Resposta aprovada! O Zumi já aprendeu e aplicará em todas as conversas.");
    }
  });

  const discardKbMutation = trpc.zuma.discardKnowledge.useMutation({
    onSuccess: () => {
      utils.zuma.listKnowledgeBase.invalidate();
      toast.info("Item de aprendizado descartado.");
    }
  });

  const createKbMutation = trpc.zuma.createKnowledge.useMutation({
    onSuccess: () => {
      utils.zuma.listKnowledgeBase.invalidate();
      setManualQ("");
      setManualA("");
      toast.success("Conhecimento adicionado com sucesso ao cérebro do Zumi!");
    }
  });

  // Filtros
  const filteredConvs = convs.filter(c => {
    if (filter === "fila") return c.status === "fila";
    if (filter === "ia") return c.status === "ia";
    if (filter === "humano") return c.status === "humano";
    if (filter === "resolvida") return c.status === "resolvida";
    if (search) {
      const q = search.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.toLowerCase().includes(q) ||
        Boolean(c.neighborhood && c.neighborhood.toLowerCase().includes(q))
      );
    }
    return true;
  });

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

  const handleSimulateNewCustomer = () => {
    const names = ["Rafaela Prado", "Gabriel Souza", "Leonardo Martins", "Carla Vasconcelos", "Thiago Barbosa"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomBairro = BAIRROS_TANGARA[Math.floor(Math.random() * BAIRROS_TANGARA.length)];
    createConvMutation.mutate({ name: randomName, neighborhood: randomBairro });
  };

  const handleExecuteCloseSale = (returnToAi: boolean) => {
    if (!currentConv) return;
    const cartItems = currentConv.cart && currentConv.cart.length > 0
      ? currentConv.cart
      : [{ nome: selectedDish, preco: (ALL_ITEMS.find(i => i.nome === selectedDish)?.preco || 31.9), cat: "Combinados", q: dishQty }];

    closeSaleMutation.mutate({
      conversationId: currentConv.id,
      customerName: currentConv.customerName,
      items: cartItems,
      discount: discountVal,
      deliveryFee: 0,
      paymentMethod: payMethod,
      returnToAi,
      resolveConversation: !returnToAi,
    });
  };

  // KPIs
  const totalConvs = convs.length;
  const inQueue = convs.filter(c => c.status === "fila").length;
  const resolved = convs.filter(c => c.status === "resolvida").length;
  const withHuman = convs.filter(c => c.status === "humano").length;
  const approvedKbCount = kbList.filter(k => k.status === "aprovado").length;
  const pendingKbCount = kbList.filter(k => k.status === "pendente").length;

  const quickCliOptions = [
    "Somos 2, até R$ 120. O que você sugere?",
    "Quero algo gostoso sem peixe cru",
    "Até que horas entrega hoje no meu bairro?",
    "Meu pedido veio frio e atrasou!",
    "Quero falar com uma pessoa",
    "Pode fechar o pedido no Pix!"
  ];

  const quickHumOptions = [
    "Oi! Aqui é a Ana da equipe, já estou cuidando disso para você agora mesmo.",
    "Vou mandar um novo hot roll quentinho sem custo e um cupom no próximo pedido!",
    "Preparei o seu pedido com prioridade total na nossa cozinha.",
    "Vou gerar a chave Pix do pedido para acertar: zuma@kytto.com.br",
    "Tudo resolvido! Vou te devolver para o Zumi acompanhar a entrega 🍣"
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header com Botão de Abrir em Nova Janela */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Central de Atendimento Multicanal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
            WhatsApp com IA Zumi &amp; Transbordo para Equipe
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
            O Zumi atende primeiro com velocidade e inteligência. Quando o cliente faz uma reclamação, pede um humano ou negocia eventos grandes, a conversa transborda para a fila da equipe (com o box piscando em vermelho). O atendente assume, fecha a venda, devolve para a IA e o sistema aprende com o perfil do cliente.
          </p>
        </div>

        {/* Botão de Abrir em Nova Janela & Status */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/admin/waha"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Acessar Administração do Servidor WAHA (WhatsApp HTTP API)"
          >
            <Server className="w-3.5 h-3.5" />
            <span>⚙️ Servidor WAHA</span>
          </Link>
          <button
            onClick={() => window.open("/atendimento", "_blank", "width=1400,height=900")}
            className="px-3.5 py-2 rounded-xl bg-[var(--ink)] text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            title="Abre o Cockpit do Atendente em uma janela dedicada separada"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[var(--salmon)]" />
            <span>Abrir em Nova Janela</span>
          </button>

          <Link
            href="/atendimento"
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface2)] transition-all flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Modo Cockpit</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--nori-soft)] text-[var(--nori)]">
            <span className="w-2 h-2 rounded-full bg-[var(--good)] animate-ping" />
            IA Ativa · Cardápio &amp; CRM Real
          </span>
        </div>
      </div>

      {/* 4 KPIs de Atendimento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Conversas no Sistema</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{totalConvs}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Histórico completo gravado</div>
        </div>

        <div className={`border rounded-xl p-4 shadow-xs transition-all ${
          inQueue > 0
            ? "bg-red-50/80 dark:bg-red-950/20 border-red-500/40"
            : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Na Fila da Equipe</span>
            {inQueue > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-display font-extrabold text-red-600 font-mono-nums mt-1">{inQueue}</div>
          <div className="text-xs text-red-600 font-bold mt-0.5">
            {inQueue > 0 ? "Pulsando em vermelho (requer ação)" : "Fila zerada"}
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Em Atendimento Humano</span>
          <div className="text-2xl font-display font-extrabold text-[var(--warn)] font-mono-nums mt-1">{withHuman}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Equipe atendendo e fechando vendas</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Respostas Aprendidas</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">{approvedKbCount}</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">+{pendingKbCount} aguardando aprovação</div>
        </div>
      </div>

      {/* Central WhatsApp: 3 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ================= Coluna 1: Lista de Conversas ================= */}
        <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3 space-y-3 shadow-xs">
          {/* Filtros em chips */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "todas", label: `Todas (${convs.length})` },
              { id: "fila", label: `🚨 Fila (${inQueue})`, alert: inQueue > 0 },
              { id: "ia", label: `IA (${convs.filter(c => c.status === "ia").length})` },
              { id: "humano", label: `Equipe (${withHuman})` },
              { id: "resolvida", label: `Resolvidas (${resolved})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                  filter === f.id
                    ? f.alert
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-[var(--ink)] text-white font-bold"
                    : f.alert
                    ? "bg-red-500/10 text-red-600 border border-red-500/30 font-bold"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar nome, fone, bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
            />
          </div>

          {/* Lista scrollável com BOX PULSANDO EM VERMELHO */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredConvs.map((c) => {
              const isSelected = c.id === currentConv?.id;
              const isPulsingRed = c.status === "fila";
              const lastMsg = c.messages[c.messages.length - 1];

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    isPulsingRed
                      ? "box-alert-pulsing-red bg-red-50/80 dark:bg-red-950/30 border-red-500 ring-2 ring-red-400/60"
                      : isSelected
                      ? "border-[var(--salmon)] bg-[var(--salmon-soft)]/20 shadow-xs"
                      : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {/* Alerta Chamativo Pulsando se estiver na fila */}
                  {isPulsingRed && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-red-500/20 text-red-600 font-bold text-[10px]">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                        🚨 IA PRECISA DE AJUDA
                      </span>
                      <span className="bg-red-600 text-white px-1.5 py-0.2 rounded-full font-mono text-[9px]">
                        URGENTE
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <b className="text-xs font-bold text-[var(--ink)] truncate max-w-[130px]">{c.customerName}</b>
                    <span className="text-[10px] text-[var(--muted)] font-mono-nums">
                      {new Date(c.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                    {lastMsg?.authorType === "ia" && "Zumi: "}
                    {lastMsg?.authorType === "hum" && "Equipe: "}
                    {lastMsg?.content || "Nenhuma mensagem"}
                  </p>

                  <div className="flex items-center justify-between gap-1 pt-1.5">
                    {c.status === "fila" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                        {c.handoffReason || "Transbordo"}
                      </span>
                    )}
                    {c.status === "humano" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--warn)] text-white">
                        Com {c.assignedAgent || "Equipe"}
                      </span>
                    )}
                    {c.status === "ia" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--good)] text-white">
                        Zumi atendendo
                      </span>
                    )}
                    {c.status === "resolvida" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--muted)]">
                        Resolvida
                      </span>
                    )}

                    <span className="text-[10px] text-[var(--muted)] font-mono-nums">{c.neighborhood}</span>
                  </div>

                  {/* Botão de Pegar Atendimento Direto no Box Pulsando */}
                  {isPulsingRed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConvId(c.id);
                        setWriteMode("hum");
                        updateStatusMutation.mutate({ conversationId: c.id, action: "assume" });
                        toast.success(`Você assumiu o atendimento de ${c.customerName}!`);
                      }}
                      className="mt-2 w-full py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      🚨 Pegar Atendimento Agora
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botão de simular cliente novo */}
          <button
            onClick={handleSimulateNewCustomer}
            disabled={createConvMutation.isPending}
            className="w-full py-2 rounded-xl border border-dashed border-[var(--salmon)] text-[var(--salmon)] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--salmon-soft)]/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Simular cliente novo chamando
          </button>
        </div>

        {/* ================= Coluna 2: Chat Interativo & Fechamento de Vendas ================= */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[700px]">
          {/* Header do Chat */}
          {currentConv ? (
            <div className="p-3 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <ZumiMascot size={36} />
                <div className="truncate">
                  <b className="block text-xs font-extrabold text-[var(--ink)] truncate">
                    {currentConv.customerName} · {currentConv.customerPhone}
                  </b>
                  <span className="text-[11px] text-[var(--muted)] block truncate">
                    {currentConv.status === "fila" && (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Aguardando Atendente · Motivo: {currentConv.handoffReason || "Atenção"}
                      </span>
                    )}
                    {currentConv.status === "humano" && `Em atendimento por ${currentConv.assignedAgent || "Ana"}`}
                    {currentConv.status === "ia" && "Zumi respondendo sozinho com IA"}
                    {currentConv.status === "resolvida" && "Conversa finalizada e resolvida"}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-1.5 shrink-0">
                {currentConv.status === "fila" || currentConv.status === "ia" ? (
                  <button
                    onClick={() => {
                      setWriteMode("hum");
                      updateStatusMutation.mutate({ conversationId: currentConv.id, action: "assume" });
                      toast.success("Você assumiu a conversa!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assumir Atendimento
                  </button>
                ) : null}

                {currentConv.status === "humano" && (
                  <>
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({ conversationId: currentConv.id, action: "backToAi" });
                        toast.info("Atendimento devolvido para a IA Zumi!");
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[var(--nori)] text-white text-xs font-bold hover:brightness-105 flex items-center gap-1"
                      title="Devolve para o Zumi continuar atendendo e acompanhando"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Devolver para IA
                    </button>

                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({ conversationId: currentConv.id, action: "resolve" });
                        toast.success("Atendimento encerrado com sucesso!");
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--good)]" />
                      Encerrar
                    </button>
                  </>
                )}

                {currentConv.status === "resolvida" && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ conversationId: currentConv.id, action: "reopen" })}
                    className="px-2.5 py-1 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface2)]"
                  >
                    Reabrir
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-[var(--muted)]">Selecione uma conversa</div>
          )}

          {/* BARRA TÁTICA DE FECHAMENTO DE VENDA (Quando Atendente está no Controle) */}
          {currentConv && currentConv.status === "humano" && (
            <div className="bg-[var(--surface2)] border-b border-[var(--line)] p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[var(--salmon)]" />
                  Painel de Fechamento de Venda Rápida
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  Feche o pedido e devolva o cliente para a IA com 1 clique
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
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
                    <option value={0}>Sem desconto</option>
                    <option value={10}>- R$ 10 (Cortesia)</option>
                    <option value={15}>- R$ 15 (VIP)</option>
                  </select>
                </div>

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

          {/* Área de Mensagens com fundo do WhatsApp */}
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
                  <span>Zumi processando resposta com IA...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chips de Resposta Rápida */}
          <div className="px-3 pt-2 bg-[var(--surface)] border-t border-[var(--line)] flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(writeMode === "cli" ? quickCliOptions : quickHumOptions).map((q, i) => (
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

          {/* Alternador de Perfil: Escrever como Cliente x Responder como Atendente */}
          <div className="px-3 py-1 bg-[var(--surface)] flex items-center justify-between text-xs border-t border-[var(--line)]/40">
            <span className="text-[11px] text-[var(--muted)] font-medium">Modo de envio:</span>
            <div className="flex rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface2)] p-0.5">
              <button
                type="button"
                onClick={() => setWriteMode("cli")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  writeMode === "cli" ? "bg-[var(--ink)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Escrever como cliente (Simular)
              </button>
              <button
                type="button"
                onClick={() => setWriteMode("hum")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  writeMode === "hum" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Responder como atendente (Equipe)
              </button>
            </div>
          </div>

          {/* Botões de Simulação de Áudio e Pix */}
          <div className="px-3 py-1 bg-[var(--surface)] border-t border-[var(--line)]/40 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!currentConv) return;
                sendMsgMutation.mutate({
                  conversationId: currentConv.id,
                  authorType: "cli",
                  content: "🎤 Mensagem de voz (0:14)",
                  messageType: "audio",
                  audioDurationSeconds: 14,
                  audioTranscription: "Boa noite Zumi! Quero pedir um combo de 26 peças e um hot filadélfia com shoyu extra aqui pro Centro, por favor!",
                });
                toast.info("Áudio de voz enviado! Zumi AI responderá em instantes.");
              }}
              className="px-2 py-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] text-[var(--ink)] hover:border-[var(--salmon)] flex items-center gap-1"
            >
              <Mic className="w-3 h-3 text-[var(--salmon)]" />
              <span>Simular Áudio</span>
            </button>

            <button
              type="button"
              onClick={() => {
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
                toast.info("Comprovante PIX enviado! IA Zumi autenticará.");
              }}
              className="px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] hover:bg-emerald-500/20 flex items-center gap-1"
            >
              <Receipt className="w-3 h-3 text-emerald-600" />
              <span>Simular Pix</span>
            </button>
          </div>

          {/* Input de Envio */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[var(--surface)] border-t border-[var(--line)] flex gap-2">
            <input
              type="text"
              placeholder={writeMode === "cli" ? "Escreva como o cliente falaria..." : "Responda como atendente (ensina a IA)..."}
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

        {/* ================= Coluna 3: Dossiê & Aprendizado do Cliente ================= */}
        <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs space-y-4">
          {/* Abas */}
          <div className="flex border-b border-[var(--line)]">
            {[
              { id: "perfil", label: "Perfil & IA" },
              { id: "ped", label: "Pedido" },
              { id: "hist", label: "Auditoria" }
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
              {/* Aba Perfil & Aprendizado com IA */}
              {activeSideTab === "perfil" && (
                <div className="space-y-3.5 text-xs">
                  {/* Ficha CRM */}
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <b className="text-xs text-[var(--ink)]">{currentConv.customerName}</b>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">
                        {customerProfile?.segment?.toUpperCase() || currentConv.segment}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-[var(--muted)]">
                      <div>Telefone: <span className="font-mono-nums text-[var(--ink)]">{currentConv.customerPhone}</span></div>
                      <div>Bairro: <span className="text-[var(--ink)] font-bold">{currentConv.neighborhood}</span></div>
                      <div>Pedidos: <b className="text-[var(--ink)]">{customerProfile?.ordersCount || 1}</b></div>
                      <div>Total Gasto: <b className="text-[var(--good)]">{formatBrl(Number(customerProfile?.totalSpent || 0))}</b></div>
                    </div>
                  </div>

                  {/* Preferências Alimentares Aprendidas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Preferências Alimentares Aprendidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {((customerProfile?.dietaryPreferences as string[]) || ["Não come peixe cru", "Gosta de hot roll"]).map((pref, i) => (
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
                        <p className="text-[11px] leading-tight">{customerProfile?.recommendedPromo || "Frete grátis no seu bairro acima de R$ 60"}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Gatilho de Venda Detectado:</span>
                        <p className="text-[11px] italic text-[var(--muted)]">{customerProfile?.aiSalesTrigger || "Apresentar opções grelhadas com cortesia de sobremesa."}</p>
                      </div>
                    </div>

                    {/* Botão de 1 clique para injetar a recomendação da IA no chat */}
                    <button
                      onClick={() => {
                        const promoText = `Oi ${currentConv.customerName.split(" ")[0]}! O Zumi preparou algo especial pra você hoje: ${customerProfile?.recommendedPromo || "Frete grátis na sua entrega!"}. Posso já adiantar o seu pedido?`;
                        setInputText(promoText);
                        setWriteMode("hum");
                        toast.info("Sugestão da IA carregada no chat!");
                      }}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Enviar Sugestão da IA no Chat
                    </button>
                  </div>

                  {/* Memória Contínua com Atendente Humano */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                      Memória Contínua (Equipe × IA):
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(customerProfile?.learnedNotes || [
                        "Atendente fechou venda com opções sem cru.",
                        "Cliente valoriza rapidez e entrega caprichada."
                      ]).map((note, i) => (
                        <div key={i} className="p-2 rounded-lg bg-[var(--surface2)] text-[10.5px] text-[var(--ink)] border border-[var(--line)]">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Pedido */}
              {activeSideTab === "ped" && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">Carrinho da Conversa</span>
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
                        <div className="flex justify-between font-bold text-xs pt-1 border-t border-[var(--line)]">
                          <span>Total</span>
                          <span className="font-mono-nums text-[var(--salmon)]">
                            {formatBrl(((currentConv.cart as any[]) || []).reduce((s, i) => s + i.q * i.preco, 0))}
                          </span>
                        </div>

                        {/* Botão de Fechar Venda */}
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
                      <p className="text-xs text-[var(--muted)] italic">Nenhum item adicionado ao carrinho ainda.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Histórico */}
              {activeSideTab === "hist" && (
                <div className="space-y-2 text-xs">
                  <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">Linha do Tempo</span>
                  <div className="space-y-2 pl-2 border-l-2 border-[var(--line)]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[var(--muted)] font-mono-nums">
                        {new Date(currentConv.createdAt).toLocaleTimeString("pt-BR")}
                      </span>
                      <p className="text-[11px] text-[var(--ink)] font-medium">Conversa iniciada e recebida pelo Zumi (IA)</p>
                    </div>
                    {currentConv.handoffsCount > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-red-600 font-mono-nums">Transbordo</span>
                        <p className="text-[11px] text-red-600 font-bold">Transferida para a equipe: {currentConv.handoffReason}</p>
                      </div>
                    )}
                    {currentConv.returnsCount > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[var(--good)] font-mono-nums">Retorno</span>
                        <p className="text-[11px] text-[var(--good)] font-bold">Equipe devolveu atendimento para o Zumi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Seção Inferior: Módulo de Aprendizado do Zumi & Regras de Transbordo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Aprendizado do Zumi */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--salmon)]" />
                Aprendizado Contínuo do Zumi (Base de Conhecimento)
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Toda resposta da equipe e negociação vira aprendizado. Você aprova e o Zumi passa a usar na hora em todas as conversas.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)]">
              {pendingKbCount} para aprovar
            </span>
          </div>

          {/* Itens Pendentes para Aprovar */}
          <div className="space-y-3">
            {kbList.filter(k => k.status === "pendente").map((kb) => (
              <div key={kb.id} className="p-3.5 rounded-xl border border-[var(--salmon)]/40 bg-[var(--salmon-soft)]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <b className="text-xs text-[var(--ink)]">Pergunta: "{kb.question}"</b>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">
                    {kb.origin}
                  </span>
                </div>

                <textarea
                  defaultValue={kb.answer}
                  id={`kb-answer-${kb.id}`}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                  placeholder="Escreva ou ajuste a resposta que o Zumi deve dar..."
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`kb-answer-${kb.id}`) as HTMLTextAreaElement;
                      approveKbMutation.mutate({ id: kb.id, answer: el?.value || kb.answer });
                    }}
                    className="px-3 py-1 rounded-md bg-[var(--nori)] text-white text-xs font-bold hover:brightness-105"
                  >
                    Aprovar e ensinar ao Zumi
                  </button>
                  <button
                    onClick={() => discardKbMutation.mutate({ id: kb.id })}
                    className="px-2.5 py-1 rounded-md border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--bad)]"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário para Ensinar à Mão */}
          <div className="pt-3 border-t border-[var(--line)] space-y-2.5">
            <b className="text-xs font-bold text-[var(--ink)] block">Ensinar uma resposta nova manualmente:</b>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Quando o cliente perguntar... (ex: vocês têm estacionamento?)"
                value={manualQ}
                onChange={(e) => setManualQ(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
              />
              <textarea
                placeholder="O Zumi responde... (ex: Temos sim, 12 vagas gratuitas na frente da loja!)"
                value={manualA}
                onChange={(e) => setManualA(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
              />
              <button
                onClick={() => {
                  if (!manualQ || !manualA) return toast.error("Preencha a pergunta e a resposta.");
                  createKbMutation.mutate({ question: manualQ, answer: manualA });
                }}
                disabled={createKbMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105"
              >
                Ensinar ao Zumi
              </button>
            </div>
          </div>
        </div>

        {/* Regras de Transbordo Automático */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-[var(--nori)]" />
            Regras de Transbordo com Alerta Vermelho
          </h3>
          <p className="text-xs text-[var(--muted)]">
            A IA nunca alucina. O box pisca em vermelho para o atendente assumir nas seguintes situações:
          </p>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[var(--salmon)]" />
              <span>Cliente reclamou (comida fria, atraso, item errado, insatisfação)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[var(--salmon)]" />
              <span>Cliente pediu expressamente para falar com uma pessoa/gerente</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[var(--salmon)]" />
              <span>Evento, empresa ou grupo grande (acima de 15 pessoas)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[var(--salmon)]" />
              <span>Negociação especial de desconto ou parceria</span>
            </label>

            <div className="pt-2 border-t border-[var(--line)] space-y-1">
              <span className="text-[11px] text-[var(--muted)] font-medium block">
                Tempo máximo permitido na fila da equipe (SLA):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={30}
                  className="w-16 px-2 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-center font-bold"
                />
                <span className="text-xs text-[var(--muted)]">minutos (após isso, alerta vermelho no Cockpit)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
