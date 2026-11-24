import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  Store,
  Landmark,
  UtensilsCrossed,
  Shirt,
  Wheat,
  Activity,
  Zap,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  BarChart3,
  Cpu,
  Truck,
  ArrowRight,
  PieChart
} from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { DynamicIcon } from "../components/DynamicIcon";
import {
  AVAILABLE_ICONS,
  BADGE_COLOR_PRESETS,
  BusinessModuleConfig,
  BusinessUnit,
  BusinessMetrics,
  ModuleTelemetry,
} from "@shared/businessModules";
import { toast } from "sonner";

export const AdminModulosPage: React.FC = () => {
  const {
    businesses,
    activeBusiness,
    activeBusinessId,
    setActiveBusinessId,
    modules,
    activeModules,
    isLoading,
    saveBusiness,
    deleteBusiness,
    saveModule,
    deleteModule,
    toggleModule,
    reorderModules,
    resetToDefault,
  } = useBusiness();

  // Modo de exibição: "company" (Gestão por Empresa) ou "group" (Visão Consolidada Grupo BancoFe)
  const [viewMode, setViewMode] = useState<"company" | "group">("company");

  // Estados de visualização / privacidade
  const [showSensitiveValues, setShowSensitiveValues] = useState<boolean>(true);
  const [showCalculationDetails, setShowCalculationDetails] = useState<boolean>(false);

  // Estados de modais
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<BusinessModuleConfig | null>(null);

  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessUnit | null>(null);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: "module" | "business";
    id: string;
    name: string;
  }>({ isOpen: false, type: "module", id: "", name: "" });

  // Filtros e busca na lista
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Estado do formulário de módulo
  const [moduleForm, setModuleForm] = useState<{
    id?: string;
    label: string;
    description: string;
    iconName: string;
    badge: string;
    badgeColor: string;
    defaultPath: string;
    order?: number;
    active: boolean;
    permission: "admin" | "user" | "all";
    domains: string[];
    telemetry?: ModuleTelemetry;
  }>({
    label: "",
    description: "",
    iconName: "Boxes",
    badge: "",
    badgeColor: BADGE_COLOR_PRESETS[0].class,
    defaultPath: "/erp",
    active: true,
    permission: "all",
    domains: ["frente_loja"],
    telemetry: {
      monthlyRequests: 15000,
      uptimePercent: 99.99,
      avgLatencyMs: 14,
      status: "healthy",
      costReduction: 2500,
      usersCount: 8,
      lastSync: "Agora",
    },
  });

  // Estado do formulário de negócio
  const [businessForm, setBusinessForm] = useState<{
    id?: string;
    name: string;
    slug: string;
    description: string;
    iconName: string;
    badge: string;
    colorScheme: "blue" | "emerald" | "purple" | "amber" | "cyan" | "slate" | "indigo" | "rose";
    cnpj: string;
    cidade: string;
    unidade: string;
  }>({
    name: "",
    slug: "",
    description: "",
    iconName: "Building2",
    badge: "Negócio",
    colorScheme: "emerald",
    cnpj: "",
    cidade: "Tangará da Serra - MT",
    unidade: "Matriz Operacional",
  });

  // Ícone busca no modal
  const [iconSearch, setIconSearch] = useState("");

  // Estatísticas Consolidadas de Todo o Grupo BancoFe
  const consolidatedGroupStats = useMemo(() => {
    let totalVolume = 0;
    let totalTransactions = 0;
    let totalSavings = 0;
    let totalHoursSaved = 0;
    let totalUsers = 0;
    let sumUptime = 0;

    businesses.forEach((b) => {
      const m = b.metrics;
      if (m) {
        totalVolume += m.monthlyVolume || 0;
        totalTransactions += m.monthlyTransactions || 0;
        totalSavings += m.monthlySavings || 0;
        totalHoursSaved += m.hoursSavedMonthly || 0;
        totalUsers += m.activeUsersCount || 0;
        sumUptime += m.uptimeSla || 99.98;
      }
    });

    const avgUptime = businesses.length > 0 ? Number((sumUptime / businesses.length).toFixed(2)) : 99.98;

    return {
      totalCompanies: businesses.length,
      totalVolume,
      totalTransactions,
      totalSavings,
      totalHoursSaved,
      totalUsers,
      avgUptime,
    };
  }, [businesses]);

  // Módulos filtrados
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchSearch =
        m.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.defaultPath.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === "active") return m.active;
      if (filterStatus === "inactive") return !m.active;
      return true;
    });
  }, [modules, searchTerm, filterStatus]);

  // Ícones filtrados
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return AVAILABLE_ICONS;
    return AVAILABLE_ICONS.filter((name) =>
      name.toLowerCase().includes(iconSearch.toLowerCase())
    );
  }, [iconSearch]);

  // Cálculos dinâmicos e agregados do negócio ativo
  const calculatedStats = useMemo(() => {
    const total = modules.length;
    const active = activeModules.length;
    const inactive = total - active;
    const activationPercent = total > 0 ? Math.round((active / total) * 100) : 0;

    const baseMetrics = activeBusiness?.metrics || {
      monthlyVolume: 100000,
      monthlyTransactions: 5000,
      uptimeSla: 99.98,
      avgLatencyMs: 15,
      monthlySavings: 8000,
      activeUsersCount: 12,
      hoursSavedMonthly: 60,
      complianceScore: 100,
    };

    let totalRequests = 0;
    let totalSavings = 0;
    let sumLatency = 0;
    let sumUptime = 0;

    activeModules.forEach((m) => {
      const t = m.telemetry;
      if (t) {
        totalRequests += t.monthlyRequests || 0;
        totalSavings += t.costReduction || 0;
        sumLatency += t.avgLatencyMs || 14;
        sumUptime += t.uptimePercent || 99.98;
      }
    });

    const avgLatency = active > 0 ? Math.round(sumLatency / active) : 0;
    const avgUptime = active > 0 ? Number((sumUptime / active).toFixed(2)) : 0;
    const hoursSaved = Math.round(totalSavings / 65); // Média de R$ 65/hora homem economizada

    return {
      total,
      active,
      inactive,
      activationPercent,
      monthlyVolume: baseMetrics.monthlyVolume,
      monthlyTransactions: totalRequests > 0 ? totalRequests : baseMetrics.monthlyTransactions,
      uptimeSla: avgUptime > 0 ? avgUptime : baseMetrics.uptimeSla,
      avgLatencyMs: avgLatency > 0 ? avgLatency : baseMetrics.avgLatencyMs,
      monthlySavings: totalSavings > 0 ? totalSavings : baseMetrics.monthlySavings,
      activeUsersCount: baseMetrics.activeUsersCount,
      hoursSavedMonthly: hoursSaved > 0 ? hoursSaved : baseMetrics.hoursSavedMonthly,
      complianceScore: baseMetrics.complianceScore,
    };
  }, [modules, activeModules, activeBusiness]);

  // Formatador de Moeda
  const formatMoney = (val: number) => {
    if (!showSensitiveValues) return "R$ ••••••••";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Formatador de Números
  const formatNumber = (val: number) => {
    if (!showSensitiveValues) return "••••";
    return new Intl.NumberFormat("pt-BR").format(val);
  };

  // Handlers para modais
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      label: "",
      description: "",
      iconName: "Boxes",
      badge: "NOVO",
      badgeColor: BADGE_COLOR_PRESETS[0].class,
      defaultPath: "/erp",
      active: true,
      permission: "all",
      domains: ["frente_loja"],
      telemetry: {
        monthlyRequests: 12000,
        uptimePercent: 99.99,
        avgLatencyMs: 14,
        status: "healthy",
        costReduction: 2200,
        usersCount: 6,
        lastSync: "Agora",
      },
    });
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: BusinessModuleConfig) => {
    setEditingModule(mod);
    setModuleForm({
      id: mod.id,
      label: mod.label,
      description: mod.description,
      iconName: mod.iconName,
      badge: mod.badge || "",
      badgeColor: mod.badgeColor || BADGE_COLOR_PRESETS[0].class,
      defaultPath: mod.defaultPath,
      order: mod.order,
      active: mod.active,
      permission: mod.permission,
      domains: mod.domains || [],
      telemetry: mod.telemetry || {
        monthlyRequests: 12000,
        uptimePercent: 99.98,
        avgLatencyMs: 14,
        status: "healthy",
        costReduction: 2000,
        usersCount: 6,
        lastSync: "Agora",
      },
    });
    setIsModuleModalOpen(true);
  };

  const handleOpenAddBusiness = () => {
    setEditingBusiness(null);
    setBusinessForm({
      name: "",
      slug: "",
      description: "",
      iconName: "Building2",
      badge: "Nova Unidade",
      colorScheme: "emerald",
      cnpj: "",
      cidade: "Tangará da Serra - MT",
      unidade: "Filial Operacional",
    });
    setIsBusinessModalOpen(true);
  };

  // Salvar Módulo
  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.label.trim()) {
      toast.error("O nome do módulo é obrigatório!");
      return;
    }

    try {
      await saveModule(moduleForm);
      setIsModuleModalOpen(false);
    } catch (err) {}
  };

  // Salvar Negócio
  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessForm.name.trim()) {
      toast.error("O nome do negócio é obrigatório!");
      return;
    }

    try {
      await saveBusiness(businessForm);
      setIsBusinessModalOpen(false);
    } catch (err) {}
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (deleteConfirmModal.type === "module") {
      await deleteModule(deleteConfirmModal.id);
    } else {
      await deleteBusiness(deleteConfirmModal.id);
    }
    setDeleteConfirmModal({ isOpen: false, type: "module", id: "", name: "" });
  };

  // Reordenação
  const handleMoveModule = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const newOrder = [...modules];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await reorderModules(newOrder.map((m) => m.id));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0d12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors antialiased font-sans">
      {/* Top Breadcrumb & Status */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
            BancoFe
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Painel Administrativo</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {viewMode === "group" ? "Ecossistema Consolidado BancoFe" : "Módulos por Negócio"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Modo de Visão: Grupo Consolidado x Por Empresa */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("company")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "company"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Por Empresa
            </button>
            <button
              onClick={() => setViewMode("group")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "group"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              Grupo Consolidado
            </button>
          </div>

          <button
            onClick={() => setShowSensitiveValues(!showSensitiveValues)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-all cursor-pointer"
            title={showSensitiveValues ? "Ocultar valores financeiros" : "Mostrar valores financeiros"}
          >
            {showSensitiveValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSensitiveValues ? "Ocultar Valores" : "Exibir Valores"}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sidebar Sincronizada
          </div>
        </div>
      </div>

      {/* =========================================================================
          NUBANK-STYLE BUSINESS SELECTOR (PILL TABS)
          ========================================================================= */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Empresas do Ecossistema BancoFe
          </span>
          <span className="text-xs text-slate-500">
            {businesses.length} empresas integradas ao core bancário
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {businesses.map((biz) => {
            const isSelected = viewMode === "company" && biz.id === activeBusinessId;
            return (
              <button
                key={biz.id}
                onClick={() => {
                  setActiveBusinessId(biz.id);
                  setViewMode("company");
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-600 shadow-sm shadow-emerald-900/30 scale-[1.01]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <DynamicIcon name={biz.iconName} className="w-4 h-4" />
                </div>
                <span>{biz.name.split("—")[0].trim()}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {biz.id === activeBusinessId ? modules.length : (biz as any).modulesCount || 0}
                </span>
              </button>
            );
          })}

          <button
            onClick={handleOpenAddBusiness}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: VISÃO CONSOLIDADA DE TODAS AS EMPRESAS DO GRUPO BANCOFE
          ========================================================================= */}
      {viewMode === "group" && (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
          {/* Executive Group Hero Card */}
          <div className="bg-gradient-to-br from-[#0c4a34] to-[#4c047d] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Landmark className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Grupo BancoFe — Ecossistema Corporativo 360°
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-2xl">
                    Painel executivo unificado das 17 empresas e unidades operacionais. Liquidação instantânea Pix, esteira de antecipação de crédito intercompany e auditoria consolidada.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-xs">
                  {consolidatedGroupStats.totalCompanies} Empresas Integradas
                </span>
              </div>
            </div>

            {/* Consolidated Big Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
              <div className="space-y-1">
                <div className="text-xs text-purple-200">Volume Total Transacionado</div>
                <div className="text-2xl sm:text-3xl font-black font-mono">
                  {formatMoney(consolidatedGroupStats.totalVolume)}
                </div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 100% Auditado em Tempo Real
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-purple-200">Operações & Transações/mês</div>
                <div className="text-2xl sm:text-3xl font-black font-mono">
                  {formatNumber(consolidatedGroupStats.totalTransactions)}
                </div>
                <div className="text-[11px] text-purple-200 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Core Bancário Alta Velocidade
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-purple-200">Disponibilidade do Grupo (SLA)</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                  {consolidatedGroupStats.avgUptime}%
                </div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Infraestrutura Cloud Run GCP
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-purple-200">Economia Operacional Gerada</div>
                <div className="text-2xl sm:text-3xl font-black font-mono">
                  {formatMoney(consolidatedGroupStats.totalSavings)}
                </div>
                <div className="text-[11px] text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ~{formatNumber(consolidatedGroupStats.totalHoursSaved)}h economizadas
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Todas as Empresas do Grupo BancoFe */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Empresas & Unidades Operacionais Integradas
              </h3>
              <span className="text-xs text-slate-500">
                Clique em qualquer empresa para configurar seus módulos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz) => {
                const m = biz.metrics;
                return (
                  <div
                    key={biz.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                          <DynamicIcon name={biz.iconName} className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {biz.badge}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                        {biz.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {biz.description}
                      </p>

                      {/* Dados operacionais da empresa */}
                      <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Volume Mensal:</span>
                          <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                            {formatMoney(m?.monthlyVolume || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transações / Mês:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {formatNumber(m?.monthlyTransactions || 0)} ops
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">SLA Disponibilidade:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {m?.uptimeSla || 99.98}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">CNPJ:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                            {biz.cnpj || "N/D"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        Polo: <span className="font-medium text-slate-700 dark:text-slate-300">{biz.cidade?.split("&")[0].trim()}</span>
                      </span>

                      <button
                        onClick={() => {
                          setActiveBusinessId(biz.id);
                          setViewMode("company");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
                      >
                        <span>Gerenciar Módulos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: GESTÃO DETALHADA POR EMPRESA (NUBANK STYLE HERO + CARDS)
          ========================================================================= */}
      {viewMode === "company" && (
        <>
          {/* Executive Hero Card da Empresa */}
          <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 shadow-[0_2px_14px_rgba(0,0,0,0.03)] mb-6 transition-all">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 dark:text-emerald-300">
                  <DynamicIcon name={activeBusiness.iconName} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {activeBusiness.name}
                    </h1>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 border border-emerald-500/20">
                      {activeBusiness.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeBusiness.unidade || activeBusiness.cidade} • CNPJ: {activeBusiness.cnpj || "N/D"}
                  </p>
                </div>
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddModule}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Módulo
                </button>

                <button
                  onClick={() => resetToDefault()}
                  title="Restaurar configuração de módulos padrão para este negócio"
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Complete Metrics Row (Nubank Big Numbers) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-100 dark:border-slate-800">
              {/* Card 1: Volume */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Volume Mensal Operado</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatMoney(calculatedStats.monthlyVolume)}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> Processamento 100% Auditado
                </div>
              </div>

              {/* Card 2: Transações / Requisições */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Transações & Requisições</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatNumber(calculatedStats.monthlyTransactions)}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Latência média: {calculatedStats.avgLatencyMs}ms
                </div>
              </div>

              {/* Card 3: Uptime SLA */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Disponibilidade (SLA)</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {calculatedStats.uptimeSla}%
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Alta Confiabilidade 24/7
                </div>
              </div>

              {/* Card 4: Economia / ROI */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Economia / ROI Mensal</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatMoney(calculatedStats.monthlySavings)}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ~{calculatedStats.hoursSavedMonthly}h economizadas da equipe
                </div>
              </div>
            </div>

            {/* Module Health Progress & Toggle Details */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Status Operacional dos Módulos:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${calculatedStats.activationPercent}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {calculatedStats.active}/{calculatedStats.total} ativos ({calculatedStats.activationPercent}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{showCalculationDetails ? "Ocultar Detalhamento de Cálculos" : "Ver Cálculos e Indicadores Completos"}</span>
                {showCalculationDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Calculation & Telemetry Drawer */}
            {showCalculationDetails && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>Memória de Cálculo & Auditoria Operacional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <div className="text-slate-500">Cálculo de Eficiência da Equipe</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {calculatedStats.hoursSavedMonthly} horas / mês
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Base de cálculo: R$ 65,00/hora homem economizada em tarefas automatizadas pelos módulos ativos.
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <div className="text-slate-500">Conformidade Regulatória & Fiscal</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {calculatedStats.complianceScore}% Aprovado
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Padrão Bacen Open Finance, SEFAZ-MT Bloco K e rastreabilidade sanitária Anvisa auditados.
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <div className="text-slate-500">Operadores e Usuários Impactados</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {calculatedStats.activeUsersCount} usuários ativos
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Contas corporativas com permissões sincronizadas e logins rastreados.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Search & Filter Bar */}
          <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por módulo, rota (/pdv) ou identificador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {(["all", "active", "inactive"] as const).map((status) => {
                const count =
                  status === "all"
                    ? modules.length
                    : status === "active"
                    ? activeModules.length
                    : modules.length - activeModules.length;

                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      filterStatus === status
                        ? "bg-emerald-700 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {status === "all" ? "Todos" : status === "active" ? "Ativos" : "Inativos"} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nubank-Style Module Cards List */}
          <div className="max-w-6xl mx-auto space-y-3">
            {filteredModules.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
                <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Nenhum módulo encontrado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Não encontramos módulos para os critérios de pesquisa. Adicione um novo módulo para esta empresa.
                </p>
                <button
                  onClick={handleOpenAddModule}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Módulo Agora
                </button>
              </div>
            ) : (
              filteredModules.map((mod, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredModules.length - 1;
                const t = mod.telemetry || {
                  monthlyRequests: 12000,
                  uptimePercent: 99.98,
                  avgLatencyMs: 14,
                  status: "healthy",
                  costReduction: 2000,
                  usersCount: 6,
                  lastSync: "Agora",
                };

                return (
                  <div
                    key={mod.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 transition-all shadow-[0_1px_8px_rgba(0,0,0,0.02)] hover:border-emerald-500 dark:hover:border-emerald-800 ${
                      mod.active
                        ? "border-slate-200/90 dark:border-slate-800/90"
                        : "border-slate-200/50 dark:border-slate-800/50 opacity-60 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Icon Box */}
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                          <DynamicIcon name={mod.iconName} className="w-5 h-5" />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400">#{mod.order}</span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {mod.label}
                            </h3>

                            {mod.badge && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mod.badgeColor || "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                                {mod.badge}
                              </span>
                            )}

                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {mod.id}
                            </span>

                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              mod.permission === "admin"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                              {mod.permission === "admin" ? "Apenas Admin" : "Todos os Usuários"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                            {mod.description || "Sem descrição cadastrada."}
                          </p>

                          {/* Complete Calculations / Telemetry Line */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t.uptimePercent}% SLA
                            </span>
                            <span>•</span>
                            <span>⏱ {t.avgLatencyMs}ms</span>
                            <span>•</span>
                            <span>📊 {formatNumber(t.monthlyRequests || 0)} req/mês</span>
                            {t.costReduction && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  💰 {formatMoney(t.costReduction)} economizados
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Rota:</span>
                              <Link
                                href={mod.defaultPath}
                                className="text-emerald-600 dark:text-emerald-400 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-mono"
                              >
                                {mod.defaultPath}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Controls & Actions (Minimalist & Effective) */}
                      <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                        {/* Toggle Active Switch */}
                        <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-medium text-slate-500">
                            {mod.active ? "Ativo" : "Inativo"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id, !mod.active)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                              mod.active ? "bg-emerald-700" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                mod.active ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleMoveModule(index, "up")}
                            disabled={isFirst}
                            title="Subir na Sidebar"
                            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-20 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveModule(index, "down")}
                            disabled={isLast}
                            title="Descer na Sidebar"
                            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-20 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModule(mod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Modificar
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmModal({
                              isOpen: true,
                              type: "module",
                              id: mod.id,
                              name: mod.label,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* =========================================================================
          MODAL: ADICIONAR / MODIFICAR MÓDULO (CLEAN NUBANK STYLE)
          ========================================================================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-700 text-white">
                  <DynamicIcon name={moduleForm.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingModule ? `Modificar Módulo: ${editingModule.label}` : `Adicionar Módulo em ${activeBusiness.name.split("—")[0].trim()}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Parâmetros visuais, rotas e telemetria operacional.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModule} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Pré-visualização do Módulo:
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300">
                    <DynamicIcon name={moduleForm.iconName} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {moduleForm.label || "Nome do Módulo"}
                      </span>
                      {moduleForm.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${moduleForm.badgeColor}`}>
                          {moduleForm.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {moduleForm.description || "Descrição do módulo operacional"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nome e Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Módulo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Open Finance & Pix"
                    value={moduleForm.label}
                    onChange={(e) => setModuleForm({ ...moduleForm, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ID Slug
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: open_finance (opcional)"
                    value={moduleForm.id || ""}
                    disabled={!!editingModule}
                    onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Módulo
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o que este módulo oferece e quais operações ele executa..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Rota Padrão e Permissão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rota Padrão ao Clicar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/pdv, /erp, /agro..."
                    value={moduleForm.defaultPath}
                    onChange={(e) => setModuleForm({ ...moduleForm, defaultPath: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nível de Permissão
                  </label>
                  <select
                    value={moduleForm.permission}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        permission: e.target.value as "all" | "admin" | "user",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">Todos os Usuários</option>
                    <option value="admin">Apenas Administradores</option>
                    <option value="user">Usuários Padrão</option>
                  </select>
                </div>
              </div>

              {/* Badge Text e Preset de Cor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Texto do Badge (Tag)
                  </label>
                  <input
                    type="text"
                    placeholder="NOVO, BETA, 24/7..."
                    value={moduleForm.badge}
                    onChange={(e) => setModuleForm({ ...moduleForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estilo de Cor do Badge
                  </label>
                  <select
                    value={moduleForm.badgeColor}
                    onChange={(e) => setModuleForm({ ...moduleForm, badgeColor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {BADGE_COLOR_PRESETS.map((p) => (
                      <option key={p.id} value={p.class}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ícone Seletor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ícone do Módulo (Lucide)
                  </label>
                  <div className="relative w-36">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 max-h-28 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/40">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setModuleForm({ ...moduleForm, iconName })}
                      title={iconName}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        moduleForm.iconName === iconName
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <DynamicIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {editingModule ? "Salvar Alterações" : "Adicionar Módulo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRMAÇÃO DE EXCLUSÃO SEGURA
          ========================================================================= */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Excluir Módulo "{deleteConfirmModal.name}"?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Esta ação removerá o módulo permanentemente deste negócio. Caso prefira apenas ocultar da navegação, utilize o botão de ativar/desativar.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ ...deleteConfirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Sim, Excluir Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOVO NEGÓCIO
          ========================================================================= */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-700 text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Cadastrar Nova Empresa no Grupo BancoFe
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBusinessModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBusiness} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BancoFe Imobiliária & Investimentos"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={businessForm.cnpj}
                    onChange={(e) => setBusinessForm({ ...businessForm, cnpj: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tag / Categoria</label>
                  <input
                    type="text"
                    placeholder="Imóveis, Fomento, etc."
                    value={businessForm.badge}
                    onChange={(e) => setBusinessForm({ ...businessForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Descreva as operações e o escopo desta empresa..."
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                >
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
