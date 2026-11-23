import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { 
  MapPin, 
  Bike, 
  CloudRain, 
  Clock, 
  CheckCircle2, 
  X, 
  Search, 
  DollarSign, 
  Navigation,
  ShieldCheck,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  Building2,
  Crown
} from "lucide-react";
import { toast } from "sonner";

interface GestaoBairrosFreteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BairroFormData {
  id?: string;
  name: string;
  cidade: string;
  zone: string;
  cep: string;
  cepInicial?: string;
  cepFinal?: string;
  logradourosPrincipais?: string;
  distanceKm: number;
  fee: number;
  avgTimeMin: number;
  freeShippingMin: number;
  minOrderValue: number;
  rainSurcharge: number;
  active: boolean;
  notes?: string;
}

const DEFAULT_FORM: BairroFormData = {
  name: "",
  cidade: "Tangará da Serra",
  zone: "Centro",
  cep: "78300-000",
  distanceKm: 2.0,
  fee: 8.0,
  avgTimeMin: 25,
  freeShippingMin: 120.0,
  minOrderValue: 30.0,
  rainSurcharge: 3.0,
  active: true,
  notes: ""
};

export const GestaoBairrosFreteModal: React.FC<GestaoBairrosFreteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("TODAS");
  const [rainModeActive, setRainModeActive] = useState(true);
  const [testOrderValue, setTestOrderValue] = useState(115.0);

  // Estados do Modal de Criação / Edição
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<BairroFormData>(DEFAULT_FORM);

  const { data: neighborhoods = [], refetch } = trpc.zuma.getDeliveryNeighborhoods.useQuery(undefined, {
    enabled: isOpen
  });

  const createMutation = trpc.zuma.createDeliveryNeighborhood.useMutation({
    onSuccess: (data) => {
      toast.success(`Bairro/CEP ${data.name} cadastrado com sucesso!`);
      setIsEditorOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao cadastrar: ${err.message}`);
    }
  });

  const updateMutation = trpc.zuma.updateDeliveryNeighborhood.useMutation({
    onSuccess: () => {
      toast.success("Parâmetros do bairro/CEP atualizados com sucesso!");
      setIsEditorOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
    }
  });

  const deleteMutation = trpc.zuma.deleteDeliveryNeighborhood.useMutation({
    onSuccess: () => {
      toast.success("Bairro/CEP removido com sucesso!");
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao excluir: ${err.message}`);
    }
  });

  const resetMutation = trpc.zuma.resetDeliveryNeighborhoodsToDefault.useMutation({
    onSuccess: (data) => {
      toast.success(`Tabela padrão oficial restaurada com sucesso (${data.length} regiões e CEPs de MT)!`);
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao restaurar: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  const regionTabs = [
    { id: "TODAS", label: "Todas as Regiões", count: neighborhoods.length },
    { id: "TGA_URBANO", label: "Tangará Urbano", count: neighborhoods.filter(b => b.cidade === "Tangará da Serra" && b.zone !== "Distrito / Perímetro").length },
    { id: "TGA_RURAL", label: "Tangará Distritos & Rural", count: neighborhoods.filter(b => b.cidade === "Tangará da Serra" && b.zone === "Distrito / Perímetro").length },
    { id: "VIZINHAS", label: "Cidades Vizinhas & Parecis", count: neighborhoods.filter(b => b.zone === "Cidades Vizinhas & Parecis").length },
    { id: "POLOS_MT", label: "Cuiabá & Polos MT", count: neighborhoods.filter(b => b.zone === "Cuiabá & Polos MT").length },
  ];

  const filtered = neighborhoods.filter(b => {
    const q = search.toLowerCase().trim();
    const cleanQ = q.replace(/\D/g, "");
    const matchSearch = 
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.cidade && b.cidade.toLowerCase().includes(q)) ||
      (b.cep && (b.cep.toLowerCase().includes(q) || (cleanQ.length >= 4 && b.cep.replace(/\D/g, "").includes(cleanQ)))) ||
      (b.zone && b.zone.toLowerCase().includes(q)) ||
      (b.logradourosPrincipais && b.logradourosPrincipais.toLowerCase().includes(q));

    let matchRegion = true;
    if (selectedRegion === "TGA_URBANO") {
      matchRegion = b.cidade === "Tangará da Serra" && b.zone !== "Distrito / Perímetro";
    } else if (selectedRegion === "TGA_RURAL") {
      matchRegion = b.cidade === "Tangará da Serra" && b.zone === "Distrito / Perímetro";
    } else if (selectedRegion === "VIZINHAS") {
      matchRegion = b.zone === "Cidades Vizinhas & Parecis";
    } else if (selectedRegion === "POLOS_MT") {
      matchRegion = b.zone === "Cuiabá & Polos MT";
    }

    return matchSearch && matchRegion;
  });

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData(DEFAULT_FORM);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setIsEditMode(true);
    setFormData({
      id: b.id,
      name: b.name,
      cidade: b.cidade || "Tangará da Serra",
      zone: b.zone || "Centro",
      cep: b.cep || "78300-000",
      cepInicial: b.cepInicial || "",
      cepFinal: b.cepFinal || "",
      logradourosPrincipais: b.logradourosPrincipais || "",
      distanceKm: b.distanceKm || 2.0,
      fee: b.fee || 8.0,
      avgTimeMin: b.avgTimeMin || 25,
      freeShippingMin: b.freeShippingMin || 120.0,
      minOrderValue: b.minOrderValue || 30.0,
      rainSurcharge: b.rainSurcharge || 3.0,
      active: b.active ?? true,
      notes: b.notes || ""
    });
    setIsEditorOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Informe o nome do bairro ou região!");
      return;
    }

    if (isEditMode && formData.id) {
      updateMutation.mutate({
        id: formData.id,
        name: formData.name,
        cidade: formData.cidade,
        zone: formData.zone,
        cep: formData.cep,
        cepInicial: formData.cepInicial,
        cepFinal: formData.cepFinal,
        logradourosPrincipais: formData.logradourosPrincipais,
        distanceKm: Number(formData.distanceKm),
        fee: Number(formData.fee),
        avgTimeMin: Number(formData.avgTimeMin),
        freeShippingMin: Number(formData.freeShippingMin),
        minOrderValue: Number(formData.minOrderValue),
        rainSurcharge: Number(formData.rainSurcharge),
        active: formData.active,
        notes: formData.notes
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        cidade: formData.cidade,
        zone: formData.zone,
        cep: formData.cep,
        cepInicial: formData.cepInicial,
        cepFinal: formData.cepFinal,
        logradourosPrincipais: formData.logradourosPrincipais,
        distanceKm: Number(formData.distanceKm),
        fee: Number(formData.fee),
        avgTimeMin: Number(formData.avgTimeMin),
        freeShippingMin: Number(formData.freeShippingMin),
        minOrderValue: Number(formData.minOrderValue),
        rainSurcharge: Number(formData.rainSurcharge),
        active: formData.active,
        notes: formData.notes
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o bairro/CEP "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3 bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  TANGARÁ DA SERRA &amp; MATO GROSSO (MT)
                </span>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {neighborhoods.length} Bairros, Cidades &amp; CEPs Mapeados
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                Gestão de Bairros, CEPs, Fretes &amp; Raio de Entrega
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Cadastrar novo bairro ou CEP específico no estado do MT"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Bairro / CEP MT</span>
            </button>

            <button
              onClick={() => {
                if (confirm("Deseja restaurar a tabela de referência padrão oficial com todos os CEPs de Tangará da Serra e principais cidades de MT?")) {
                  resetMutation.mutate();
                }
              }}
              disabled={resetMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Restaurar tabela padrão com valores de referência"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetMutation.isPending ? "animate-spin" : ""}`} />
              <span>Restaurar Referência MT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner Informativo de Clientes VIP com Frete Grátis */}
        <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
              <strong className="font-black text-amber-600 dark:text-amber-400">Regra de Fidelidade VIP:</strong> Clientes VIP têm <strong className="underline">Entrega 100% Grátis</strong> automática em qualquer CEP de Tangará da Serra e polos do MT. Basta informar o código (ex: VIP-01), nome ou telefone no pedido.
            </span>
          </div>
        </div>

        {/* Barra de Controles, Busca & Dr. Clima Chuva */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar por CEP (78300-000, 78000), Bairro ou Cidade MT..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Abas de Região */}
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {regionTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRegion(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1.5 ${
                    selectedRegion === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9.5px] px-1 py-0.2 rounded-full font-mono ${
                    selectedRegion === tab.id ? "bg-blue-800 text-white" : "bg-[var(--line)] text-[var(--muted)]"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Adicional Dr. Clima Chuva */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
            <CloudRain className="w-4 h-4 text-purple-600 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-purple-900 dark:text-purple-300 text-[11px]">
                Taxa Chuva Dr. Clima (+R$ 3,00)
              </span>
              <span className="text-[9px] text-purple-700 dark:text-purple-400">
                Repasse 100% integral ao entregador
              </span>
            </div>
            <button
              onClick={() => {
                setRainModeActive(!rainModeActive);
                toast.info(rainModeActive ? "Taxa de chuva desativada." : "Taxa de chuva ativada (+R$ 3,00 por entrega)!");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ml-1 ${
                rainModeActive ? "bg-purple-600 text-white" : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {rainModeActive ? "ATIVO" : "OFF"}
            </button>
          </div>
        </div>

        {/* Tabela de Bairros e Cidades */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[50vh]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--surface)] z-10">
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold text-[10px] uppercase">
                <th className="py-2.5 px-3">Bairro / Região &amp; Cidade</th>
                <th className="py-2.5 px-3 text-center">Distância / Raio</th>
                <th className="py-2.5 px-3 text-center">Tempo Médio</th>
                <th className="py-2.5 px-3 text-right">Taxa Normal</th>
                <th className="py-2.5 px-3 text-right">Taxa Chuva</th>
                <th className="py-2.5 px-3 text-center">Frete Grátis Acima</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--muted)] italic">
                    Nenhum bairro, CEP ou cidade encontrada para a busca informada.
                  </td>
                </tr>
              ) : (
                filtered.map(b => {
                  const totalFeeWithRain = b.fee + (rainModeActive ? b.rainSurcharge : 0);
                  const isTangara = !b.cidade || b.cidade === "Tangará da Serra";

                  return (
                    <tr key={b.id} className="hover:bg-[var(--surface2)]/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[var(--ink)] text-xs flex items-center gap-1.5 flex-wrap">
                          <Navigation className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{b.name}</span>
                          {b.cep && (
                            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface2)] border border-[var(--line)] text-blue-700 dark:text-blue-300 font-bold">
                              {b.cep}
                            </span>
                          )}
                          {!isTangara && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              {b.cidade} (MT)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                          <span>{b.zone}</span>
                          {b.logradourosPrincipais && (
                            <span className="truncate max-w-[280px]" title={b.logradourosPrincipais}>
                              · {b.logradourosPrincipais}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {b.distanceKm.toFixed(1)} km
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface2)] border border-[var(--line)] text-[10px] font-mono">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {b.avgTimeMin} min
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-[var(--ink)]">
                        R$ {b.fee.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                        R$ {totalFeeWithRain.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                          R$ {b.freeShippingMin.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] transition cursor-pointer"
                            title="Editar parâmetros completos deste bairro/CEP"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id, b.name)}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition cursor-pointer"
                            title="Excluir bairro/CEP da tabela"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Simulador Rápido de Frete */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--muted)] flex items-center gap-1 font-semibold">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              Simular Pedido de Teste:
            </span>
            <input
              type="number"
              value={testOrderValue}
              onChange={e => setTestOrderValue(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-xs"
            />
            <span className="text-[10px] text-[var(--muted)]">
              (Pedidos a partir de R$ 100~150 ganham frete grátis na regra normal · Clientes VIP ganham sempre)
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ml-auto"
          >
            Concluir &amp; Fechar
          </button>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO ESPECÍFICA DE BAIRRO OU CEP */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-black text-[var(--ink)]">
                  {isEditMode ? "Editar Bairro / CEP" : "Cadastrar Novo Bairro / CEP MT"}
                </h4>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Nome do Bairro ou Região *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jardim dos Ipês IV, Residencial San Diego..."
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Cidade (MT)
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Tangará da Serra, Cuiabá..."
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Zona / Polo
                  </label>
                  <select
                    value={formData.zone}
                    onChange={e => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  >
                    <option value="Centro">Centro</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Sul">Zona Sul</option>
                    <option value="Zona Leste">Zona Leste</option>
                    <option value="Zona Oeste">Zona Oeste</option>
                    <option value="Distrito / Perímetro">Distrito / Perímetro</option>
                    <option value="Cidades Vizinhas & Parecis">Cidades Vizinhas &amp; Parecis</option>
                    <option value="Cuiabá & Polos MT">Cuiabá &amp; Polos MT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    CEP Principal
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={e => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="78300-000"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Distância da Loja (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={e => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Taxa Normal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fee}
                    onChange={e => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Tempo Médio (min)
                  </label>
                  <input
                    type="number"
                    value={formData.avgTimeMin}
                    onChange={e => setFormData({ ...formData, avgTimeMin: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Frete Grátis Acima (R$)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formData.freeShippingMin}
                    onChange={e => setFormData({ ...formData, freeShippingMin: parseFloat(e.target.value) || 120 })}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Logradouros / Vias Principais
                </label>
                <input
                  type="text"
                  value={formData.logradourosPrincipais || ""}
                  onChange={e => setFormData({ ...formData, logradourosPrincipais: e.target.value })}
                  placeholder="Ex: Av. Brasil, Rua 26, Av. Lions..."
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Observações Operacionais
                </label>
                <input
                  type="text"
                  value={formData.notes || ""}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Entrega rápida no almoço, condomínio fechado..."
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isEditMode ? "Salvar Alterações" : "Cadastrar Bairro / CEP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
