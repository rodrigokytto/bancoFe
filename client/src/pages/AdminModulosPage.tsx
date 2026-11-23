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
  ShieldAlert,
  Download,
  Upload,
  Copy,
  Sparkles,
  Layers,
  Search,
  Filter,
  Check,
  ChevronRight,
  Eye,
  Sliders,
  Store,
  Landmark,
  UtensilsCrossed,
  Shirt,
  Wheat,
  Info,
} from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { DynamicIcon } from "../components/DynamicIcon";
import {
  AVAILABLE_ICONS,
  BADGE_COLOR_PRESETS,
  BusinessModuleConfig,
  BusinessUnit,
} from "@shared/businessModules";
import { MENU_DOMAINS } from "../navigation.config";
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

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");

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
    colorScheme: "blue",
    cnpj: "",
    cidade: "Tangará da Serra - MT",
    unidade: "Matriz Operacional",
  });

  // Ícone busca no modal
  const [iconSearch, setIconSearch] = useState("");

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

  // Handlers para abrir modais
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      label: "",
      description: "",
      iconName: "Boxes",
      badge: "NOVO",
      badgeColor: BADGE_COLOR_PRESETS[1].class,
      defaultPath: "/erp",
      active: true,
      permission: "all",
      domains: ["frente_loja"],
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
      colorScheme: "blue",
      cnpj: "",
      cidade: "Tangará da Serra - MT",
      unidade: "Filial Operacional",
    });
    setIsBusinessModalOpen(true);
  };

  const handleOpenEditBusiness = (biz: BusinessUnit) => {
    setEditingBusiness(biz);
    setBusinessForm({
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      description: biz.description,
      iconName: biz.iconName,
      badge: biz.badge,
      colorScheme: biz.colorScheme,
      cnpj: biz.cnpj || "",
      cidade: biz.cidade || "",
      unidade: biz.unidade || "",
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
    } catch (err) {
      // toast já disparado no context
    }
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
    } catch (err) {
      // toast disparado no context
    }
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

  // Alternar Domínio no Formulário
  const toggleDomainInForm = (domainId: string) => {
    setModuleForm((prev) => {
      const exists = prev.domains.includes(domainId);
      return {
        ...prev,
        domains: exists ? prev.domains.filter((d) => d !== domainId) : [...prev.domains, domainId],
      };
    });
  };

  // Cores de tema dos negócios
  const getColorBadge = (scheme: string) => {
    switch (scheme) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "purple":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "cyan":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      case "rose":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "slate":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Breadcrumb & Status */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">BancoFe</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Painel Administrativo</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600 dark:text-blue-400 font-medium">Gestão de Módulos por Negócio</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sincronização em Tempo Real com Sidebar
          </div>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Sliders className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Gestão de Módulos por Negócio
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Configure, adicione, altere ou exclua módulos operacionais para cada empresa ou unidade de negócio do ecossistema <span className="font-semibold text-slate-800 dark:text-slate-200">BancoFe</span>. As alterações refletem imediatamente na navegação da Sidebar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddModule}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Módulo
            </button>

            <button
              onClick={handleOpenAddBusiness}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              Novo Negócio
            </button>

            <button
              onClick={resetToDefault}
              title="Restaurar configuração de módulos padrão para este negócio"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Padrão
            </button>
          </div>
        </div>

        {/* Business Selector Tabs */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Selecione o Negócio para Gerenciar:
            </span>
            <span className="text-xs text-slate-500">
              {businesses.length} negócios cadastrados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {businesses.map((biz) => {
              const isSelected = biz.id === activeBusinessId;
              const badgeClass = getColorBadge(biz.colorScheme);

              return (
                <div
                  key={biz.id}
                  onClick={() => setActiveBusinessId(biz.id)}
                  className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                      : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <DynamicIcon name={biz.iconName} className="w-5 h-5" />
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {biz.badge}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm line-clamp-1 mb-1" title={biz.name}>
                    {biz.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {biz.unidade || biz.cidade}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {biz.id === activeBusinessId ? modules.length : (biz as any).modulesCount || 0} módulos
                    </span>

                    {isSelected && (
                      <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-xs">
                        <Check className="w-3.5 h-3.5" /> Ativo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Business Stats & Meta Card */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <DynamicIcon name={activeBusiness.iconName} className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeBusiness.badge}
                </span>
                <span className="text-xs text-slate-400">CNPJ: {activeBusiness.cnpj || "N/D"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {activeBusiness.name}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                {activeBusiness.description}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 sm:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700/60">
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-extrabold text-blue-400">{modules.length}</div>
              <div className="text-xs text-slate-300">Total Módulos</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-extrabold text-emerald-400">{activeModules.length}</div>
              <div className="text-xs text-slate-300">Ativos na Sidebar</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-extrabold text-amber-400">{modules.length - activeModules.length}</div>
              <div className="text-xs text-slate-300">Desabilitados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar módulo por nome, rota ou id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              {status === "all" ? "Todos" : status === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Modules List / Cards */}
      <div className="max-w-7xl mx-auto space-y-4">
        {filteredModules.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Nenhum módulo encontrado
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Não encontramos módulos para os filtros selecionados. Clique em "Adicionar Módulo" para criar o primeiro módulo personalizado deste negócio.
            </p>
            <button
              onClick={handleOpenAddModule}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Módulo Agora
            </button>
          </div>
        ) : (
          filteredModules.map((mod, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredModules.length - 1;

            return (
              <div
                key={mod.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 sm:p-6 transition-all shadow-sm hover:shadow-md ${
                  mod.active
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/40"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Order & Icon Box */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                        <DynamicIcon name={mod.iconName} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        #{mod.order}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {mod.label}
                        </h3>

                        {mod.badge && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${mod.badgeColor || "bg-blue-500/10 text-blue-600 border-blue-500/30"}`}>
                            {mod.badge}
                          </span>
                        )}

                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          id: {mod.id}
                        </span>

                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          mod.permission === "admin"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                        }`}>
                          {mod.permission === "admin" ? "Apenas Admin" : "Todos os Usuários"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {mod.description || "Sem descrição cadastrada."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Rota padrão:</span>
                          <Link
                            href={mod.defaultPath}
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            {mod.defaultPath}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        {mod.domains && mod.domains.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Domínios vinculados:</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {mod.domains.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls & Actions */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Toggle Active Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        {mod.active ? "Ativo" : "Inativo"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id, !mod.active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          mod.active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            mod.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleMoveModule(index, "up")}
                        disabled={isFirst}
                        title="Mover para cima"
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveModule(index, "down")}
                        disabled={isLast}
                        title="Mover para baixo"
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModule(mod)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          MODAL: ADICIONAR / MODIFICAR MÓDULO
          ========================================================================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                  <DynamicIcon name={moduleForm.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingModule ? `Modificar Módulo: ${editingModule.label}` : `Adicionar Módulo em ${activeBusiness.name}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure os parâmetros visuais, rotas e domínios deste módulo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModule} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Pré-visualização do Módulo no Menu / Sidebar:
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <DynamicIcon name={moduleForm.iconName} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
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
                      {moduleForm.description || "Descrição breve do módulo operacional"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nome e Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Módulo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Open Finance & Pix"
                    value={moduleForm.label}
                    onChange={(e) => setModuleForm({ ...moduleForm, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Identificador Único (ID Slug)
                  </label>
                  <input
                    type="text"
                    disabled={!!editingModule}
                    placeholder="Ex: open_finance (opcional)"
                    value={moduleForm.id || ""}
                    onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm disabled:opacity-60 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    {editingModule ? "O ID slug não pode ser alterado após criação." : "Deixe vazio para gerar automaticamente do nome."}
                  </span>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Módulo
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o que este módulo oferece e quais operações ele executa..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Rota Padrão e Permissão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rota Padrão ao Clicar (defaultPath) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: /pdv, /conexoes, /erp, /mercado"
                    value={moduleForm.defaultPath}
                    onChange={(e) => setModuleForm({ ...moduleForm, defaultPath: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nível de Permissão
                  </label>
                  <select
                    value={moduleForm.permission}
                    onChange={(e: any) => setModuleForm({ ...moduleForm, permission: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">Todos os Usuários</option>
                    <option value="admin">Apenas Administradores (Admin)</option>
                    <option value="user">Usuários Padrão</option>
                  </select>
                </div>
              </div>

              {/* Badge e Cor do Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Texto do Badge (Tag de Destaque)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bacen, Tempo Real, NOVO"
                    value={moduleForm.badge}
                    onChange={(e) => setModuleForm({ ...moduleForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estilo de Cor do Badge
                  </label>
                  <select
                    value={moduleForm.badgeColor}
                    onChange={(e) => setModuleForm({ ...moduleForm, badgeColor: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {BADGE_COLOR_PRESETS.map((p) => (
                      <option key={p.id} value={p.class}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seletor de Ícone Lucide */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ícone do Módulo (Lucide Icons)
                  </label>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Filtrar ícones..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs w-32 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                  {filteredIcons.map((iconName) => {
                    const isSelected = moduleForm.iconName === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setModuleForm({ ...moduleForm, iconName })}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white ring-2 ring-blue-500"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title={iconName}
                      >
                        <DynamicIcon name={iconName} className="w-4 h-4" />
                        <span className="text-[9px] truncate w-full text-center">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domínios e Submódulos Associados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domínios & Submódulos Vinculados na Sidebar
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Selecione quais blocos de telas e menus recolhíveis aparecerão na Sidebar quando este módulo estiver selecionado:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                  {MENU_DOMAINS.map((dom) => {
                    const isChecked = moduleForm.domains.includes(dom.id);
                    return (
                      <div
                        key={dom.id}
                        onClick={() => toggleDomainInForm(dom.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium truncate">{dom.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Switch de Ativação Inicial */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Módulo Ativo Imediatamente
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Se desativado, o módulo ficará oculto da navegação dos usuários.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModuleForm({ ...moduleForm, active: !moduleForm.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    moduleForm.active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      moduleForm.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {editingModule ? "Salvar Modificações" : "Adicionar Módulo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADICIONAR / EDITAR NEGÓCIO
          ========================================================================= */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingBusiness ? `Editar Negócio: ${editingBusiness.name}` : "Cadastrar Nova Unidade / Negócio"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adicione uma nova empresa ao ecossistema BancoFe.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBusinessModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBusiness} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Negócio / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BancoFe Corretora de Câmbio"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Câmbio, Saúde, Agro"
                    value={businessForm.badge}
                    onChange={(e) => setBusinessForm({ ...businessForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={businessForm.cnpj}
                    onChange={(e) => setBusinessForm({ ...businessForm, cnpj: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Tangará da Serra - MT"
                    value={businessForm.cidade}
                    onChange={(e) => setBusinessForm({ ...businessForm, cidade: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Esquema de Cor
                  </label>
                  <select
                    value={businessForm.colorScheme}
                    onChange={(e: any) => setBusinessForm({ ...businessForm, colorScheme: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="blue">Azul Financeiro</option>
                    <option value="emerald">Verde Esmeralda</option>
                    <option value="purple">Roxo Tech</option>
                    <option value="amber">Âmbar Agro</option>
                    <option value="rose">Rosa Boutique</option>
                    <option value="slate">Cinza Holding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Negócio
                </label>
                <textarea
                  rows={2}
                  placeholder="Finalidade e escopo desta unidade de negócio..."
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  {editingBusiness ? "Salvar Negócio" : "Cadastrar Negócio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRMAR EXCLUSÃO
          ========================================================================= */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Tem certeza de que deseja excluir o {deleteConfirmModal.type === "module" ? "módulo" : "negócio"}{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                "{deleteConfirmModal.name}"
              </span>
              ? Esta ação removerá o acesso a esta opção na barra lateral.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: "module", id: "", name: "" })}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm cursor-pointer"
              >
                Confirmar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModulosPage;
