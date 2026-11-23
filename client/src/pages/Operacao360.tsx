import React, { useState, useEffect } from "react";
import {
  Layers,
  Calculator,
  Flame,
  UtensilsCrossed,
  Bike,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  Bell,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
  DollarSign,
  AlertTriangle,
  FileText,
  Volume2,
  VolumeX,
  ExternalLink,
  MessageCircle,
  Users,
  Receipt,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Produtos padrão para o PDV e Garçom
interface ProdutoOperacao {
  id: string;
  nome: string;
  categoria: "sushi" | "quente" | "bebida" | "sobremesa";
  praca: "sushibar" | "wok" | "fritadeira" | "bar";
  preco: number;
}

const PRODUTOS: ProdutoOperacao[] = [
  { id: "P1", nome: "Barca Especial 50 Pçs", categoria: "sushi", praca: "sushibar", preco: 148.0 },
  { id: "P2", nome: "Combinado Salmão Lovers 24 Pçs", categoria: "sushi", praca: "sushibar", preco: 89.9 },
  { id: "P3", nome: "Sashimi Salmão Fresco (10 Pçs)", categoria: "sushi", praca: "sushibar", preco: 48.0 },
  { id: "P4", nome: "Hot Roll Especial Trufado (8 Pçs)", categoria: "sushi", praca: "fritadeira", preco: 38.0 },
  { id: "P5", nome: "Temaki Filadélfia Completo", categoria: "sushi", praca: "sushibar", preco: 34.0 },
  { id: "P6", nome: "Yakissoba Especial de Mignon", categoria: "quente", praca: "wok", preco: 58.0 },
  { id: "P7", nome: "Guioza de Carne Suína (6 Pçs)", categoria: "quente", praca: "wok", preco: 32.0 },
  { id: "P8", nome: "Harumaki de Queijo e Ervas (4 Pçs)", categoria: "quente", praca: "fritadeira", preco: 26.0 },
  { id: "P9", nome: "Soda Italiana Maçã Verde", categoria: "bebida", praca: "bar", preco: 18.0 },
  { id: "P10", nome: "Saquê Dourado Junmai 750ml", categoria: "bebida", praca: "bar", preco: 110.0 },
  { id: "P11", nome: "Cerveja Japonesa Kirin Ichiban", categoria: "bebida", praca: "bar", preco: 22.0 },
  { id: "P12", nome: "Petit Gâteau com Sorvete de Wasabi", categoria: "sobremesa", praca: "wok", preco: 28.0 },
];

interface MesaSalao {
  num: string;
  setor: "Salão Principal" | "Deck Jardim" | "Bistrô Casais" | "Sushi Bar Balcão";
  status: "livre" | "ocupada" | "chamando" | "conta";
  total: number;
  pessoas: number;
  itensConsumidos: { nome: string; qtd: number; valor: number }[];
  tempoMin: number;
}

interface ComandaKds {
  id: string;
  mesaOuOrigem: string;
  tipo: "mesa" | "delivery" | "balcao";
  itens: { nome: string; qtd: number; praca: "sushibar" | "wok" | "fritadeira" | "bar" }[];
  praca: "sushibar" | "wok" | "fritadeira" | "bar" | "todas";
  tempoMinutos: number;
  status: "preparando" | "pronto" | "expedido";
  obs?: string;
}

interface EntregaExpedicao {
  id: string;
  cliente: string;
  bairro: string;
  endereco: string;
  telefone: string;
  valorTotal: number;
  taxa: number;
  itens: string;
  status: "aguardando_motoboy" | "em_rota" | "entregue";
  motoboy?: string;
}

export const Operacao360: React.FC = () => {
  // Módulo ativo: 'pdv' | 'kds' | 'garcom' | 'motoboy'
  const [moduloAtivo, setModuloAtivo] = useState<"pdv" | "kds" | "garcom" | "motoboy">("pdv");
  const [somAtivo, setSomAtivo] = useState(true);

  // Som via Web Audio API
  const tocarBeep = (frequencia = 600, duracao = 0.15) => {
    if (!somAtivo) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duracao);
    } catch (e) {
      // Ignorar erros de áudio silenciosamente
    }
  };

  // ===================== ESTADO DO PDV =====================
  const [carrinhoPdv, setCarrinhoPdv] = useState<{ produto: ProdutoOperacao; qtd: number }[]>([
    { produto: PRODUTOS[0], qtd: 1 },
    { produto: PRODUTOS[8], qtd: 2 },
  ]);
  const [buscaPdv, setBuscaPdv] = useState("");
  const [categoriaPdv, setCategoriaPdv] = useState<string>("todas");
  const [formaPagamentoPdv, setFormaPagamentoPdv] = useState("apple_pay");
  const [modalSangria, setModalSangria] = useState(false);
  const [modalSuprimento, setModalSuprimento] = useState(false);
  const [modalZReport, setModalZReport] = useState(false);
  const [valorCaixaAtual, setValorCaixaAtual] = useState(450.0);

  // ===================== ESTADO DO GARÇOM & 27 MESAS =====================
  const [mesas, setMesas] = useState<MesaSalao[]>(() =>
    Array.from({ length: 27 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");
      let setor: MesaSalao["setor"] = "Salão Principal";
      let status: MesaSalao["status"] = "livre";
      let total = 0;
      let pessoas = 2;
      let itensConsumidos: { nome: string; qtd: number; valor: number }[] = [];
      let tempoMin = 0;

      if (i >= 12 && i < 18) setor = "Deck Jardim";
      else if (i >= 18 && i < 22) setor = "Bistrô Casais";
      else if (i >= 22) setor = "Sushi Bar Balcão";

      if ([2, 4, 8, 14, 19].includes(i + 1)) {
        status = "ocupada";
        total = 145.0 + (i * 12);
        tempoMin = 35 + (i * 3);
        itensConsumidos = [
          { nome: "Combinado Salmão Lovers", qtd: 1, valor: 89.9 },
          { nome: "Soda Italiana Maçã Verde", qtd: 2, valor: 36.0 },
        ];
      }
      if ([7, 21].includes(i + 1)) {
        status = "chamando";
        total = 210.0;
        tempoMin = 50;
        itensConsumidos = [
          { nome: "Barca Especial 50 Pçs", qtd: 1, valor: 148.0 },
          { nome: "Cerveja Kirin Ichiban", qtd: 2, valor: 44.0 },
        ];
      }
      if (i + 1 === 10) {
        status = "conta";
        total = 192.5;
        tempoMin = 75;
        itensConsumidos = [
          { nome: "Sashimi Salmão Fresco", qtd: 2, valor: 96.0 },
          { nome: "Yakissoba de Mignon", qtd: 1, valor: 58.0 },
        ];
      }

      return { num, setor, status, total, pessoas, itensConsumidos, tempoMin };
    })
  );

  const [mesaSelecionada, setMesaSelecionada] = useState<MesaSalao | null>(null);
  const [modalMesaAberto, setModalMesaAberto] = useState(false);
  const [novoItemGarcom, setNovoItemGarcom] = useState("");

  // ===================== ESTADO DO KDS COZINHA =====================
  const [filtroPracaKds, setFiltroPracaKds] = useState<string>("todas");
  const [comandasKds, setComandasKds] = useState<ComandaKds[]>([
    {
      id: "KDS-301",
      mesaOuOrigem: "Mesa 07",
      tipo: "mesa",
      itens: [
        { nome: "Barca Especial 50 Pçs", qtd: 1, praca: "sushibar" },
        { nome: "Hot Roll Especial Trufado", qtd: 2, praca: "fritadeira" },
      ],
      praca: "sushibar",
      tempoMinutos: 8,
      status: "preparando",
      obs: "Sem cebolinha nos sashimis",
    },
    {
      id: "KDS-302",
      mesaOuOrigem: "Delivery #8841",
      tipo: "delivery",
      itens: [
        { nome: "Yakissoba de Mignon", qtd: 2, praca: "wok" },
        { nome: "Guioza Suína (6 Pçs)", qtd: 1, praca: "wok" },
      ],
      praca: "wok",
      tempoMinutos: 18,
      status: "preparando",
      obs: "Molho agridoce extra",
    },
    {
      id: "KDS-303",
      mesaOuOrigem: "Mesa 02",
      tipo: "mesa",
      itens: [
        { nome: "Sashimi Salmão (10 Pçs)", qtd: 1, praca: "sushibar" },
        { nome: "Temaki Filadélfia Completo", qtd: 2, praca: "sushibar" },
      ],
      praca: "sushibar",
      tempoMinutos: 27,
      status: "preparando",
    },
  ]);

  // ===================== ESTADO DE EXPEDIÇÃO & MOTOBOY =====================
  const [entregas, setEntregas] = useState<EntregaExpedicao[]>([
    {
      id: "DEL-801",
      cliente: "Juliana Mendes",
      bairro: "Centro",
      endereco: "Rua Antônio Hortolani, 450",
      telefone: "(65) 99912-3344",
      valorTotal: 148.5,
      taxa: 12.0,
      itens: "Barca Especial 50 Pçs + Hot Roll Nutella",
      status: "aguardando_motoboy",
    },
    {
      id: "DEL-802",
      cliente: "Dr. Fernando Barros",
      bairro: "Jardim Europa",
      endereco: "Av. Tancredo Neves, 1220",
      telefone: "(65) 99655-8899",
      valorTotal: 215.0,
      taxa: 14.0,
      itens: "Especial Zuma 68 Pçs + 2x Sodas",
      status: "em_rota",
      motoboy: "Carlos Silva (Honda CG 160)",
    },
    {
      id: "DEL-803",
      cliente: "Beatriz Oliveira",
      bairro: "Vila Alta",
      endereco: "Rua 26, 890",
      telefone: "(65) 99877-1122",
      valorTotal: 92.0,
      taxa: 16.0,
      itens: "Yakissoba Misto + Rolinho Queijo",
      status: "aguardando_motoboy",
    },
  ]);

  // Temporizador do KDS (avança 1 min a cada período para realismo)
  useEffect(() => {
    const timer = setInterval(() => {
      setComandasKds((prev) =>
        prev.map((c) => (c.status === "preparando" ? { ...c, tempoMinutos: c.tempoMinutos + 1 } : c))
      );
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Total do PDV
  const subtotalPdv = carrinhoPdv.reduce((acc, item) => acc + item.produto.preco * item.qtd, 0);

  // Ações do PDV
  const adicionarAoPdv = (prod: ProdutoOperacao) => {
    tocarBeep(700, 0.1);
    setCarrinhoPdv((prev) => {
      const existe = prev.find((i) => i.produto.id === prod.id);
      if (existe) {
        return prev.map((i) => (i.produto.id === prod.id ? { ...i, qtd: i.qtd + 1 } : i));
      }
      return [...prev, { produto: prod, qtd: 1 }];
    });
    toast.success(`+1 ${prod.nome} adicionado.`);
  };

  const alterarQtdPdv = (prodId: string, delta: number) => {
    tocarBeep(500, 0.08);
    setCarrinhoPdv((prev) =>
      prev
        .map((i) => (i.produto.id === prodId ? { ...i, qtd: i.qtd + delta } : i))
        .filter((i) => i.qtd > 0)
    );
  };

  const concluirVendaPdv = () => {
    if (carrinhoPdv.length === 0) {
      toast.error("O carrinho está vazio.");
      return;
    }
    tocarBeep(880, 0.3);
    setValorCaixaAtual((prev) => prev + subtotalPdv);
    toast.success(`Venda de R$ ${subtotalPdv.toFixed(2)} finalizada via ${formaPagamentoPdv.toUpperCase()}!`, {
      icon: "🧾",
    });
    setCarrinhoPdv([]);
  };

  // Ações de Caixa (Sangria e Suprimento)
  const executarSangria = (valor: number, motivo: string) => {
    setValorCaixaAtual((prev) => prev - valor);
    setModalSangria(false);
    toast.info(`Sangria de R$ ${valor.toFixed(2)} registrada (${motivo}). Comprovante impresso.`);
  };

  const executarSuprimento = (valor: number, motivo: string) => {
    setValorCaixaAtual((prev) => prev + valor);
    setModalSuprimento(false);
    toast.success(`Suprimento de R$ ${valor.toFixed(2)} inserido no caixa (${motivo}).`);
  };

  // Ações do KDS
  const concluirComandaKds = (id: string) => {
    tocarBeep(950, 0.25);
    setComandasKds((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "pronto" } : c))
    );
    toast.success(`Comanda ${id} marcada como PRONTA para servir!`, { icon: "🍣" });
  };

  const expedirComandaKds = (id: string) => {
    tocarBeep(600, 0.15);
    setComandasKds((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Comanda ${id} expedida com sucesso.`);
  };

  const simularNovoPedidoKds = () => {
    tocarBeep(1200, 0.35);
    const novoKds: ComandaKds = {
      id: `KDS-${Math.floor(300 + Math.random() * 100)}`,
      mesaOuOrigem: `Mesa ${String(Math.floor(1 + Math.random() * 27)).padStart(2, "0")}`,
      tipo: "mesa",
      itens: [
        { nome: "Combo Salmão Lovers 24 Pçs", qtd: 1, praca: "sushibar" },
        { nome: "Harumaki de Queijo", qtd: 1, praca: "fritadeira" },
      ],
      praca: "sushibar",
      tempoMinutos: 1,
      status: "preparando",
      obs: "Caprichar no gengibre",
    };
    setComandasKds((prev) => [novoKds, ...prev]);
    toast.info(`🔔 Novo pedido acabou de chegar na Cozinha (${novoKds.id})!`, { icon: "👨‍🍳" });
  };

  // Ações do Garçom / Mesas
  const abrirModalMesa = (m: MesaSalao) => {
    setMesaSelecionada(m);
    setModalMesaAberto(true);
    tocarBeep(650, 0.1);
  };

  const adicionarItemComandaMesa = (prod: ProdutoOperacao) => {
    if (!mesaSelecionada) return;
    tocarBeep(750, 0.12);
    setMesas((prev) =>
      prev.map((m) => {
        if (m.num === mesaSelecionada.num) {
          const novoTotal = m.total + prod.preco;
          const novosItens = [...m.itensConsumidos, { nome: prod.nome, qtd: 1, valor: prod.preco }];
          const mesaAtualizada: MesaSalao = {
            ...m,
            status: "ocupada",
            total: novoTotal,
            itensConsumidos: novosItens,
          };
          setMesaSelecionada(mesaAtualizada);
          return mesaAtualizada;
        }
        return m;
      })
    );
    toast.success(`+1 ${prod.nome} lançado na Mesa ${mesaSelecionada.num}!`);
  };

  const pedirContaMesa = () => {
    if (!mesaSelecionada) return;
    setMesas((prev) =>
      prev.map((m) => (m.num === mesaSelecionada.num ? { ...m, status: "conta" } : m))
    );
    setModalMesaAberto(false);
    toast.info(`Conta da Mesa ${mesaSelecionada.num} solicitada ao Caixa!`, { icon: "🧾" });
  };

  const atenderChamadoMesa = (num: string) => {
    setMesas((prev) =>
      prev.map((m) => (m.num === num ? { ...m, status: "ocupada" } : m))
    );
    toast.success(`Chamado da Mesa ${num} atendido pelo garçom.`);
  };

  const dividirConta = () => {
    if (!mesaSelecionada) return;
    const pessoas = prompt("Dividir a conta entre quantas pessoas?", String(mesaSelecionada.pessoas || 2));
    if (pessoas && parseInt(pessoas) > 0) {
      const qtd = parseInt(pessoas);
      const valorPorPessoa = mesaSelecionada.total / qtd;
      alert(`Mesa ${mesaSelecionada.num}:\nTotal: R$ ${mesaSelecionada.total.toFixed(2)}\nDividido por ${qtd} pessoas = R$ ${valorPorPessoa.toFixed(2)} cada.`);
    }
  };

  // Ações de Motoboy
  const atribuirMotoboy = (entregaId: string) => {
    setEntregas((prev) =>
      prev.map((e) =>
        e.id === entregaId
          ? { ...e, status: "em_rota", motoboy: "Carlos Silva (Honda CG 160)" }
          : e
      )
    );
    toast.success(`Pedido ${entregaId} atribuído ao entregador Carlos Silva!`);
  };

  const chamandoCount = mesas.filter((m) => m.status === "chamando").length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Header com Seletor dos 4 Módulos da Operação 360° */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--salmon-soft)] border border-[var(--salmon)]/30 flex items-center justify-center text-[var(--salmon)] font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[var(--ink)] tracking-tight">
                Operação 360° Unificada
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              PDV Touch · KDS Cozinha · 27 Mesas do Salão · Despacho Motoboy
            </p>
          </div>
        </div>

        {/* Módulos Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] flex-wrap">
          <button
            onClick={() => setModuloAtivo("pdv")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              moduloAtivo === "pdv"
                ? "bg-[var(--surface)] text-[var(--salmon)] font-black shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calculator className="w-4 h-4" />
            PDV Caixa
          </button>

          <button
            onClick={() => setModuloAtivo("kds")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              moduloAtivo === "kds"
                ? "bg-[var(--surface)] text-[var(--salmon)] font-black shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            KDS Cozinha ({comandasKds.length})
          </button>

          <button
            onClick={() => setModuloAtivo("garcom")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all relative ${
              moduloAtivo === "garcom"
                ? "bg-[var(--surface)] text-[var(--salmon)] font-black shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-blue-500" />
            27 Mesas Salão
            {chamandoCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          <button
            onClick={() => setModuloAtivo("motoboy")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              moduloAtivo === "motoboy"
                ? "bg-[var(--surface)] text-[var(--salmon)] font-black shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Bike className="w-4 h-4 text-emerald-500" />
            Expedição ({entregas.filter((e) => e.status === "aguardando_motoboy").length})
          </button>

          {/* Toggle Som */}
          <button
            onClick={() => setSomAtivo(!somAtivo)}
            className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--ink)]"
            title={somAtivo ? "Silenciar sons" : "Ativar sons"}
          >
            {somAtivo ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MÓDULO: PDV CAIXA TOUCH                                               */}
      {/* ========================================================================= */}
      {moduloAtivo === "pdv" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna Esquerda: Catálogo de Produtos e Categorias (Col 7) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Barra de Filtros e Busca */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3 flex flex-col sm:flex-row gap-2 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={buscaPdv}
                  onChange={(e) => setBuscaPdv(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["todas", "sushi", "quente", "bebida", "sobremesa"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaPdv(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                      categoriaPdv === cat
                        ? "bg-[var(--salmon)] text-white"
                        : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Produtos Touch */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRODUTOS.filter((p) => {
                const matchCat = categoriaPdv === "todas" || p.categoria === categoriaPdv;
                const matchBusca = !buscaPdv || p.nome.toLowerCase().includes(buscaPdv.toLowerCase());
                return matchCat && matchBusca;
              }).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => adicionarAoPdv(prod)}
                  className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--salmon)] rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                      {prod.categoria}
                    </span>
                    <h4 className="text-xs font-black text-[var(--ink)] leading-snug line-clamp-2">
                      {prod.nome}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                    <span className="font-mono font-black text-sm text-[var(--salmon)]">
                      R$ {prod.preco.toFixed(2)}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-[var(--salmon-soft)] text-[var(--salmon)] flex items-center justify-center font-bold text-xs group-hover:bg-[var(--salmon)] group-hover:text-white transition-colors">
                      +
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações de Caixa (Sangria, Suprimento, Fechamento) */}
            <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)] font-medium">Fundo de Caixa Atual:</span>
                <strong className="text-[var(--ink)] font-mono text-sm">
                  R$ {valorCaixaAtual.toFixed(2)}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalSuprimento(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 font-bold hover:bg-emerald-500/25 transition-all"
                >
                  + Suprimento
                </button>
                <button
                  onClick={() => setModalSangria(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 border border-rose-500/30 font-bold hover:bg-rose-500/25 transition-all"
                >
                  - Sangria
                </button>
                <button
                  onClick={() => setModalZReport(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-700 border border-purple-500/30 font-bold hover:bg-purple-500/25 transition-all"
                >
                  Z-Report
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Carrinho e Checkout Touch (Col 5) */}
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[var(--salmon)]" />
                  Comanda Atual
                </h3>
                <button
                  onClick={() => setCarrinhoPdv([])}
                  className="text-xs text-rose-500 hover:underline font-bold"
                >
                  Limpar
                </button>
              </div>

              {/* Lista de Itens do Carrinho */}
              <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
                {carrinhoPdv.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[var(--muted)]">
                    Nenhum item selecionado. Toque nos produtos ao lado para adicionar.
                  </div>
                ) : (
                  carrinhoPdv.map((item) => (
                    <div
                      key={item.produto.id}
                      className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <strong className="text-[var(--ink)] block">{item.produto.nome}</strong>
                        <span className="text-[10px] text-[var(--muted)] font-mono">
                          R$ {item.produto.preco.toFixed(2)} cada
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => alterarQtdPdv(item.produto.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold font-mono text-xs">
                          {item.qtd}
                        </span>
                        <button
                          onClick={() => alterarQtdPdv(item.produto.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-[var(--salmon)] text-xs ml-2 w-16 text-right">
                          R$ {(item.produto.preco * item.qtd).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totais & Pagamento */}
            <div className="space-y-3 pt-3 border-t border-[var(--line)]">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Subtotal:</span>
                  <span className="font-mono">R$ {subtotalPdv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[var(--ink)]">
                  <span>Total da Venda:</span>
                  <span className="font-mono text-[var(--salmon)] text-lg">
                    R$ {subtotalPdv.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formas de Pagamento Rápidas Touch */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormaPagamentoPdv("apple_pay")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formaPagamentoPdv === "apple_pay"
                      ? "border-sky-500 bg-sky-500/15 text-sky-700"
                      : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                  Apple Pay
                </button>
                <button
                  type="button"
                  onClick={() => setFormaPagamentoPdv("pix")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formaPagamentoPdv === "pix"
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-700"
                      : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  Pix Instantâneo
                </button>
                <button
                  type="button"
                  onClick={() => setFormaPagamentoPdv("cartao")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formaPagamentoPdv === "cartao"
                      ? "border-amber-500 bg-amber-500/15 text-amber-700"
                      : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  Cartão Crédito/Débito
                </button>
                <button
                  type="button"
                  onClick={() => setFormaPagamentoPdv("dinheiro")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formaPagamentoPdv === "dinheiro"
                      ? "border-purple-500 bg-purple-500/15 text-purple-700"
                      : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-purple-600" />
                  Dinheiro (Troco)
                </button>
              </div>

              <button
                onClick={concluirVendaPdv}
                className="w-full py-3 rounded-2xl bg-[var(--salmon)] hover:bg-orange-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                Finalizar Venda · R$ {subtotalPdv.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO: KDS COZINHA & SUSHIBAR SETORIZADO                              */}
      {/* ========================================================================= */}
      {moduloAtivo === "kds" && (
        <div className="space-y-4">
          {/* Header do KDS com Filtro por Praça e Ação de Simular Pedido */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold text-[var(--muted)] mr-1">Praça:</span>
              {[
                { id: "todas", label: "Todas as Praças" },
                { id: "sushibar", label: "🍣 Sushibar (Frio)" },
                { id: "wok", label: "🥢 Wok & Quentes" },
                { id: "fritadeira", label: "🍤 Fritadeira & Hot" },
                { id: "bar", label: "🍹 Bar & Sodas" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFiltroPracaKds(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filtroPracaKds === p.id
                      ? "bg-[var(--salmon)] text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={simularNovoPedidoKds}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simular Novo Pedido
            </button>
          </div>

          {/* Grid de Comandas KDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandasKds
              .filter((c) => filtroPracaKds === "todas" || c.praca === filtroPracaKds)
              .map((comanda) => {
                // Alertas de cor por tempo
                const isUrgente = comanda.tempoMinutos > 25;
                const isAlerta = comanda.tempoMinutos >= 15 && comanda.tempoMinutos <= 25;

                const corBorda = isUrgente
                  ? "border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/30"
                  : isAlerta
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-[var(--line)] bg-[var(--surface)]";

                return (
                  <div
                    key={comanda.id}
                    className={`rounded-3xl border ${corBorda} p-5 space-y-4 shadow-xs flex flex-col justify-between transition-all`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                            {comanda.tipo.toUpperCase()}
                          </span>
                          <h3 className="text-base font-black text-[var(--ink)]">
                            {comanda.mesaOuOrigem}
                          </h3>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            isUrgente
                              ? "bg-rose-500 text-white animate-pulse"
                              : isAlerta
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-emerald-500/15 text-emerald-600"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {comanda.tempoMinutos} min
                        </div>
                      </div>

                      {/* Lista de Itens */}
                      <div className="space-y-2">
                        {comanda.itens.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between text-xs p-2 rounded-xl bg-[var(--surface2)]"
                          >
                            <span className="font-bold text-[var(--ink)]">
                              <span className="text-[var(--salmon)] font-mono mr-1.5">{it.qtd}x</span>
                              {it.nome}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)]">
                              {it.praca}
                            </span>
                          </div>
                        ))}
                      </div>

                      {comanda.obs && (
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[11px] font-bold">
                          ⚠️ Obs: {comanda.obs}
                        </div>
                      )}
                    </div>

                    {/* Ações da Comanda */}
                    <div className="pt-2 border-t border-[var(--line)] flex gap-2">
                      {comanda.status === "preparando" ? (
                        <button
                          onClick={() => concluirComandaKds(comanda.id)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pronto
                        </button>
                      ) : (
                        <button
                          onClick={() => expedirComandaKds(comanda.id)}
                          className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          Expedir p/ Garçom / Balcão
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MÓDULO: APP DO GARÇOM & MAPA DAS 27 MESAS DO SALÃO                     */}
      {/* ========================================================================= */}
      {moduloAtivo === "garcom" && (
        <div className="space-y-4">
          {/* Header com Legenda de Cores do Salão */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-[var(--ink)]">
                Mapa Operacional do Salão · 27 Mesas
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Toque em qualquer mesa para abrir a comanda móvel ou atender chamados
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--line)]" />
                Livre
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Ocupada
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                Chamando Garçom ({chamandoCount})
              </span>
              <span className="flex items-center gap-1.5 text-orange-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Pediu Conta
              </span>
            </div>
          </div>

          {/* Grid das 27 Mesas */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
            {mesas.map((m) => {
              let corCard = "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)]";
              let badgeStatus = "Livre";

              if (m.status === "ocupada") {
                corCard = "bg-blue-500/10 border-blue-500/40 text-blue-700 shadow-2xs";
                badgeStatus = `R$ ${m.total.toFixed(0)}`;
              } else if (m.status === "chamando") {
                corCard = "bg-amber-500/20 border-amber-500 text-amber-900 ring-2 ring-amber-500 animate-pulse";
                badgeStatus = "🔔 Chamando!";
              } else if (m.status === "conta") {
                corCard = "bg-orange-500/15 border-orange-500/40 text-orange-800";
                badgeStatus = "Pediu Conta";
              }

              return (
                <div
                  key={m.num}
                  onClick={() => abrirModalMesa(m)}
                  className={`border ${corCard} rounded-2xl p-3 cursor-pointer hover:scale-105 transition-all text-center space-y-1 flex flex-col justify-between`}
                >
                  <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] truncate block">
                    {m.setor}
                  </span>
                  <div className="text-xl font-black text-[var(--ink)]">Mesa {m.num}</div>
                  <span className="text-[10px] font-bold block truncate">{badgeStatus}</span>
                </div>
              );
            })}
          </div>

          {/* Modal de Comanda Móvel da Mesa */}
          {modalMesaAberto && mesaSelecionada && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <h3 className="text-lg font-black text-[var(--ink)] flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-[var(--salmon)]" />
                      Comanda Móvel · Mesa {mesaSelecionada.num}
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      {mesaSelecionada.setor} · Permanência: ~{mesaSelecionada.tempoMin} min
                    </p>
                  </div>
                  <button
                    onClick={() => setModalMesaAberto(false)}
                    className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Status e Ação de Atender Chamado se aplicável */}
                {mesaSelecionada.status === "chamando" && (
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                      Cliente chamou o garçom!
                    </span>
                    <button
                      onClick={() => atenderChamadoMesa(mesaSelecionada.num)}
                      className="px-3 py-1 rounded-xl bg-amber-600 text-white font-bold text-xs"
                    >
                      Marcar Atendido
                    </button>
                  </div>
                )}

                {/* Itens já consumidos na mesa */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Itens Lançados ({mesaSelecionada.itensConsumidos.length})
                  </h4>
                  {mesaSelecionada.itensConsumidos.length === 0 ? (
                    <div className="text-xs text-[var(--muted)] py-3 text-center">
                      Mesa livre. Nenhum item lançado.
                    </div>
                  ) : (
                    mesaSelecionada.itensConsumidos.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[var(--surface2)] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[var(--ink)]">
                          {it.qtd}x {it.nome}
                        </span>
                        <span className="font-mono font-bold text-[var(--salmon)]">
                          R$ {it.valor.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Total da Mesa */}
                <div className="p-3 rounded-2xl bg-[var(--surface2)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">Total Parcial:</span>
                  <span className="text-lg font-black font-mono text-[var(--salmon)]">
                    R$ {mesaSelecionada.total.toFixed(2)}
                  </span>
                </div>

                {/* Adicionar Itens Rápidos com 1 Toque */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--ink)]">Lançar Novo Item Rápido:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUTOS.slice(0, 4).map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => adicionarItemComandaMesa(prod)}
                        className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--line)] text-left text-xs transition-all flex justify-between items-center"
                      >
                        <span className="font-bold text-[var(--ink)] truncate">{prod.nome}</span>
                        <span className="font-mono text-[10px] text-[var(--salmon)] shrink-0 ml-1">
                          +R$ {prod.preco}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação da Mesa */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={dividirConta}
                    className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Dividir Conta
                  </button>
                  <button
                    onClick={pedirContaMesa}
                    className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Solicitar Fechamento
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MÓDULO: EXPEDIÇÃO & DESPACHO DE MOTOBOY                                 */}
      {/* ========================================================================= */}
      {moduloAtivo === "motoboy" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-[var(--ink)]">
                Bancada de Expedição & Despacho Delivery
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Pedidos prontos na embalagem aguardando saída para as ruas de Tangará da Serra
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
              {entregas.filter((e) => e.status === "aguardando_motoboy").length} prontos para entrega
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entregas.map((ent) => (
              <div
                key={ent.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                    <div>
                      <strong className="text-sm font-bold text-[var(--ink)]">{ent.cliente}</strong>
                      <span className="text-[10px] text-[var(--muted)] block font-mono">{ent.id}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600">
                      Taxa: R$ {ent.taxa.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-[var(--ink)]">
                    <div>
                      📍 <strong>{ent.endereco}</strong> ({ent.bairro})
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Pedido: <strong className="text-[var(--ink)]">{ent.itens}</strong>
                    </div>
                    <div className="text-[11px]">
                      Total: <strong className="font-mono text-emerald-600">R$ {ent.valorTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <a
                    href={`https://wa.me/55${ent.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Olá ${ent.cliente}! Seu pedido do Zuma Cozinha Oriental está pronto e a caminho!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-600/30 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Avisar no WhatsApp
                  </a>

                  {ent.status === "aguardando_motoboy" ? (
                    <button
                      onClick={() => atribuirMotoboy(ent.id)}
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Bike className="w-4 h-4" />
                      Despachar com Motoboy
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-sky-500/15 text-sky-700 text-xs font-bold text-center">
                      ✓ Em Rota com {ent.motoboy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {modalSangria && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-[var(--ink)]">Registrar Sangria de Caixa</h3>
            <p className="text-xs text-[var(--muted)]">Retirada de numerário da gaveta para cofre ou despesa urgente</p>
            <input
              id="sangria-valor"
              type="number"
              placeholder="Valor (R$)"
              defaultValue={100}
              className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-bold font-mono"
            />
            <input
              id="sangria-motivo"
              type="text"
              placeholder="Motivo (ex: Sangria Cofre Fechamento)"
              defaultValue="Depósito Cofre Noturno"
              className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalSangria(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface2)] text-xs font-bold text-[var(--muted)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const val = parseFloat((document.getElementById("sangria-valor") as HTMLInputElement).value || "0");
                  const mot = (document.getElementById("sangria-motivo") as HTMLInputElement).value;
                  executarSangria(val, mot);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-black shadow-xs"
              >
                Confirmar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suprimento */}
      {modalSuprimento && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-[var(--ink)]">Inserir Suprimento de Troco</h3>
            <p className="text-xs text-[var(--muted)]">Aporte inicial de moedas e cédulas para abertura de turno</p>
            <input
              id="suprimento-valor"
              type="number"
              placeholder="Valor (R$)"
              defaultValue={150}
              className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-bold font-mono"
            />
            <input
              id="suprimento-motivo"
              type="text"
              placeholder="Motivo (ex: Troco Abertura Manhã)"
              defaultValue="Fundo de Troco Gaveta"
              className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalSuprimento(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface2)] text-xs font-bold text-[var(--muted)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const val = parseFloat((document.getElementById("suprimento-valor") as HTMLInputElement).value || "0");
                  const mot = (document.getElementById("suprimento-motivo") as HTMLInputElement).value;
                  executarSuprimento(val, mot);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs"
              >
                Confirmar Aporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Z-Report */}
      {modalZReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-[var(--ink)]">Relatório Z-Report de Fechamento</h3>
            <p className="text-xs text-[var(--muted)]">Resumo fiscal e operacional do turno em Tangará da Serra</p>
            <div className="p-3 rounded-2xl bg-[var(--surface2)] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span>Vendas Totais Hoje:</span>
                <strong>R$ 3.840,00</strong>
              </div>
              <div className="flex justify-between">
                <span>Cartão Débito/Crédito:</span>
                <strong>R$ 2.120,00</strong>
              </div>
              <div className="flex justify-between">
                <span>Apple Pay / Pix:</span>
                <strong>R$ 1.270,00</strong>
              </div>
              <div className="flex justify-between">
                <span>Dinheiro em Gaveta:</span>
                <strong>R$ 450,00</strong>
              </div>
            </div>
            <button
              onClick={() => {
                setModalZReport(false);
                toast.success("Z-Report emitido e enviado para o e-mail contábil!");
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-xs"
            >
              Fechar Turno & Imprimir Comprovante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
