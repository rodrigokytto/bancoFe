import React, { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl } from "../../../shared/zumaData";
import {
  MapPin,
  Bike,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Clock,
  Navigation,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  Compass,
  FileSpreadsheet,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageCircle,
  Receipt,
  Printer,
  Users,
  TrendingUp,
  Zap,
  Calendar,
  Layers,
  Map
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { ImpressaoTermicaModal } from "../components/pdv/ImpressaoTermicaModal";

interface NeighborhoodFormData {
  id?: string;
  name: string;
  zone: string;
  cep: string;
  cepInicial: string;
  cepFinal: string;
  logradourosPrincipais: string;
  distanceKm: number;
  avgTimeMin: number;
  fee: number;
  rainSurcharge: number;
  minOrderValue: number;
  freeShippingMin: number;
  active: boolean;
  notes: string;
}

const DEFAULT_FORM: NeighborhoodFormData = {
  name: "",
  zone: "Centro",
  cep: "78300-000",
  cepInicial: "78300-000",
  cepFinal: "78300-150",
  logradourosPrincipais: "",
  distanceKm: 2.5,
  avgTimeMin: 25,
  fee: 8.0,
  rainSurcharge: 3.0,
  minOrderValue: 35.0,
  freeShippingMin: 120.0,
  active: true,
  notes: "",
};

const ZONAS_TANGARA = [
  "TODAS",
  "Centro",
  "Zona Norte",
  "Zona Sul",
  "Zona Leste",
  "Zona Oeste",
  "Distrito / Perímetro",
];

export default function TabelaEntregasTangara() {
  const utils = trpc.useUtils();

  // Navegação entre abas principais
  const [activeMainTab, setActiveMainTab] = useState<"bairros" | "frota" | "acerto" | "rotas">("bairros");

  // ==================== QUERIES & MUTATIONS ====================
  const { data: neighborhoods = [], isLoading, refetch } = trpc.zuma.getDeliveryNeighborhoods.useQuery();
  const { data: motoboys = [], refetch: refetchMotoboys } = trpc.zuma.listMotoboys.useQuery();
  const { data: allOrders = [] } = trpc.zuma.listOrders.useQuery();

  const createMutation = trpc.zuma.createDeliveryNeighborhood.useMutation({
    onSuccess: (data) => {
      toast.success(`Bairro ${data.name} cadastrado com sucesso em Tangará da Serra!`);
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(`Erro ao criar: ${err.message}`)
  });

  const updateMutation = trpc.zuma.updateDeliveryNeighborhood.useMutation({
    onSuccess: (data) => {
      toast.success(`Parâmetros de ${data.name} atualizados e salvos com sucesso!`);
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`)
  });

  const deleteMutation = trpc.zuma.deleteDeliveryNeighborhood.useMutation({
    onSuccess: () => {
      toast.success("Bairro / CEP removido com sucesso!");
      refetch();
    },
    onError: (err) => toast.error(`Erro ao excluir: ${err.message}`)
  });

  const resetMutation = trpc.zuma.resetDeliveryNeighborhoodsToDefault.useMutation({
    onSuccess: (data) => {
      toast.success(`Tabela oficial de Tangará da Serra restaurada com sucesso (${data.length} bairros e CEPs)!`);
      refetch();
    },
    onError: (err) => toast.error(`Erro ao restaurar: ${err.message}`)
  });

  // Motoboys Mutations
  const createMotoboyMutation = trpc.zuma.createMotoboy.useMutation({
    onSuccess: (data) => {
      toast.success(`Entregador ${data.name} cadastrado com sucesso na frota Zuma Tangará!`);
      setIsMotoboyModalOpen(false);
      refetchMotoboys();
    },
    onError: (err) => toast.error(`Erro ao cadastrar motoboy: ${err.message}`),
  });

  const updateMotoboyMutation = trpc.zuma.updateMotoboy.useMutation({
    onSuccess: () => {
      toast.success("Status do entregador atualizado com sucesso!");
      refetchMotoboys();
    },
    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  const deleteMotoboyMutation = trpc.zuma.deleteMotoboy.useMutation({
    onSuccess: () => {
      toast.success("Entregador removido da frota!");
      refetchMotoboys();
    },
    onError: (err) => toast.error(`Erro ao remover: ${err.message}`),
  });

  const settleMotoboyMutation = trpc.zuma.settleMotoboyShift.useMutation({
    onSuccess: () => {
      toast.success("Turno do entregador liquidado com sucesso no caixa!");
      refetchMotoboys();
    },
    onError: (err) => toast.error(`Erro ao liquidar turno: ${err.message}`),
  });

  // Estados locais de interface de Bairros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("TODAS");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "fee_asc" | "fee_desc" | "dist_asc" | "time_asc">("dist_asc");
  const [rainModeGlobal, setRainModeGlobal] = useState(true);

  // Modal de edição / criação de Bairros
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<NeighborhoodFormData>(DEFAULT_FORM);

  // Modal de Cadastro de Motoboy
  const [isMotoboyModalOpen, setIsMotoboyModalOpen] = useState(false);
  const [motoboyForm, setMotoboyForm] = useState({ name: "", phone: "", plate: "" });

  // Modal de Impressão Térmica de Fechamento do Motoboy
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSettlementBoy, setSelectedSettlementBoy] = useState<any>(null);

  // Simulador de Frete por CEP em tempo real
  const [simCep, setSimCep] = useState("78300-200");
  const [simOrderValue, setSimOrderValue] = useState(135.0);

  // Lookup query do simulador
  const { data: simResult } = trpc.zuma.lookupCepTangara.useQuery(
    { cep: simCep, orderTotal: simOrderValue },
    { enabled: simCep.length >= 4 }
  );

  // Filtragem e ordenação da tabela de bairros
  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods
      .filter((b: any) => {
        const term = searchTerm.toLowerCase().trim();
        const matchesTerm =
          !term ||
          b.name.toLowerCase().includes(term) ||
          (b.cep && b.cep.includes(term)) ||
          (b.logradourosPrincipais && b.logradourosPrincipais.toLowerCase().includes(term)) ||
          (b.notes && b.notes.toLowerCase().includes(term));

        const matchesZone = selectedZone === "TODAS" || b.zone === selectedZone;

        const matchesActive =
          filterActive === "all" ||
          (filterActive === "active" && b.active) ||
          (filterActive === "inactive" && !b.active);

        return matchesTerm && matchesZone && matchesActive;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "fee_asc") return a.fee - b.fee;
        if (sortBy === "fee_desc") return b.fee - a.fee;
        if (sortBy === "dist_asc") return a.distanceKm - b.distanceKm;
        if (sortBy === "time_asc") return a.avgTimeMin - b.avgTimeMin;
        return 0;
      });
  }, [neighborhoods, searchTerm, selectedZone, filterActive, sortBy]);

  // Estatísticas calculadas de bairros
  const stats = useMemo(() => {
    const total = neighborhoods.length;
    const active = neighborhoods.filter((b: any) => b.active).length;
    const avgFee = total > 0 ? neighborhoods.reduce((s: number, b: any) => s + b.fee, 0) / total : 0;
    const avgTime = total > 0 ? neighborhoods.reduce((s: number, b: any) => s + b.avgTimeMin, 0) / total : 0;
    return { total, active, avgFee, avgTime };
  }, [neighborhoods]);

  // Estatísticas de Acerto de Motoboys do Turno
  const settlementStats = useMemo(() => {
    const totalEntregas = motoboys.reduce((acc: number, m: any) => acc + (m.completedToday || 0), 0);
    const totalTaxas = motoboys.reduce((acc: number, m: any) => acc + (m.accumulatedDeliveryFees || 0), 0);
    const totalDiarias = motoboys.length * 70.0;
    
    // Calcular pedidos em dinheiro por motoboy
    const boyMoneyMap: Record<string, number> = {};
    allOrders.forEach((o: any) => {
      if (o.motoboy && o.paymentMethod === "dinheiro") {
        boyMoneyMap[o.motoboy] = (boyMoneyMap[o.motoboy] || 0) + (o.total || 0);
      }
    });

    const totalDinheiroRecolhido = Object.values(boyMoneyMap).reduce((a, b) => a + b, 0);
    const saldoGeralLiquido = (totalDiarias + totalTaxas) - totalDinheiroRecolhido;

    return {
      totalEntregas,
      totalTaxas,
      totalDiarias,
      totalDinheiroRecolhido,
      saldoGeralLiquido,
      boyMoneyMap
    };
  }, [motoboys, allOrders]);

  // Handlers de Bairro
  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode("edit");
    setFormData({
      id: item.id,
      name: item.name,
      zone: item.zone || "Centro",
      cep: item.cep || "78300-000",
      cepInicial: item.cepInicial || "78300-000",
      cepFinal: item.cepFinal || "78300-150",
      logradourosPrincipais: item.logradourosPrincipais || "",
      distanceKm: item.distanceKm || 2.0,
      avgTimeMin: item.avgTimeMin || 25,
      fee: item.fee || 8.0,
      rainSurcharge: item.rainSurcharge || 3.0,
      minOrderValue: item.minOrderValue || 35.0,
      freeShippingMin: item.freeShippingMin || 120.0,
      active: item.active !== false,
      notes: item.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a região/bairro "${name}" da tabela de frete de Tangará da Serra?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("O nome do bairro é obrigatório!");
      return;
    }

    if (modalMode === "create") {
      createMutation.mutate({
        name: formData.name.trim(),
        zone: formData.zone,
        cep: formData.cep.trim(),
        cepInicial: formData.cepInicial.trim(),
        cepFinal: formData.cepFinal.trim(),
        logradourosPrincipais: formData.logradourosPrincipais.trim(),
        distanceKm: Number(formData.distanceKm),
        avgTimeMin: Number(formData.avgTimeMin),
        fee: Number(formData.fee),
        rainSurcharge: Number(formData.rainSurcharge),
        minOrderValue: Number(formData.minOrderValue),
        freeShippingMin: Number(formData.freeShippingMin),
        active: Boolean(formData.active),
        notes: formData.notes.trim()
      });
    } else if (formData.id) {
      updateMutation.mutate({
        id: formData.id,
        name: formData.name.trim(),
        zone: formData.zone,
        cep: formData.cep.trim(),
        cepInicial: formData.cepInicial.trim(),
        cepFinal: formData.cepFinal.trim(),
        logradourosPrincipais: formData.logradourosPrincipais.trim(),
        distanceKm: Number(formData.distanceKm),
        avgTimeMin: Number(formData.avgTimeMin),
        fee: Number(formData.fee),
        rainSurcharge: Number(formData.rainSurcharge),
        minOrderValue: Number(formData.minOrderValue),
        freeShippingMin: Number(formData.freeShippingMin),
        active: Boolean(formData.active),
        notes: formData.notes.trim()
      });
    }
  };

  // Handlers de Motoboys
  const handleToggleMotoboyStatus = (boy: any) => {
    const nextStatus = boy.status === "disponivel" ? "em_rota" : boy.status === "em_rota" ? "pausa" : "disponivel";
    updateMotoboyMutation.mutate({ id: boy.id, status: nextStatus });
  };

  const handleOpenPrintSettlement = (boy: any) => {
    const dinheiroRecolhido = settlementStats.boyMoneyMap[boy.name] || 0;
    const taxaGanha = boy.accumulatedDeliveryFees > 0 ? boy.accumulatedDeliveryFees : (boy.completedToday * 7.0);
    const diaria = 70.0;
    const saldoLiquido = (diaria + taxaGanha) - dinheiroRecolhido;

    setSelectedSettlementBoy({
      name: boy.name,
      plate: boy.plate,
      completedToday: boy.completedToday,
      diaria,
      taxaGanha,
      dinheiroRecolhido,
      saldoLiquido,
      id: boy.id
    });
    setIsPrintModalOpen(true);
  };

  const handleConfirmSettlement = (boyId: string) => {
    settleMotoboyMutation.mutate({ motoboyId: boyId });
    toast.success("Turno do motoboy liquidado com sucesso no Caixa!");
  };

  // Exportações
  const handleExportCsv = () => {
    if (!neighborhoods.length) {
      toast.error("Nenhum dado disponível para exportação.");
      return;
    }
    const headers = [
      "ID",
      "Bairro",
      "Zona",
      "CEP Padrão",
      "Faixa Inicial",
      "Faixa Final",
      "Logradouros Principais",
      "Distância (KM)",
      "Tempo Médio (Min)",
      "Taxa Padrão (R$)",
      "Sobretaxa Chuva (R$)",
      "Pedido Mínimo (R$)",
      "Frete Grátis Acima (R$)",
      "Status Ativo",
      "Observações"
    ];

    const rows = filteredNeighborhoods.map((b: any) => [
      b.id,
      `"${b.name}"`,
      `"${b.zone}"`,
      b.cep || "78300-000",
      b.cepInicial || "",
      b.cepFinal || "",
      `"${(b.logradourosPrincipais || "").replace(/"/g, '""')}"`,
      b.distanceKm,
      b.avgTimeMin,
      b.fee.toFixed(2),
      b.rainSurcharge.toFixed(2),
      (b.minOrderValue || 0).toFixed(2),
      b.freeShippingMin.toFixed(2),
      b.active ? "ATIVO" : "INATIVO",
      `"${(b.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tabela_ceps_entregas_tangara_da_serra_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Tabela exportada com sucesso em formato CSV (Excel)!");
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(neighborhoods, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_tabela_ceps_tangara_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Backup JSON oficial de Tangará da Serra gerado!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ===================== CABEÇALHO EXECUTIVO ===================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
              LOGÍSTICA &amp; ENTREGAS · TANGARÁ DA SERRA (MT)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface2)] text-[var(--muted)]">
              Faixa: 78300-000 a 78309-999
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Cobertura 100% Homologada
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
              Superior ao Saipos ERP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-blue-600" />
            <span>Central de Logística, Entregas &amp; Motoboys</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Gestão unificada de tarifas por CEP/bairro de Tangará da Serra, frota de entregadores em tempo real e fechamento de turno com emissão de bobina térmica 80mm.
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/entregador"
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-97"
            title="Abrir App PWA do Entregador com rota GPS viária"
          >
            <Bike className="w-4 h-4" />
            <span>App do Entregador (GPS)</span>
          </Link>
          <button
            onClick={() => {
              if (confirm("Deseja restaurar a tabela oficial de Tangará da Serra com todos os 38 bairros e CEPs padrão?")) {
                resetMutation.mutate();
              }
            }}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--ink)] text-xs font-bold text-[var(--ink)] transition flex items-center gap-1.5 cursor-pointer"
            title="Restaurar tabela oficial"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Restaurar 38 Bairros</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--ink)] text-xs font-bold text-[var(--ink)] transition flex items-center gap-1.5 cursor-pointer"
            title="Exportar para Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          {activeMainTab === "bairros" ? (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Bairro</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMotoboyForm({ name: "", phone: "(65) 9", plate: "MT- " });
                setIsMotoboyModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Entregador</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================== BARRA DE ABAS PRINCIPAIS ===================== */}
      <div className="flex border-b border-[var(--line)] gap-2 overflow-x-auto pb-px">
        {[
          { id: "bairros", label: "📍 38 Bairros & CEPs (Tangará MT)", count: stats.total, badgeColor: "bg-blue-500/10 text-blue-600" },
          { id: "frota", label: "🛵 Frota de Entregadores & Tempo Real", count: motoboys.length, badgeColor: "bg-orange-500/10 text-orange-600" },
          { id: "acerto", label: "💰 Acerto de Turno & Fechamento Financeiro", count: settlementStats.totalEntregas, countLabel: "corridas", badgeColor: "bg-emerald-500/10 text-emerald-600" },
          { id: "rotas", label: "🗺️ OEE Logístico & Rotas Viárias Tangará", badgeColor: "bg-purple-500/10 text-purple-600" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
              activeMainTab === tab.id
                ? "border-blue-600 text-blue-600 bg-blue-50/30 dark:bg-blue-950/20"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${tab.badgeColor}`}>
                {tab.count} {tab.countLabel || ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: TABELA DE 38 BAIRROS & CEPS                                       */}
      {/* ========================================================================= */}
      {activeMainTab === "bairros" && (
        <div className="space-y-6">
          {/* CARDS DE MÉTRICAS & INDICADORES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Bairros &amp; CEPs</span>
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-[var(--ink)] font-mono">{stats.total}</div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stats.active} ativos em operação</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Taxa Média de Entrega</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-[var(--ink)] font-mono">{formatBrl(stats.avgFee)}</div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Faixa R$ 6,00 a R$ 22,00</div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Tempo Médio Rota</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[var(--ink)] font-mono">
                {stats.avgTime.toFixed(0)} <span className="text-sm font-normal text-[var(--muted)]">min</span>
              </div>
              <div className="text-[11px] text-blue-600 font-medium">Tangará da Serra 100% Viária</div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Dr. Clima (Chuva)</span>
                <CloudRain className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600 font-mono">+R$ 3,00</div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">Adicional ativo</span>
                <input
                  type="checkbox"
                  checked={rainModeGlobal}
                  onChange={(e) => setRainModeGlobal(e.target.checked)}
                  className="rounded text-blue-600 cursor-pointer"
                  title="Alternar cálculo de chuva na visualização"
                />
              </div>
            </div>
          </div>

          {/* SIMULADOR DE FRETE EM TEMPO REAL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--ink)]">
                  Simulador Instantâneo de Frete por CEP ou Bairro (Tangará da Serra)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                Algoritmo Preditivo Zuma · Superior ao Saipos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                  Digite o CEP ou Nome do Bairro:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={simCep}
                    onChange={(e) => setSimCep(e.target.value)}
                    placeholder="Ex: 78300-200, Centro, Tarumã..."
                    className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                  Valor do Pedido (R$):
                </label>
                <input
                  type="number"
                  value={simOrderValue}
                  onChange={(e) => setSimOrderValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                {simResult?.found ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-[var(--ink)] flex items-center gap-1.5">
                        <span>{simResult.neighborhood?.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600">
                          {simResult.neighborhood?.zone}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {simResult.neighborhood?.distanceKm} km · Prazo: {simResult.estimatedMinutes} min
                      </div>
                    </div>

                    <div className="text-right">
                      {simResult.isFreeShipping ? (
                        <div>
                          <span className="text-xs font-black text-emerald-600 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            FRETE GRÁTIS
                          </span>
                          <div className="text-[9px] text-[var(--muted)] mt-0.5">
                            Pedido &gt;= {formatBrl(simResult.neighborhood?.freeShippingMin || 120)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-base font-black text-[var(--ink)] font-mono">
                            {formatBrl(simResult.fee)}
                          </div>
                          {(simResult as any).rainSurchargeApplied && (
                            <div className="text-[9px] text-sky-600 font-bold flex items-center justify-end gap-0.5">
                              <CloudRain className="w-3 h-3" />
                              <span>Chuva (+R$ 3,00)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--muted)] italic flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Digite um CEP ou nome de bairro de Tangará da Serra para simular...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FILTROS, BUSCA E ORDENAÇÃO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--line)]">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar bairro, CEP ou avenida..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)]"
              >
                {ZONAS_TANGARA.map((z) => (
                  <option key={z} value={z}>
                    Zona: {z}
                  </option>
                ))}
              </select>

              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)]"
              >
                <option value="all">Status: Todos</option>
                <option value="active">Somente Ativos</option>
                <option value="inactive">Somente Inativos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--muted)] flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Ordenar:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)]"
              >
                <option value="dist_asc">Menor Distância (KM)</option>
                <option value="fee_asc">Menor Taxa de Entrega</option>
                <option value="fee_desc">Maior Taxa de Entrega</option>
                <option value="time_asc">Menor Tempo Médio</option>
                <option value="name">Ordem Alfabética</option>
              </select>
            </div>
          </div>

          {/* TABELA DE 38 BAIRROS DE TANGARÁ DA SERRA */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface2)] border-b border-[var(--line)] text-[var(--muted)] font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Bairro / Região</th>
                    <th className="py-3 px-3">Zona</th>
                    <th className="py-3 px-3">Faixa de CEP</th>
                    <th className="py-3 px-3 text-center">Distância</th>
                    <th className="py-3 px-3 text-center">Tempo</th>
                    <th className="py-3 px-3 text-right">Taxa Frete</th>
                    <th className="py-3 px-3 text-right">Modo Chuva</th>
                    <th className="py-3 px-3 text-right">Frete Grátis</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredNeighborhoods.map((item: any) => {
                    const finalFee = rainModeGlobal ? item.fee + item.rainSurcharge : item.fee;
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition group">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-[var(--ink)] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.name}</span>
                          </div>
                          {item.logradourosPrincipais && (
                            <div className="text-[10px] text-[var(--muted)] mt-0.5 line-clamp-1">
                              {item.logradourosPrincipais}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--surface2)] text-[var(--ink)]">
                            {item.zone}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink)]">
                          {item.cepInicial && item.cepFinal ? (
                            <span>{item.cepInicial} a {item.cepFinal}</span>
                          ) : (
                            <span>{item.cep || "78300-000"}</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-[var(--ink)]">
                          {item.distanceKm} km
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-[var(--muted)]">
                          {item.avgTimeMin} min
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-extrabold text-[var(--ink)] text-sm">
                          {formatBrl(item.fee)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-sky-600 font-bold">
                          {formatBrl(finalFee)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">
                          {formatBrl(item.freeShippingMin)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {item.active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-stone-500 bg-stone-500/10 px-2 py-0.5 rounded-full">
                              Pausado
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-[var(--line)] hover:border-blue-500 text-[var(--muted)] hover:text-blue-600 transition cursor-pointer"
                              title="Editar parâmetros do bairro"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 rounded-lg border border-[var(--line)] hover:border-red-500 text-[var(--muted)] hover:text-red-600 transition cursor-pointer"
                              title="Excluir bairro da tabela"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: FROTA DE ENTREGADORES & DESPACHO EM TEMPO REAL                      */}
      {/* ========================================================================= */}
      {activeMainTab === "frota" && (
        <div className="space-y-6">
          {/* CARDS DE INDICADORES DA FROTA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Total de Entregadores</span>
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-[var(--ink)] font-mono">{motoboys.length}</div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{motoboys.filter((m: any) => m.status !== "pausa").length} ativos no turno</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Entregadores em Rota</span>
                <Bike className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-600 font-mono">
                {motoboys.filter((m: any) => m.status === "em_rota").length}
              </div>
              <div className="text-[11px] text-[var(--muted)]">Rotas ativas em Tangará</div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Disponíveis no Salão</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {motoboys.filter((m: any) => m.status === "disponivel").length}
              </div>
              <div className="text-[11px] text-[var(--muted)]">Prontos p/ novo despacho</div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Total Corridas Hoje</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {settlementStats.totalEntregas}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                Média {motoboys.length > 0 ? (settlementStats.totalEntregas / motoboys.length).toFixed(1) : 0} por motoboy
              </div>
            </div>
          </div>

          {/* LISTAGEM DOS ENTREGADORES EM CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {motoboys.map((boy: any) => {
              const cleanPhone = boy.phone ? boy.phone.replace(/\D/g, "") : "";
              const whatsappUrl = `https://wa.me/55${cleanPhone}`;
              return (
                <div key={boy.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4 hover:border-orange-500/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 font-black flex items-center justify-center text-lg border border-orange-500/20">
                        {boy.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[var(--ink)] leading-tight">{boy.name}</h4>
                        <div className="text-xs text-[var(--muted)] font-mono mt-0.5">{boy.plate}</div>
                      </div>
                    </div>

                    <div>
                      {boy.status === "em_rota" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black animate-pulse border border-blue-500/20">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                          Em Rota
                        </span>
                      ) : boy.status === "disponivel" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-500/10 text-stone-600 text-[10px] font-black border border-stone-500/20">
                          Pausa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--surface2)] rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Entregas Hoje:</span>
                      <span className="text-base font-black text-[var(--ink)] font-mono">{boy.completedToday || 0} corridas</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Taxas Ganhas:</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{formatBrl(boy.accumulatedDeliveryFees || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-600/20"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleToggleMotoboyStatus(boy)}
                      className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--ink)] text-xs font-bold text-[var(--ink)] transition cursor-pointer"
                      title="Alternar status do entregador"
                    >
                      Status
                    </button>

                    <button
                      onClick={() => handleOpenPrintSettlement(boy)}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Simular e imprimir acerto do entregador"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Acerto</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: FECHAMENTO & ACERTO DE TURNO DE DELIVERY                            */}
      {/* ========================================================================= */}
      {activeMainTab === "acerto" && (
        <div className="space-y-6">
          {/* RESUMO CONSOLIDADO FINANCEIRO */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Fechamento de Caixa &amp; Conciliação de Motoboys (Turno Atual)
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Cálculo automático de diárias fixas, repasse de taxas de frete de Tangará e prestação de contas de dinheiro vivo recebido na porta.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  TURNO EM ANDAMENTO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Entregas Totais:</span>
                <span className="text-xl font-black text-[var(--ink)] font-mono">{settlementStats.totalEntregas}</span>
              </div>

              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Taxas Acumuladas:</span>
                <span className="text-xl font-black text-emerald-600 font-mono">{formatBrl(settlementStats.totalTaxas)}</span>
              </div>

              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Diárias Devidas (R$ 70):</span>
                <span className="text-xl font-black text-[var(--ink)] font-mono">{formatBrl(settlementStats.totalDiarias)}</span>
              </div>

              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-red-600 uppercase block">Dinheiro em Mãos:</span>
                <span className="text-xl font-black text-red-600 font-mono">{formatBrl(settlementStats.totalDinheiroRecolhido)}</span>
              </div>

              <div className="p-3 bg-[var(--surface)] border border-emerald-500/30 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Saldo Geral Equipe:</span>
                <span className="text-xl font-black text-emerald-600 font-mono">{formatBrl(settlementStats.saldoGeralLiquido)}</span>
              </div>
            </div>
          </div>

          {/* TABELA DE ACERTO INDIVIDUAL POR ENTREGADOR */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-black text-[var(--ink)]">Conciliação Individual por Motoboy</h4>
              </div>
              <span className="text-xs text-[var(--muted)]">Supera o Saipos com fechamento e impressão em 1 toque</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface2)] border-b border-[var(--line)] text-[var(--muted)] font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Entregador &amp; Moto</th>
                    <th className="py-3 px-3 text-center">Corridas</th>
                    <th className="py-3 px-3 text-right">Diária Fixa</th>
                    <th className="py-3 px-3 text-right">Taxas de Entrega</th>
                    <th className="py-3 px-3 text-right">Dinheiro Cobrado</th>
                    <th className="py-3 px-3 text-right">Saldo Líquido</th>
                    <th className="py-3 px-3 text-center">Status Fechamento</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {motoboys.map((boy: any) => {
                    const dinheiroRecolhido = settlementStats.boyMoneyMap[boy.name] || 0;
                    const taxaGanha = boy.accumulatedDeliveryFees > 0 ? boy.accumulatedDeliveryFees : (boy.completedToday * 7.0);
                    const diaria = 70.0;
                    const saldoLiquido = (diaria + taxaGanha) - dinheiroRecolhido;

                    return (
                      <tr key={boy.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-[var(--ink)] flex items-center gap-2">
                            <Bike className="w-4 h-4 text-orange-500" />
                            <span>{boy.name}</span>
                          </div>
                          <div className="text-[10px] text-[var(--muted)] font-mono pl-6">{boy.plate} · {boy.phone}</div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-black text-[var(--ink)]">
                          {boy.completedToday || 0}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-[var(--ink)]">
                          {formatBrl(diaria)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-emerald-600 font-bold">
                          {formatBrl(taxaGanha)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-red-600 font-bold">
                          {formatBrl(dinheiroRecolhido)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-black text-sm">
                          {saldoLiquido >= 0 ? (
                            <span className="text-emerald-600">+{formatBrl(saldoLiquido)}</span>
                          ) : (
                            <span className="text-red-600">Devolve {formatBrl(Math.abs(saldoLiquido))}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {boy.shiftSettled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Liquidado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPrintSettlement(boy)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-97 shadow-xs"
                              title="Emitir comprovante térmico de acerto 80mm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Bobina 80mm</span>
                            </button>
                            {!boy.shiftSettled && (
                              <button
                                onClick={() => handleConfirmSettlement(boy.id)}
                                className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                                title="Marcar como liquidado no caixa"
                              >
                                Liquidar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: OEE LOGÍSTICO & ROTAS VIÁRIAS DE TANGARÁ                           */}
      {/* ========================================================================= */}
      {activeMainTab === "rotas" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <Map className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  Corredores Viários e OEE Logístico de Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Tempos médios de rota e eficiência de entrega partindo do Zuma Culinária Oriental na Av. Brasil.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <span>Eixo 1: Centro &amp; Jd. Europa</span>
                  <span className="text-emerald-600 font-mono font-black">12 a 18 min</span>
                </div>
                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[88%]"></div>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  Trânsito fluido pela Av. Brasil e Av. Tancredo Neves. Taxa padrão R$ 6,00 a R$ 8,00.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <span>Eixo 2: Cidade Alta &amp; Tarumã</span>
                  <span className="text-blue-600 font-mono font-black">20 a 28 min</span>
                </div>
                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[72%]"></div>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  Conexão via Av. Ismael José do Nascimento e Anel Viário. Taxa padrão R$ 8,00 a R$ 10,00.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <span>Eixo 3: Parque Universitário &amp; IFMT</span>
                  <span className="text-amber-600 font-mono font-black">28 a 40 min</span>
                </div>
                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[54%]"></div>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  Acesso pela MT-358 sentido Unemat / Distrito Industrial. Taxa padrão R$ 14,00 a R$ 22,00.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL DE CADASTRO/EDIÇÃO DE BAIRROS ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-black text-[var(--ink)]">
                  {modalMode === "create" ? "Cadastrar Novo Bairro / CEP em Tangará" : `Editar Parâmetros: ${formData.name}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome do Bairro */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Nome do Bairro / Região:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Jardim Tangará II"
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Zona de Tangará */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Zona Geográfica:
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)]"
                  >
                    {ZONAS_TANGARA.filter((z) => z !== "TODAS").map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CEP Padrão */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    CEP Padrão / Central:
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="78300-000"
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Faixa Inicial e Final */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                      Faixa Inicial:
                    </label>
                    <input
                      type="text"
                      value={formData.cepInicial}
                      onChange={(e) => setFormData({ ...formData, cepInicial: e.target.value })}
                      placeholder="78300-000"
                      className="w-full px-2.5 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                      Faixa Final:
                    </label>
                    <input
                      type="text"
                      value={formData.cepFinal}
                      onChange={(e) => setFormData({ ...formData, cepFinal: e.target.value })}
                      placeholder="78300-150"
                      className="w-full px-2.5 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                    />
                  </div>
                </div>

                {/* Logradouros Principais */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Logradouros e Avenidas Principais:
                  </label>
                  <input
                    type="text"
                    value={formData.logradourosPrincipais}
                    onChange={(e) => setFormData({ ...formData, logradourosPrincipais: e.target.value })}
                    placeholder="Ex: Av. Brasil, Rua Júlio Martinez Benevides, Av. Mauá..."
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Distância e Tempo Médio */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Distância da Cozinha (KM):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Tempo Médio Entrega (Minutos):
                  </label>
                  <input
                    type="number"
                    value={formData.avgTimeMin}
                    onChange={(e) => setFormData({ ...formData, avgTimeMin: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                  />
                </div>

                {/* Taxa Padrão e Sobretaxa Chuva */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Taxa de Entrega Padrão (R$):
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Sobretaxa Chuva Dr. Clima (R$):
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.rainSurcharge}
                    onChange={(e) => setFormData({ ...formData, rainSurcharge: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-sky-600"
                  />
                </div>

                {/* Frete Grátis e Pedido Mínimo */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Frete Grátis a Partir de (R$):
                  </label>
                  <input
                    type="number"
                    step="5.00"
                    value={formData.freeShippingMin}
                    onChange={(e) => setFormData({ ...formData, freeShippingMin: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Pedido Mínimo p/ Delivery (R$):
                  </label>
                  <input
                    type="number"
                    step="5.00"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                  />
                </div>

                {/* Status Ativo */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="active_check"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="active_check" className="text-xs font-bold text-[var(--ink)] cursor-pointer">
                    Bairro ativo para entregas e tele-entrega própria Zuma
                  </label>
                </div>

                {/* Observações Operacionais */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">
                    Observações Operacionais para os Motoboys:
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Instruções de acesso, segurança, trechos sem asfalto..."
                    className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvando..."
                    : modalMode === "create"
                    ? "Salvar Novo Bairro"
                    : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL DE CADASTRO DE MOTOBOY ===================== */}
      {isMotoboyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-[var(--ink)]">Cadastrar Novo Entregador</h3>
              </div>
              <button onClick={() => setIsMotoboyModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!motoboyForm.name.trim()) {
                  toast.error("O nome do entregador é obrigatório!");
                  return;
                }
                createMotoboyMutation.mutate(motoboyForm);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={motoboyForm.name}
                  onChange={(e) => setMotoboyForm({ ...motoboyForm, name: e.target.value })}
                  placeholder="Ex: Matheus Guimarães"
                  className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">WhatsApp / Celular:</label>
                <input
                  type="text"
                  required
                  value={motoboyForm.phone}
                  onChange={(e) => setMotoboyForm({ ...motoboyForm, phone: e.target.value })}
                  placeholder="(65) 99988-7766"
                  className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono font-bold text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">Veículo &amp; Placa:</label>
                <input
                  type="text"
                  required
                  value={motoboyForm.plate}
                  onChange={(e) => setMotoboyForm({ ...motoboyForm, plate: e.target.value })}
                  placeholder="QBN-3044 (Honda Titan 160)"
                  className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-mono text-[var(--ink)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMotoboyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMotoboyMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-sm"
                >
                  {createMotoboyMutation.isPending ? "Salvando..." : "Salvar Entregador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL DE IMPRESSÃO TÉRMICA DE FECHAMENTO ===================== */}
      {isPrintModalOpen && selectedSettlementBoy && (
        <ImpressaoTermicaModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          tipoComanda="acerto_motoboy"
          titulo={`Fechamento Turno: ${selectedSettlementBoy.name}`}
          motoboyNome={selectedSettlementBoy.name}
          motoboyPlaca={selectedSettlementBoy.plate}
          qtdEntregas={selectedSettlementBoy.completedToday}
          diariaFixa={selectedSettlementBoy.diaria}
          taxaEntrega={selectedSettlementBoy.taxaGanha}
          dinheiroRecebido={selectedSettlementBoy.dinheiroRecolhido}
          saldoLiquido={selectedSettlementBoy.saldoLiquido}
        />
      )}
    </div>
  );
}
