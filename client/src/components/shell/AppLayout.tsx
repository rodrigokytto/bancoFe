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
import {
  Landmark,
  TrendingUp,
  Scale,
  ShieldCheck,
  CreditCard,
  FileText,
  FileCheck2,
  PieChart,
  Home
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

  // Estado de fixação da Sidebar (por padrão true = sempre visível e aberta)
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
    { title: "⚖️ Mesa de Crédito & SCR Bacen", path: "/admin/mesa-credito", category: "Crédito" },
    { title: "📈 CRM de Operações & Funil (31 Ops)", path: "/admin/crm-financeira?aba=funil", category: "Crédito" },
    { title: "🏡 Esteira Pré-Cadastros Casa Nova (20 Proponentes)", path: "/admin/crm-financeira?aba=precadastros", category: "Crédito" },
    { title: "🔍 Consulta 360° CPF/CNPJ & Bureaus", path: "/consulta-360", category: "Compliance" },
    { title: "📜 Central de Termos SCR & LGPD", path: "/admin/termos", category: "Compliance" },
    { title: "🏦 BancoFé Hub Geral & Core Bancário", path: "/bancofe", category: "BaaS" },
    { title: "💳 Carteira Digital & BaaS Pix", path: "/plataforma/carteira", category: "BaaS" },
    { title: "🧮 Simulador de Financiamento SAC / PRICE", path: "/admin/crm-financeira?aba=simulador", category: "Crédito" },
    { title: "🏢 Gestão de Módulos da Holding", path: "/admin", category: "Governança" },
    { title: "📊 Fechamento & Contabilidade COSIF", path: "/admin/fechamento", category: "Governança" },
    { title: "🛍️ E-Commerce & Omnichannel Holding", path: "/admin/ecommerce", category: "Holding" },
    { title: "💼 Backoffice Corporativo Holding", path: "/admin/backoffice", category: "Governança" },
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
          {/* Status Institucional BancoFé Holding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mesa de Crédito &amp; SCR Bacen Operacional · Conectado PRD</span>
            </div>
            <span className="text-xs text-[var(--muted)] font-medium">
              BancoFé Holding S/A · CNPJ: 53.338.003/0001-04 · Polo MT
            </span>
          </div>

          {/* Atalhos e Submenu Estruturado */}
          <div className="flex items-center gap-3">
            {/* Botão de Busca Rápida (Command Palette) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--salmon)] transition-all shadow-2xs cursor-pointer"
              title="Buscar módulos BancoFé (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="font-medium">Buscar módulos...</span>
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
                title="Abrir submenu corporativo BancoFé Holding"
              >
                <LayoutGrid className={`w-3.5 h-3.5 transition-transform group-hover:rotate-12 ${
                  modulesMenuOpen ? "text-white" : "text-[var(--salmon)]"
                }`} />
                <span>Módulos BancoFé</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  modulesMenuOpen
                    ? "bg-white/20 text-white"
                    : "bg-[var(--salmon)]/10 text-[var(--salmon)] border border-[var(--salmon)]/20"
                }`}>
                  12
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
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--ink)] uppercase tracking-wider flex items-center gap-2">
                          Módulos &amp; Operações BancoFé Holding
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                            Holding Integrada
                          </span>
                        </h4>
                        <p className="text-[10px] text-[var(--muted)] font-medium">
                          Acesso centralizado à Mesa de Crédito, CRM 360°, Bureaus Bacen e BaaS
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
                    {/* Coluna 1: Crédito & Mesa de Operações */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <Scale className="w-3 h-3 text-[var(--salmon)]" />
                        <span>Mesa &amp; Operações</span>
                      </div>
                      
                      {/* Mesa de Crédito & SCR Bacen */}
                      <Link
                        href="/admin/mesa-credito"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)]/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-[var(--salmon)] transition-colors">
                            Mesa de Crédito
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Comitê, Pareceres &amp; SCR Bacen
                          </span>
                        </div>
                      </Link>

                      {/* CRM Financeira (Funil) */}
                      <Link
                        href="/admin/crm-financeira?aba=funil"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-amber-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-amber-600 transition-colors">
                              Funil de Operações
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-amber-500/15 text-amber-700">
                              31 Ops
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            R$ 29,43M em 6 colunas ativas
                          </span>
                        </div>
                      </Link>

                      {/* Esteira Casa Nova */}
                      <Link
                        href="/admin/crm-financeira?aba=precadastros"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-emerald-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Home className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-emerald-600 transition-colors">
                            Casa Nova Imóveis
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            20 Proponentes com LTV &amp; LGPD
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Coluna 2: Compliance, Bureaus & Bacen */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-purple-500" />
                        <span>Compliance &amp; Bacen</span>
                      </div>

                      {/* Consulta 360° CPF/CNPJ */}
                      <Link
                        href="/consulta-360"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-purple-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-purple-600 transition-colors">
                            Consulta 360° Bureaus
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            48+ bureaus federais e estaduais
                          </span>
                        </div>
                      </Link>

                      {/* Central de Termos SCR & LGPD */}
                      <Link
                        href="/admin/termos"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-cyan-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <FileCheck2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-cyan-600 transition-colors">
                              Termos SCR &amp; LGPD
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-cyan-500/15 text-cyan-700">
                              Conforme
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Assinatura digital e custódia segura
                          </span>
                        </div>
                      </Link>

                      {/* Simulador SAC / PRICE */}
                      <Link
                        href="/admin/crm-financeira?aba=simulador"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-emerald-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <PieChart className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-emerald-600 transition-colors">
                            Simulador de Crédito
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Tabelas SAC vs PRICE &amp; CET Real
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Coluna 3: Holding, BaaS & Governança */}
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 rounded-md bg-[var(--surface2)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <Landmark className="w-3 h-3 text-indigo-500" />
                        <span>Holding &amp; BaaS Core</span>
                      </div>

                      {/* BancoFé Core Bancário */}
                      <Link
                        href="/bancofe"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-indigo-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Landmark className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-indigo-600 transition-colors">
                            BancoFé Core
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            BaaS, Pix 24/7 &amp; Liquidação
                          </span>
                        </div>
                      </Link>

                      {/* Carteira Digital & BaaS */}
                      <Link
                        href="/plataforma/carteira"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-emerald-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--ink)] block group-hover:text-emerald-600 transition-colors">
                              Carteira Digital
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-500/15 text-emerald-700">
                              Pix
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Saldos, limites e extrato Bacen
                          </span>
                        </div>
                      </Link>

                      {/* Gestão da Holding /admin */}
                      <Link
                        href="/admin"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-[var(--line)] hover:border-emerald-500/40 hover:bg-[var(--surface2)] transition-all no-underline group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[var(--ink)] block group-hover:text-emerald-600 transition-colors">
                            Gestão da Holding
                          </span>
                          <span className="text-[10px] text-[var(--muted)] leading-tight block">
                            Módulos das 12 coligadas &amp; métricas
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Rodapé Executivo do Submenu */}
                  <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <Link
                        href="/admin/backoffice"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--salmon)] font-bold transition-colors no-underline text-[11px]"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[var(--salmon)]" />
                        <span>Backoffice Holding</span>
                      </Link>
                      <Link
                        href="/admin/termos"
                        onClick={() => setModulesMenuOpen(false)}
                        className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] font-bold transition-colors no-underline text-[11px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Central de Termos &amp; SCR</span>
                      </Link>
                    </div>

                    <Link
                      href="/admin/crm-financeira?aba=funil"
                      onClick={() => setModulesMenuOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--salmon)] text-white hover:brightness-110 font-bold transition-all text-[11px] cursor-pointer shadow-2xs no-underline"
                    >
                      <Zap className="w-3 h-3" />
                      <span>+ Nova Operação de Crédito</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Ação Rápida: Nova Operação no Funil (Direto no Header) */}
            <Link
              href="/admin/crm-financeira?aba=funil"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer no-underline"
              title="Nova Operação no Funil de Crédito"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+ Nova Operação</span>
            </Link>

            {/* Central de Notificações em Tempo Real */}
            <HeaderNotificationCenter />

            {/* Perfil Rodrigo Ribeiro Gonçalves & Logout */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-2xs">
                  RG
                </div>
                <div className="hidden xl:block text-left">
                  <span className="block text-xs font-black text-[var(--ink)] leading-tight">
                    {user?.name || "Rodrigo Ribeiro Gonçalves"}
                  </span>
                  <span className="block text-[9.5px] text-[var(--salmon)] font-bold leading-tight">
                    {user?.cargo || "CEO & Diretoria Executiva BancoFé"}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm("Deseja desconectar do BancoFé Holding?")) {
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

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA (MOBILE BANCOFÉ) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-xl px-2 py-1.5 flex items-center justify-around safe-area-bottom">
          <Link
            href="/admin/mesa-credito"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/admin/mesa-credito"
                ? "text-[var(--salmon)] font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Scale className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Mesa Crédito</span>
          </Link>

          <Link
            href="/admin/crm-financeira?aba=funil"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location.includes("/admin/crm-financeira") && location.includes("funil")
                ? "text-[var(--salmon)] font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">CRM Funil</span>
          </Link>

          <Link
            href="/admin/crm-financeira?aba=precadastros"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location.includes("precadastros")
                ? "text-emerald-600 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5 text-emerald-600" />
            <span className="text-[10px] tracking-tight">Casa Nova</span>
          </Link>

          <Link
            href="/consulta-360"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/consulta-360"
                ? "text-purple-600 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Search className="w-5 h-5 mb-0.5 text-purple-600" />
            <span className="text-[10px] tracking-tight">Bureaus 360</span>
          </Link>

          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              location === "/admin"
                ? "text-emerald-700 font-black"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5 text-emerald-700" />
            <span className="text-[10px] tracking-tight">Holding</span>
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
