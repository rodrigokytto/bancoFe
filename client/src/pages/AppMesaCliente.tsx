import React, { useState } from "react";
import { 
  UtensilsCrossed, 
  Bell, 
  Receipt, 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  QrCode, 
  Smartphone, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Coffee,
  Wine,
  Fish,
  Share2
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  category: "sushis" | "quentes" | "barcas" | "bebidas" | "sobremesas";
  price: number;
  description: string;
  prepTime: string;
  highlight?: string;
  image: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    name: "Sashimi Salmão Fresco Especial (10 un)",
    category: "sushis",
    price: 49.90,
    description: "Fatias nobres de salmão chileno eviscerado fresco, flor de sal e raspas de limão siciliano.",
    prepTime: "8-12 min",
    highlight: "Mais Pedido",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-2",
    name: "Niguiri Salmão Trufado Maçaricado (6 un)",
    category: "sushis",
    price: 38.90,
    description: "Salmão com azeite trufado, flor de sal de Mossoró e raspas de limão taiti.",
    prepTime: "10-15 min",
    highlight: "Chef Recomendação",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-3",
    name: "Uramaki Ebi Especial (8 un)",
    category: "sushis",
    price: 44.90,
    description: "Camarão empanado crocante, cream cheese Philadelphia, enrolado no salmão com geleia de pimenta.",
    prepTime: "12-16 min",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-4",
    name: "Shimeji na Manteiga com Cebolinha (250g)",
    category: "quentes",
    price: 36.90,
    description: "Cogumelos shimeji salteados na manteiga da terra, sakê mirin e finalizados com cebolinha fresca.",
    prepTime: "6-10 min",
    highlight: "Entrada Quente",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-5",
    name: "Guioza Suíno Artesanal no Vapor (6 un)",
    category: "quentes",
    price: 29.90,
    description: "Pastéis japoneses recheados com lombo suíno temperado, gengibre e molho ponzu cítrico.",
    prepTime: "8-12 min",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-6",
    name: "Barca Zuma Premium (42 peças)",
    category: "barcas",
    price: 189.90,
    description: "12 Sashimis variados, 10 Uramakis especiais, 8 Niguiris trufados, 6 Jhows e 6 Hots Filadélfia.",
    prepTime: "18-25 min",
    highlight: "Ideal p/ 2 a 3 pessoas",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-7",
    name: "Saquê Junmai Hakushika (Dose 150ml)",
    category: "bebidas",
    price: 32.00,
    description: "Saquê premium importado de fermentação tradicional nobre, servido gelado no massu de madeira.",
    prepTime: "2-3 min",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-8",
    name: "Cerveja Japonesa Kirin Ichiban 355ml",
    category: "bebidas",
    price: 18.00,
    description: "Primeira prensagem do malte, puro malte de sabor suave e refrescante.",
    prepTime: "2 min",
    image: "https://images.unsplash.com/photo-1608270546103-97992762b32f?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "item-9",
    name: "Petit Gâteau de Chá Verde Matcha",
    category: "sobremesas",
    price: 28.90,
    description: "Bolo vulcão com recheio cremoso de matcha japonês, servido com sorvete artesanal de gergelim preto.",
    prepTime: "10-14 min",
    highlight: "Exclusivo",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80"
  }
];

export function AppMesaCliente() {
  const [mesaId, setMesaId] = useState("07");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [orderSent, setOrderSent] = useState(false);
  const [chamadoGarcomModal, setChamadoGarcomModal] = useState(false);
  const [chamadoConfirmado, setChamadoConfirmado] = useState<string | null>(null);
  const [splitModal, setSplitModal] = useState(false);
  const [pessoasDivisao, setPessoasDivisao] = useState(2);
  const [pixModal, setPixModal] = useState(false);

  const addOrderMutation = trpc.zuma.addCustomerTableOrder.useMutation({
    onSuccess: (data) => {
      setOrderSent(true);
      toast.success(`Pedido da Mesa ${data.tableNumber} transmitido para o KDS das praças!`);
      setTimeout(() => {
        setCart([]);
        setOrderSent(false);
      }, 4000);
    },
    onError: (err) => {
      toast.error(`Erro ao despachar pedido: ${err.message}`);
    }
  });

  // Itens já pedidos anteriormente na mesa
  const previousOrders = [
    { name: "Sunomono Especial com Polvo", qty: 1, price: 32.00, status: "Entregue na Mesa", time: "19:42" },
    { name: "Hot Roll Salmão Crocante (8 un)", qty: 2, price: 59.80, status: "Entregue na Mesa", time: "19:55" },
    { name: "Água com Gás San Pellegrino", qty: 2, price: 28.00, status: "Entregue na Mesa", time: "19:40" }
  ];

  const totalPrevious = previousOrders.reduce((acc, curr) => acc + curr.price, 0);
  const totalCart = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const totalMesa = totalPrevious + totalCart;

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.item.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.item.id !== itemId);
    });
  };

  const handleEnviarPedido = () => {
    if (cart.length === 0) return;
    const tableNum = parseInt(mesaId, 10) || 7;
    addOrderMutation.mutate({
      tableNumber: tableNum,
      customerName: `Cliente Mesa ${tableNum}`,
      items: cart.map(c => ({
        itemName: c.item.name,
        quantity: c.quantity,
        unitPrice: c.item.price,
        station: c.item.category === "quentes" ? "cozinha_quente" : c.item.category === "bebidas" ? "bar" : "sushibar"
      }))
    });
  };

  const chamarGarcom = (motivo: string) => {
    setChamadoConfirmado(motivo);
    setChamadoGarcomModal(false);
    setTimeout(() => {
      setChamadoConfirmado(null);
    }, 5000);
  };

  const filteredItems = selectedCategory === "todos" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28">
      {/* TopBar do Cliente com Seletor de Mesa */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
              ZM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white">ZUMA COZINHA ORIENTAL</h1>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold uppercase">Ao Vivo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Tangará da Serra</span>
                <span>•</span>
                <span className="text-orange-400 font-bold">Mesa #{mesaId} (Salão Nobre)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setChamadoGarcomModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Garçom</span>
            </button>
            <Link href="/erp">
              <button className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700">
                ERP
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Alerta de Confirmação de Chamado de Garçom */}
      {chamadoConfirmado && (
        <div className="max-w-2xl mx-auto px-4 mt-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Garçom acionado para Mesa #{mesaId}: <strong>"{chamadoConfirmado}"</strong>. Já a caminho!</span>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Pedido Enviado para Cozinha */}
      {orderSent && (
        <div className="max-w-2xl mx-auto px-4 mt-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Pedido transmitido para o KDS do Sushibar!</p>
              <p className="text-xs text-emerald-100">O Sushiman chefe iniciou o preparo. Tempo estimado: 12-16 minutos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Container Principal */}
      <main className="max-w-2xl mx-auto px-4 mt-4 space-y-6">
        
        {/* Banner de Boas-Vindas e Resumo da Mesa */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Comanda Digital</p>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Mesa #{mesaId}
                <span className="text-xs font-normal text-slate-400">(4 lugares ocupados)</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Consumido</p>
              <p className="text-xl font-black text-orange-400">R$ {totalMesa.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => setSplitModal(true)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Dividir Conta ({pessoasDivisao}x)</span>
            </button>
            <button 
              onClick={() => setPixModal(true)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pagar c/ Pix</span>
            </button>
          </div>
        </div>

        {/* Categorias com Rolagem Horizontal Tátil */}
        <div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "todos", label: "Tudo", icon: Sparkles },
              { id: "sushis", label: "Sushis Nobres", icon: Fish },
              { id: "quentes", label: "Cozinha Quente", icon: Flame },
              { id: "barcas", label: "Barcas & Combinados", icon: UtensilsCrossed },
              { id: "bebidas", label: "Saquês & Bebidas", icon: Wine },
              { id: "sobremesas", label: "Sobremesas", icon: Coffee }
            ].map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Pratos do Cardápio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>{filteredItems.length} opções disponíveis para pedir agora</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Clock className="w-3.5 h-3.5" /> Preparo médio: 12 min
            </span>
          </div>

          {filteredItems.map(item => {
            const inCart = cart.find(c => c.item.id === item.id);
            return (
              <div 
                key={item.id}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 flex gap-3 shadow-md transition"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {item.highlight && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-orange-600/90 text-[9px] font-bold text-white shadow">
                      {item.highlight}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-sm font-black text-orange-400">R$ {item.price.toFixed(2)}</span>
                    
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-600 flex items-center justify-center text-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{inCart.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white text-xs font-bold border border-orange-500/30 transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Itens Já Pedidos na Comanda da Mesa */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            Itens Já Servidos na Mesa #{mesaId}
          </h3>
          <div className="space-y-2">
            {previousOrders.map((ord, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/40 last:border-none">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center font-bold text-slate-300">{ord.qty}x</span>
                  <span className="text-slate-200 font-medium">{ord.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{ord.status}</span>
                  <span className="font-bold text-slate-300">R$ {ord.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Barra Inferior Fixa do Carrinho / Envio de Pedido */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-4 backdrop-blur-md shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Novo Pedido a Enviar</p>
              <p className="text-lg font-black text-orange-400">
                R$ {totalCart.toFixed(2)} <span className="text-xs text-slate-400 font-normal">({cart.reduce((a, c) => a + c.quantity, 0)} itens)</span>
              </p>
            </div>
            <button
              onClick={handleEnviarPedido}
              className="flex-1 max-w-xs py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Enviar para a Cozinha</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Chamado do Garçom com Motivo */}
      {chamadoGarcomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                Chamar Garçom na Mesa #{mesaId}
              </h3>
              <button 
                onClick={() => setChamadoGarcomModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">Selecione o motivo para agilizar o atendimento:</p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Pedir a Conta (Fechamento)", icon: Receipt },
                { label: "Mais Shoyu, Wasabi e Gengibre", icon: Fish },
                { label: "Mais Pratos, Hashis ou Talheres", icon: UtensilsCrossed },
                { label: "Mais Bebidas / Gelo", icon: Wine },
                { label: "Falar com o Garçom (Dúvidas)", icon: HelpCircle }
              ].map((motivo, i) => {
                const Icon = motivo.icon;
                return (
                  <button
                    key={i}
                    onClick={() => chamarGarcom(motivo.label)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-orange-500/50 transition text-left"
                  >
                    <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{motivo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Divisão de Conta Tátil */}
      {splitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Dividir Conta da Mesa #{mesaId}
              </h3>
              <button onClick={() => setSplitModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <p className="text-xs text-slate-400">Total Consumido até agora</p>
              <p className="text-2xl font-black text-white mt-1">R$ {totalMesa.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Número de pessoas dividindo:</label>
              <div className="flex items-center justify-center gap-4 p-2 rounded-xl bg-slate-800">
                <button 
                  onClick={() => setPessoasDivisao(Math.max(1, pessoasDivisao - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-black text-white">{pessoasDivisao} pessoas</span>
                <button 
                  onClick={() => setPessoasDivisao(pessoasDivisao + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-xs text-blue-300 font-medium">Valor por pessoa:</p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                R$ {(totalMesa / pessoasDivisao).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => {
                setSplitModal(false);
                setPixModal(true);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Pagar Minha Parte via Pix (R$ {(totalMesa / pessoasDivisao).toFixed(2)})
            </button>
          </div>
        </div>
      )}

      {/* Modal de Pagamento Pix Instantâneo */}
      {pixModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Pix Dinâmico Sicredi/Sicoob
              </h3>
              <button onClick={() => setPixModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Escaneie o QR Code abaixo no app do seu banco ou copie a chave Pix:
            </p>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl shadow-inner flex items-center justify-center">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014BR.GOV.BCB.PIX0136zuma.tangara@kytto.com.br520400005303986540549.905802BR5925ZUMA+COZINHA+ORIENTAL6016TANGARA+DA+SERRA62070503***6304" 
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-sm font-black text-emerald-400">
              Valor: R$ {(totalMesa / (splitModal ? pessoasDivisao : 1)).toFixed(2)}
            </div>

            <button 
              onClick={() => {
                alert("Código Pix Copia e Cola copiado para a área de transferência!");
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Copiar Código Pix Copia e Cola
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Aguardando liquidação bancária automática...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AppMesaCliente;
