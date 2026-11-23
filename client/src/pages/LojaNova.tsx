import React, { useState } from "react";
import { MENU, ALL_ITEMS, PAIRS, BEST_SELLERS, formatBrl } from "../../../shared/zumaData";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { trpc } from "../lib/trpc";
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Smartphone, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  MapPin, 
  ChevronRight,
  Check
} from "lucide-react";
import { toast } from "sonner";

const FREE_SHIPPING_THRESHOLD = 80.0;

interface CartItem {
  nome: string;
  preco: number;
  cat: string;
  q: number;
}

export const LojaNova: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("Mais pedidos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [upsellSuggestion, setUpsellSuggestion] = useState<{ item: CartItem; hints: string[] } | null>(null);
  
  // Modais de Checkout & Apple Pay
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "pix" | "cartao">("apple_pay");
  const [applePaySheetOpen, setApplePaySheetOpen] = useState<boolean>(false);
  const [applePayProcessing, setApplePayProcessing] = useState<boolean>(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState<boolean>(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{ orderNumber: number; method: string } | null>(null);

  const createOrderMutation = trpc.zuma.createOrder.useMutation({
    onSuccess: (data) => {
      setLastOrderDetails({ orderNumber: data.orderNumber, method: paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod.toUpperCase() });
      setApplePaySheetOpen(false);
      setCheckoutModalOpen(false);
      setOrderSuccessModal(true);
      toast.success(`Pedido #${data.orderNumber} aprovado instantaneamente via ${paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod}! Enviado ao KDS.`);
    },
    onError: (err) => {
      setApplePayProcessing(false);
      toast.error(`Erro ao criar pedido: ${err.message}`);
    }
  });

  const cartTotal = cart.reduce((s, i) => s + i.q * i.preco, 0);
  const cartCount = cart.reduce((s, i) => s + i.q, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const shippingCost = remainingForFreeShipping <= 0 ? 0 : 8.0;
  const finalTotal = cartTotal + shippingCost;

  // Filtragem de produtos
  const filteredItems = ALL_ITEMS.filter((item) => {
    const matchesSearch = searchQuery
      ? item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (selectedCat === "Mais pedidos") {
      return BEST_SELLERS.has(item.nome);
    }
    return item.cat === selectedCat;
  });

  const handleAddToCart = (nome: string, cat: string, preco: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.nome === nome);
      if (existing) {
        return prev.map((i) => (i.nome === nome ? { ...i, q: i.q + 1 } : i));
      }
      return [...prev, { nome, cat, preco, q: 1 }];
    });

    toast.success(`${nome} adicionado ao carrinho!`);

    // Disparar Upsell inteligente
    const suggestions = PAIRS[cat] || ["Refrigerante Lata", "Hot Nutella (8 un)"];
    const validSuggestions = suggestions.filter((s) => !cart.some((c) => c.nome === s));
    if (validSuggestions.length > 0) {
      setUpsellSuggestion({
        item: { nome, cat, preco, q: 1 },
        hints: validSuggestions,
      });
    }
  };

  const handleReorder = () => {
    handleAddToCart("Combo 26 Peças", "Combinados", 69.90);
    handleAddToCart("Refrigerante Lata", "Bebidas", 5.00);
    toast.success("Último pedido repetido com sucesso no topo em 1 clique!");
  };

  // Disparo do Apple Pay Sheet
  const handleTriggerApplePay = () => {
    if (cart.length === 0) {
      toast.error("Adicione itens ao carrinho para pagar com Apple Pay.");
      return;
    }
    setPaymentMethod("apple_pay");
    setApplePaySheetOpen(true);
  };

  // Confirmação biométrica simulada (Face ID)
  const handleConfirmApplePay = () => {
    setApplePayProcessing(true);
    setTimeout(() => {
      setApplePayProcessing(false);
      createOrderMutation.mutate({
        channel: "Loja",
        customerName: "Rodrigo Gonçalves (Apple Pay)",
        neighborhood: "Centro - Tangará da Serra",
        paymentMethod: "Apple Pay",
        items: cart.map((i) => ({
          itemName: i.nome,
          category: i.cat,
          quantity: i.q,
          unitPrice: i.preco,
        })),
      });
    }, 1500);
  };

  // Finalização comum
  const handleConfirmGeneralOrder = () => {
    if (cart.length === 0) return;
    createOrderMutation.mutate({
      channel: "Loja",
      customerName: "Cliente Loja Web",
      neighborhood: "Centro",
      paymentMethod: paymentMethod === "pix" ? "Pix" : "Cartão de Crédito",
      items: cart.map((i) => ({
        itemName: i.nome,
        category: i.cat,
        quantity: i.q,
        unitPrice: i.preco,
      })),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          O que o cliente vê · Experiência de Compra
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Delivery Próprio com Apple Pay, Frete Grátis &amp; Upsell Inteligente
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Mesmo cardápio e preços reais do Zuma Tangará da Serra, agora com pagamento em 1 toque via Apple Pay, sugestões dinâmicas no carrinho e Zumi com IA.
        </p>
      </div>

      {/* Grid Principal: Loja Phone-frame + Tabela Comparativa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Smartphone Store Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[420px] bg-[var(--surface)] border-2 border-[var(--line)] rounded-[26px] shadow-xl overflow-hidden flex flex-col h-[780px] relative">
            {/* Top Bar da Loja */}
            <div className="bg-[var(--ink)] text-white p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ZumiMascot size={32} />
                <div>
                  <b className="block text-sm font-display font-extrabold leading-tight">ZUMA Cozinha Oriental</b>
                  <span className="text-[11px] opacity-80 block">Tangará da Serra · Entrega ~45 min</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-[var(--good)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Aberto
              </span>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
              {/* Banners rotativos */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                <div className="min-w-[240px] bg-[var(--salmon)] text-white p-3 rounded-xl flex flex-col justify-between h-24 snap-start shadow-xs">
                  <b className="text-xs font-display font-extrabold uppercase tracking-wide">Terça do Hot Roll</b>
                  <p className="text-[11px] opacity-95">Hot Filadélfia em dobro até 20h. Só hoje, ninja!</p>
                </div>
                <div className="min-w-[240px] bg-black text-white p-3 rounded-xl flex flex-col justify-between h-24 snap-start shadow-xs">
                  <b className="text-xs font-display font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                    Pay Disponível
                  </b>
                  <p className="text-[11px] opacity-90">Pague em 1 segundo com Face ID e ganhe raspadinha!</p>
                </div>
                <div className="min-w-[240px] bg-[var(--nori)] text-white p-3 rounded-xl flex flex-col justify-between h-24 snap-start shadow-xs">
                  <b className="text-xs font-display font-extrabold uppercase tracking-wide">Clube Zumi</b>
                  <p className="text-[11px] opacity-95">Assine por R$ 39,90 e ganhe frete grátis + 1 temaki/mês.</p>
                </div>
              </div>

              {/* Botão Pedir de Novo em 1 Clique */}
              <div className="p-3 bg-[var(--surface2)] border border-[var(--line)] rounded-xl flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <b className="text-xs text-[var(--ink)] block">Seu pedido favorito</b>
                  <span className="text-[11px] text-[var(--muted)] block">Combo 26 Peças + Coca-Cola</span>
                </div>
                <button
                  onClick={handleReorder}
                  className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pedir de novo</span>
                </button>
              </div>

              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Buscar no cardápio de Tangará..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--salmon)]"
                />
              </div>

              {/* Categorias */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["Mais pedidos", ...Object.keys(MENU)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCat(cat);
                      setSearchQuery("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCat === cat
                        ? "bg-[var(--salmon)] text-white shadow-xs"
                        : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Lista de Produtos */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--ink)] block">
                  {selectedCat} ({filteredItems.length} pratos)
                </span>

                <div className="space-y-2">
                  {filteredItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)]/50 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <b className="text-xs text-[var(--ink)] block truncate">{item.nome}</b>
                        <span className="text-[11px] text-[var(--muted)] block">{item.cat}</span>
                        <span className="text-xs font-mono-nums font-bold text-[var(--salmon)] block">
                          {formatBrl(item.preco)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item.nome, item.cat, item.preco)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] hover:bg-[var(--salmon)] hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Barra de Frete Grátis e Botões de Checkout */}
            <div className="p-3 bg-[var(--surface)] border-t border-[var(--line)] space-y-2.5">
              {/* Barra de Frete Grátis Progressivo */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  {remainingForFreeShipping <= 0 ? (
                    <span className="text-[var(--good)] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Frete Grátis Desbloqueado!
                    </span>
                  ) : (
                    <span className="text-[var(--muted)]">
                      Faltam <b className="text-[var(--salmon)] font-mono-nums">{formatBrl(remainingForFreeShipping)}</b> para frete grátis
                    </span>
                  )}
                  <span className="font-mono-nums text-[var(--muted)]">{formatBrl(cartTotal)} / {formatBrl(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface2)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      remainingForFreeShipping <= 0 ? "bg-[var(--good)]" : "bg-[var(--salmon)]"
                    }`}
                    style={{ width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Botão Oficial Apple Pay */}
              <button
                onClick={handleTriggerApplePay}
                disabled={cartCount === 0 || createOrderMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-900 active:scale-98 transition-all shadow-md disabled:opacity-50"
              >
                <span className="text-sm font-sans tracking-tight">Pay</span>
                <span>Pagar com Apple Pay</span>
                <span className="text-white/80 font-mono-nums font-normal">({formatBrl(finalTotal)})</span>
              </button>

              {/* Botão Ver Carrinho Normal */}
              <button
                onClick={() => setCheckoutModalOpen(true)}
                disabled={cartCount === 0}
                className="w-full py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-2 hover:border-[var(--ink)] transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[var(--salmon)]" />
                <span>Outras opções de pagamento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comparativo de Recursos e KPIs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Comparativo detalhado: Loja antiga (Foodsapp) × Loja Nova (Zuma Pilot)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-2 pr-4 font-bold">Recurso Estratégico</th>
                    <th className="py-2 px-3 font-bold text-[var(--bad)]">Loja Antiga</th>
                    <th className="py-2 pl-4 font-bold text-[var(--good)]">Loja Nova (Zuma Pilot)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">Pagamento com Apple Pay</td>
                    <td className="py-2.5 px-3 text-[var(--bad)]">Não suporta</td>
                    <td className="py-2.5 pl-4 text-[var(--good)] font-medium">1 toque nativo com Face ID / Touch ID</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">Sugestão no carrinho (Upsell)</td>
                    <td className="py-2.5 px-3 text-[var(--bad)]">Desligada / ausente</td>
                    <td className="py-2.5 pl-4 text-[var(--good)] font-medium">Recomenda bebida e sobremesa que combinam</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">Frete grátis progressivo</td>
                    <td className="py-2.5 px-3 text-[var(--bad)]">Não existe na cidade</td>
                    <td className="py-2.5 pl-4 text-[var(--good)] font-medium">Acima de R$ 80 com barra visual de meta</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">Botão "Pedir de novo"</td>
                    <td className="py-2.5 px-3 text-[var(--bad)]">Escondido no histórico</td>
                    <td className="py-2.5 pl-4 text-[var(--good)] font-medium">1 clique no topo repete o combo favorito</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">Integração iFood &amp; Meta</td>
                    <td className="py-2.5 px-3 text-[var(--bad)]">Sistemas isolados</td>
                    <td className="py-2.5 pl-4 text-[var(--good)] font-medium">Cardápio sincronizado e KDS unificado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FOLHA NATIVA DE PAGAMENTO APPLE PAY (SIMULADOR NATIVO iOS) */}
      {applePaySheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#1C1C1E] text-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-5 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10">
            {/* Top Bar da Folha Apple Pay */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-sans">Pay</span>
                <span className="text-xs text-white/60">Zuma Cozinha Oriental</span>
              </div>
              <button
                onClick={() => setApplePaySheetOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cartão de Crédito Selecionado */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 rounded bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-[9px] font-black tracking-tighter">
                  MC
                </div>
                <div>
                  <span className="text-xs font-bold block">Nubank Mastercard</span>
                  <span className="text-[11px] text-white/60 block">•••• 4242</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </div>

            {/* Endereço de Entrega */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-white/60 block">Endereço de Entrega:</span>
                  <span className="font-bold text-white block">Rua Cel. Celso Rosa, Centro</span>
                  <span className="text-[11px] text-white/70 block">Tangará da Serra - MT</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </div>

            {/* Resumo Financeiro */}
            <div className="space-y-1.5 text-xs border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-white/70">
                <span>Subtotal ({cartCount} itens):</span>
                <span className="font-mono-nums">{formatBrl(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Frete de Entrega:</span>
                <span className="font-mono-nums">
                  {shippingCost === 0 ? "Grátis" : formatBrl(shippingCost)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
                <span>Total a Pagar:</span>
                <span className="font-mono-nums text-base">{formatBrl(finalTotal)}</span>
              </div>
            </div>

            {/* Autenticação Biométrica Face ID */}
            <div className="pt-2 text-center space-y-3">
              <button
                onClick={handleConfirmApplePay}
                disabled={applePayProcessing}
                className="w-full py-3.5 rounded-2xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-98 transition-all shadow-lg disabled:opacity-50"
              >
                {applePayProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Processando Face ID...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Confirmar com Face ID</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-white/50 block">
                Dois cliques no botão lateral para pagar com Apple Pay
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Normal de Carrinho & Outras Opções de Pagamento */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-bold text-[var(--ink)]">Finalizar Pedido na Loja</h3>
              <button onClick={() => setCheckoutModalOpen(false)}>
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>

            {/* Resumo */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
              {cart.map((i, idx) => (
                <div key={idx} className="flex justify-between text-[var(--ink)]">
                  <span>{i.q}x {i.nome}</span>
                  <span className="font-mono-nums font-bold">{formatBrl(i.preco * i.q)}</span>
                </div>
              ))}
            </div>

            {/* Métodos */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)]">
              <span className="text-xs font-bold text-[var(--ink)] block">Selecione o Método:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 ${
                    paymentMethod === "pix"
                      ? "border-[var(--salmon)] bg-[var(--salmon)]/10 text-[var(--salmon)]"
                      : "border-[var(--line)] bg-[var(--surface2)]"
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Pix Instantâneo
                </button>
                <button
                  onClick={() => setPaymentMethod("cartao")}
                  className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 ${
                    paymentMethod === "cartao"
                      ? "border-[var(--salmon)] bg-[var(--salmon)]/10 text-[var(--salmon)]"
                      : "border-[var(--line)] bg-[var(--surface2)]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Cartão Online
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmGeneralOrder}
              disabled={createOrderMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105"
            >
              Concluir Pedido ({formatBrl(finalTotal)})
            </button>
          </div>
        </div>
      )}

      {/* Modal de Sucesso com Raspadinha */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-center">
              <ZumiMascot size={72} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--good)]/10 text-[var(--good)] text-xs font-bold mb-1">
                <Check className="w-3.5 h-3.5" /> Pago via {lastOrderDetails?.method || "Apple Pay"}
              </div>
              <h2 className="text-xl font-display font-extrabold text-[var(--ink)]">Pedido Recebido com Sucesso!</h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                A comanda #{lastOrderDetails?.orderNumber} já caiu no painel KDS da cozinha, os insumos de salmão e arroz foram baixados do estoque e a NFC-e foi gerada.
              </p>
            </div>

            <div className="p-3 bg-[var(--salmon-soft)] border border-[var(--salmon)]/40 rounded-xl space-y-1">
              <span className="text-xs font-bold text-[var(--salmon)] flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Raspadinha premiada garantida!
              </span>
              <p className="text-[11px] text-[var(--ink)]">
                Você ganhou 1 raspadinha do Zumi com desconto ou brinde para o próximo pedido!
              </p>
            </div>

            <button
              onClick={() => {
                setOrderSuccessModal(false);
                setCart([]);
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105"
            >
              Fazer outro pedido de teste
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
