import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Sun,
  Moon,
  LogOut,
  Menu as MenuIcon,
  Sparkles,
  Sliders,
  RotateCcw,
  History,
  Check,
  Pin,
  PinOff,
  Calculator,
  UtensilsCrossed,
  ChefHat,
  Crown,
  Building2,
  Users,
  Share2,
  Store,
  Layers,
  Bike,
  CreditCard,
  MessageSquare,
  Compass,
  Maximize2,
  Minimize2,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBusiness } from "../../contexts/BusinessContext";
import { DynamicIcon } from "../DynamicIcon";
import * as Icons from "lucide-react";
import { ZumiMascot } from "./ZumiMascot";
import { SimuladorSerendipidadeModal } from "./SimuladorSerendipidadeModal";
import {
  MODULES,
  MENU_DOMAINS,
  SECTIONS,
  DEFAULT_MODULE,
  STORAGE_KEY_MODULE,
  getActiveHierarchy,
  normalizeNavPath,
  getSafetyNetUnmappedItems,
  NavModule,
  NavDomain,
  NavSection,
  NavItem,
} from "../../navigation.config";

export interface DicaSerendipidade {
  id: string;
  titulo: string;
  tag: string;
  texto: string;
  rota: string;
  acao: string;
  simuladorType: "clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv";
}

export const DICAS_SERENDIPIDADE: DicaSerendipidade[] = [
  {
    id: "clima",
    titulo: "Previsão Meteorológica & Delivery",
    tag: "METEOROLOGIA & DELIVERY",
    texto: "Previsão de pancadas de chuva em Tangará da Serra: ative o 'Plano Chuva de Vendas' para focar em combos quentes e reforçar entregadores.",
    rota: "/dr-clima",
    acao: "Abrir Dr. Clima",
    simuladorType: "clima",
  },
  {
    id: "gap",
    titulo: "Atraso no Concorrente",
    tag: "Gap Competitivo",
    texto: "Bonsai tem 68 min de espera no delivery às sextas: dispare contra-ataque para o Jardim Europa com entrega garantida em 35 min.",
    rota: "/mercado",
    acao: "Ver no War Room",
    simuladorType: "gap",
  },
  {
    id: "salmao",
    titulo: "Cotação do Salmão Nobre",
    tag: "Insumos & Dólar",
    texto: "Dólar estável mantém custo CIF do Salmão Nobre Fresco a R$ 80,60/kg entregue em Tangará da Serra via rota Puerto Montt.",
    rota: "/mercado",
    acao: "Conferir Câmbio",
    simuladorType: "salmao",
  },
  {
    id: "ifood",
    titulo: "Desintermediação iFood",
    tag: "Margem Líquida",
    texto: "70% das vendas rivais estão presas no iFood: use 10% de cashback no Zuma PWA e economize até 27% de taxas de marketplace.",
    rota: "/mercado",
    acao: "Plano de Ataque",
    simuladorType: "ifood",
  },
  {
    id: "tatames",
    titulo: "Ocupação dos Tatames",
    tag: "Ociosidade Salão",
    texto: "Identificado buraco de ocupação na terça-feira às 19h: ative reserva nos Tatames VIP com brinde autoral do Chef.",
    rota: "/mapa-de-calor",
    acao: "Ver Mapa de Calor",
    simuladorType: "tatames",
  },
  {
    id: "cftv",
    titulo: "CFTV & Ultra Vision",
    tag: "Visão Computacional",
    texto: "CAM-01 identificou mesa com gesto de mão levantada há 48s: acione ronda preventiva de garçons no Salão Nobre.",
    rota: "/ultra",
    acao: "Abrir Ultra Vision",
    simuladorType: "cftv",
  },
];

const STORAGE_KEY_RECENTS = "zuma_recent_routes_v1";

export interface SidebarProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isPinned = true,
  onTogglePin,
}) => {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { activeBusiness, businesses, setActiveBusinessId, activeModules } = useBusiness();
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const businessDropdownRef = useRef<HTMLDivElement>(null);

  // Módulos dinâmicos da empresa ativa
  const effectiveModules: NavModule[] = useMemo(() => {
    if (activeModules && activeModules.length > 0) {
      return activeModules.map((m) => {
        const IconComp = (Icons as Record<string, any>)[m.iconName] || Icons.Boxes;
        return {
          id: m.id,
          label: m.label,
          icon: IconComp,
          badge: m.badge,
          badgeColor: m.badgeColor,
          defaultPath: m.defaultPath,
          description: m.description,
          domains: m.domains || [],
          permission: m.permission,
        };
      });
    }
    return MODULES;
  }, [activeModules]);

  // Estados de navegação e filtros
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuFilter, setMenuFilter] = useState("");
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtro de exibição de módulos: "all" (Todos os 39 itens da Holding) ou ID do módulo específico
  const [activeTabFilter, setActiveTabFilter] = useState<string>("all");

  // O menu expande quando estiver fixado (pinned) OU com o mouse em cima (hovered)
  const isExpanded = isPinned || isHovered;

  // Serendipidade IA
  const [serendipidadeIndex, setSerendipidadeIndex] = useState(0);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [criterioInicial, setCriterioInicial] = useState<"clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv">("clima");
  const dicaAtual = DICAS_SERENDIPIDADE[serendipidadeIndex];

  const proximaDica = () => {
    setSerendipidadeIndex((prev) => (prev + 1) % DICAS_SERENDIPIDADE.length);
  };

  // Histórico de recentes
  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_RECENTS) || localStorage.getItem(STORAGE_KEY_RECENTS);
      return saved ? JSON.parse(saved) : ["/cockpit", "/pdv", "/apps"];
    } catch {
      return ["/cockpit", "/pdv", "/apps"];
    }
  });

  // Grava rota atual nos recentes
  useEffect(() => {
    if (!location || location === "/login") return;
    setRecentPaths((prev) => {
      const clean = location === "/" ? "/cockpit" : location;
      const filtered = prev.filter((p) => p !== clean);
      const next = [clean, ...filtered].slice(0, 4);
      try {
        sessionStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(next));
      } catch (e) {
        console.warn("Falha ao salvar recentes", e);
      }
      return next;
    });
  }, [location]);

  // Derivação automática do módulo ativo a partir da rota atual
  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    try {
      const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
      const hierarchy = getActiveHierarchy(currentUrl);
      if (hierarchy.activeModule) {
        return hierarchy.activeModule.id;
      }
      const saved = localStorage.getItem(STORAGE_KEY_MODULE);
      if (saved && MODULES.some((m) => m.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn("Falha ao ler módulo salvo:", e);
    }
    return DEFAULT_MODULE;
  });

  // Atualiza módulo quando a rota mudar no roteador
  useEffect(() => {
    const currentUrl = location + (typeof window !== "undefined" ? window.location.search : "");
    const hierarchy = getActiveHierarchy(currentUrl);
    if (hierarchy.activeModule && hierarchy.activeModule.id !== activeModuleId) {
      setActiveModuleId(hierarchy.activeModule.id);
      try {
        localStorage.setItem(STORAGE_KEY_MODULE, hierarchy.activeModule.id);
      } catch (e) {
        console.warn("Falha ao persistir módulo ativo:", e);
      }
    }
  }, [location]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModuleDropdownOpen(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setBusinessDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Módulo ativo resolvido
  const activeModule = useMemo(() => {
    return effectiveModules.find((m) => m.id === activeModuleId) || effectiveModules[0] || MODULES[0];
  }, [effectiveModules, activeModuleId]);

  // Ação de troca manual de módulo via dropdown ou abas rápidas
  const handleSelectModule = (modId: string) => {
    if (modId === "all") {
      setActiveTabFilter("all");
      setModuleDropdownOpen(false);
      return;
    }
    const mod = effectiveModules.find((m) => m.id === modId) || MODULES.find((m) => m.id === modId);
    if (mod) {
      setActiveModuleId(mod.id);
      setActiveTabFilter(mod.id);
      setModuleDropdownOpen(false);
      try {
        localStorage.setItem(STORAGE_KEY_MODULE, mod.id);
      } catch (e) {
        console.warn("Falha ao persistir módulo ativo:", e);
      }
    }
  };

  // Estado de colapso dos domínios (grupos recolhíveis na sidebar)
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({});

  const toggleDomain = (domainId: string) => {
    setCollapsedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const isSearching = menuFilter.trim().length > 0;

  // Filtragem de permissões e busca: Exibe os domínios do filtro selecionado ou todos (360°)
  const visibleDomains = useMemo(() => {
    const userRole = user?.role || "admin";
    const q = menuFilter.trim().toLowerCase();

    // Se estiver buscando ou a aba for "all", mostra todos os domínios
    let targetDomains = MENU_DOMAINS;
    if (!isSearching && activeTabFilter !== "all") {
      const selectedMod = effectiveModules.find((m) => m.id === activeTabFilter) || MODULES.find((m) => m.id === activeTabFilter);
      if (selectedMod) {
        targetDomains = MENU_DOMAINS.filter((dom) => selectedMod.domains.includes(dom.id));
      }
    }

    return targetDomains
      .map((dom) => {
        if (dom.permission && dom.permission !== "all" && dom.permission !== userRole) {
          return null;
        }

        const sectionsInDomain: NavSection[] = dom.sections
          .map((secId) => SECTIONS[secId])
          .filter(Boolean)
          .map((sec) => {
            let items = sec.items.filter((it) => {
              if (it.permission && it.permission !== "all" && it.permission !== userRole) {
                return false;
              }
              return true;
            });

            if (isSearching) {
              items = items.filter(
                (it) =>
                  it.label.toLowerCase().includes(q) ||
                  it.path.toLowerCase().includes(q) ||
                  (it.badge && it.badge.toLowerCase().includes(q))
              );
            }

            return {
              ...sec,
              items,
            };
          })
          .filter((sec) => sec.items.length > 0);

        if (sectionsInDomain.length === 0) return null;

        return {
          ...dom,
          label: dom.label || (dom as any).title || "Domínio Operacional",
          sectionsData: sectionsInDomain,
          totalItems: sectionsInDomain.reduce((acc, s) => acc + s.items.length, 0),
        };
      })
      .filter(Boolean) as (NavDomain & { label: string; sectionsData: NavSection[]; totalItems: number })[];
  }, [activeTabFilter, menuFilter, isSearching, user?.role]);

  // Total de itens folha visíveis
  const totalVisibleItemsCount = useMemo(() => {
    return visibleDomains.reduce((acc, dom) => acc + dom.totalItems, 0);
  }, [visibleDomains]);

  // Rede de segurança: rotas não mapeadas
  const safetyNetItems = useMemo(() => {
    const systemPaths = [
      "/pdv", "/garcom", "/mesa", "/pagamentos", "/cozinha", "/kds-v2", "/telemetria",
      "/entregador", "/operacao", "/loja", "/barca", "/zumi", "/atendimento", "/clientes",
      "/recuperacao", "/clube", "/campanhas", "/leads", "/reputacao", "/agro", "/cockpit",
      "/proprietario", "/mapa-de-calor", "/mercado", "/dr-clima", "/ultra", "/previsao-compras",
      "/cardapio", "/horarios", "/capacidade", "/reservas", "/erp", "/suprimentos", "/estoque",
      "/financeiro", "/fiscal", "/fechamento-contabil", "/patrimonio", "/integracoes", "/conexoes",
      "/apps", "/moda", "/nossa-gente"
    ];
    return getSafetyNetUnmappedItems(systemPaths);
  }, []);

  const currentNormalizedPath = normalizeNavPath(location);

  return (
    <>
      {/* ==================== BARRA MOBILE TOP ==================== */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--surface)] text-[var(--ink)] border-b border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ZumiMascot size={28} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-black text-sm tracking-tight text-[var(--ink)]">
                zuma<span className="text-[var(--salmon)] font-light">pilot</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold block leading-none">
              Módulo: {activeModule.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-colors border border-[var(--line)] cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR PRINCIPAL COMPLETA E REAL ==================== */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setModuleDropdownOpen(false);
        }}
        className={`fixed top-0 left-0 z-50 h-screen bg-[var(--surface)] text-[var(--ink)] border-r border-[var(--line)] flex flex-col select-none transition-all duration-300 ease-in-out ${
          mobileOpen
            ? "translate-x-0 w-[280px] shadow-2xl"
            : isExpanded
            ? "translate-x-0 w-[280px] shadow-2xl"
            : "-translate-x-full lg:translate-x-0 lg:w-[68px] lg:shadow-none"
        }`}
      >
        {/* ==================== VISTA COMPACTA RECOLHIDA (68px) ==================== */}
        {!isExpanded && !mobileOpen && (
          <div className="hidden lg:flex flex-col h-full w-[68px] items-center py-3 px-1.5 justify-between overflow-hidden">
            {/* Topo do Mini-Rail: Logo e Botão de Expandir */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              <Link
                href="/cockpit"
                className="w-11 h-11 rounded-xl bg-[var(--salmon)]/10 border border-[var(--salmon)]/25 flex items-center justify-center p-1 shadow-2xs hover:scale-105 transition-transform"
                title="Zuma Pilot - Painel Executivo"
              >
                <ZumiMascot size={28} />
              </Link>

              {/* Botão para Reabrir / Expandir Menu Completo */}
              {onTogglePin && (
                <button
                  type="button"
                  onClick={onTogglePin}
                  className="w-10 h-8 rounded-lg bg-[var(--surface2)] hover:bg-[var(--salmon)]/15 hover:text-[var(--salmon)] text-[var(--muted)] border border-[var(--line)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Expandir Menu Lateral Completo (Fixar Aberto)"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Módulo Ativo */}
              <div
                className="w-10 h-10 rounded-xl bg-[var(--salmon)]/15 text-[var(--salmon)] border border-[var(--salmon)]/30 flex items-center justify-center shadow-2xs cursor-pointer group"
                title={`Módulo Ativo: ${activeModule.label} (Passe o mouse para abrir)`}
                onClick={() => setIsHovered(true)}
              >
                <activeModule.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            {/* Centro: Todos os Atalhos Rápidos Operacionais Reais */}
            <div className="flex flex-col items-center gap-1.5 w-full my-auto overflow-y-auto no-scrollbar py-2">
              {/* Cockpit */}
              <Link
                href="/cockpit"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/cockpit" || location === "/"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black ring-2 ring-[var(--salmon)]/30"
                    : "text-[var(--muted)] hover:text-[var(--salmon)] hover:bg-[var(--salmon)]/10"
                }`}
                title="👑 Cockpit Executivo & D-7"
              >
                <Crown className="w-5 h-5" />
              </Link>

              {/* PDV Touch */}
              <Link
                href="/pdv"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/pdv"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black ring-2 ring-[var(--salmon)]/30"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
                title="🧾 Frente de Caixa Touch & NFC-e (Gastronomia & Moda)"
              >
                <Calculator className="w-5 h-5" />
              </Link>

              {/* Mesas Salão */}
              <Link
                href="/mesas"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/mesas"
                    ? "bg-amber-500 text-white shadow-xs font-black ring-2 ring-amber-500/30"
                    : "text-[var(--muted)] hover:text-amber-600 hover:bg-amber-500/10"
                }`}
                title="🍽️ Mesas & Salão (27 Mesas)"
              >
                <UtensilsCrossed className="w-5 h-5" />
              </Link>

              {/* KDS Cozinha */}
              <Link
                href="/cozinha"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/cozinha"
                    ? "bg-orange-500 text-white shadow-xs font-black ring-2 ring-orange-500/30"
                    : "text-[var(--muted)] hover:text-orange-600 hover:bg-orange-500/10"
                }`}
                title="👨‍🍳 KDS Cozinha (4 Praças de Preparo)"
              >
                <ChefHat className="w-5 h-5" />
              </Link>

              {/* Delivery Tangará */}
              <Link
                href="/delivery"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/delivery" || location === "/entregador"
                    ? "bg-blue-600 text-white shadow-xs font-black ring-2 ring-blue-600/30"
                    : "text-[var(--muted)] hover:text-blue-600 hover:bg-blue-500/10"
                }`}
                title="🛵 Delivery & Motoboys Tangará"
              >
                <Bike className="w-5 h-5" />
              </Link>

              {/* WhatsApp IA Zumi */}
              <Link
                href="/zumi"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/zumi"
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-emerald-600 hover:bg-emerald-500/10"
                }`}
                title="💬 WhatsApp com IA Zumi"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* IA & Mercado War Room */}
              <Link
                href="/mercado"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/mercado"
                    ? "bg-purple-600 text-white shadow-xs font-black ring-2 ring-purple-600/30"
                    : "text-[var(--muted)] hover:text-purple-600 hover:bg-purple-500/10"
                }`}
                title="🤖 IA & Mercado War Room Tangará"
              >
                <Sparkles className="w-5 h-5" />
              </Link>

              {/* Central ERP */}
              <Link
                href="/erp"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/erp"
                    ? "bg-purple-700 text-white shadow-xs font-black ring-2 ring-purple-700/30"
                    : "text-[var(--muted)] hover:text-purple-700 hover:bg-purple-500/10"
                }`}
                title="💼 Central ERP Zuma 360°"
              >
                <Building2 className="w-5 h-5" />
              </Link>

              {/* Nossa Gente RH */}
              <Link
                href="/nossa-gente"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/nossa-gente"
                    ? "bg-indigo-600 text-white shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-indigo-600 hover:bg-indigo-500/10"
                }`}
                title="👥 Nossa Gente (RH 360° & Ponto Facial AI)"
              >
                <Users className="w-5 h-5" />
              </Link>

              {/* Integrações */}
              <Link
                href="/integracoes"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  location === "/integracoes"
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-emerald-600 hover:bg-emerald-500/10"
                }`}
                title="🔌 Central de Integrações & APIs"
              >
                <Share2 className="w-5 h-5" />
              </Link>
            </div>

            {/* Rodapé do Mini-Rail */}
            <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-[var(--line)]">
              {onTogglePin && (
                <button
                  type="button"
                  onClick={onTogglePin}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--salmon)] hover:bg-[var(--surface2)] transition-colors cursor-pointer"
                  title="Menu recolhido. Clique para fixar aberto (280px)."
                >
                  <Pin className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors cursor-pointer"
                title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <div
                className="w-8 h-8 rounded-full border border-[var(--line)] bg-gradient-to-tr from-[#ff6b4a] to-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs"
                title={`Usuário: ${user?.name || "Rodrigo Ribeiro Gonçalves"}`}
              >
                RG
              </div>
            </div>
          </div>
        )}

        {/* ==================== VISTA COMPLETA EXPANDIDA (280px) ==================== */}
        {(isExpanded || mobileOpen) && (
          <div className="flex flex-col h-full w-[280px] overflow-hidden">
            {/* CABEÇALHO & SELETOR DE MÓDULO */}
            <div className="p-3.5 pb-2.5 border-b border-[var(--line)] shrink-0 space-y-2.5 bg-[var(--surface)]">
              {/* Linha da Marca + Status + Pin + Tema */}
              <div className="flex items-center justify-between">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 no-underline group"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform text-blue-600">
                    <Icons.Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-sans font-black text-base tracking-tight text-[var(--ink)] block leading-none">
                      banco<span className="text-blue-600 font-normal ml-0.5">Fe</span>
                    </span>
                    <span className="text-[9px] text-[var(--muted)] tracking-wider uppercase font-bold block mt-0.5">
                      ERP &amp; Multi-Negócio
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  {/* Botão de Fixação / Desfixação com Status Claro */}
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={onTogglePin}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isPinned
                          ? "bg-[var(--salmon)]/15 text-[var(--salmon)] font-bold border border-[var(--salmon)]/30"
                          : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                      }`}
                      title={
                        isPinned
                          ? "Menu fixado aberto (280px). Clique para recolher."
                          : "Menu flutuante. Clique para fixar aberto permanentemente."
                      }
                    >
                      {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors cursor-pointer"
                    title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  </button>
                  {mobileOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="lg:hidden p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* SELETOR DE EMPRESA / NEGÓCIO ATIVO */}
              <div className="relative" ref={businessDropdownRef}>
                <button
                  type="button"
                  onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                  className="w-full text-left p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between transition-colors cursor-pointer group"
                  title="Clique para alternar o Negócio Ativo"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <DynamicIcon name={activeBusiness.iconName} className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[8px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block leading-tight">
                        NEGÓCIO SELECIONADO
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block leading-tight mt-0.5">
                        {activeBusiness.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600/10 text-blue-600 border border-blue-600/20">
                      {activeBusiness.badge}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${businessDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {businessDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shadow-2xl space-y-1">
                    <div className="px-2 py-1 text-[9px] uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                      <span>Unidades de Negócio</span>
                      <span className="text-blue-600 font-bold">{businesses.length} Negócios</span>
                    </div>
                    {businesses.map((biz) => {
                      const isSel = biz.id === activeBusiness.id;
                      return (
                        <button
                          key={biz.id}
                          type="button"
                          onClick={() => {
                            setActiveBusinessId(biz.id);
                            setBusinessDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${isSel ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold border-l-2 border-blue-600" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <DynamicIcon name={biz.iconName} className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className="truncate min-w-0">
                              <span className="text-xs font-semibold block truncate leading-tight">{biz.name}</span>
                              <span className="text-[9px] text-slate-400 truncate block">{biz.unidade || biz.cidade}</span>
                            </div>
                          </div>
                          {isSel && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}

                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href="/admin"
                        onClick={() => {
                          setBusinessDropdownOpen(false);
                          setMobileOpen(false);
                        }}
                        className="w-full p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                      >
                        <Icons.Sliders className="w-3.5 h-3.5" />
                        <span>Gerenciar Módulos no /admin</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* SELETOR EXECUTIVO DE MÓDULO (DROPDOWN) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setModuleDropdownOpen(!moduleDropdownOpen)}
                  className="w-full text-left p-2 rounded-xl bg-[var(--surface2)]/60 hover:bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
                  title="Clique para alternar entre os Módulos da Holding Zuma"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--salmon)]/15 text-[var(--salmon)] border border-[var(--salmon)]/25 flex items-center justify-center shrink-0">
                      <activeModule.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[8.5px] uppercase font-bold tracking-wider text-[var(--muted)] block leading-tight">
                        MÓDULO ATIVO
                      </span>
                      <span className="text-xs font-black text-[var(--ink)] truncate block leading-tight mt-0.5">
                        {activeModule.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeModule.badge && (
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md border ${activeModule.badgeColor || "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)]"}`}>
                        {activeModule.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--ink)] transition-transform duration-150 ${
                        moduleDropdownOpen ? "rotate-180 text-[var(--ink)]" : ""
                      }`}
                    />
                  </div>
                </button>

                {moduleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-1.5 shadow-xl space-y-1">
                    <div className="px-2 py-1 text-[9px] uppercase font-extrabold tracking-wider text-[var(--muted)] border-b border-[var(--line)] mb-1 flex items-center justify-between">
                      <span>Selecione a Área de Negócio</span>
                      <span className="text-[8.5px] text-[var(--salmon)] font-bold">5 Módulos</span>
                    </div>

                    {effectiveModules.map((mod) => {
                      const isSelected = mod.id === activeModule.id;
                      const ModIcon = mod.icon;

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => {
                            handleSelectModule(mod.id);
                            setLocation(mod.defaultPath);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[var(--salmon)]/10 text-[var(--salmon)] font-bold border-l-2 border-[var(--salmon)]"
                              : "text-[var(--ink)]/80 hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-[var(--salmon)] text-white"
                                  : "bg-[var(--surface2)] text-[var(--muted)]"
                              }`}
                            >
                              <ModIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate min-w-0">
                              <span className="text-xs font-bold block truncate leading-tight">
                                {mod.label}
                              </span>
                              <span className="text-[9.5px] text-[var(--muted)] truncate block leading-tight mt-0.5">
                                {mod.description}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[var(--salmon)] shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BARRA DE ABAS RÁPIDAS DOS 5 MÓDULOS + VISÃO 360° COMPLETA */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("all")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "all"
                      ? "bg-[var(--salmon)] text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]"
                  }`}
                  title="Exibir todas as 39 telas reais da Holding Zuma"
                >
                  🌐 Todos (39)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("operacao")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "operacao"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-amber-600"
                  }`}
                  title="Operação de Mesas, KDS e Delivery"
                >
                  🍽️ Salão
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("comando")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "comando"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-purple-600"
                  }`}
                  title="Cockpits, War Room e Modelagem IA"
                >
                  👑 Comando
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("erp_kytto")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "erp_kytto"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-indigo-600"
                  }`}
                  title="ERP, Finanças, Estoque e Fiscal"
                >
                  💼 ERP
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("vendas_crm")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "vendas_crm"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-emerald-600"
                  }`}
                  title="WhatsApp Zumi e CRM de Clientes"
                >
                  💬 CRM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("tecnologia_ti")}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    activeTabFilter === "tecnologia_ti"
                      ? "bg-cyan-600 text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-cyan-600"
                  }`}
                  title="APIs, Integrações e Apps"
                >
                  🔌 TI
                </button>
              </div>

              {/* Campo de Busca Rápida no Menu (⌘K) */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar no menu (⌘K)..."
                  value={menuFilter}
                  onChange={(e) => setMenuFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-[var(--surface2)]/50 border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--salmon)] focus:bg-[var(--surface)] transition-colors"
                />
                {menuFilter ? (
                  <button
                    type="button"
                    onClick={() => setMenuFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)]">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Card de Serendipidade IA */}
              <div
                onClick={() => {
                  setCriterioInicial(dicaAtual.simuladorType || "clima");
                  setSimulatorOpen(true);
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--salmon)]/8 via-amber-500/8 to-purple-500/8 border border-[var(--salmon)]/25 text-xs space-y-1.5 shadow-2xs hover:border-[var(--salmon)]/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[var(--salmon)]">
                    <Sparkles className="w-3 h-3 text-[var(--salmon)] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Serendipidade IA
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[var(--salmon)]/15 text-[var(--salmon)] border border-[var(--salmon)]/25">
                    {dicaAtual.tag}
                  </span>
                </div>
                <p className="text-[10.5px] text-[var(--ink)] leading-snug line-clamp-2">
                  {dicaAtual.texto}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--line)] text-[9.5px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={proximaDica}
                    className="text-[var(--muted)] hover:text-[var(--salmon)] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Próxima sugestão"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Nova dica</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCriterioInicial(dicaAtual.simuladorType || "clima");
                        setSimulatorOpen(true);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[var(--salmon)] hover:brightness-105 text-white font-bold text-[9px] flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Sliders className="w-2.5 h-2.5" />
                      <span>Simular</span>
                    </button>
                    <Link
                      href={dicaAtual.rota}
                      className="text-[var(--salmon)] hover:underline font-bold flex items-center gap-0.5 cursor-pointer no-underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{dicaAtual.acao}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE DOMÍNIOS E SEÇÕES ROLÁVEL - COM LABELS REAIS E 100% VISÍVEIS */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {visibleDomains.map((domain) => {
                const isDomainCollapsed = !!collapsedDomains[domain.id];
                const DomainIcon = domain.icon;

                return (
                  <div key={domain.id} className="space-y-1">
                    {/* Cabeçalho do Domínio com Título Real */}
                    <button
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <DomainIcon className="w-4 h-4 text-[var(--salmon)] shrink-0" />
                        <span className="truncate">{domain.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[var(--surface2)] text-[var(--muted)] group-hover:bg-[var(--line)]">
                          {domain.totalItems}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-150 ${
                            isDomainCollapsed ? "-rotate-90 text-[var(--muted)]" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Seções e Itens Folha */}
                    {!isDomainCollapsed && (
                      <div className="space-y-2 pl-1 border-l-2 border-[var(--line)] ml-2">
                        {domain.sectionsData.map((section) => (
                          <div key={section.id} className="space-y-0.5">
                            {/* Título da Seção Real */}
                            <div className="px-2 pt-1 pb-0.5 text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]/80 flex items-center justify-between">
                              <span>{section.label || (section as any).title || "Seção"}</span>
                            </div>

                            {/* Botões Reais de Navegação */}
                            {section.items.map((item) => {
                              const isActive = currentNormalizedPath === normalizeNavPath(item.path);
                              const ItemIcon = item.icon;

                              return (
                                <Link
                                  key={item.id}
                                  href={item.path}
                                  onClick={() => setMobileOpen(false)}
                                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all no-underline ${
                                    isActive
                                      ? "bg-[var(--salmon)]/12 text-[var(--salmon)] font-bold shadow-2xs border border-[var(--salmon)]/30 border-l-3 border-l-[var(--salmon)]"
                                      : "text-[var(--ink)]/80 hover:text-[var(--ink)] hover:bg-[var(--surface2)] hover:border-[var(--line)] border border-transparent"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate min-w-0">
                                    <ItemIcon
                                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                        isActive
                                          ? "text-[var(--salmon)]"
                                          : "text-[var(--muted)] group-hover:text-[var(--ink)]"
                                      }`}
                                    />
                                    <span className="truncate">{item.label}</span>
                                  </div>

                                  {item.badge && (
                                    <span
                                      className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full shrink-0 border transition-colors ${
                                        isActive
                                          ? "bg-[var(--salmon)]/20 text-[var(--salmon)] border-[var(--salmon)]/30"
                                          : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)] group-hover:border-[var(--muted)]/30 group-hover:text-[var(--ink)]"
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {safetyNetItems.length > 0 && (
                <div className="pt-2 border-t border-red-500/30">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-md mb-1 border border-red-200 dark:border-red-800">
                    ⚠️ Outros (Não Mapeados) · {safetyNetItems.length}
                  </div>
                  <div className="space-y-0.5">
                    {safetyNetItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.path}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 no-underline"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full">
                          Ajustar
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* RODAPÉ: RECENTES & CARD DO USUÁRIO */}
            <div className="p-3 border-t border-[var(--line)] bg-[var(--surface2)]/40 shrink-0 space-y-2">
              {recentPaths.length > 0 && !isSearching && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 px-1 text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    <History className="w-2.5 h-2.5" />
                    <span>Acessados Recentes</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {recentPaths.map((p) => {
                      const label =
                        p === "/cockpit"
                          ? "Cockpit"
                          : p === "/pdv"
                          ? "PDV Touch"
                          : p === "/apps"
                          ? "Apps & APKs"
                          : p === "/zumi"
                          ? "Zumi IA"
                          : p === "/erp"
                          ? "ERP Master"
                          : p === "/nossa-gente"
                          ? "Nossa Gente"
                          : p.replace("/", "").substring(0, 10);
                      const isCur = location === p;

                      return (
                        <Link
                          key={p}
                          href={p}
                          onClick={() => setMobileOpen(false)}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[80px] transition-colors no-underline shrink-0 border ${
                            isCur
                              ? "bg-[var(--salmon)]/15 text-[var(--salmon)] border-[var(--salmon)]/30 font-bold"
                              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)] border-[var(--line)]"
                          }`}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Profile Card com Cargo Real */}
              <div className="flex items-center justify-between gap-2 px-1 pt-1 border-t border-[var(--line)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full border border-[var(--line)] bg-gradient-to-tr from-[#ff6b4a] to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    RG
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-xs font-semibold text-[var(--ink)] truncate leading-tight">
                      {user?.name || "Rodrigo Gonçalves"}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] truncate leading-tight">
                      {user?.cargo || "Proprietário & ADM Geral"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Deseja desconectar do Zuma Pilot?")) {
                      await logout();
                    }
                  }}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                  title="Sair do Zuma Pilot"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Modal Serendipidade */}
      <SimuladorSerendipidadeModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        initialCriterio={criterioInicial}
      />
    </>
  );
};
