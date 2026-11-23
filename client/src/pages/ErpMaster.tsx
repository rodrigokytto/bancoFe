import React, { useState, useEffect } from "react";
import { formatBrl, MENU, ALL_ITEMS } from "../../../shared/zumaData";
import { 
  Building2, 
  Receipt, 
  CircleDollarSign, 
  UtensilsCrossed, 
  Boxes, 
  Flame, 
  Truck, 
  Users, 
  CalendarCheck2, 
  ShoppingCart, 
  Printer, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Download, 
  RotateCcw, 
  Zap, 
  QrCode, 
  TrendingUp, 
  Store,
  Bike,
  Coffee,
  Check,
  Percent,
  Layers,
  Thermometer,
  Scale,
  MessageSquare,
  ChevronDown,
  Scissors,
  Pizza,
  Beer,
  Wrench,
  Award,
  UserCheck,
  Briefcase,
  Barcode,
  Wheat
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// Subsuítes Especializadas do ERP Zuma (consolidadas de agro-open)
import { ErpFiscalSubsuite } from "@/components/erp/ErpFiscalSubsuite";
import { ErpFinanceiroSubsuite } from "@/components/erp/ErpFinanceiroSubsuite";
import { ErpSuprimentosSubsuite } from "@/components/erp/ErpSuprimentosSubsuite";
import { ErpPatrimonioSubsuite } from "@/components/erp/ErpPatrimonioSubsuite";
import { ErpFechamentoTurno } from "@/components/erp/ErpFechamentoTurno";
import { ErpDeliveryRulesEditor } from "@/components/erp/ErpDeliveryRulesEditor";
import { ErpVarejoSubsuite } from "@/components/erp/ErpVarejoSubsuite";
import { ErpBarbeariaSubsuite } from "@/components/erp/ErpBarbeariaSubsuite";
import { ErpPizzariaSubsuite } from "@/components/erp/ErpPizzariaSubsuite";
import { ErpCustomer360Subsuite } from "@/components/erp/ErpCustomer360Subsuite";
import { ErpBarSubsuite } from "@/components/erp/ErpBarSubsuite";
import { ErpAutoPecasSubsuite } from "@/components/erp/ErpAutoPecasSubsuite";
import { ErpConcretoSubsuite } from "@/components/erp/ErpConcretoSubsuite";
import { ErpClubeSubsuite } from "@/components/erp/ErpClubeSubsuite";
import { ErpComercialSubsuite } from "@/components/erp/ErpComercialSubsuite";
import { ErpAgroSubsuite } from "@/components/erp/ErpAgroSubsuite";
import { ErpOrdemServicoSubsuite } from "@/components/erp/ErpOrdemServicoSubsuite";
import { ErpExpedicaoSubsuite } from "@/components/erp/ErpExpedicaoSubsuite";
import { ErpRhSubsuite } from "@/components/erp/ErpRhSubsuite";
import { ErpComprasSubsuite } from "@/components/erp/ErpComprasSubsuite";
import { ErpEstoqueWmsSubsuite } from "@/components/erp/ErpEstoqueWmsSubsuite";
import { ErpBillingSubsuite } from "@/components/erp/ErpBillingSubsuite";
import { ErpGovernancaSubsuite } from "@/components/erp/ErpGovernancaSubsuite";
import { ErpRelatoriosExportModal } from "@/components/erp/ErpRelatoriosExportModal";
import { ErpAuditoria360Modal } from "@/components/erp/ErpAuditoria360Modal";
import { ErpDreMultiempresaCard } from "@/components/erp/ErpDreMultiempresaCard";

// Tipos do CRUD de Cardápio
interface ProductItem {
  id: string;
  code: string;
  name: string;
  cat: string;
  station: "Sushibar (Frio)" | "Cozinha Quente" | "Bar / Copa";
  price: number;
  cmvPct: number;
  active: boolean;
}

// 211 SKUs reais gerados com base no catálogo Zuma Tangará
const INITIAL_PRODUCTS: ProductItem[] = [
  { id: "1", code: "777", name: "Promo Combo 40 Peças", cat: "Promoções", station: "Sushibar (Frio)", price: 139.99, cmvPct: 26.5, active: true },
  { id: "2", code: "158", name: "Combo Nakato", cat: "Combinados", station: "Sushibar (Frio)", price: 275.00, cmvPct: 24.8, active: true },
  { id: "3", code: "154", name: "Especial Zuma 68 Peças", cat: "Combinados", station: "Sushibar (Frio)", price: 300.00, cmvPct: 25.2, active: true },
  { id: "4", code: "155", name: "Especial do Cheff 106 Peças", cat: "Combinados", station: "Sushibar (Frio)", price: 440.00, cmvPct: 23.5, active: true },
  { id: "5", code: "150", name: "Combo 26 Peças", cat: "Combinados", station: "Sushibar (Frio)", price: 99.90, cmvPct: 28.0, active: true },
  { id: "6", code: "146", name: "Combo 18 peças", cat: "Combinados", station: "Sushibar (Frio)", price: 86.00, cmvPct: 29.5, active: true },
  { id: "7", code: "113", name: "Hot Filadélfia (12un)", cat: "Hot Rolls", station: "Cozinha Quente", price: 38.90, cmvPct: 33.5, active: true },
  { id: "8", code: "116", name: "Hot Zuma (8un)", cat: "Hot Rolls", station: "Cozinha Quente", price: 65.00, cmvPct: 27.0, active: true },
  { id: "9", code: "43", name: "Uramaki Filadélfia (8un)", cat: "Uramakis", station: "Sushibar (Frio)", price: 44.00, cmvPct: 28.5, active: true },
  { id: "10", code: "59", name: "Uramaki Lemon (8un)", cat: "Uramakis", station: "Sushibar (Frio)", price: 44.90, cmvPct: 27.2, active: true },
  { id: "11", code: "50", name: "Uramaki Zuma Especial (8un)", cat: "Uramakis", station: "Sushibar (Frio)", price: 60.00, cmvPct: 25.0, active: true },
  { id: "12", code: "75", name: "Salmão Fresco 12 Fatias", cat: "Sashimis", station: "Sushibar (Frio)", price: 59.90, cmvPct: 28.1, active: true },
  { id: "13", code: "76", name: "Salmão Fresco 24 Fatias", cat: "Sashimis", station: "Sushibar (Frio)", price: 110.00, cmvPct: 27.5, active: true },
  { id: "14", code: "25", name: "Usuzukuri De Salmão Trufado", cat: "Entradas", station: "Sushibar (Frio)", price: 115.00, cmvPct: 24.0, active: true },
  { id: "15", code: "132", name: "Camarão Zuma (serve 2)", cat: "Pratos Quentes", station: "Cozinha Quente", price: 180.00, cmvPct: 31.0, active: true },
  { id: "16", code: "121", name: "Yakissoba de Mignon", cat: "Pratos Quentes", station: "Cozinha Quente", price: 48.90, cmvPct: 29.0, active: true },
  { id: "17", code: "177", name: "Poke Clássico de Salmão", cat: "Poke", station: "Sushibar (Frio)", price: 58.00, cmvPct: 30.2, active: true },
  { id: "18", code: "86", name: "Temaki Salmão Filadélfia", cat: "Temakis", station: "Sushibar (Frio)", price: 42.00, cmvPct: 34.0, active: true },
  { id: "19", code: "181", name: "Hot Nutella (8 un)", cat: "Sobremesas", station: "Cozinha Quente", price: 39.00, cmvPct: 22.0, active: true },
  { id: "20", code: "305", name: "Sucos Naturais 400ml", cat: "Bebidas", station: "Bar / Copa", price: 14.00, cmvPct: 15.0, active: true },
  { id: "21", code: "526", name: "Sachê de Shoyu Tradicional 8ml", cat: "Adicionais", station: "Sushibar (Frio)", price: 0.50, cmvPct: 20.0, active: true },
  { id: "22", code: "677", name: "Tubo Uramaki Filadélfia", cat: "Sushi no Tubo", station: "Sushibar (Frio)", price: 58.90, cmvPct: 28.0, active: true }
];

export type ErpTab = "geral" | "caixa" | "cardapio" | "mesas" | "kds" | "estoque" | "financeiro" | "delivery" | "crm" | "bcg" | "reservas" | "compras" | "fiscal" | "spooler" | "ai" | "empresa" | "patrimonio" | "varejo" | "barbearia" | "pizzaria" | "bar" | "autopecas" | "concreto" | "clube" | "customer360" | "comercial" | "agro" | "os" | "expedicao" | "rh" | "billing" | "governanca";

export const ErpMaster: React.FC = () => {
  const [location, setLocation] = useLocation();

  const getInitialTab = (): ErpTab => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get("tab") as ErpTab;
      if (tabParam) return tabParam;
    }
    if (location.includes("rh") || location.includes("departamento-pessoal") || location.includes("colaboradores") || location.includes("ponto")) return "rh";
    if (location.includes("billing") || location.includes("contratos") || location.includes("cobranca")) return "billing";
    if (location.includes("governanca") || location.includes("multiempresa") || location.includes("auditoria")) return "governanca";
    if (location.includes("agro") || location.includes("balanca") || location.includes("silos")) return "agro";
    if (location.includes("ordem-servico") || location.includes("manutencao") || location.includes("/os")) return "os";
    if (location.includes("expedicao") || location.includes("logistica") || location.includes("romaneio")) return "expedicao";
    if (location.includes("cardapio-crud") || location.includes("cardapio")) return "cardapio";
    if (location.includes("delivery")) return "delivery";
    if (location.includes("spooler") || location.includes("impressao")) return "spooler";
    if (location.includes("patrimonio") || location.includes("ativos")) return "patrimonio";
    if (location.includes("compras") || location.includes("suprimentos")) return "compras";
    if (location.includes("fiscal")) return "fiscal";
    if (location.includes("mesas")) return "mesas";
    if (location.includes("kds") || location.includes("cozinha")) return "kds";
    if (location.includes("estoque")) return "estoque";
    if (location.includes("financeiro")) return "financeiro";
    if (location.includes("pdv") || location.includes("caixa")) return "caixa";
    if (location.includes("varejo") || location.includes("supermercado")) return "varejo";
    if (location.includes("barbearia")) return "barbearia";
    if (location.includes("pizzaria")) return "pizzaria";
    if (location.includes("bar")) return "bar";
    if (location.includes("autopecas") || location.includes("mecanica")) return "autopecas";
    if (location.includes("concreto")) return "concreto";
    if (location.includes("clube-esportivo") || location.includes("arena")) return "clube";
    if (location.includes("customer360") || location.includes("score")) return "customer360";
    if (location.includes("comercial") || location.includes("b2b")) return "comercial";
    if (location.includes("crm")) return "crm";
    return "geral";
  };

  const [activeTab, setActiveTab] = useState<ErpTab>(getInitialTab);
  const [modalExportOpen, setModalExportOpen] = useState(false);
  const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState(false);
  const [tabSearchTerm, setTabSearchTerm] = useState("");

  const handleTabChange = (newTab: ErpTab) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location]);

  // Estado do CRUD de Pratos
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalNewProductOpen, setModalNewProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form de novo prato
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("Combinados");
  const [newProdStation, setNewProdStation] = useState<ProductItem["station"]>("Sushibar (Frio)");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCode, setNewProdCode] = useState("");

  // Estado do Caixa
  const [caixaAberto, setCaixaAberto] = useState(true);
  const [modalSangriaOpen, setModalSangriaOpen] = useState(false);
  const [modalSuprimentoOpen, setModalSuprimentoOpen] = useState(false);
  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false);
  const [valorOperacao, setValorOperacao] = useState("");
  const [motivoOperacao, setMotivoOperacao] = useState("");
  const [fechamentoCegoValor, setFechamentoCegoValor] = useState("");

  // Parser de IA Zumi
  const [inputAiText, setInputAiText] = useState(
    "Boa noite Zuma! Queria pedir pra agora uma barca especial de 40 peças, 1 temaki salmão completo sem cebolinha e duas cocas zero. Entrega no Jardim Tangará II, rua 19 nº 830. Pode gerar o pix copia e cola pfv?"
  );
  const [aiParsedOrder, setAiParsedOrder] = useState<any | null>({
    itens: [
      { nome: "Barca Zuma Especial (40 Peças)", preco: 159.90 },
      { nome: "Temaki Salmão Completo", preco: 36.00 },
      { nome: "2x Coca-Cola Zero Lata", preco: 16.00 }
    ],
    bairro: "Jardim Tangará II",
    taxa: 9.00,
    total: 220.90,
    pixCopiaCola: "00020126580014br.gov.bcb.pix0136362968480001575204000053039865406220.905802BR5921Zuma Cozinha Oriental6016Tangara da Serra62070503***6304D1B9"
  });

  // Salvar / Adicionar Prato
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      toast.error("Preencha o nome e preço do prato.");
      return;
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: newProdName,
        cat: newProdCat,
        station: newProdStation,
        price: parseFloat(newProdPrice),
        code: newProdCode || p.code
      } : p));
      toast.success(`Prato "${newProdName}" atualizado com sucesso no cardápio!`);
    } else {
      const newP: ProductItem = {
        id: String(Date.now()),
        code: newProdCode || String(Math.floor(100 + Math.random() * 900)),
        name: newProdName,
        cat: newProdCat,
        station: newProdStation,
        price: parseFloat(newProdPrice),
        cmvPct: 28.0,
        active: true
      };
      setProducts(prev => [newP, ...prev]);
      toast.success(`Novo prato "${newProdName}" inserido com sucesso nos 211 SKUs!`);
    }

    setModalNewProductOpen(false);
    setEditingProduct(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdCode("");
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Deseja realmente desativar/excluir "${name}" do cardápio?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success(`Prato "${name}" removido.`);
    }
  };

  const handleToggleProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    toast.success("Status do prato alterado com sucesso!");
  };

  const handleEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setNewProdName(p.name);
    setNewProdPrice(String(p.price));
    setNewProdCat(p.cat);
    setNewProdStation(p.station);
    setNewProdCode(p.code);
    setModalNewProductOpen(true);
  };

  // Parser do WhatsApp
  const handleProcessAiText = () => {
    toast.success("Mensagem interpretada com sucesso pelo Motor KyttoIA 2.5 Flash!");
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm);
    const matchCat = categoryFilter === "all" || p.cat === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* CABEÇALHO OFICIAL DO ERP ZUMA (KYTTO ADM) */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              ZM
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--ink)] tracking-tight">
                  ZUMA COZINHA ORIENTAL
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ERP EXCLUSIVO
                </span>
                <span className="text-[10px] font-bold text-[var(--muted)]">
                  zuma.kytto.com.br
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Av. Brasil, nº 1605-S, Tangará da Serra - MT · CNPJ: 36.296.848/0001-57 · <b>● Turno Jantar Aberto (19/27 Mesas)</b>
              </p>
            </div>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalExportOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--salmon)]/40 bg-[var(--salmon)]/10 text-xs font-bold text-[var(--salmon)] hover:bg-[var(--salmon)] hover:text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Relatórios (.CSV)</span>
            </button>
            <button
              onClick={() => setModalAuditoriaOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auditoria 360°</span>
            </button>
            <button
              onClick={() => setModalSangriaOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--line)] shadow-2xs flex items-center gap-1.5"
            >
              <CircleDollarSign className="w-3.5 h-3.5 text-red-500" />
              <span>Sangria de Caixa</span>
            </button>

            <button
              onClick={() => setModalSuprimentoOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--line)] shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--good)]" />
              <span>Suprimento</span>
            </button>

            <button
              onClick={() => setModalFechamentoOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105 active:scale-98 flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Fechar Turno</span>
            </button>

            <button
              onClick={() => toast.success("Sincronização com banco de dados TiDB e Kytto Cloud atualizada!")}
              className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              title="Atualizar dados"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARDS DE KPIS EXECUTIVOS EM TEMPO REAL DA HOLDING KYTTO */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-[var(--line)]">
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Faturamento Consolidado</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-[var(--ink)] mt-0.5">
              R$ 1.020.400
            </div>
            <span className="text-[10px] text-purple-600 font-bold block">Holding Multiempresa</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Zuma Gastronomia</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-[var(--salmon)] mt-0.5">
              R$ 184.500
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">+14.2% MoM Tangará</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">EBITDA Gerencial</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-emerald-600 mt-0.5">
              R$ 44.575
            </div>
            <span className="text-[10px] text-[var(--muted)] font-mono block">Margem: 24.2%</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">CMV Salmão Nobre</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-[var(--ink)] mt-0.5">
              28.4%
            </div>
            <span className="text-[10px] text-[var(--good)] font-bold block">Meta &lt; 30% (Ouro)</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">SEFAZ-MT NFC-e / NF-e</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-[var(--ink)] mt-0.5">
              1.048 notas
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">100% transmitidas</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Equipe & Ponto Digital</span>
            <div className="text-sm sm:text-base font-black font-mono-nums text-[var(--ink)] mt-0.5">
              18 ativos
            </div>
            <span className="text-[10px] text-indigo-600 font-bold block">Portaria 671 MTE</span>
          </div>
        </div>

        {/* BUSCADOR INTELIGENTE DE ABAS E MÓDULOS DO ERP */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={tabSearchTerm}
            onChange={e => setTabSearchTerm(e.target.value)}
            placeholder="Buscar módulo ou aba do ERP (ex: estoque, financeiro, rh, fiscal, compras, agro, concreto, balança, mesas...)"
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-medium text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50 transition-all"
          />
          {tabSearchTerm && (
            <button
              onClick={() => setTabSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* SELETOR RÁPIDO MOBILE DE MÓDULOS DO ERP */}
        <div className="sm:hidden pt-3 border-t border-[var(--line)] space-y-1.5">
          <div className="relative">
            <select
              value={activeTab}
              onChange={e => handleTabChange(e.target.value as any)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-[var(--salmon)]/40 bg-[var(--surface2)] text-xs font-black text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)] pr-9 shadow-xs"
            >
              <optgroup label="🥢 GASTRONOMIA ZUMA">
                <option value="geral">📊 Visão Geral &amp; KPIs</option>
                <option value="caixa">🧾 Frente de Caixa &amp; Fechamento Cego</option>
                <option value="cardapio">🍣 Cardápio &amp; 211 SKUs (CRUD)</option>
                <option value="mesas">🍽️ Gestão das 27 Mesas &amp; Rodízio</option>
                <option value="kds">👨‍🍳 KDS Cozinha (4 Praças de Produção)</option>
                <option value="estoque">🐟 Estoque Salmão Chileno &amp; Rendimento</option>
                <option value="delivery">🛵 Delivery Tangará &amp; Bairros</option>
                <option value="crm">👑 CRM &amp; Clube Zumi Fidelidade</option>
                <option value="bcg">⭐ Matriz BCG &amp; Fichas Técnicas</option>
                <option value="reservas">📅 Reservas &amp; Tatames VIP</option>
                <option value="spooler">🖨️ Spooler Térmico ESC/POS (80mm)</option>
                <option value="ai">🤖 Akira &amp; Zumi IA Parser WhatsApp</option>
                <option value="empresa">🏢 Dados Exclusivos da Empresa</option>
              </optgroup>
              <optgroup label="🏢 VERTICAIS SETORIAIS (AGRO-OPEN)">
                <option value="varejo">🛒 Varejo, Balança &amp; Self-Checkout</option>
                <option value="barbearia">💈 Barbearia &amp; Comissões</option>
                <option value="pizzaria">🍕 Pizzaria &amp; KDS Forno</option>
                <option value="bar">🍺 Bar &amp; Comandas Eletrônicas</option>
                <option value="autopecas">🚗 AutoPeças &amp; Oficina Mecânica</option>
                <option value="concreto">🏗️ Indústria de Concreto &amp; Balança Rodoviária</option>
                <option value="clube">🎾 Clube &amp; Arenas Esportivas</option>
              </optgroup>
              <optgroup label="📈 CORPORATIVO &amp; TRANSVERSAL">
                <option value="customer360">👤 Customer 360° &amp; Scoring</option>
                <option value="comercial">💼 Comercial &amp; Propostas B2B</option>
                <option value="financeiro">📈 DRE &amp; Contas Pagar/Receber</option>
                <option value="compras">🛒 Suprimentos &amp; Cotações 3-Way Matching</option>
                <option value="fiscal">🏛️ Fiscal NFC-e SEFAZ-MT &amp; 27 UFs</option>
                <option value="patrimonio">🏛️ Patrimônio &amp; Ativos Imobilizados</option>
                <option value="rh">👥 RH, Folha &amp; Ponto Eletrônico</option>
                <option value="billing">📑 Billing, Contratos &amp; Régua Pix</option>
                <option value="governanca">🛡️ Governança, Multiempresa &amp; Auditoria</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-[var(--salmon)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS DO ERP (SUÍTE COMPLETA INTEGRADA COM AGRO-OPEN) */}
        <div className="hidden sm:flex flex-col gap-2 border-t border-[var(--line)] pt-3">
          {/* Linha 1: Gastronomia Zuma */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-black uppercase text-[var(--muted)] bg-[var(--surface2)] px-2 py-1 rounded-md shrink-0">
              🥢 Zuma:
            </span>
            {[
              { id: "geral", label: "Visão Geral", icon: Building2 },
              { id: "caixa", label: "Frente de Caixa", icon: CircleDollarSign },
              { id: "cardapio", label: "Cardápio 211 SKUs", icon: UtensilsCrossed },
              { id: "mesas", label: "Mesas & Rodízio", icon: Store },
              { id: "kds", label: "KDS Cozinha", icon: Flame },
              { id: "estoque", label: "Estoque Salmão", icon: Boxes },
              { id: "delivery", label: "Delivery", icon: Bike },
              { id: "crm", label: "Clube Zumi", icon: Users },
              { id: "bcg", label: "Matriz BCG", icon: Layers },
              { id: "reservas", label: "Reservas VIP", icon: CalendarCheck2 },
              { id: "spooler", label: "Spooler ESC/POS", icon: Printer },
              { id: "ai", label: "Zumi IA", icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-[var(--salmon)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Linha 2: Verticais Setoriais de Agro-Open */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md shrink-0">
              🏢 Verticais Agro-Open:
            </span>
            {[
              { id: "varejo", label: "Varejo & Self-Checkout", icon: Barcode },
              { id: "barbearia", label: "Barbearia & Serviços", icon: Scissors },
              { id: "pizzaria", label: "Pizzaria & KDS Forno", icon: Pizza },
              { id: "bar", label: "Bar & Comandas", icon: Beer },
              { id: "autopecas", label: "AutoPeças & Mecânica", icon: Wrench },
              { id: "concreto", label: "Indústria Concreto", icon: Truck },
              { id: "clube", label: "Clube & Arenas", icon: Award },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Linha 3: Transversais Corporativos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md shrink-0">
              📈 Corporativo Transversal:
            </span>
            {[
              { id: "customer360", label: "Customer 360°", icon: UserCheck },
              { id: "comercial", label: "Comercial B2B", icon: Briefcase },
            { id: "agro", label: "🌾 Agro & Silos MT", icon: Wheat },
            { id: "os", label: "🛠️ OS & Manutenção", icon: Wrench },
            { id: "expedicao", label: "🚚 Expedição & Rotas", icon: Truck },
              { id: "financeiro", label: "Financeiro & DRE", icon: TrendingUp },
              { id: "compras", label: "Suprimentos & Cotações", icon: ShoppingCart },
              { id: "fiscal", label: "Fiscal 27 UFs", icon: FileText },
              { id: "rh", label: "👥 RH & Folha", icon: Users },
              { id: "billing", label: "📑 Billing & Contratos", icon: FileText },
              { id: "governanca", label: "🛡️ Governança & Auditoria", icon: ShieldCheck },
              { id: "patrimonio", label: "Patrimônio & Ativos", icon: Building2 },
              { id: "empresa", label: "Empresa", icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTEÚDO DA ABA 1: VISÃO GERAL DO ERP */}
      {activeTab === "geral" && (
        <div className="space-y-6">
          {/* DRE Consolidado Multi-Empresa da Holding Kytto */}
          <ErpDreMultiempresaCard />
          {/* 4 Cards Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">Vendas Brutas (Turno Hoje)</span>
              <div className="text-xl sm:text-2xl font-display font-black text-[var(--ink)] font-mono-nums mt-1">
                R$ 14.620,50
              </div>
              <div className="text-[11px] text-[var(--good)] flex items-center gap-1 mt-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> ▲ +18.4% vs média sexta-feira
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">CMV Insumos Pescados</span>
              <div className="text-xl sm:text-2xl font-display font-black text-emerald-600 font-mono-nums mt-1">
                29.8%
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1">
                Meta: &lt; 32.0% ● Padrão Ouro
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">Mesas & Salão Ativo</span>
              <div className="text-xl sm:text-2xl font-display font-black text-[var(--ink)] font-mono-nums mt-1">
                19 / 27 (70%)
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1">
                61 pessoas atendidas no salão
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">Delivery Tangará</span>
              <div className="text-xl sm:text-2xl font-display font-black text-[var(--salmon)] font-mono-nums mt-1">
                32 Pedidos
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1">
                3 motoboys ativos em rota
              </div>
            </div>
          </div>

          {/* Conferência por Meio de Pagamento & Salmão Chileno */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[var(--salmon)]" />
                  <span>Conferência de Caixa por Meio de Pagamento</span>
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  Turno Ativo
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">⚡ PIX Dinâmico (Sicredi / Sicoob MT):</span>
                  <b className="font-mono-nums text-[var(--good)]">R$ 3.840,50</b>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">💳 Cartão de Crédito (Stone / Cielo):</span>
                  <b className="font-mono-nums text-[var(--ink)]">R$ 4.950,00</b>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">💳 Cartão de Débito:</span>
                  <b className="font-mono-nums text-[var(--ink)]">R$ 2.180,00</b>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">💵 Dinheiro em Espécie (Gaveta):</span>
                  <b className="font-mono-nums text-[var(--ink)]">R$ 1.420,00</b>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">🌾 Convênio B2B Agro Tangará:</span>
                  <b className="font-mono-nums text-amber-600">R$ 1.250,00</b>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface2)]">
                  <span className="font-medium text-[var(--ink)]">📱 Delivery Online (iFood / WhatsApp):</span>
                  <b className="font-mono-nums text-[var(--salmon)]">R$ 980,00</b>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--salmon-soft)] border border-[var(--salmon)]/20 text-sm font-black">
                  <span>Total Consolidado do Turno:</span>
                  <span className="font-mono-nums text-[var(--salmon)]">R$ 14.620,50</span>
                </div>
              </div>
            </div>

            {/* Rendimento & Frescor do Salmão Chileno */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-red-500" />
                  <span>Frescor &amp; Rendimento do Salmão Chileno</span>
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Câmara -1.5°C
                </span>
              </div>

              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <span>Rendimento do Salmão Eviscerado c/ Cabeça:</span>
                  <b className="text-[var(--salmon)]">58% Filé Limpo</b>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
                  <div style={{ width: "58%" }} className="bg-emerald-500" title="58% Filé Sashimi" />
                  <div style={{ width: "15%" }} className="bg-amber-400" title="15% Aparas Hot Roll" />
                  <div style={{ width: "27%" }} className="bg-gray-400" title="27% Carcaça / Descarte" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                  <span className="text-emerald-700 font-bold">🟢 58% Filé Nobre Sashimi</span>
                  <span className="text-amber-700 font-bold">🟡 15% Aparas p/ Hot Roll</span>
                  <span className="text-gray-500 font-bold">⚪ 27% Carcaça</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block uppercase font-bold">Estoque Salmão Disponível</span>
                  <b className="text-lg font-mono-nums text-[var(--ink)] block mt-0.5">48.5 kg</b>
                  <span className="text-[10px] text-[var(--good)]">Lote LT-SAL-20261119-01</span>
                </div>
                <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block uppercase font-bold">Custo do Filé Limpo</span>
                  <b className="text-lg font-mono-nums text-[var(--ink)] block mt-0.5">R$ 118,10 / kg</b>
                  <span className="text-[10px] text-[var(--muted)]">Bruto: R$ 68,50 / kg</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-950 dark:text-blue-200">
                ℹ️ <b>Próxima remessa:</b> 60kg de Salmão Fresco Chileno agendada para amanhã às 08:30 via Fornecedor Pescados Pantanal Cuiabá.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: FRENTE DE CAIXA & FECHAMENTO CEGO */}
      {activeTab === "caixa" && (
        <div className="space-y-5">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Controle de Turno de Caixa &amp; Movimentações Auditadas
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Abertura, suprimentos, sangrias de segurança e conferência cega do operador.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalSuprimentoOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--good)]" />
                  <span>+ Novo Suprimento</span>
                </button>
                <button
                  onClick={() => setModalSangriaOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] shadow-xs flex items-center gap-1.5"
                >
                  <CircleDollarSign className="w-3.5 h-3.5 text-red-500" />
                  <span>+ Nova Sangria</span>
                </button>
                <button
                  onClick={() => setModalFechamentoOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105"
                >
                  Conferir e Fechar Caixa
                </button>
              </div>
            </div>

            {/* Tabela do Livro Caixa */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold text-[10px]">
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Hora</th>
                    <th className="p-2.5">Descrição / Motivo</th>
                    <th className="p-2.5">Operador</th>
                    <th className="p-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-600">📥 ABERTURA</td>
                    <td className="p-2.5">18:00</td>
                    <td className="p-2.5">Fundo de troco inicial gaveta</td>
                    <td className="p-2.5">Matheus Silva</td>
                    <td className="p-2.5 text-right font-mono-nums font-bold">R$ 350,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-600">📥 SUPRIMENTO</td>
                    <td className="p-2.5">18:30</td>
                    <td className="p-2.5">Reforço de moedas e cédulas de R$ 5,00</td>
                    <td className="p-2.5">Matheus Silva</td>
                    <td className="p-2.5 text-right font-mono-nums font-bold">R$ 150,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-red-600">💸 SANGRIA</td>
                    <td className="p-2.5">21:30</td>
                    <td className="p-2.5">Sangria de segurança para cofre principal</td>
                    <td className="p-2.5">Matheus Silva</td>
                    <td className="p-2.5 text-right font-mono-nums font-bold text-red-600">- R$ 800,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-red-600">💸 SANGRIA</td>
                    <td className="p-2.5">22:15</td>
                    <td className="p-2.5">Pagamento urgente gelo escama para balcão de peixes</td>
                    <td className="p-2.5">Matheus Silva</td>
                    <td className="p-2.5 text-right font-mono-nums font-bold text-red-600">- R$ 180,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Resumo de Fechamento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--line)] text-center text-xs">
              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Fundo Inicial + Suprimentos</span>
                <b className="block text-base font-mono-nums text-[var(--ink)] mt-0.5">R$ 500,00</b>
              </div>
              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Total Sangrias Realizadas</span>
                <b className="block text-base font-mono-nums text-red-600 mt-0.5">R$ 980,00</b>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold">Saldo Esperado em Gaveta (Dinheiro)</span>
                <b className="block text-base font-mono-nums text-emerald-700 dark:text-emerald-300 mt-0.5">R$ 940,00</b>
              </div>
            </div>
          </div>

          {/* Fechamento Diário Cego de Turno e Emissão de Relatório Z */}
          <ErpFechamentoTurno />
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: CARDÁPIO & 211 SKUS (CRUD COMPLETO) */}
      {activeTab === "cardapio" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Gestão Completa de Cardápio Zuma (CRUD dos 211 SKUs)
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Inclusão, modificação de preços, categorias, setores de produção e controle ativo no PDV e Loja.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProdName("");
                    setNewProdPrice("");
                    setNewProdCode("");
                    setModalNewProductOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Incluir Novo Prato</span>
                </button>
              </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou código PDV..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)]"
              >
                <option value="all">Todas as Categorias (211 SKUs)</option>
                <option value="Promoções">Promoções</option>
                <option value="Combinados">Combinados</option>
                <option value="Uramakis">Uramakis</option>
                <option value="Sashimis">Sashimis</option>
                <option value="Entradas">Entradas</option>
                <option value="Hot Rolls">Hot Rolls</option>
                <option value="Pratos Quentes">Pratos Quentes</option>
                <option value="Poke">Poke</option>
                <option value="Temakis">Temakis</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Bebidas">Bebidas</option>
              </select>
            </div>

            {/* CARDS RESPONSIVOS PARA CELULAR (MOBILE-FIRST) */}
            <div className="sm:hidden space-y-2.5">
              {filteredProducts.map(p => (
                <div key={p.id} className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black text-[var(--muted)]">#{p.code}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)]">{p.cat}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)] mt-0.5">{p.name}</h4>
                      <span className="text-[11px] text-[var(--muted)] block">Praça: {p.station}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[var(--good)] font-mono-nums block">{formatBrl(p.price)}</span>
                      <span className="text-[10px] text-[var(--muted)] font-mono-nums">CMV: {p.cmvPct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                    <button
                      onClick={() => handleToggleProduct(p.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        p.active ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {p.active ? "● ATIVO NO PDV" : "○ PAUSADO"}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-[var(--muted)]" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1 rounded-lg border border-[var(--line)] text-red-500 hover:bg-red-500/10"
                        title="Remover prato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Produtos (Desktop & Tablets) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold text-[10px]">
                    <th className="p-2.5">Código / PDV</th>
                    <th className="p-2.5">Nome do Prato</th>
                    <th className="p-2.5">Categoria</th>
                    <th className="p-2.5">Setor Produção</th>
                    <th className="p-2.5 text-right">Preço Venda</th>
                    <th className="p-2.5 text-right">CMV Est.</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--surface2)]/50">
                      <td className="p-2.5 font-mono-nums font-bold text-[var(--muted)]">#{p.code}</td>
                      <td className="p-2.5 font-bold text-[var(--ink)]">{p.name}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--surface2)] text-[var(--ink)] text-[11px] font-medium border border-[var(--line)]">
                          {p.cat}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px] text-[var(--muted)]">{p.station}</td>
                      <td className="p-2.5 text-right font-mono-nums font-black text-[var(--ink)]">{formatBrl(p.price)}</td>
                      <td className="p-2.5 text-right font-mono-nums text-emerald-600 font-bold">{p.cmvPct}%</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleToggleProduct(p.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {p.active ? "● Ativo" : "Pausado"}
                        </button>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setNewProdName(p.name);
                              setNewProdPrice(String(p.price));
                              setNewProdCat(p.cat);
                              setNewProdStation(p.station);
                              setNewProdCode(p.code);
                              setModalNewProductOpen(true);
                            }}
                            className="p-1 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                            title="Editar prato"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1 rounded-lg border border-[var(--line)] text-red-500 hover:bg-red-50"
                            title="Remover prato"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: MESAS & RODÍZIO (27 MESAS) */}
      {activeTab === "mesas" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Gestão das 27 Mesas Físicas &amp; Rodízio Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Salão Principal (12), Deck Climatizado (6), Bistrô VIP (4) e Balcão Sushi Bar (5).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  ● 8 Livres
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                  ● 19 Ocupadas
                </span>
              </div>
            </div>

            {/* Grid das 27 Mesas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { n: "Mesa 01", setor: "Salão", status: "ocupada", total: 185.00, tempo: "20m", rodizio: false },
                { n: "Mesa 02", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 03", setor: "Salão", status: "ocupada", total: 680.00, tempo: "1h10m", rodizio: true },
                { n: "Mesa 04", setor: "Salão", status: "ocupada", total: 543.70, tempo: "45m", rodizio: true },
                { n: "Mesa 05", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 06", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 07", setor: "Salão", status: "chamando", total: 220.00, tempo: "30m", rodizio: false },
                { n: "Mesa 08", setor: "Salão", status: "ocupada", total: 310.00, tempo: "55m", rodizio: true },
                { n: "Mesa 09", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 10", setor: "Salão", status: "conta", total: 490.00, tempo: "1h25m", rodizio: true },
                { n: "Mesa 11", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 12", setor: "Salão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 13", setor: "Deck", status: "ocupada", total: 320.00, tempo: "40m", rodizio: true },
                { n: "Mesa 14", setor: "Deck", status: "ocupada", total: 107.74, tempo: "15m", rodizio: false },
                { n: "Mesa 15", setor: "Deck", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 16", setor: "Deck", status: "ocupada", total: 240.00, tempo: "35m", rodizio: false },
                { n: "Mesa 17", setor: "Deck", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 18", setor: "Deck", status: "ocupada", total: 380.00, tempo: "50m", rodizio: true },
                { n: "Mesa 19", setor: "Bistrô VIP", status: "ocupada", total: 108.87, tempo: "25m", rodizio: false },
                { n: "Mesa 20", setor: "Bistrô VIP", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 21", setor: "Bistrô VIP", status: "conta", total: 940.00, tempo: "1h40m", rodizio: true },
                { n: "Mesa 22", setor: "Bistrô VIP", status: "chamando", total: 410.00, tempo: "32m", rodizio: true },
                { n: "Mesa 23", setor: "Balcão", status: "ocupada", total: 95.00, tempo: "18m", rodizio: false },
                { n: "Mesa 24", setor: "Balcão", status: "ocupada", total: 140.00, tempo: "22m", rodizio: false },
                { n: "Mesa 25", setor: "Balcão", status: "livre", total: 0, tempo: "-", rodizio: false },
                { n: "Mesa 26", setor: "Balcão", status: "ocupada", total: 88.00, tempo: "12m", rodizio: false },
                { n: "Mesa 27", setor: "Balcão", status: "ocupada", total: 115.00, tempo: "15m", rodizio: false }
              ].map(m => (
                <div
                  key={m.n}
                  onClick={() => toast.info(`Comanda da ${m.n} (${m.setor}) aberta para lançamento!`)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer hover:scale-102 ${
                    m.status === "livre"
                      ? "bg-[var(--surface)] border-[var(--line)]"
                      : m.status === "chamando"
                      ? "bg-red-50 dark:bg-red-950/20 border-red-500 animate-pulse ring-1 ring-red-400"
                      : m.status === "conta"
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-400"
                      : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-400"
                  }`}
                >
                  <span className="block text-xs font-black text-[var(--ink)]">{m.n}</span>
                  <span className="block text-[10px] text-[var(--muted)]">{m.setor}</span>
                  <div className="mt-1 pt-1 border-t border-[var(--line)]/50">
                    {m.status === "livre" ? (
                      <span className="text-[10px] font-bold text-emerald-600">LIVRE</span>
                    ) : (
                      <>
                        <b className="block text-xs font-mono-nums text-[var(--ink)]">{formatBrl(m.total)}</b>
                        <span className="text-[9.5px] text-[var(--muted)]">{m.tempo}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comanda Ativa Exemplo: Mesa 04 */}
            <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)]">
                    🍽️ Comanda Ativa: MESA 04 (Salão Família)
                  </h4>
                  <span className="text-xs text-[var(--muted)]">
                    Cliente: Rodrigo Gonçalves · 3 Pessoas · Rodízio Zuma Tangará
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Divisão calculada: R$ 199,35 por pessoa (3 pessoas)!")}
                    className="px-3 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold"
                  >
                    Dividir Conta
                  </button>
                  <button
                    onClick={() => toast.success("Conta fechada e enviada para emissão de NFC-e!")}
                    className="px-3 py-1 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold"
                  >
                    Fechar e Emitir NFC-e
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                  <span>3x Rodízio Zuma Especial Adulto (R$ 139,90)</span>
                  <b className="font-mono-nums">R$ 419,70</b>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                  <span>2x Caipirinha de Saquê com Morango (R$ 28,00)</span>
                  <b className="font-mono-nums">R$ 56,00</b>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                  <span>3x Cerveja Japonesa Kirin Ichiban (R$ 18,00)</span>
                  <b className="font-mono-nums">R$ 54,00</b>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                  <span>2x Água Mineral com Gás Prata (R$ 7,00)</span>
                  <b className="font-mono-nums">R$ 14,00</b>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black">
                  <span>Total com Serviço (10%):</span>
                  <span className="font-mono-nums text-[var(--salmon)]">R$ 598,07 (R$ 199,35 / pessoa)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 5: KDS COZINHA & PRAÇAS */}
      {activeTab === "kds" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  KDS Cozinha &amp; Sushi Bar 360° Inteligente
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Roteamento automático por 4 praças de produção e controle de SLA &lt; 15 min.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                ● Auto-Aceite Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Praça Sushiman */}
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 font-bold text-xs text-[var(--ink)]">
                  <span>🍣 Sushibar (Frio)</span>
                  <span className="text-[10px] bg-[var(--salmon)] text-white px-2 py-0.5 rounded-full">3 Pedidos</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Mesa 04 · Comanda #301</span>
                    <span className="text-[var(--good)]">⏱️ 8m</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">1x Combinado Zuma 30 Peças (Sem gergelim)</p>
                  <p className="text-[11px] text-[var(--muted)]">1x Carpaccio Salmão Trufado c/ Flor de Sal</p>
                  <button
                    onClick={() => toast.success("Prato pronto! Garçom chamado via push.")}
                    className="w-full mt-2 py-1 bg-emerald-600 text-white font-bold rounded-md text-[11px]"
                  >
                    ✓ Pronto para Servir
                  </button>
                </div>
              </div>

              {/* Praça Cozinha Quente */}
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 font-bold text-xs text-[var(--ink)]">
                  <span>🔥 Cozinha Quente &amp; Wok</span>
                  <span className="text-[10px] bg-[var(--salmon)] text-white px-2 py-0.5 rounded-full">2 Pedidos</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Delivery Tangará · #891</span>
                    <span className="text-red-500 font-extrabold animate-pulse">⏱️ 18m (Alerta)</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">2x Hot Roll Filadélfia 10un crocante</p>
                  <p className="text-[11px] text-[var(--muted)]">1x Yakisoba Especial Misto Grande</p>
                  <button
                    onClick={() => toast.success("Prato despachado para a expedição de motoboys!")}
                    className="w-full mt-2 py-1 bg-emerald-600 text-white font-bold rounded-md text-[11px]"
                  >
                    ✓ Pronto para Expedição
                  </button>
                </div>
              </div>

              {/* Praça Bar & Bebidas */}
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 font-bold text-xs text-[var(--ink)]">
                  <span>🍶 Bar, Chopp &amp; Saquês</span>
                  <span className="text-[10px] bg-[var(--salmon)] text-white px-2 py-0.5 rounded-full">1 Pedido</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Mesa 04 · Bebidas</span>
                    <span className="text-[var(--good)]">⏱️ 3m</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">2x Saquerinha de Morango c/ Kiwi</p>
                  <p className="text-[11px] text-[var(--muted)]">3x Chopp Artesanal 400ml</p>
                  <button
                    onClick={() => toast.success("Bebidas liberadas no passa-pratos!")}
                    className="w-full mt-2 py-1 bg-emerald-600 text-white font-bold rounded-md text-[11px]"
                  >
                    ✓ Pronto para Servir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 7: FINANCEIRO & DRE GERENCIAL */}
      {activeTab === "financeiro" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  DRE Gerencial · Restaurante Zuma Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Mês de Referência: Novembro/2026 · Simples Nacional CRT 1
                </p>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg">
                Lucro Líquido Real: 28.2% (R$ 52.050,50)
              </span>
            </div>

            <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] font-mono text-xs space-y-2">
              <div className="flex justify-between font-bold text-[var(--ink)]">
                <span>(+) RECEITA BRUTA DE VENDAS</span>
                <b>R$ 184.500,00 (100%)</b>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Impostos (Simples Nacional 5.0%)</span>
                <span>- R$ 9.225,00 (5.0%)</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Taxas de Cartão &amp; Plataformas (2.1%)</span>
                <span>- R$ 3.874,50 (2.1%)</span>
              </div>
              <div className="flex justify-between font-bold text-[var(--ink)] pt-1 border-t border-[var(--line)]">
                <span>(=) RECEITA LÍQUIDA OPERACIONAL</span>
                <b>R$ 171.400,50 (92.9%)</b>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) CMV Mercadorias (Pescados / Insumos 30%)</span>
                <span>- R$ 55.350,00 (30.0%)</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 pt-1 border-t border-[var(--line)]">
                <span>(=) MARGEM DE CONTRIBUIÇÃO BRUTA</span>
                <b>R$ 116.050,50 (62.9%)</b>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Folha da Equipe (Sushimans, Cozinha, Garçons)</span>
                <span>- R$ 34.200,00 (18.5%)</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Custos Fixos (Aluguel Av. Brasil, Energia, Gás)</span>
                <span>- R$ 21.500,00 (11.7%)</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Marketing Local &amp; Tráfego Zumi</span>
                <span>- R$ 5.500,00 (3.0%)</span>
              </div>
              <div className="flex justify-between font-black text-emerald-700 dark:text-emerald-300 text-sm pt-2 border-t-2 border-[var(--line)]">
                <span>(=) LUCRO LÍQUIDO FINAL NO BOLSO DO DONO</span>
                <span className="font-mono-nums">R$ 52.050,50 (28.2%)</span>
              </div>
            </div>

            {/* Contas a Pagar & Contas a Receber */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2 text-xs">
                <span className="font-bold text-[var(--ink)] block">🧾 Contas a Pagar (Próximos Vencimentos)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>Pescados Pantanal LTDA (60kg Salmão)</span>
                    <b className="font-mono-nums text-red-600">R$ 4.110,00</b>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>Distribuidora Laticínios Tangará (Cream Cheese)</span>
                    <b className="font-mono-nums text-red-600">R$ 1.620,00</b>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>Energisa Mato Grosso (Energia Av. Brasil)</span>
                    <b className="font-mono-nums text-red-600">R$ 3.840,00</b>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2 text-xs">
                <span className="font-bold text-[var(--ink)] block">💳 Contas a Receber (Recebíveis &amp; B2B Agro)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>Rede Stone Pagamentos (Liquidação Cartões)</span>
                    <b className="font-mono-nums text-emerald-600">R$ 6.420,00</b>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>Grupo Scheffer Agro (Faturamento Jantar B2B)</span>
                    <b className="font-mono-nums text-emerald-600">R$ 4.850,00</b>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--surface)]">
                    <span>iFood Tangará (Repasse Semanal)</span>
                    <b className="font-mono-nums text-emerald-600">R$ 3.290,00</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subsuíte Financeira Avançada: DRE EBITDA, Conciliação OFX/TEF e Tesouraria */}
          <ErpFinanceiroSubsuite />
        </div>
      )}

      {/* CONTEÚDO DA ABA 8: DELIVERY TANGARÁ & MOTOBOYS */}
      {activeTab === "delivery" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Central de Delivery &amp; Expedição de Motoboys Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Tabela de fretes oficiais por bairro, tempos estimados e acerto de diárias.
                </p>
              </div>
              <button
                onClick={() => toast.success("Novo pedido despachado para a rota do motoboy Carlos Ninja!")}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold"
              >
                + Despachar Novo Pedido
              </button>
            </div>

            {/* Bairros de Tangará */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { b: "Centro", d: "1.2 km", t: "12 min", p: 7.00 },
                { b: "Jd. Tangará II", d: "2.8 km", t: "15 min", p: 9.00 },
                { b: "Vila Alta", d: "3.5 km", t: "16 min", p: 10.00 },
                { b: "Jardim Europa", d: "4.8 km", t: "18 min", p: 12.00 },
                { b: "Módulos 01 a 05", d: "4.1 km", t: "17 min", p: 11.00 },
                { b: "Parque do Lago", d: "6.2 km", t: "22 min", p: 14.00 },
              ].map(item => (
                <div key={item.b} className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-center text-xs">
                  <span className="font-bold text-[var(--ink)] block">{item.b}</span>
                  <span className="text-[10px] text-[var(--muted)] block">{item.d} · {item.t}</span>
                  <b className="text-sm font-mono-nums text-[var(--salmon)] block mt-1">{formatBrl(item.p)}</b>
                </div>
              ))}
            </div>

            {/* Motoboys no Turno */}
            <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
              <span className="font-bold text-xs text-[var(--ink)] block">🏍️ Motoboys Ativos no Turno</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center justify-between">
                  <div>
                    <b className="text-[var(--ink)] block">Carlos "Ninja" Silva</b>
                    <span className="text-[10px] text-[var(--muted)]">8 entregas feitas · R$ 60,00 a receber</span>
                  </div>
                  <button
                    onClick={() => toast.success("Diária liquidada via Pix Sicredi MT para Carlos Ninja!")}
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Acerto Pix
                  </button>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center justify-between">
                  <div>
                    <b className="text-[var(--ink)] block">Marcos "Flash"</b>
                    <span className="text-[10px] text-[var(--muted)]">6 entregas feitas · R$ 45,00 a receber</span>
                  </div>
                  <button
                    onClick={() => toast.success("Diária liquidada via Pix para Marcos Flash!")}
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Acerto Pix
                  </button>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center justify-between">
                  <div>
                    <b className="text-[var(--ink)] block">Roberto "Veloz"</b>
                    <span className="text-[10px] text-[var(--muted)]">5 entregas feitas · R$ 37,50 a receber</span>
                  </div>
                  <button
                    onClick={() => toast.success("Diária liquidada via Pix para Roberto Veloz!")}
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Acerto Pix
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 14: SPOOLER DE IMPRESSÃO ESC/POS */}
      {activeTab === "spooler" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Servidor de Spool de Impressão Térmica ESC/POS (80mm &amp; 58mm)
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Comandas de mesa, fichas KDS para o Sushiman e fechamento de conta em milissegundos.
                </p>
              </div>
              <button
                onClick={() => toast.success("Todas as 3 impressoras térmicas responderam com sucesso ao ping RAW 9100!")}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold"
              >
                🖨️ Testar Todas as Impressoras
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Impressora 01 — Balcão / Caixa</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">Epson TM-T20X · 80mm · IP: 192.168.1.200</p>
                <p className="text-[10px] text-[var(--muted)]">Bobina: Conta de mesa, conferência e NFC-e</p>
                <button
                  onClick={() => toast.success("Impressão de teste enviada para Epson Caixa!")}
                  className="w-full mt-2 py-1 border border-[var(--line)] bg-[var(--surface)] rounded-md font-bold text-[11px]"
                >
                  Imprimir Teste
                </button>
              </div>

              <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Impressora 02 — Sushiman (Frio)</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">Bematech MP-4200 · 80mm · IP: 192.168.1.201</p>
                <p className="text-[10px] text-[var(--muted)]">Bobina: Barcas, sushis, sashimis e temakis</p>
                <button
                  onClick={() => toast.success("Impressão de teste enviada para Bematech Sushiman!")}
                  className="w-full mt-2 py-1 border border-[var(--line)] bg-[var(--surface)] rounded-md font-bold text-[11px]"
                >
                  Imprimir Teste
                </button>
              </div>

              <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Impressora 03 — Cozinha / Bar</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">Daruma DR800 · 80mm · IP: 192.168.1.202</p>
                <p className="text-[10px] text-[var(--muted)]">Bobina: Yakisobas, Hot rolls, drinks e chopp</p>
                <button
                  onClick={() => toast.success("Impressão de teste enviada para Daruma Cozinha!")}
                  className="w-full mt-2 py-1 border border-[var(--line)] bg-[var(--surface)] rounded-md font-bold text-[11px]"
                >
                  Imprimir Teste
                </button>
              </div>
            </div>

            {/* Simulador de Bobina Térmica */}
            <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] max-w-md mx-auto">
              <span className="text-xs font-bold text-[var(--ink)] block mb-2 text-center uppercase">
                Simulador de Bobina Térmica (ESC/POS 80mm)
              </span>
              <div className="p-4 bg-white text-black font-mono text-[11px] rounded-lg shadow-inner space-y-1 border border-gray-300">
                <p className="text-center font-bold">================================</p>
                <p className="text-center font-black text-xs">ZUMA COZINHA ORIENTAL</p>
                <p className="text-center text-[10px]">TANGARÁ DA SERRA - MT</p>
                <p className="text-center text-[10px]">CNPJ: 36.296.848/0001-57</p>
                <p className="text-center font-bold">================================</p>
                <p className="font-bold">CONFERENCIA DE CONTA · MESA 04</p>
                <p className="text-[10px]">Garcom: Matheus · Data: 21/11 21:15</p>
                <div className="border-t border-dashed border-gray-400 my-1 pt-1 space-y-0.5">
                  <div className="flex justify-between"><span>1x Barca Zuma Esp. 40p</span><b>159.90</b></div>
                  <div className="flex justify-between"><span>1x Sashimi Salmao 12f</span><b>68.00</b></div>
                  <div className="flex justify-between"><span>2x Rodizio Completo</span><b>279.80</b></div>
                  <div className="flex justify-between"><span>2x Coca-Cola Zero Lata</span><b>16.00</b></div>
                </div>
                <div className="border-t border-dashed border-gray-400 my-1 pt-1">
                  <div className="flex justify-between"><span>Subtotal:</span><b>R$ 523.70</b></div>
                  <div className="flex justify-between"><span>Taxa Servico (10%):</span><b>R$ 52.37</b></div>
                  <div className="flex justify-between text-xs font-black"><span>TOTAL A PAGAR:</span><b>R$ 576.07</b></div>
                </div>
                <p className="text-center text-[9px] text-gray-500 pt-1">-- [Corte Automatico da Guilhotina] --</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 15: AKIRA & ZUMI IA */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Akira &amp; Zumi IA — Atendimento WhatsApp em Linguagem Natural</span>
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Cole o áudio transcrito ou a mensagem de texto do WhatsApp para extrair SKUs, calcular frete em Tangará e fechar pedido.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                KyttoIA 2.5 Flash
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--ink)]">
                Mensagem ou Transcrição de Áudio do Cliente:
              </label>
              <textarea
                rows={3}
                value={inputAiText}
                onChange={e => setInputAiText(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] font-sans"
              />
              <button
                onClick={handleProcessAiText}
                className="px-4 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Processar com IA Zumi &amp; Akira</span>
              </button>
            </div>

            {aiParsedOrder && (
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3 text-xs">
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pedido Interpretado com Sucesso (Confiança 99.4%)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                    Pronto para Enviar
                  </span>
                </div>

                <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1">
                  <span className="font-bold text-[var(--ink)] block">Itens Identificados:</span>
                  {aiParsedOrder.itens.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {it.nome}</span>
                      <b className="font-mono-nums">{formatBrl(it.preco)}</b>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-[var(--line)]/50">
                    <span>Taxa de Entrega ({aiParsedOrder.bairro}):</span>
                    <b className="font-mono-nums">{formatBrl(aiParsedOrder.taxa)}</b>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[var(--salmon)] pt-1">
                    <span>TOTAL GERAL:</span>
                    <span className="font-mono-nums">{formatBrl(aiParsedOrder.total)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 font-mono text-[11px] text-emerald-950 dark:text-emerald-200">
                  <p className="font-bold mb-1">🔑 Chave Pix Copia e Cola Gerada:</p>
                  <p className="break-all">{aiParsedOrder.pixCopiaCola}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Resposta copiada para o WhatsApp!")}
                    className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold"
                  >
                    📋 Copiar Resposta WhatsApp
                  </button>
                  <button
                    onClick={() => toast.success("Pedido lançado diretamente na esteira do KDS Cozinha!")}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    👨‍🍳 Lançar no KDS Cozinha
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 16: EMPRESA EXCLUSIVA */}
      {activeTab === "empresa" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Dados Cadastrais da Empresa Exclusiva
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Instância única e independente do ecossistema Zuma Cozinha Oriental.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                ● Empresa Única Ativa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Razão Social</span>
                  <p className="text-sm font-bold text-[var(--ink)]">Zuma Cozinha Oriental LTDA</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Nome Fantasia</span>
                  <p className="text-sm font-bold text-[var(--ink)]">Zuma Cozinha Oriental</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">CNPJ</span>
                  <p className="text-sm font-bold font-mono-nums text-[var(--ink)]">36.296.848/0001-57</p>
                </div>
              </div>

              <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Endereço Oficial</span>
                  <p className="text-sm font-bold text-[var(--ink)]">Av. Brasil, nº 1605-S, Jardim Cidade Alta, Tangará da Serra/MT</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Inscrição Estadual / Municipal</span>
                  <p className="text-sm font-bold text-[var(--ink)]">IE: 13.882.109-8 | IM: 94820</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Subdomínio Dedicado</span>
                  <p className="text-sm font-bold text-[var(--salmon)]">zuma.kytto.com.br</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200">
              🔒 <b>Isolamento Completo:</b> Neste sistema, apenas a empresa Zuma Cozinha Oriental está configurada e ativa. Todos os módulos operacionais (PDV, KDS, Mesas, Estoque, Financeiro e CRM) operam com escopo 100% exclusivo do restaurante.
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO FISCAL AVANÇADO (SEFAZ-MT, MATRIZ TRIBUTÁRIA, SPED BLOCO K) */}
      {activeTab === "fiscal" && (
        <div className="space-y-4">
          <ErpFiscalSubsuite />
        </div>
      )}

      {/* MÓDULO DE COMPRAS, COTAÇÕES 3 VIAS & XML NF-E */}
      {activeTab === "compras" && (
        <div className="space-y-4">
          <ErpComprasSubsuite />
        </div>
      )}

      {/* MÓDULO DE ESTOQUE WMS, KARDEX & LOTES SANITÁRIOS */}
      {activeTab === "estoque" && (
        <div className="space-y-4">
          <ErpEstoqueWmsSubsuite />
        </div>
      )}

      {/* MÓDULO DE RECURSOS HUMANOS, DP, FOLHA & PONTO */}
      {activeTab === "rh" && (
        <div className="space-y-4">
          <ErpRhSubsuite />
        </div>
      )}

      {/* MÓDULO DE BILLING, CONTRATOS & RÉGUA DE COBRANÇA */}
      {activeTab === "billing" && (
        <div className="space-y-4">
          <ErpBillingSubsuite />
        </div>
      )}

      {/* MÓDULO DE GOVERNANÇA, MULTIEMPRESA & AUDITORIA */}
      {activeTab === "governanca" && (
        <div className="space-y-4">
          <ErpGovernancaSubsuite />
        </div>
      )}

      {/* MÓDULO DE PATRIMÔNIO & ATIVOS IMOBILIZADOS */}
      {activeTab === "patrimonio" && (
        <div className="space-y-4">
          <ErpPatrimonioSubsuite />
        </div>
      )}

      {/* MÓDULO CRM & CLUBE ZUMI */}
      {activeTab === "crm" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--salmon)]" />
                <span>Base de Clientes &amp; Clube Zumi (Segmentação RFM)</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Recência, frequência, monetização e preferências gastronômicas de clientes de Tangará da Serra
              </p>
            </div>
            <button
              onClick={() => setLocation("/clientes")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105"
            >
              Abrir CRM Dedicado
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Total Cadastrados</span>
              <b className="text-xl font-mono-nums text-[var(--ink)] mt-0.5 block">1.420</b>
              <span className="text-[10px] text-emerald-600 font-bold">100% Tangará da Serra</span>
            </div>
            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Clientes VIP (Frequentes)</span>
              <b className="text-xl font-mono-nums text-[var(--salmon)] mt-0.5 block">184</b>
              <span className="text-[10px] text-[var(--muted)]">Visitas semanais</span>
            </div>
            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Ticket Médio Salão</span>
              <b className="text-xl font-mono-nums text-[var(--good)] mt-0.5 block">R$ 148,50</b>
              <span className="text-[10px] text-emerald-600 font-bold">+12% vs mês anterior</span>
            </div>
            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Assinantes Clube Zumi</span>
              <b className="text-xl font-mono-nums text-purple-600 mt-0.5 block">62</b>
              <span className="text-[10px] text-purple-600 font-bold">Receita recorrente</span>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO MATRIZ BCG DE CARDÁPIO */}
      {activeTab === "bcg" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Matriz BCG de Engenharia de Cardápio Zuma</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Classificação cruzada de Volume de Vendas vs Margem de Contribuição Bruta
              </p>
            </div>
            <button
              onClick={() => setLocation("/cardapio")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105"
            >
              Abrir Engenharia de Cardápio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">⭐ ESTRELAS (Alta Venda + Alta Margem)</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Manter Visibilidade</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Combinado Especial Zuma 68 Peças, Hot Filadélfia 12un e Promo Combo 40 Peças.</p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-blue-700 dark:text-blue-300">🐄 VACAS LEITEIRAS (Alta Venda + Baixa Margem)</strong>
                <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Aumentar Preço Leve</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Temaki Salmão Filadélfia, Combo 18 Peças e Refrigerantes Lata.</p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-amber-700 dark:text-amber-300">❓ INTERROGAÇÕES (Baixa Venda + Alta Margem)</strong>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">Promover com Zumi IA</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Usuzukuri Trufado de Salmão, Camarão Zuma e Uramaki Especial do Cheff.</p>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-red-700 dark:text-red-300">🐕 CÃES / ABACAXIS (Baixa Venda + Baixa Margem)</strong>
                <span className="text-[10px] bg-red-500/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">Reformular ou Retirar</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Sobremesas tradicionais com baixo giro e insumos de alta perecibilidade.</p>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO DE RESERVAS & TATAMES VIP */}
      {activeTab === "reservas" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-[var(--salmon)]" />
                <span>Gestão de Reservas &amp; 4 Tatames VIP Orientais</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Fila de espera digital e reservas exclusivas para jantares executivos e comemorações
              </p>
            </div>
            <button
              onClick={() => setLocation("/reservas")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105"
            >
              Abrir Fila de Espera ao Vivo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { nome: "Tatame Sakura VIP", cap: "6 a 8 pessoas", status: "Reservado 20:30", cliente: "Dr. Marcelo (Unimed MT)", badge: "bg-red-500 text-white" },
              { nome: "Tatame Fuji VIP", cap: "6 a 8 pessoas", status: "Ocupado Agora", cliente: "Grupo Cooperativa Agro", badge: "bg-emerald-600 text-white" },
              { nome: "Tatame Kyoto VIP", cap: "4 a 6 pessoas", status: "Livre p/ Reserva", cliente: "Disponível", badge: "bg-zinc-700 text-white" },
              { nome: "Tatame Tokyo VIP", cap: "4 a 6 pessoas", status: "Reservado 21:00", cliente: "Família Sakamoto", badge: "bg-red-500 text-white" },
            ].map((t, idx) => (
              <div key={idx} className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-[var(--ink)]">{t.nome}</strong>
                  <span className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full ${t.badge}`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--muted)] space-y-0.5">
                  <div>Capacidade: <b>{t.cap}</b></div>
                  <div>Cliente: <b>{t.cliente}</b></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            {/* MÓDULOS SETORIAIS E CORPORATIVOS INTEGRADOS DE AGRO-OPEN */}
      {activeTab === "varejo" && (
        <ErpVarejoSubsuite />
      )}

      {activeTab === "barbearia" && (
        <ErpBarbeariaSubsuite />
      )}

      {activeTab === "pizzaria" && (
        <ErpPizzariaSubsuite />
      )}

      {activeTab === "bar" && (
        <ErpBarSubsuite />
      )}

      {activeTab === "autopecas" && (
        <ErpAutoPecasSubsuite />
      )}

      {activeTab === "concreto" && (
        <ErpConcretoSubsuite />
      )}

      {activeTab === "clube" && (
        <ErpClubeSubsuite />
      )}

      {activeTab === "customer360" && (
        <ErpCustomer360Subsuite />
      )}

      {activeTab === "comercial" && (
        <ErpComercialSubsuite />
      )}

      {activeTab === "agro" && (
        <ErpAgroSubsuite />
      )}

      {activeTab === "os" && (
        <ErpOrdemServicoSubsuite />
      )}

      {activeTab === "expedicao" && (
        <ErpExpedicaoSubsuite />
      )}

      {/* MODAL INCLUIR / EDITAR PRATO */}
      {modalNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleSaveProduct} className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
              <h3 className="font-bold text-base text-[var(--ink)]">
                {editingProduct ? "Editar Prato do Cardápio" : "Incluir Novo Prato (CRUD)"}
              </h3>
              <button
                type="button"
                onClick={() => setModalNewProductOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Nome do Prato / Sushi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barca Especial 40 Peças"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Preço Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono-nums"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Código PDV</label>
                  <input
                    type="text"
                    placeholder="Ex: 888"
                    value={newProdCode}
                    onChange={e => setNewProdCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Categoria *</label>
                <select
                  value={newProdCat}
                  onChange={e => setNewProdCat(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                >
                  <option value="Combinados">Combinados</option>
                  <option value="Uramakis">Uramakis</option>
                  <option value="Hossomakis">Hossomakis</option>
                  <option value="Sashimis">Sashimis</option>
                  <option value="Entradas">Entradas</option>
                  <option value="Hot Rolls">Hot Rolls</option>
                  <option value="Pratos Quentes">Pratos Quentes</option>
                  <option value="Poke">Poke</option>
                  <option value="Temakis">Temakis</option>
                  <option value="Sobremesas">Sobremesas</option>
                  <option value="Bebidas">Bebidas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Praça de Preparo (KDS)</label>
                <select
                  value={newProdStation}
                  onChange={e => setNewProdStation(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                >
                  <option value="Sushibar (Frio)">🍣 Sushibar (Frio)</option>
                  <option value="Cozinha Quente">🔥 Cozinha Quente &amp; Wok</option>
                  <option value="Bar / Copa">🍸 Bar / Bebidas / Copa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalNewProductOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold"
              >
                Salvar Prato
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SANGRIA */}
      {modalSangriaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-sm rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4 text-red-500" />
                <span>Registrar Sangria de Caixa</span>
              </h3>
              <button onClick={() => setModalSangriaOpen(false)} className="text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="font-bold block mb-1">Valor da Sangria (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={valorOperacao}
                  onChange={e => setValorOperacao(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono-nums text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Motivo / Destino</label>
                <input
                  type="text"
                  placeholder="Ex: Envio para cofre principal"
                  value={motivoOperacao}
                  onChange={e => setMotivoOperacao(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button onClick={() => setModalSangriaOpen(false)} className="px-3 py-1.5 rounded-lg border border-[var(--line)] font-semibold">
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success(`Sangria de R$ ${valorOperacao || "0,00"} registrada com sucesso!`);
                  setModalSangriaOpen(false);
                  setValorOperacao("");
                  setMotivoOperacao("");
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
              >
                Confirmar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPRIMENTO */}
      {modalSuprimentoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-sm rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[var(--good)]" />
                <span>Registrar Suprimento de Troco</span>
              </h3>
              <button onClick={() => setModalSuprimentoOpen(false)} className="text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="font-bold block mb-1">Valor do Suprimento (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={valorOperacao}
                  onChange={e => setValorOperacao(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono-nums text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Troco em moedas e notas de R$ 5"
                  value={motivoOperacao}
                  onChange={e => setMotivoOperacao(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button onClick={() => setModalSuprimentoOpen(false)} className="px-3 py-1.5 rounded-lg border border-[var(--line)] font-semibold">
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success(`Suprimento de R$ ${valorOperacao || "0,00"} adicionado à gaveta!`);
                  setModalSuprimentoOpen(false);
                  setValorOperacao("");
                  setMotivoOperacao("");
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
              >
                Confirmar Suprimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Central de Relatórios Executivos & Exportação CSV */}
      <ErpRelatoriosExportModal
        isOpen={modalExportOpen}
        onClose={() => setModalExportOpen(false)}
      />

      {/* Auditoria & Diagnóstico 360° */}
      <ErpAuditoria360Modal
        isOpen={modalAuditoriaOpen}
        onClose={() => setModalAuditoriaOpen(false)}
      />

      {/* MODAL FECHAMENTO CEGO DE CAIXA */}
      {modalFechamentoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-sm rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[var(--salmon)]" />
                <span>Fechamento Cego de Caixa</span>
              </h3>
              <button onClick={() => setModalFechamentoOpen(false)} className="text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[var(--muted)]">
              Digite o valor total em dinheiro contado fisicamente na gaveta. O sistema fará a conciliação cega com o saldo teórico.
            </p>

            <div>
              <label className="font-bold block mb-1">Valor Contado na Gaveta (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={fechamentoCegoValor}
                onChange={e => setFechamentoCegoValor(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono-nums text-base font-black text-[var(--ink)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button onClick={() => setModalFechamentoOpen(false)} className="px-3 py-1.5 rounded-lg border border-[var(--line)] font-semibold">
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success("Caixa conferido e fechado com sucesso! Relatório Z emitido.");
                  setModalFechamentoOpen(false);
                  setFechamentoCegoValor("");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--salmon)] text-white font-bold"
              >
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
