import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation, Link } from "wouter";
import { 
  Flame, 
  Building2,
  Users,
  Share2, 
  Calculator, 
  Search, 
  Zap, 
  Store, 
  Bell, 
  Clock,
  Sparkles,
  Command,
  Crown,
  Smartphone,
  UtensilsCrossed,
  LogOut,
  X,
  Camera,
  Eye,
  LayoutGrid,
  ChevronDown,
  ChefHat,
  CloudSun
} from "lucide-react";
import { toast } from "sonner";
import { ZumiMascot } from "./ZumiMascot";
import { useAuth } from "../../contexts/AuthContext";
import { SimuladorPedidoModal } from "../modals/SimuladorPedidoModal";
import { HeaderNotificationCenter } from "./HeaderNotificationCenter";
import { ZumiCopilotAssistant } from "./ZumiCopilotAssistant";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [simuladorModalOpen, setSimuladorModalOpen] = useState(false);

  // Estado de fixação da Sidebar (por padrão falso = auto-recolhe e abre no hover)
  const [sidebarPinned, setSidebarPinned] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zuma_sidebar_pinned");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const handleTogglePin = () => {
    setSidebarPinned((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zuma_sidebar_pinned", String(next));
        } catch {}
      }
      return next;
    });
  };

  // Submenu de Módulos & Operações (substitui os 8 botões em fila horizontal)
  const [modulesMenuOpen, setModulesMenuOpen] = useState(false);
  const modulesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(e.target as Node)) {
        setModulesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setModulesMenuOpen(false);
  }, [location]);

  // Atalho de teclado Ctrl+K / Cmd+K para busca rápida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setModulesMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const QUICK_LINKS = [
    { title: "🤖 IA e Mercado War Room (Ações Concorrentes)", path: "/mercado", category: "Estratégia" },
    { title: "🌧️ Dr. Clima Tangará da Serra (Telemetria)", path: "/dr-clima", category: "Estratégia" },
    { title: "🔥 Mapa de Calor Analítico (7x11)", path: "/mapa-de-calor", category: "Vendas" },
    { title: "📊 Previsão de Compras 360° & BOM", path: "/previsao-compras", category: "Estratégia" },
    { title: "🔌 Módulo de Integrações & APIs (TI)", path: "/integracoes", category: "TI" },
    { title: "👥 Nossa Gente (RH 360° & Ponto Facial Ultra AI)", path: "/nossa-gente", category: "RH" },
    { title: "💼 Central ERP Zuma 360° (Kytto ADM)", path: "/erp", category: "ERP" },
    { title: "🧾 Frente de Caixa & PDV Touch", path: "/pdv", category: "ERP" },
    { title: "🍽️ Mapa de Mesas & Rodízio (27 Mesas)", path: "/mesas", category: "ERP" },
    { title: "👨‍🍳 KDS Cozinha & Praças de Produção", path: "/cozinha", category: "ERP" },
    { title: "🐟 Estoque Salmão Chileno Nobre", path: "/estoque", category: "ERP" },
    { title: "📈 Financeiro, DRE Gerencial & Contas", path: "/financeiro", category: "ERP" },
    { title: "🛵 Delivery Tangará & Roteirização", path: "/delivery", category: "ERP" },
    { title: "🍣 Gestão de Cardápio (CRUD 211 SKUs)", path: "/cardapio-crud", category: "ERP" },
    { title: "💬 WhatsApp Zumi com IA", path: "/zumi", category: "Atendimento" },
    { title: "⚡ Cockpit do Atendente Ao Vivo", path: "/atendimento", category: "Atendimento" },
    { title: "🛍️ Loja Delivery Próprio com Apple Pay", path: "/loja", category: "Vendas" },
    { title: "👑 Cockpit do Dono & Comparativos D-7", path: "/cockpit", category: "Gestão" },
    { title: "📲 Central de Apps & PWA", path: "/apps", category: "Apps" },
    { title: "🔗 Hub Open APIs & Consulta CNPJ", path: "/conexoes", category: "Conexões" },
  ];

  const filteredLinks = QUICK_LINKS.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col lg:flex-row antialiased">
      {/* Espaçador Desktop: reserva largura base para evitar jitter ao passar o mouse */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          sidebarPinned ? "w-[280px]" : "w-[68px]"
        }`}
      />

      {/* Sidebar com auto-fechamento e hover-expand */}
      <Sidebar
        isPinned={sidebarPinned}
        onTogglePin={handleTogglePin}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra Superior Global (Header) - Limpo, Executivo e Sem Poluição Visual */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-[var(--surface)] border-b border-[var(--line)] sticky top-0 z-30 shadow-2xs">
          {/* Status do Restaurante em Tangará da Serra */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Turno Jantar Aberto · 19/27 Mesas Ativas</span>
            </div>
            <span className="text-xs text-[var(--muted)] font-medium">
              Tangará da Serra (MT) · CNPJ: 36.296.848/0001-57
            </span>
          </div>

          {/* Atalhos e Submenu Estruturado */}
          <div className="flex items-center gap-3">
            {/* Botão de Busca Rápida (Command Palette) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--salmon)] transition-all shadow-2xs cursor-pointer"
              title="Buscar módulos (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="font-medium">Buscar módulo...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[10px] font-mono text-[var(--muted)]">
                ⌘K
              </kbd>
            </button>

            {/* ==================== SUBMENU EXECUTIVO DE MÓDULOS (ORGANIZADO) ==================== */}
            <div className="relative" ref={modulesMenuRef}>
              <button
                type="button"
                onClick={() => setModulesMenuOpen(!modulesMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shadow-2xs cursor-pointer group ${
                  modulesMenuOpen
                    ? "bg-[var(--salmon)] text-white border-[var(--salmon)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)]"
                }`}
                title="Abrir submenu completo com todos os módulos operacionais e de inteligência"
              >
                <LayoutGrid className={`w-3.5 h-3.5 transition-transform group-hover:rotate-12 ${
                  modulesMenuOpen ? "text-white" : "text-[var(--salmon)]"
                }`} />
                <span>Módulos &amp; Operações</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  modulesMenuOpen
                    ? "bg-white/20 text-white"
                    : "bg-[var(--salmon)]/10 text-[var(--salmon)] border border-[var(--salmon)]/20"
                }`}>
                  8
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  modulesMenuOpen ? "rotate-180 text-white" : "text-[var(--muted)]"
                }`} />
              </button>

              {/* Painel do Submenu (Dropdown em 3 Colunas Estruturadas) */}
              {modulesMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[720px] rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  {/* Topo do Submenu */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[var(--salmon)]/15 border border-[var(--salmon)]/25 flex items-center justify-center text-[var(--salmon)] shadow-2xs">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--ink)] uppercase tracking-wider flex items-center gap-2">
                          Módulos &amp; Operações Holding Zuma
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                            Holding Integrada
                          </span>
                        </h4>
                        <p className="text-[10px] text-[var(--muted)] font-medium">
                          Acesso centralizado aos subsistemas de atendimento, IA e retaguarda
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setModulesMenuOpen(false)}
                      className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grid das 3 Colunas dos Itens do Header */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Coluna 1: Frente & Salão */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3 h-3 text-[var(--salmon)]" />
                        <span>Frente &amp; Salão</span>
                      </div>
                      
                      {/* PDV Caixa Touch */}
                      <Link
                        href="/pdv"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)]/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Calculator className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-[var(--salmon)] transition-colors">
                            PDV Caixa Touch
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Frente de Caixa, NFC-e e EAN-13
                          </span>
                        </div>
                      </Link>

                      {/* Mesas Salão (27) */}
                      <Link
                        href="/mesas"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-amber-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-amber-600 transition-colors">
                              Mesas Salão
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-amber-500/15 text-amber-700">
                              27
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Mapa interativo, rodízio e comandas
                          </span>
                        </div>
                      </Link>

                      {/* KDS Cozinha */}
                      <Link
                        href="/cozinha"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-orange-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <ChefHat className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-orange-600 transition-colors">
                            KDS Cozinha
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            4 praças de produção e tempo de prato
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Coluna 2: Inteligência & IA */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Inteligência &amp; IA</span>
                      </div>

                      {/* IA & Mercado War Room */}
                      <Link
                        href="/mercado"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-purple-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-purple-600 transition-colors">
                            IA &amp; Mercado
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            War Room, rivais e gap iFood
                          </span>
                        </div>
                      </Link>

                      {/* Câmeras Ultra Vision (6) */}
                      <Link
                        href="/cameras"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-cyan-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-cyan-600 transition-colors">
                              Câmeras Ultra
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-cyan-500/15 text-cyan-700">
                              6
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            CFTV com visão computacional de mesas
                          </span>
                        </div>
                      </Link>

                      {/* Mapa de Calor */}
                      <Link
                        href="/mapa-de-calor"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-red-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Flame className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-red-600 transition-colors">
                            Mapa de Calor
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Taxa de giro 7x11 e horários de pico
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Coluna 3: Gestão & Retaguarda */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-indigo-500" />
                        <span>Gestão &amp; Retaguarda</span>
                      </div>

                      {/* ERP 360° */}
                      <Link
                        href="/erp"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-purple-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-purple-600 transition-colors">
                            ERP 360°
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Kytto ADM, financeiro e DRE gerencial
                          </span>
                        </div>
                      </Link>

                      {/* Integrações (8) */}
                      <Link
                        href="/integracoes"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-emerald-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Share2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-emerald-600 transition-colors">
                              Integrações
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-500/15 text-emerald-700">
                              8
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            APIs, Stone TEF, SEFAZ-MT e iFood
                          </span>
                        </div>
                      </Link>

                      {/* Nossa Gente (8) */}
                      <Link
                        href="/nossa-gente"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-indigo-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-indigo-600 transition-colors">
                              Nossa Gente
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-indigo-500/15 text-indigo-700">
                              8
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            RH 360°, escala e ponto facial Ultra AI
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Rodapé Executivo do Submenu */}
                  <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <Link
                        href="/cockpit"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--salmon)] font-bold transition-colors no-underline text-[11px]"
                      >
                        <Crown className="w-3.5 h-3.5 text-[var(--salmon)]" />
                        <span>Cockpit do Dono</span>
                      </Link>
                      <Link
                        href="/apps"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] font-bold transition-colors no-underline text-[11px]"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Central de Apps</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        setModulesMenuOpen(false);
                        setSimuladorModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] hover:bg-[var(--salmon)] hover:text-white border border-[var(--salmon)]/25 font-bold transition-all text-[11px] cursor-pointer shadow-2xs"
                    >
                      <Zap className="w-3 h-3" />
                      <span>+ Simular Pedido Serendipidade</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Ação Rápida: Simular Pedido (Direto no Header) */}
            <button
              onClick={() => setSimuladorModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer"
              title="Disparar simulador de pedidos e testes"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+ Simular Pedido</span>
            </button>

            {/* Central de Notificações em Tempo Real */}
            <HeaderNotificationCenter />

            {/* Perfil Rodrigo & Logout */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff6b4a] to-orange-400 text-white font-black flex items-center justify-center text-xs shadow-2xs">
                  RG
                </div>
                <div className="hidden xl:block text-left">
                  <span className="block text-xs font-black text-[var(--ink)] leading-tight">
                    {user?.name || "Rodrigo Gonçalves"}
                  </span>
                  <span className="block text-[9.5px] text-[var(--salmon)] font-bold leading-tight">
                    {user?.cargo || "Proprietário & ADM"}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm("Deseja desconectar do Zuma Pilot?")) {
                    await logout();
                  }
                }}
                className="p-1.5 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Sair do sistema (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA (MOBILE NATIVE FEEL) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-xl px-2 py-1.5 flex items-center justify-around safe-area-bottom">
          <Link
            href="/cockpit"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/" || location === "/cockpit"
                ? "text-[var(--salmon)] font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Crown className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Cockpit</span>
          </Link>

          <Link
            href="/pdv"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/pdv" || location === "/mesas"
                ? "text-[var(--salmon)] font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calculator className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">PDV Caixa</span>
          </Link>

          <Link
            href="/cameras"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/cameras" || location === "/ultra-vision"
                ? "text-cyan-600 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Camera className="w-5 h-5 mb-0.5 text-cyan-600" />
            <span className="text-[10px] tracking-tight">Câmeras AI</span>
          </Link>
          <Link
            href="/cozinha"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              location === "/cozinha" || location === "/kds"
                ? "text-orange-600 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <ChefHat className="w-5 h-5 mb-0.5 text-orange-600" />
            <span className="text-[10px] tracking-tight">Cozinha KDS</span>
          </Link>

          <Link
            href="/erp"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/erp" || location === "/financeiro"
                ? "text-purple-600 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5 text-purple-600" />
            <span className="text-[10px] tracking-tight">ERP 360°</span>
          </Link>
        </nav>
      </div>

      {/* Modal Command Palette (Ctrl+K) */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--line)]">
              <Search className="w-5 h-5 text-[var(--muted)] mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar por módulo, funcionalidade ou tela executiva..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
              />
              <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredLinks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  Nenhum módulo encontrado para "{searchQuery}"
                </div>
              ) : (
                filteredLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.path}
                    onClick={() => setCommandPaletteOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface2)] text-xs text-[var(--ink)] group transition-colors no-underline"
                  >
                    <span className="font-medium group-hover:text-[var(--salmon)] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] font-bold">
                      {item.category}
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Use as setas para navegar ou Esc para fechar</span>
              <span className="font-mono text-[10px]">ESC para sair</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulador de Pedido */}
      <SimuladorPedidoModal 
        isOpen={simuladorModalOpen} 
        onClose={() => setSimuladorModalOpen(false)} 
      />

      {/* Assistente Zumi Copilot IA Flutuante */}
      <ZumiCopilotAssistant />
    </div>
  );
};
