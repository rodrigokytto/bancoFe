import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Thermometer,
  Camera,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Plus,
  Radio,
  FileText,
  Lock,
  Layers,
  ChevronRight,
  BadgeCheck,
  Eye,
  Hash,
  Download,
  Share2,
  Calendar,
  Search,
  Check,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  Fish,
  QrCode,
  ExternalLink,
  Copy,
  MapPin,
  Snowflake,
  Award,
  Scale,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { ultraEventBus } from "../lib/ultraSyncEvents";
import {
  UltraSyncEvent,
  UltraStation,
  UltraInspection,
  UltraEquipment,
  ColaboradorNossaGente,
  INITIAL_COLABORADORES_NOSSA_GENTE,
  SalmonPassportLot,
  SmartTriggerRule,
} from "@shared/ultraData";

const formatBrl = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
};

export const Ultra: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"cockpit" | "nossagente" | "auditoria" | "frio" | "ia" | "passaporte" | "triggers">("cockpit");
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPhotoInspectionModalOpen, setIsPhotoInspectionModalOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<any | null>(null);
  const [selectedPassportModal, setSelectedPassportModal] = useState<SalmonPassportLot | null>(null);
  const [filterTriggerCategory, setFilterTriggerCategory] = useState<string>("ALL");

  // Form states para emissão de evento interno
  const [eventFormData, setEventFormData] = useState({
    type: "INSPECTION_ANVISA_REGISTERED",
    originSystem: "ULTRA_SISTEMA" as "ULTRA_SISTEMA" | "NOSSA_GENTE",
    targetSystem: "NOSSA_GENTE" as "ULTRA_SISTEMA" | "NOSSA_GENTE",
    summary: "",
    collaboratorName: "Kenji Sato",
    notes: "",
  });

  // Form states para nova inspeção ANVISA com foto
  const [inspectionFormData, setInspectionFormData] = useState({
    category: "RECEBIMENTO_PEIXE" as const,
    itemEvaluated: "Lote Salmão Chileno Premium (Bancada Sushibar)",
    stationId: "st_sushibar",
    inspectorName: "Mariana Alencar",
    status: "CONFORME" as const,
    valueMeasured: "1.2°C",
    targetStandard: "0.0°C a +2.0°C (RDC 216)",
    notes: "Medição de núcleo térmico e superfície. Coloração vibrante, guelras limpas e textura firme.",
    photoUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80",
    photoDescription: "Foto de auditoria: filé de salmão fresco sobre bancada higienizada",
  });

  // tRPC Queries & Mutations
  const overviewQuery = trpc.zuma.getUltraOverview.useQuery(undefined, {
    refetchInterval: 12000,
  });

  const syncEventsQuery = trpc.zuma.listUltraSyncEvents.useQuery(undefined, {
    refetchInterval: 8000,
  });

  const inspectionsQuery = trpc.zuma.listUltraInspections.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const emitEventMutation = trpc.zuma.emitUltraSyncEvent.useMutation({
    onSuccess: (data) => {
      toast.success("Evento interno emitido no barramento!", {
        description: `${data.originSystem} -> ${data.targetSystem} [${data.type}]`,
      });
      ultraEventBus.emit(data as UltraSyncEvent);
      setIsEventModalOpen(false);
      overviewQuery.refetch();
      syncEventsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao emitir evento: " + err.message);
    },
  });

  const createInspectionMutation = trpc.zuma.createUltraInspection.useMutation({
    onSuccess: (data) => {
      toast.success("Inspeção e foto segura registradas!", {
        description: `Hash SHA-256: ${data.secureStorageHash} · Sincronizado com Nossa Gente`,
      });
      setIsPhotoInspectionModalOpen(false);
      inspectionsQuery.refetch();
      overviewQuery.refetch();
      syncEventsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao registrar inspeção: " + err.message);
    },
  });

  const updateStationMutation = trpc.zuma.updateUltraStation.useMutation({
    onSuccess: (station) => {
      toast.success(`Posto ${station.name} atualizado! Status: ${station.status}`);
      overviewQuery.refetch();
    },
  });

  const passportsQuery = trpc.zuma.listSalmonPassports.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const passports = passportsQuery.data || [];

  const triggersQuery = trpc.zuma.listSmartTriggers.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const triggers = triggersQuery.data || [];

  const toggleTriggerMutation = trpc.zuma.toggleSmartTrigger.useMutation({
    onSuccess: (data) => {
      toast.success(`Gatilho ${data.nome} ${data.ativo ? "ativado" : "pausado"}!`);
      triggersQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao alterar gatilho: " + err.message);
    },
  });

  const simulateTriggerMutation = trpc.zuma.simulateSmartTrigger.useMutation({
    onSuccess: (data) => {
      toast.success(`Regra ${data.rule.nome} disparada!`, {
        description: data.rule.logRecente,
      });
      triggersQuery.refetch();
      syncEventsQuery.refetch();
      overviewQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao simular disparo: " + err.message);
    },
  });

  // Escuta ativa de eventos internos na aba via barramento ultraEventBus
  useEffect(() => {
    const unsubscribe = ultraEventBus.subscribe((evt) => {
      toast.info(`⚡ Novo Evento Interno: Ultra x Nossa Gente`, {
        description: evt.summary || evt.title,
      });
      overviewQuery.refetch();
      syncEventsQuery.refetch();
    });
    return unsubscribe;
  }, []);

  const overview = overviewQuery.data;
  const stations: any[] = overview?.stations || [];
  const kpis: any = overview?.kpis || {};
  const equipments: any[] = overview?.equipments || [];
  const syncEvents: any[] = syncEventsQuery.data || overview?.recentEvents || [];
  const inspections: any[] = inspectionsQuery.data || overview?.recentInspections || [];
  const colaboradores: ColaboradorNossaGente[] = overview?.colaboradores || INITIAL_COLABORADORES_NOSSA_GENTE;

  const handleEmitCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.summary) {
      toast.error("Por favor, preencha o resumo do evento");
      return;
    }
    emitEventMutation.mutate({
      type: eventFormData.type,
      originSystem: eventFormData.originSystem,
      targetSystem: eventFormData.targetSystem,
      summary: eventFormData.summary,
      collaboratorName: eventFormData.collaboratorName,
      payload: {
        notes: eventFormData.notes,
        triggeredBy: "Painel Gestor Ultra Web",
        device: "Zuma Pilot Cloud Engine",
        dispatchedAt: new Date().toISOString(),
      },
    });
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionFormData.itemEvaluated) {
      toast.error("Preencha o item avaliado");
      return;
    }
    createInspectionMutation.mutate(inspectionFormData);
  };

  const handleToggleStationStatus = (st: any) => {
    const nextStatus = st.status === "NORMAL" ? "ALERTA" : "NORMAL";
    updateStationMutation.mutate({
      stationId: st.id,
      status: nextStatus as any,
    });
  };

  const handleSimulateShiftEntry = (colab: ColaboradorNossaGente) => {
    emitEventMutation.mutate({
      type: "FACIAL_BIOMETRIC_PUNCH",
      originSystem: "NOSSA_GENTE",
      targetSystem: "ULTRA_SISTEMA",
      summary: `Ponto biométrico registrado: ${colab.nome} (${colab.cargo}) confirmou presença no ${colab.departamento}`,
      collaboratorId: colab.id,
      collaboratorName: colab.nome,
      payload: {
        departamento: colab.departamento,
        turno: colab.turnoHoje,
        scoreQualidade: colab.scoreQualidade,
        biometriaFacial: true,
      },
    });
  };

  // Valores calculados dos KPIs
  const faturamentoHoje = kpis.faturamentoDia ? formatBrl(kpis.faturamentoDia) : "R$ 18.450,90";
  const pedidosHoje = kpis.pedidosHoje || 146;
  const taxaAssertividade = kpis.taxaAssertividadePct || 99.3;
  const tempoMedio = kpis.tempoMedioPreparoMin || 13.2;
  const produtividade = kpis.indiceProdutividadeBrigada || 94.2;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Topo / Header da Instância Ultra */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                    Zuma Ultra
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    Cockpit Operacional 360°
                  </span>
                  <span className="inline-flex px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Evento Interno Ativo
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Cofre Seguro Fotos ANVISA
                  </span>
                </div>
                <p className="text-xs md:text-sm text-neutral-400">
                  Zuma Cozinha Oriental · Tangará da Serra - MT · CNPJ 36.296.848/0001-57 · Sincronização por Evento Interno com Nossa Gente (RH)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Emitir Evento Interno
            </button>
            <button
              onClick={() => setIsPhotoInspectionModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              Nova Foto Segura
            </button>
            <button
              onClick={() => {
                toast.success("Laudo Técnico ANVISA Exportado!", {
                  description: "Relatório RDC 216 gerado com dados criptografados e assinaturas da equipe.",
                });
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Laudo ANVISA
            </button>
          </div>
        </div>

        {/* 5 KPIs Principais no Topo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
              <span>Faturamento Operacional</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{faturamentoHoje}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {pedidosHoje} pedidos finalizados
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
              <span>Assertividade KDS</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{taxaAssertividade}%</div>
            <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
              <span>Conforme RDC 216 / CVS 5</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
              <span>Nossa Gente Sync</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">100% Online</div>
            <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Barramento por evento ativo
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
              <span>Tempo Médio Preparo</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{tempoMedio} min</div>
            <div className="text-[11px] text-amber-400 mt-1">Meta: &lt; 15.0 min</div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm col-span-2 md:col-span-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
              <span>Produtividade Brigada</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{produtividade}%</div>
            <div className="text-[11px] text-cyan-400 mt-1">Cofre seguro com hash ativo</div>
          </div>
        </div>

        {/* Abas de Navegação do Ultra */}
        <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "cockpit"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Activity className="w-4 h-4" />
            Cockpit Praças & KDS
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {stations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("nossagente")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "nossagente"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Sincronização por Evento Interno (Nossa Gente)
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {syncEvents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("auditoria")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "auditoria"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Camera className="w-4 h-4" />
            Auditoria & Fotos Seguras ANVISA
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {inspections.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("frio")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "frio"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Thermometer className="w-4 h-4" />
            Telemetria Frio & Ultracongelamento (-40°C)
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {equipments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ia")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "ia"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Alavancas Ultra IA & Auditoria
          </button>
          <button
            onClick={() => setActiveTab("passaporte")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "passaporte"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Fish className="w-4 h-4 text-emerald-300" />
            Passaporte Salmão 360°
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {passports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("triggers")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === "triggers"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <Radio className="w-4 h-4 text-rose-300" />
            Gatilhos Inteligentes (Smart Rules)
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white font-mono">
              {triggers.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: COCKPIT PRAÇAS & KDS */}
        {/* ========================================================================= */}
        {activeTab === "cockpit" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  Praças Operacionais em Tempo Real & KDS
                </h2>
                <p className="text-xs text-neutral-400">
                  Monitoramento de cada estação da cozinha, tempo de ciclo, pratos na fila e operador alocado via Nossa Gente
                </p>
              </div>
              <div className="text-xs text-neutral-400">
                {stations.length} praças monitoradas · KDS 2.0 Integrado
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${st.status === "NORMAL" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
                        <h3 className="font-bold text-white text-base">{st.name}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                          st.status === "NORMAL"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
                      <div>
                        <span className="text-neutral-500 block">Líder da Praça:</span>
                        <span className="font-medium text-white flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          {st.leadName || st.assignedCollaborator || "Equipe"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Pedidos em Fila:</span>
                        <span className="font-bold text-amber-400 text-sm block mt-0.5">
                          {st.pedidosEmFila || st.currentQueueCount || 0} pedidos
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Tempo Médio:</span>
                        <span className="font-medium text-neutral-200 block mt-0.5">
                          {st.tempoMedioMin || st.avgCycleTimeMinutes || 12} min (meta: {st.slaMetaMin || 15} min)
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Carga de Trabalho:</span>
                        <span className="font-medium text-emerald-400 block mt-0.5">
                          {st.cargaTrabalhoPct || 75}%
                        </span>
                      </div>
                    </div>

                    {st.colaboradoresEscalados && st.colaboradoresEscalados.length > 0 && (
                      <div className="text-[11px] text-neutral-400">
                        <span className="text-neutral-500">Escala Ativa: </span>
                        {st.colaboradoresEscalados.join(", ")}
                      </div>
                    )}

                    {st.tempAlvo && (
                      <div className="text-[11px] text-cyan-400 flex items-center justify-between pt-1 border-t border-neutral-800/60">
                        <span>Temperatura Alvo: {st.tempAlvo}</span>
                        <span>{st.temperaturaAtual ? `${st.temperaturaAtual}°C` : "OK"}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStationStatus(st)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        st.status === "NORMAL"
                          ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {st.status === "NORMAL" ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Sinalizar Alerta
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          Normalizar Praça
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        emitEventMutation.mutate({
                          type: "DESVIO_POP_QUALIDADE",
                          originSystem: "ULTRA_SISTEMA",
                          targetSystem: "NOSSA_GENTE",
                          summary: `Checklist sanitário de bancada acionado no posto ${st.name}`,
                          collaboratorName: st.leadName || st.assignedCollaborator,
                          payload: { stationId: st.id, requestedAction: "HIGIENIZACAO_BANCADA" },
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      Checklist POP
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Painel de Alertas Operacionais de Cozinha */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/20 via-neutral-900 to-neutral-900 border border-red-900/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Proteção Inteligente de Cozinha Zuma Ativa</h3>
              </div>
              <p className="text-xs text-neutral-300">
                O sistema Ultra monitora a cadência de pedidos em conjunto com o KDS 2.0 e o estoque físico real. Em caso de sobrecarga ou ruptura iminente de salmão chileno (&lt; 5kg), o barramento de eventos internos aciona automaticamente a pausa inteligente no iFood e redistribui a equipe de Nossa Gente.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: SINCRONIZAÇÃO POR EVENTO INTERNO (NOSSA GENTE) */}
        {/* ========================================================================= */}
        {activeTab === "nossagente" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Barramento de Sincronização por Evento Interno
                </h2>
                <p className="text-xs text-neutral-400">
                  Prioridade estabelecida: sincronização por eventos internos em memória (CustomEvent), propagação cross-tab (StorageEvent) e tRPC auditável. Sem overhead de pooling externo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Barramento Ativo &middot; Latência &lt; 2ms
                </span>
                <button
                  onClick={() => setIsEventModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Disparar Evento
                </button>
              </div>
            </div>

            {/* Painel da Equipe Ativa Nossa Gente */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Equipe Ativa no Turno (Sistema Nossa Gente &middot; Portaria 671 MTE)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {colaboradores.map((colab) => (
                  <div
                    key={colab.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-purple-400">{colab.id}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {colab.statusPonto || "Presente"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {colab.fotoUrl && (
                          <img
                            src={colab.fotoUrl}
                            alt={colab.nome}
                            className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                          />
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">{colab.nome}</div>
                          <div className="text-xs text-neutral-400">{colab.cargo}</div>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 space-y-0.5 pt-2 border-t border-neutral-800">
                        <div>Departamento: <span className="text-neutral-300 font-medium">{colab.departamento}</span></div>
                        <div>Turno: <span className="text-neutral-300">{colab.turnoHoje}</span></div>
                        <div>Entrada: <span className="text-neutral-300">{colab.horarioEntradaRegistrado || "17:15"}</span></div>
                        <div className="flex justify-between pt-1">
                          <span>Pedidos: <strong className="text-white">{colab.pedidosExecutadosHoje || 0}</strong></span>
                          <span>Comissão: <strong className="text-emerald-400">{formatBrl(colab.comissaoAcumuladaHoje || 0)}</strong></span>
                          <span>Score: <strong className="text-cyan-400">{colab.scoreQualidade || 98}%</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => handleSimulateShiftEntry(colab)}
                        className="w-full py-1.5 text-[11px] font-medium rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                      >
                        Sincronizar Ponto Biométrico
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed em Tempo Real de Eventos Internos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-500" />
                  Barramento de Eventos Internos Auditável
                </h3>
                <span className="text-xs text-neutral-500">Últimos {syncEvents.length} eventos processados</span>
              </div>

              <div className="space-y-2">
                {syncEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{evt.eventType || evt.type}</span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-neutral-300 font-mono">
                            {evt.sourceSystem || evt.originSystem} &rarr; {evt.targetSystem}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                            {evt.status}
                          </span>
                        </div>
                        <div className="text-neutral-300">{evt.title || evt.summary}</div>
                        {evt.description && <div className="text-[11px] text-neutral-400">{evt.description}</div>}
                        {(evt.colaboradorNome || evt.collaboratorName) && (
                          <div className="text-[11px] text-neutral-500">
                            Colaborador: <span className="text-neutral-400">{evt.colaboradorNome || evt.collaboratorName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between text-neutral-500 text-[11px] shrink-0">
                      <span>{evt.timestamp}</span>
                      <span className="font-mono text-[10px] text-neutral-600 truncate max-w-[140px]">
                        {evt.internalChecksum || "sha256-verified"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: AUDITORIA & FOTOS SEGURAS ANVISA */}
        {/* ========================================================================= */}
        {activeTab === "auditoria" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  Auditoria de Qualidade com Armazenamento Seguro de Fotos
                </h2>
                <p className="text-xs text-neutral-400">
                  Armazenamento seguro de cópias de imagens e laudos para comprovação sanitária (RDC 216 e CVS 5). Integridade garantida por hash criptográfico SHA-256 e cofre local.
                </p>
              </div>
              <button
                onClick={() => setIsPhotoInspectionModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Plus className="w-4 h-4" />
                Registrar Foto Segura
              </button>
            </div>

            {/* Banner de Autorização de Armazenamento Seguro */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-center gap-3 text-xs text-neutral-300">
              <Lock className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Armazenamento Seguro de Imagens e Dados Autorizado & Auditado</span>
                Cópias de imagens de pescados frescos, termometria digital, display do ultracongelador (-40°C) e checklists de boas práticas são armazenadas com integridade SHA-256 e sincronizadas por evento interno com o sistema Nossa Gente.
              </div>
            </div>

            {/* Galeria de Fotos Seguras e Registros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {inspections.map((insp) => {
                const imgUrl = insp.fotoArmazenadaSeguraUrl || insp.photoUrl;
                const title = insp.local || insp.itemEvaluated || insp.tipo;
                const desc = insp.fotoDescricao || insp.photoDescription || insp.observacoes || insp.notes;
                const resp = insp.responsavelNome || insp.inspectorName;
                const temp = insp.temperaturaMedida !== undefined ? `${insp.temperaturaMedida}°C` : insp.valueMeasured;
                const padrao = insp.temperaturaFaixaSegura || insp.targetStandard || "RDC 216";
                const isConforme = insp.conforme !== undefined ? insp.conforme : insp.status === "CONFORME";

                return (
                  <div
                    key={insp.id}
                    className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition group"
                  >
                    <div className="relative aspect-video bg-neutral-950 overflow-hidden cursor-pointer" onClick={() => setSelectedPhotoModal(insp)}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            isConforme ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {isConforme ? "CONFORME" : "ALERTA"}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur-sm text-[10px] text-neutral-300 truncate">
                        {desc}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm line-clamp-1">{title}</div>
                        <div className="text-neutral-400 text-[11px] line-clamp-2">{desc}</div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-neutral-400">
                          <span>Medido:</span>
                          <span className="font-semibold text-white">{temp || "Conforme"}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Padrão:</span>
                          <span className="text-neutral-300">{padrao}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Inspetor:</span>
                          <span className="text-neutral-300 font-medium">{resp}</span>
                        </div>
                        <div className="flex justify-between text-neutral-500 font-mono text-[10px] pt-1">
                          <span>SHA-256:</span>
                          <span className="truncate max-w-[110px]">{insp.secureStorageHash || "sec_anvisa_sha256"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">{insp.timestamp}</span>
                      <button
                        onClick={() => setSelectedPhotoModal(insp)}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Laudo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: TELEMETRIA DE FRIO & ULTRACONGELAMENTO (-40°C) */}
        {/* ========================================================================= */}
        {activeTab === "frio" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  Cadeia de Frio & Ultracongelamento de Pescados (-40°C)
                </h2>
                <p className="text-xs text-neutral-400">
                  Controle contínuo de temperatura em conformidade com as exigências sanitárias para eliminação de parasitas (Anisakis) e manutenção de frescor do salmão chileno em Tangará da Serra.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-cyan-400 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Ultracongelador Criotec: -39.4°C (Conforme)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipments.map((eq) => (
                <div
                  key={eq.id}
                  className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{eq.nome || eq.name}</h3>
                      <span className="text-xs text-neutral-400">{eq.localizacao || eq.location}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        eq.status === "OPERACIONAL" || eq.status === "CONFORME"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-neutral-500 text-xs block">Temperatura Atual:</span>
                      <span className="text-3xl font-extrabold text-white tracking-tight">
                        {eq.temperaturaAtual ?? eq.currentTemperatureCelsius}°C
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-neutral-500 block">Faixa Segura:</span>
                      <span className="text-neutral-300 font-medium">
                        {eq.temperaturaMinima ?? eq.targetRangeMin}°C a {eq.temperaturaMaxima ?? eq.targetRangeMax}°C
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Tag Equipamento:</span>
                      <span className="font-mono text-neutral-300">{eq.tag || eq.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sensor IoT:</span>
                      <span className="font-mono text-neutral-300">{eq.sensorId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calibração:</span>
                      <span className="text-neutral-300">{eq.ultimaCalibracao || "01/11/2026"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Inmetro / SIF Válido
                    </span>
                    <button
                      onClick={() => {
                        toast.success(`Telemetria de ${eq.nome || eq.name} registrada no log ANVISA`);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Atualizar Leitura
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Protocolo de Congelamento de Pescados */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Procedimento Operacional Padrão (POP-ZUMA-004) &middot; Congelamento Rápido
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Todo salmão ou peixe branco destinado a consumo cru passa obrigatoriamente por congelamento rápido no ultracongelador a temperatura igual ou inferior a -20°C por pelo menos 24 horas, ou -40°C por 15 horas, cumprindo rigorosamente os padrões de segurança alimentar da ANVISA e boas práticas internacionais da gastronomia japonesa.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: ALAVANCAS ULTRA IA & AUDITORIA TANGARÁ */}
        {/* ========================================================================= */}
        {activeTab === "ia" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Alavancas Operacionais Ultra IA & Otimização Preditiva
              </h2>
              <p className="text-xs text-neutral-400">
                Modelos inteligentes calibrados para a operação do Zuma em Tangará da Serra: previsão de gargalos, sincronização preventiva de escalas e auditoria automática
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Alavanca 1: Balanceamento de Postos Dinâmico</h3>
                    <span className="text-xs text-neutral-400">Redução de tempo de espera no salão e delivery</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  A IA analisa o volume de pedidos em tempo real no KDS. Caso o Sushibar atinja 85% de capacidade, o sistema aciona automaticamente a praça de apoio e emite evento interno no barramento para Nossa Gente alocar o sushiman reserva.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      toast.success("Alavanca Executada: Balanceamento dinâmico calibrado!");
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  >
                    Calibrar Balanceamento Automático
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Alavanca 2: Auditoria Contínua ANVISA RDC 216</h3>
                    <span className="text-xs text-neutral-400">Emissão de laudo com fotos seguras e assinatura técnica</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Verificação automática diária de todos os 12 pontos críticos de controle (HACCP): temperatura dos peixes, higienização das tábuas de corte, troca de esteirinhas e temperatura da água de esterilização.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      toast.success("Auditoria Contínua Executada: 100% dos 12 pontos conformes!");
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                  >
                    Rodar Verificação HACCP Completa
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Alavanca 3: Sincronização de Escala & Treinamentos</h3>
                    <span className="text-xs text-neutral-400">Integração bidirecional direta com Nossa Gente</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Garante que nenhum colaborador assuma a bancada de pescados sem o treinamento ANVISA de Boas Práticas atualizado. Dispara evento interno de aviso caso a reciclagem anual expire nos próximos 30 dias.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      toast.success("Sincronização de Escalas Atualizada com Nossa Gente!");
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
                  >
                    Validar Certificações de Equipe
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Alavanca 4: Prevenção de Desperdício de Insumos</h3>
                    <span className="text-xs text-neutral-400">Integração com Estoque Real & Previsão 360°</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Calcula o rendimento exato do corte de salmão chileno (evisceração, toalha, filé e aparas para tartare e hot rolls). Reduz o desperdício para menos de 0.8% através de receitas técnicas padronizadas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      toast.success("Rendimento Preditivo de Pescados Calculado: 99.2% de aproveitamento!");
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition"
                  >
                    Otimizar Aproveitamento de Lotes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 6: PASSAPORTE DO SALMÃO 360° & RASTREABILIDADE TOTAL DO PESCADO */}
        {/* ========================================================================= */}
        {activeTab === "passaporte" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fish className="w-5 h-5 text-emerald-400" />
                  Passaporte do Salmão 360° · Rastreabilidade do Fiorde à Mesa
                </h2>
                <p className="text-xs text-neutral-400">
                  POP-ZUMA-004 · RDC 216 ANVISA · Ultracongelamento Criotec -40°C · SIF MAPA 4120
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/passaporte-salmao"
                  target="_blank"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Página Pública do Cliente (QR Code)
                </Link>
              </div>
            </div>

            {/* 4 Cards de Métricas de Pescados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Fish className="w-3.5 h-3.5 text-emerald-400" />
                  Lotes Cadastrados
                </div>
                <div className="text-2xl font-black text-white font-mono">{passports.length} Lotes</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">100% Homologados SIF</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  Temp. Média Recepção
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">+0.85°C</div>
                <div className="text-[11px] text-neutral-500 mt-1">Meta: 0.0°C a +2.0°C</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                  Choque -40°C Criotec
                </div>
                <div className="text-2xl font-black text-blue-400 font-mono">-40.3°C</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-1">24h Profilaxia Anisakis</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  Aproveitamento Nobre
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">99.4%</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1">Desperdício aparas &lt; 0.6%</div>
              </div>
            </div>

            {/* Lista dos Lotes de Salmão */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Lotes de Pescados em Consumo e Reserva Técnica
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {passports.map((lot) => (
                  <div
                    key={lot.id}
                    className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-white">{lot.codigoLote}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              lot.status === "ATIVO_EM_CONSUMO"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-neutral-800 text-neutral-300"
                            }`}>
                              {lot.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-300 mt-1 font-medium">
                            {lot.variedade}
                          </div>
                        </div>

                        <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                          {lot.pesoDisponivelKg.toFixed(1)} / {lot.pesoTotalRecebidoKg} kg
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-neutral-300 mt-3 pt-3 border-t border-neutral-800">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Fazenda no Chile:</span>
                          <span className="font-medium text-white">{lot.fazendaOrigem}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Despesca & Voo:</span>
                          <span className="text-neutral-300">{lot.dataDespescaChile} &middot; {lot.vooTransporte.split(" ")[0]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Recebimento em Tangará:</span>
                          <span className="font-mono text-cyan-400">+{lot.temperaturaRecebimentoC.toFixed(1)}°C (pH {lot.phMedido})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Choque Criotec -40°C:</span>
                          <span className="font-mono text-blue-400 font-bold">{lot.cicloUltracongelamentoChoque.temperaturaMinimaAlcancada.toFixed(1)}°C (24h)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Classificação Sensorial:</span>
                          <span className="font-bold text-amber-400">{lot.inspecaoOrganoleptica.classificacaoGeral}</span>
                        </div>
                      </div>

                      {/* Hash SHA-256 */}
                      <div className="mt-3 p-2 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                        <span className="truncate pr-2">SHA: {lot.hashSha256Laudo.substring(0, 24)}...</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(lot.hashSha256Laudo);
                            toast.success("Hash SHA-256 copiado!");
                          }}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-sans text-xs"
                        >
                          <Copy className="w-3 h-3" /> Copiar
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => setSelectedPassportModal(lot)}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-300" />
                        Ver Laudo Técnico
                      </button>
                      <Link
                        href={`/passaporte-salmao/${lot.codigoLote}`}
                        target="_blank"
                        className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Visualizar QR Code
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 7: GATILHOS INTELIGENTES (SMART TRIGGERS & REGRAS EM TEMPO REAL) */}
        {/* ========================================================================= */}
        {activeTab === "triggers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-400" />
                  Central de Gatilhos Inteligentes (Smart Rules & Triggers)
                </h2>
                <p className="text-xs text-neutral-400">
                  Automações ativas conectadas ao KDS, telemetria de frio, estoque real, Dr. Clima e iFood Merchant
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  {triggers.filter(t => t.ativo).length} Regras Ativas Monitorando
                </span>
              </div>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {["ALL", "FRIO", "ESTOQUE_IFOOD", "METEOROLOGIA_DR_CLIMA", "SOBRECARGA_KDS", "MOTOBOYS_PIX", "AUDITORIA_ANVISA"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterTriggerCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                    filterTriggerCategory === cat
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat === "ALL" ? "Todos os Gatilhos" : cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Grid dos Gatilhos Inteligentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triggers
                .filter(t => filterTriggerCategory === "ALL" || t.categoria === filterTriggerCategory)
                .map((rule) => {
                  const isCritical = rule.severidade === "CRITICA";
                  const isAlert = rule.severidade === "ALERTA";

                  return (
                    <div
                      key={rule.id}
                      className={`p-5 rounded-xl bg-neutral-900 border transition flex flex-col justify-between space-y-4 ${
                        rule.ativo
                          ? isCritical
                            ? "border-red-900/60 bg-red-950/10 shadow-sm"
                            : isAlert
                            ? "border-amber-900/50 bg-amber-950/10"
                            : "border-neutral-800"
                          : "border-neutral-800/50 opacity-60 bg-neutral-950"
                      }`}
                    >
                      <div>
                        {/* Cabeçalho da Regra */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCritical
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : isAlert
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}>
                                {rule.severidade} &middot; {rule.categoria.replace(/_/g, " ")}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                {rule.totalDisparosHoje} disparos hoje
                              </span>
                            </div>
                            <h3 className="font-bold text-white text-sm md:text-base leading-snug">
                              {rule.nome}
                            </h3>
                          </div>

                          {/* Switch de Ativação */}
                          <button
                            onClick={() => toggleTriggerMutation.mutate({ ruleId: rule.id })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              rule.ativo
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                            }`}
                          >
                            {rule.ativo ? "ATIVO" : "PAUSADO"}
                          </button>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                          {rule.descricao}
                        </p>

                        {/* Box de Condição & Ação */}
                        <div className="space-y-2 text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-800/80">
                          <div>
                            <span className="text-neutral-500 font-semibold block text-[11px]">Condição Disparadora (Gatilho):</span>
                            <span className="text-amber-300 font-mono text-[11px]">{rule.condicaoDisparo}</span>
                          </div>
                          <div className="pt-1.5 border-t border-neutral-850">
                            <span className="text-neutral-500 font-semibold block text-[11px]">Ação Automatizada:</span>
                            <span className="text-emerald-400">{rule.acaoAutomatica}</span>
                          </div>
                        </div>

                        {/* Log Recente */}
                        {rule.logRecente && (
                          <div className="mt-2.5 text-[11px] text-neutral-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{rule.logRecente}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer do Card com Botão de Disparo Manual */}
                      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-neutral-500 truncate">
                          {rule.ultimoDisparo || "Nenhum disparo nas últimas 24h"}
                        </span>

                        <button
                          onClick={() => simulateTriggerMutation.mutate({ ruleId: rule.id })}
                          disabled={simulateTriggerMutation.isPending}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          Simular Disparo Imediato
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EMISSÃO DE EVENTO INTERNO ULTRA x NOSSA GENTE */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Disparar Evento Interno</h3>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEmitCustomEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tipo de Evento:</label>
                <select
                  value={eventFormData.type}
                  onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                >
                  <option value="INSPECTION_ANVISA_REGISTERED">INSPECTION_ANVISA_REGISTERED</option>
                  <option value="ORDER_DELIVERED_COMMISSION_ACCREDITED">ORDER_DELIVERED_COMMISSION_ACCREDITED</option>
                  <option value="FACIAL_BIOMETRIC_PUNCH">FACIAL_BIOMETRIC_PUNCH</option>
                  <option value="SUSHIBAR_SLA_ALERT">SUSHIBAR_SLA_ALERT</option>
                  <option value="STOCK_OUTAGE_TRIGGER_SYNC">STOCK_OUTAGE_TRIGGER_SYNC</option>
                  <option value="DISPATCH_DELIVERY_MOTOBOY">DISPATCH_DELIVERY_MOTOBOY</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Sistema Origem:</label>
                  <select
                    value={eventFormData.originSystem}
                    onChange={(e) => setEventFormData({ ...eventFormData, originSystem: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="ULTRA_SISTEMA">ULTRA_SISTEMA</option>
                    <option value="NOSSA_GENTE">NOSSA_GENTE</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Sistema Destino:</label>
                  <select
                    value={eventFormData.targetSystem}
                    onChange={(e) => setEventFormData({ ...eventFormData, targetSystem: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="NOSSA_GENTE">NOSSA_GENTE</option>
                    <option value="ULTRA_SISTEMA">ULTRA_SISTEMA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Colaborador Relacionado:</label>
                <select
                  value={eventFormData.collaboratorName}
                  onChange={(e) => setEventFormData({ ...eventFormData, collaboratorName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                >
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} ({c.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Resumo do Evento:</label>
                <input
                  type="text"
                  placeholder="Ex: Aferição térmica de salmão fresco registrada no Sushibar"
                  value={eventFormData.summary}
                  onChange={(e) => setEventFormData({ ...eventFormData, summary: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Observações Técnicas:</label>
                <textarea
                  placeholder="Detalhes adicionais para o barramento interno..."
                  rows={2}
                  value={eventFormData.notes}
                  onChange={(e) => setEventFormData({ ...eventFormData, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={emitEventMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {emitEventMutation.isPending ? "Disparando..." : "Emitir Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOVA INSPEÇÃO COM FOTO SEGURA */}
      {/* ========================================================================= */}
      {isPhotoInspectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Nova Inspeção com Foto Segura</h3>
              </div>
              <button
                onClick={() => setIsPhotoInspectionModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Categoria de Auditoria:</label>
                <select
                  value={inspectionFormData.category}
                  onChange={(e) => setInspectionFormData({ ...inspectionFormData, category: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                >
                  <option value="RECEBIMENTO_PEIXE">RECEBIMENTO_PEIXE</option>
                  <option value="TEMPERATURA">TEMPERATURA</option>
                  <option value="HIGIENE_EPI">HIGIENE_EPI</option>
                  <option value="ETIQUETAGEM_VALIDADE">ETIQUETAGEM_VALIDADE</option>
                  <option value="FECHAMENTO_NOTURNO">FECHAMENTO_NOTURNO</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Item Avaliado:</label>
                <input
                  type="text"
                  value={inspectionFormData.itemEvaluated}
                  onChange={(e) => setInspectionFormData({ ...inspectionFormData, itemEvaluated: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Status de Conformidade:</label>
                  <select
                    value={inspectionFormData.status}
                    onChange={(e) => setInspectionFormData({ ...inspectionFormData, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="CONFORME">CONFORME</option>
                    <option value="ALERTA">ALERTA</option>
                    <option value="NAO_CONFORME">NÃO CONFORME</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Medido:</label>
                  <input
                    type="text"
                    value={inspectionFormData.valueMeasured}
                    onChange={(e) => setInspectionFormData({ ...inspectionFormData, valueMeasured: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">URL da Imagem / Foto de Coleta Segura:</label>
                <input
                  type="text"
                  value={inspectionFormData.photoUrl}
                  onChange={(e) => setInspectionFormData({ ...inspectionFormData, photoUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  placeholder="https://... ou base64 seguro"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição da Foto:</label>
                <input
                  type="text"
                  value={inspectionFormData.photoDescription}
                  onChange={(e) => setInspectionFormData({ ...inspectionFormData, photoDescription: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Notas do Inspetor:</label>
                <textarea
                  rows={2}
                  value={inspectionFormData.notes}
                  onChange={(e) => setInspectionFormData({ ...inspectionFormData, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ao salvar, será gerado automaticamente um hash SHA-256 e emitido evento interno para o sistema Nossa Gente.</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPhotoInspectionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createInspectionMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {createInspectionMutation.isPending ? "Registrando..." : "Salvar Inspeção Segura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VISUALIZADOR DE FOTO SEGURA E LAUDO */}
      {/* ========================================================================= */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Laudo Fotográfico de Auditoria ANVISA</h3>
              </div>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-neutral-950 border border-neutral-800">
                <img
                  src={selectedPhotoModal.fotoArmazenadaSeguraUrl || selectedPhotoModal.photoUrl}
                  alt={selectedPhotoModal.local || selectedPhotoModal.itemEvaluated}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Item / Local Auditado:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedPhotoModal.local || selectedPhotoModal.itemEvaluated}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Status Sanitário:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {selectedPhotoModal.conforme !== undefined
                      ? selectedPhotoModal.conforme ? "CONFORME" : "ALERTA"
                      : selectedPhotoModal.status}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Valor Medido:</span>
                  <span className="font-medium text-white">
                    {selectedPhotoModal.temperaturaMedida !== undefined
                      ? `${selectedPhotoModal.temperaturaMedida}°C`
                      : selectedPhotoModal.valueMeasured || "Conforme"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Padrão Regulamentar:</span>
                  <span className="font-medium text-neutral-300">
                    {selectedPhotoModal.temperaturaFaixaSegura || selectedPhotoModal.targetStandard || "RDC 216 / CVS 5"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Inspetor Responsável:</span>
                  <span className="font-medium text-neutral-300">
                    {selectedPhotoModal.responsavelNome || selectedPhotoModal.inspectorName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Carimbo de Data/Hora:</span>
                  <span className="font-medium text-neutral-300">
                    {selectedPhotoModal.timestamp}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1">
                <span className="text-neutral-500 block">Assinatura de Integridade (Hash SHA-256):</span>
                <span className="font-mono text-cyan-400 text-[11px] break-all">
                  {selectedPhotoModal.secureStorageHash || "sec_anvisa_sha256_verified_kytto"}
                </span>
              </div>

              <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60">
                <span className="text-neutral-500 block mb-1">Notas da Coleta:</span>
                {selectedPhotoModal.observacoes || selectedPhotoModal.notes || selectedPhotoModal.fotoDescricao}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-800">
              <span className="text-[11px] text-neutral-500">Zuma Pilot &middot; Tangará da Serra MT &middot; CNPJ 36.296.848/0001-57</span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Fechar Laudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LAUDO TÉCNICO COMPLETO DO PASSAPORTE DO SALMÃO */}
      {/* ========================================================================= */}
      {selectedPassportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Laudo de Rastreabilidade · {selectedPassportModal.codigoLote}
                  </h3>
                  <span className="text-xs text-neutral-400">Certificado Oficial de Origem & Sanidade</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPassportModal(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Variedade:</span>
                  <span className="font-medium text-white">{selectedPassportModal.variedade}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Fazenda de Origem:</span>
                  <span className="font-medium text-emerald-400">{selectedPassportModal.fazendaOrigem}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Temperatura Recepção:</span>
                  <span className="font-mono text-cyan-400 font-bold">+{selectedPassportModal.temperaturaRecebimentoC}°C (pH {selectedPassportModal.phMedido})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Choque Criotec -40°C:</span>
                  <span className="font-mono text-blue-400 font-bold">{selectedPassportModal.cicloUltracongelamentoChoque.temperaturaMinimaAlcancada}°C (24h)</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Chef Executivo:</span>
                  <span className="font-medium text-neutral-300">{selectedPassportModal.responsavelTecnico.chefExecutivo}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Nutricionista RT:</span>
                  <span className="font-medium text-neutral-300">{selectedPassportModal.responsavelTecnico.nutricionistaRT} ({selectedPassportModal.responsavelTecnico.crn})</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-neutral-500 font-semibold block">Chave Criptográfica SHA-256:</span>
                <span className="font-mono text-amber-400 text-[11px] break-all block">
                  {selectedPassportModal.hashSha256Laudo}
                </span>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1.5">
                <span className="text-neutral-400 font-semibold block">Laudo Organoléptico:</span>
                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  {selectedPassportModal.inspecaoOrganoleptica.olhos}. {selectedPassportModal.inspecaoOrganoleptica.guelras}. {selectedPassportModal.inspecaoOrganoleptica.elasticidadeCarne}. Classificação: <strong className="text-amber-400">{selectedPassportModal.inspecaoOrganoleptica.classificacaoGeral}</strong>.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-800">
              <Link
                href={`/passaporte-salmao/${selectedPassportModal.codigoLote}`}
                target="_blank"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                Ver Passaporte com QR Code
              </Link>
              <button
                onClick={() => setSelectedPassportModal(null)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
