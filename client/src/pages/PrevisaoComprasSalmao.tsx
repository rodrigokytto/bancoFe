import React, { useState } from "react";
import { 
  TrendingUp, 
  Fish, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Send,
  Zap,
  ArrowRight,
  Boxes,
  ClipboardList,
  Truck,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders,
  Scale,
  ShieldAlert,
  Flame,
  FileText,
  Copy,
  Check,
  Building2,
  PackageCheck,
  Percent,
  CloudRain,
  Thermometer,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  CheckCheck,
  MapPin,
  Phone,
  X,
  Bot
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { formatBrl } from "../../../shared/zumaData";
import {
  RawMaterialItem,
  SupplierItem,
  TechnicalSheetItem,
  PurchaseOrderItem
} from "../../../shared/forecastingData";

export function PrevisaoComprasSalmao() {
  const [activeTab, setActiveTab] = useState<"previsao" | "fichas_tecnicas" | "ordens_compra" | "estoque_insumos" | "alavancas">("previsao");
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [scenarioMultiplier, setScenarioMultiplier] = useState<number>(1.0);
  const [safetyBufferDays, setSafetyBufferDays] = useState<number>(2);
  const [searchFilter, setSearchFilter] = useState<string>("" );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [campanhaDisparada, setCampanhaDisparada] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<TechnicalSheetItem | null>(null);
  const [modalNewOcOpen, setModalNewOcOpen] = useState<boolean>(false);
  const [copiedOcId, setCopiedOcId] = useState<string | null>(null);
  const [filtroCategoriaEstoque, setFiltroCategoriaEstoque] = useState<string>("todas");
  const [buscaEstoque, setBuscaEstoque] = useState<string>("");

  // Estados para Modal de Nova Ordem de Compra
  const [modalSupplierId, setModalSupplierId] = useState<string>("sup_pantanal");
  const [modalDeliveryDaysAhead, setModalDeliveryDaysAhead] = useState<number>(2);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<string>("Boleto 21 dias");
  const [modalItems, setModalItems] = useState<Array<{
    rawMaterialCode: string;
    rawMaterialName: string;
    quantity: number;
    purchaseUnit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>>([]);

  // Queries via tRPC
  const forecastQuery = trpc.zuma.getPurchaseForecast.useQuery({
    horizonDays,
    scenarioMultiplier,
  }, { refetchInterval: 15000 });

  const rawMaterialsQuery = trpc.zuma.listRawMaterials.useQuery(undefined, { refetchInterval: 10000 });
  const purchaseOrdersQuery = trpc.zuma.listPurchaseOrders.useQuery(undefined, { refetchInterval: 8000 });
  const technicalSheetsQuery = trpc.zuma.listTechnicalSheets.useQuery();
  const suppliersQuery = trpc.zuma.listSuppliers.useQuery();
  const autoPauseQuery = trpc.zuma.getAutoStockPauseIfood.useQuery();
  const drClimaQuery = trpc.zuma.getDrClimaTangara.useQuery(undefined, { refetchInterval: 60000 });

  // Mutations via tRPC
  const receiveOcMutation = trpc.zuma.receivePurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Ordem de Compra ${data.order?.orderNumber} recebida com sucesso! Estoque físico atualizado.`);
      purchaseOrdersQuery.refetch();
      rawMaterialsQuery.refetch();
      forecastQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao receber ordem: ${err.message}`);
    }
  });

  const createOcMutation = trpc.zuma.createPurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Ordem de Compra ${data.order.orderNumber} para ${data.order.supplierName} gerada e integrada ao Financeiro!`);
      setModalNewOcOpen(false);
      purchaseOrdersQuery.refetch();
      forecastQuery.refetch();
      setActiveTab("ordens_compra");
    },
    onError: (err) => {
      toast.error(`Erro ao gerar ordem: ${err.message}`);
    }
  });

  const updateStockMutation = trpc.zuma.updateRawMaterialStock.useMutation({
    onSuccess: () => {
      toast.success("Estoque de insumo atualizado!");
      rawMaterialsQuery.refetch();
      forecastQuery.refetch();
    }
  });

  const simulateStockOutageMutation = trpc.zuma.simulateStockOutagePause.useMutation({
    onSuccess: (data) => {
      toast.warning(data.message);
      autoPauseQuery.refetch();
    }
  });

  const parecerIaMutation = trpc.zuma.gerarParecerComprasIa.useMutation({
    onSuccess: () => {
      toast.success("Parecer executivo gerado com sucesso pela IA Akira!");
    },
    onError: (err) => {
      toast.error(`Erro ao gerar parecer com IA: ${err.message}`);
    }
  });

  const dispararAlavancaMutation = trpc.zuma.dispararAlavancaCompras.useMutation({
    onSuccess: (data) => {
      const msg = (data as any)?.mensagem || "Alavanca ativada com sucesso!";
      setCampanhaDisparada(msg);
      toast.success(msg);
      setTimeout(() => setCampanhaDisparada(null), 5000);
    }
  });

  const forecastData = forecastQuery.data;
  const rawMaterials = rawMaterialsQuery.data || [];
  const purchaseOrders = purchaseOrdersQuery.data || [];
  const technicalSheets = technicalSheetsQuery.data || [];
  const suppliers = suppliersQuery.data || [];
  const autoPauseConfig = autoPauseQuery.data;
  const drClima = drClimaQuery.data;

  // Filtragem de insumos da previsão
  const filteredRequirements = (forecastData?.requirements || []).filter(req => {
    const matchesSearch = req.material.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          req.material.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          req.material.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          req.recommendedSupplier.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === "all" || req.material.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtragem de Fichas Técnicas
  const filteredSheets = technicalSheets.filter(sheet => {
    const matchesSearch = sheet.dishName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          sheet.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === "all" || sheet.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Disparo de Alavancas Zumi IA
  const handleDispararAlavanca = (nome: string, tipo: "promocao_excedente" | "blindagem_cozinha" | "contingencia_chuva", receita: number) => {
    dispararAlavancaMutation.mutate({
      nomeAlavanca: nome,
      tipo,
      estimativaReceitaBrl: receita
    });
  };

  // Copiar WhatsApp Formatado da Ordem de Compra
  const handleCopyWhatsAppOrder = (po: PurchaseOrderItem) => {
    const itemsList = po.items.map(it => `  • ${it.rawMaterialName}: *${it.quantity} ${it.purchaseUnit}* (R$ ${it.totalPrice.toFixed(2)})`).join("\n");
    const text = `*PEDIDO DE COMPRA - ZUMA COZINHA ORIENTAL*\n` +
      `Ordem de Compra: *${po.orderNumber}*\n` +
      `Fornecedor: *${po.supplierName}*\n` +
      `Data do Pedido: ${new Date(po.createdAt).toLocaleDateString("pt-BR")}\n` +
      `Previsão de Entrega: *${new Date(po.expectedDeliveryDate).toLocaleDateString("pt-BR")}*\n` +
      `Condição de Pagamento: ${po.paymentMethod}\n\n` +
      `*Itens Solicitados:*\n${itemsList}\n\n` +
      `*Total do Pedido: ${formatBrl(po.totalAmount)}*\n` +
      `Endereço de Entrega: Av. Brasil, nº 1605-S, Tangará da Serra - MT\n` +
      `CNPJ: 36.296.848/0001-57\n\n` +
      `_Favor acusar recebimento e confirmar horário do caminhão refrigerado._`;

    navigator.clipboard.writeText(text);
    setCopiedOcId(po.id);
    toast.success(`Pedido ${po.orderNumber} copiado para WhatsApp! Pronto para colar no chat do fornecedor.`);
    setTimeout(() => setCopiedOcId(null), 3500);
  };

  // Abrir direto no WhatsApp Web
  const handleOpenWhatsAppWeb = (po: PurchaseOrderItem) => {
    const supplier = suppliers.find(s => s.id === po.supplierId);
    const phoneRaw = (po.supplierPhone || supplier?.whatsapp || "65998413320").replace(/\D/g, "");
    const cleanPhone = phoneRaw.startsWith("55") ? phoneRaw : `55${phoneRaw}`;
    
    const itemsList = po.items.map(it => `• ${it.rawMaterialName}: ${it.quantity} ${it.purchaseUnit} (R$ ${it.totalPrice.toFixed(2)})`).join("%0A");
    const message = encodeURIComponent(
      `Olá! Segue pedido de compra oficial do Zuma Cozinha Oriental Tangará da Serra:%0A%0A` +
      `*Ordem de Compra:* ${po.orderNumber}%0A` +
      `*Fornecedor:* ${po.supplierName}%0A` +
      `*Previsão de Entrega:* ${new Date(po.expectedDeliveryDate).toLocaleDateString("pt-BR")}%0A` +
      `*Condição:* ${po.paymentMethod}%0A%0A` +
      `*Itens Solicitados:*%0A`
    ) + itemsList + encodeURIComponent(
      `%0A%0A*Total:* ${formatBrl(po.totalAmount)}%0A` +
      `Endereço: Av. Brasil, 1605-S, Tangará da Serra - MT%0A` +
      `CNPJ: 36.296.848/0001-57%0A%0A` +
      `Favor confirmar previsão do caminhão refrigerado.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  // Geração rápida de Ordem de Compra para um fornecedor
  const handleQuickGenerateOc = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const supReqs = (forecastData?.requirements || []).filter(r => r.material.supplierId === supplierId && r.suggestedPurchaseOrderQty > 0);

    if (supReqs.length === 0) {
      toast.info(`Não há déficit de compra previsto para ${supplier.name} no horizonte atual.`);
      return;
    }

    const items = supReqs.map(r => ({
      rawMaterialCode: r.material.code,
      rawMaterialName: r.material.name,
      quantity: r.suggestedPurchaseOrderQty,
      purchaseUnit: r.material.purchaseUnit,
      unitPrice: r.material.unitCost,
      totalPrice: r.estimatedCostBrl,
      notes: `Lead time: ${r.material.leadTimeDays} dias · Cobertura: ${r.daysOfCoverageRemaining}d`
    }));

    const deliveryDate = new Date(Date.now() + supplier.leadTimeHours * 3600000).toISOString();

    createOcMutation.mutate({
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierPhone: supplier.whatsapp || supplier.phone,
      expectedDeliveryDate: deliveryDate,
      paymentMethod: supplier.paymentTerms.includes("21") ? "Boleto 21 dias" : "Boleto 14 dias",
      items,
      notes: `Geração automática pelo Motor Preditivo Zuma (Horizonte: ${horizonDays} dias, Cenário: ${scenarioMultiplier}x)`
    });
  };

  // Abrir Modal para Nova Ordem de Compra Personalizada
  const handleOpenNewOcModal = (initialSupplierId?: string) => {
    const sId = initialSupplierId || "sup_pantanal";
    setModalSupplierId(sId);
    const sup = suppliers.find(s => s.id === sId) || suppliers[0];
    const defaultDeliveryDays = sup?.leadTimeHours ? Math.ceil(sup.leadTimeHours / 24) : 2;
    setModalDeliveryDaysAhead(defaultDeliveryDays);
    setModalPaymentMethod(sup?.paymentTerms.includes("21") ? "Boleto 21 dias" : "Boleto 14 dias");

    // Preenche com os insumos daquele fornecedor
    const supMaterials = rawMaterials.filter(m => m.supplierId === sId);
    const initialItems = supMaterials.map(m => {
      const req = (forecastData?.requirements || []).find(r => r.material.code === m.code);
      const qty = req?.suggestedPurchaseOrderQty || m.idealLot || 10;
      return {
        rawMaterialCode: m.code,
        rawMaterialName: m.name,
        quantity: qty,
        purchaseUnit: m.purchaseUnit,
        unitPrice: m.unitCost,
        totalPrice: Math.round(qty * m.unitCost * 100) / 100,
        notes: `Estoque atual: ${m.currentStock} ${m.recipeUnit}`
      };
    });

    setModalItems(initialItems);
    setModalNewOcOpen(true);
  };

  // Gerar Parecer Executivo via KyttoIA
  const handleGerarParecerIa = () => {
    const chuvaAtiva = Boolean(drClima?.current?.isChovendo || ((drClima?.dias?.[0]?.probabilidadeChuvaPct || 0) >= 60));
    parecerIaMutation.mutate({
      horizonDays,
      scenarioMultiplier,
      criticalItemsCount: forecastData?.criticalCount || 2,
      totalEstimatedBudget: forecastData?.totalEstimatedBudget || 23840,
      climaChuvaAtivo: chuvaAtiva,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* ==============================================================================
          1. HEADER EXECUTIVO PADRONIZADO (ZUMA PILOT DESIGN SYSTEM)
      ============================================================================== */}
      <header className="bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Título & Contexto Operacional */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                  Motor Preditivo de Compras &amp; BOM 360°
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wide">
                  Sincronizado ao Estoque Real
                </span>
                {(drClima?.current?.isChovendo || ((drClima?.dias?.[0]?.probabilidadeChuvaPct || 0) >= 60)) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>Chuva em Tangará ({drClima?.dias?.[0]?.probabilidadeChuvaPct || 83}%)</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-3xl leading-relaxed">
                Explosão analítica de cardápio em insumos (Salmão Chileno Premium, Atum, Arroz, Algas e Embalagens) cruzando o <strong>Mapa de Calor 7x11</strong>, vendas reais e logística refrigerada de Cuiabá para Tangará da Serra (MT).
              </p>
            </div>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenNewOcModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Ordem de Compra</span>
            </button>

            <button
              onClick={() => simulateStockOutageMutation.mutate({ rawMaterialCode: "SALM-01" })}
              disabled={simulateStockOutageMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Simula alerta de estoque baixo acionando auto-pausa no iFood"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simular Pausa iFood</span>
            </button>

            <Link href="/dr-clima">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition shadow-2xs cursor-pointer">
                <CloudRain className="w-4 h-4" />
                <span>Dr. Clima</span>
              </button>
            </Link>

            <Link href="/mapa-de-calor">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold transition shadow-2xs cursor-pointer">
                <Flame className="w-4 h-4" />
                <span>Mapa de Calor</span>
              </button>
            </Link>

            <Link href="/estoque">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:bg-[var(--surface)] text-xs font-bold text-[var(--ink)] transition shadow-2xs cursor-pointer">
                <Boxes className="w-4 h-4 text-sky-600" />
                <span>Estoque Físico</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Banner Informativo de Logística e Câmaras Frias de Tangará da Serra */}
        <div className="mt-4 pt-4 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Truck className="w-4 h-4 text-sky-600 shrink-0" />
            <span><strong>Rota Refrigerada:</strong> Cuiabá ➔ Tangará (240km / MT-343)</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Thermometer className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Câmara Resfriados:</strong> 0°C a 2°C (Frescor Diário Sem Congelar)</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span><strong>Fornecedores Homologados:</strong> 5 ativos (Cuiabá &amp; Tangará)</span>
          </div>
        </div>
      </header>

      {/* Alerta de Campanha / Alavanca Disparada */}
      {campanhaDisparada && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-md flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-white" />
            <span>{campanhaDisparada}</span>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-lg font-bold">Zumi IA Ativa</span>
        </div>
      )}

      {/* ==============================================================================
          2. BARRA DE CONTROLE PREDITIVO (HORIZONTE, CENÁRIOS & CONEXÃO DR. CLIMA)
      ============================================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Seletor de Horizonte de Previsão */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            Horizonte:
          </span>
          {[
            { days: 3, label: "3 Dias (Imediato)" },
            { days: 7, label: "7 Dias (Semana Cheia)" },
            { days: 14, label: "15 Dias (Quinzena)" },
            { days: 30, label: "30 Dias (Mês)" }
          ].map(h => (
            <button
              key={h.days}
              onClick={() => setHorizonDays(h.days)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                horizonDays === h.days
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {/* Seletor de Cenário / Fator Multiplicador */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-500" />
            Cenário:
          </span>
          {[
            { mul: 1.0, label: "Normal (Histórico 680 ped/sem)" },
            { mul: 1.2, label: "Pico Fim de Semana (+20%)" },
            { mul: 1.35, label: "Chuva / Dr. Clima (+35%)" },
            { mul: 1.5, label: "Safra & Eventos (+50%)" }
          ].map(s => (
            <button
              key={s.mul}
              onClick={() => setScenarioMultiplier(s.mul)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                scenarioMultiplier === s.mul
                  ? "bg-sky-600 text-white shadow-xs font-black"
                  : "bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Botão de Parecer Zumi IA */}
        <div className="shrink-0">
          <button
            onClick={handleGerarParecerIa}
            disabled={parecerIaMutation.isPending}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 text-xs font-black transition cursor-pointer shadow-2xs"
          >
            <Bot className={`w-4 h-4 ${parecerIaMutation.isPending ? "animate-spin" : "text-purple-600"}`} />
            <span>{parecerIaMutation.isPending ? "Analisando..." : "Parecer Akira IA"}</span>
          </button>
        </div>
      </div>

      {/* ==============================================================================
          3. 4 CARDS DE INDICADORES EXECUTIVOS (KPIS DO MOTOR PREDITIVO)
      ============================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Demanda Projetada */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">Demanda Projetada</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
            {forecastData?.projectedOrders || 680} <span className="text-xs text-[var(--muted)] font-normal">pedidos</span>
          </p>
          <p className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span>+{scenarioMultiplier > 1 ? `${Math.round((scenarioMultiplier - 1) * 100)}%` : "18.5%"} vs baseline</span>
            <span className="text-[var(--muted)] font-normal">· {horizonDays} dias</span>
          </p>
        </div>

        {/* Card 2: Orçamento Sugerido */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">Orçamento Sugerido</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {formatBrl(forecastData?.totalEstimatedBudget || 23840)}
          </p>
          <p className="text-[11.5px] text-[var(--muted)] font-medium">
            Déficit líquido para cobertura segura
          </p>
        </div>

        {/* Card 3: Insumos Críticos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">Insumos em Risco</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {forecastData?.criticalCount || 2}
            </p>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              + {forecastData?.attentionCount || 3} atenção
            </span>
          </div>
          <p className="text-[11.5px] text-rose-600/90 dark:text-rose-400/90 font-medium">
            Risco de ruptura antes da reposição
          </p>
        </div>

        {/* Card 4: Ordens de Compra & Economia */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">Ordens de Compra</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {purchaseOrders.length} <span className="text-xs text-[var(--muted)] font-normal">ativas</span>
          </p>
          <p className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-bold">
            Economia negociada: ~R$ 840 vs varejo
          </p>
        </div>
      </div>

      {/* Parecer Zumi IA Exibido em Card Especial se disponível */}
      {parecerIaMutation.data?.parecer && (
        <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 shadow-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-500/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-extrabold text-[var(--ink)]">Parecer Executivo de Suprimentos · KyttoIA Neural Engine (v2.5 Flash)</h3>
            </div>
            <span className="text-[11px] text-[var(--muted)] font-mono">
              Gerado em {new Date(parecerIaMutation.data.geradoEm).toLocaleTimeString("pt-BR")}
            </span>
          </div>
          <div className="text-xs text-[var(--ink)] leading-relaxed whitespace-pre-line space-y-2 font-sans">
            {parecerIaMutation.data.parecer}
          </div>
        </div>
      )}

      {/* ==============================================================================
          4. ABAS PRINCIPAIS DO SISTEMA DE COMPRAS
      ============================================================================== */}
      <div className="border-b border-[var(--line)] flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: "previsao", label: "Previsão & Demanda", icon: TrendingUp },
          { id: "fichas_tecnicas", label: "Fichas Técnicas (BOM 211 SKUs)", icon: ClipboardList },
          { id: "ordens_compra", label: "Ordens de Compra & Fornecedores", icon: ShoppingBag, badge: purchaseOrders.length },
          { id: "estoque_insumos", label: "Estoque Físico & ROP", icon: Boxes },
          { id: "alavancas", label: "Alavancas Zumi IA", icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-t-xl"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] rounded-t-xl"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-[var(--muted)]"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-[var(--surface2)] border border-[var(--line)] text-[10px] text-[var(--ink)] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==============================================================================
          ABA 1: PREVISÃO DE DEMANDA & INSUMOS (VISÃO MULTI-INSUMO COMPLETA)
      ============================================================================== */}
      {activeTab === "previsao" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cronograma de Abastecimento Inteligente (Salmão Fresco Chileno) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--ink)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Cronograma de Abastecimento Inteligente (Tangará da Serra)
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Fracionamento em remessas semanais para garantir frescor extremo sem superlotar a câmara de resfriados (0°C a 2°C).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[var(--surface2)] text-sky-700 dark:text-sky-400 px-3 py-1 rounded-lg border border-[var(--line)]">
                  Pantanal Pescados (Cuiabá ➔ Tangará)
                </span>
                <button
                  onClick={() => handleQuickGenerateOc("sup_pantanal")}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition shadow-2xs cursor-pointer active:scale-98"
                >
                  + Gerar Pedido Salmão
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remessa 1 */}
              <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--ink)]">1ª Remessa (Início da Semana)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-black uppercase">
                    18 Peças (~108 kg)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <p className="text-[10.5px] text-[var(--muted)]">Momento do Pedido:</p>
                    <p className="font-bold text-[var(--ink)]">Segunda-feira 10h (Cuiabá)</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] text-[var(--muted)]">Chegada em Tangará:</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Terça-feira 11h (Antes do Almoço)</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-xs">
                  <span className="text-[var(--muted)] text-[11px]">Cobre Almoço e Jantar de Terça, Quarta e Quinta</span>
                  <span className="font-black text-[var(--ink)]">R$ 7.398,00</span>
                </div>
              </div>

              {/* Remessa 2 */}
              <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--ink)]">2ª Remessa (Pico do Fim de Semana)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase">
                    24 Peças (~144 kg)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <p className="text-[10.5px] text-[var(--muted)]">Momento do Pedido:</p>
                    <p className="font-bold text-[var(--ink)]">Quarta-feira 16h (Cuiabá)</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] text-[var(--muted)]">Chegada em Tangará:</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Sexta-feira 10h (Frescor Máximo)</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-xs">
                  <span className="text-[var(--muted)] text-[11px]">Cobre Salão e Delivery de Sexta, Sábado e Domingo</span>
                  <span className="font-black text-[var(--ink)]">R$ 9.864,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros da Tabela de Insumos da Previsão */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar insumo (salmão, arroz, nori, cream cheese)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "Pescados Nobres", "Secos & Grãos", "Laticínios", "Hortifrúti", "Embalagens"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  {cat === "all" ? "Todos os Insumos" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela Interativa de Insumos da Previsão (Explosão de Materiais) */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-[var(--ink)]">Explosão Preditiva de Insumos ({filteredRequirements.length} monitorados)</h3>
              </div>
              <span className="text-xs text-[var(--muted)] font-medium">Horizonte: {horizonDays} dias · Cenário: {scenarioMultiplier}x</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface2)] text-[10.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-3 px-4">Insumo / Categoria</th>
                    <th className="py-3 px-3 text-right">Estoque Físico</th>
                    <th className="py-3 px-3 text-right">Consumo Previsto</th>
                    <th className="py-3 px-3 text-center">Cobertura</th>
                    <th className="py-3 px-3 text-right">Déficit Líquido</th>
                    <th className="py-3 px-3 text-right">Sugestão Compra</th>
                    <th className="py-3 px-3 text-right">Custo Est. (R$)</th>
                    <th className="py-3 px-3">Fornecedor / Prazo</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredRequirements.map(req => {
                    const isCritical = req.status === "CRITICO";
                    const isAttention = req.status === "ATENCAO";

                    return (
                      <tr key={req.material.code} className="hover:bg-[var(--surface2)] transition">
                        <td className="py-3 px-4 font-semibold text-[var(--ink)]">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isCritical ? "bg-rose-500 animate-pulse" : isAttention ? "bg-amber-400" : "bg-emerald-500"
                            }`} />
                            <div>
                              <p className="leading-tight font-bold">{req.material.name}</p>
                              <span className="text-[10px] text-[var(--muted)] font-normal">{req.material.category} · {req.material.code}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-[var(--ink)]">
                          {req.currentStock.toFixed(1)} <span className="text-[10px] text-[var(--muted)] font-normal">{req.material.recipeUnit}</span>
                        </td>

                        <td className="py-3 px-3 text-right text-[var(--muted)] font-semibold">
                          {req.grossRequirementRecipeUnit.toFixed(1)} <span className="text-[10px] text-[var(--muted)] font-normal">{req.material.recipeUnit}</span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            isCritical 
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" 
                              : isAttention 
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          }`}>
                            <span>{req.daysOfCoverageRemaining} dias</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-bold">
                          {req.netDeficitPurchaseUnit > 0 ? (
                            <span className={isCritical ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-amber-600 dark:text-amber-400"}>
                              {req.netDeficitPurchaseUnit.toFixed(1)} {req.material.recipeUnit}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">Sem déficit</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-extrabold text-[var(--ink)]">
                          {req.suggestedPurchaseOrderQty > 0 ? (
                            <span className="text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              {req.suggestedPurchaseOrderQty} {req.material.recipeUnit}
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                          {req.estimatedCostBrl > 0 ? formatBrl(req.estimatedCostBrl) : "R$ 0,00"}
                        </td>

                        <td className="py-3 px-3 text-xs">
                          <p className="font-semibold text-[var(--ink)] truncate max-w-[160px]">{req.recommendedSupplier.name}</p>
                          <span className="text-[10px] text-[var(--muted)]">{req.material.leadTimeDays}d lead time ({req.recommendedSupplier.city})</span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {req.suggestedPurchaseOrderQty > 0 ? (
                            <button
                              onClick={() => handleQuickGenerateOc(req.material.supplierId)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-slate-950 font-extrabold text-[11px] border border-amber-500/30 transition cursor-pointer"
                            >
                              + Gerar OC
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Abastecido</span>
                          )}
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

      {/* ==============================================================================
          ABA 2: FICHAS TÉCNICAS & BOM (LISTA TÉCNICA DOS 211 SKUS)
      ============================================================================== */}
      {activeTab === "fichas_tecnicas" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[var(--ink)] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                Fichas Técnicas Operacionais (BOM - Bill of Materials)
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Detalhamento analítico de cada prato do Zuma: insumos em gramas, fator de perda/rendimento e CMV teórico.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar prato (combo, hot, temaki)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSheets.map(sheet => (
              <div 
                key={sheet.id}
                onClick={() => setSelectedSheet(sheet)}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-amber-500/50 transition cursor-pointer space-y-3 shadow-xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[var(--surface2)] text-[10.5px] font-bold text-[var(--muted)] uppercase border border-[var(--line)]">
                      {sheet.category} · {sheet.station}
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--ink)] mt-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {sheet.dishName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--muted)] block">Venda</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatBrl(sheet.salePrice)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-center font-mono-nums">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Custo BOM</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatBrl(sheet.theoreticalCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">CMV Teórico</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{sheet.cmvPercent.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Margem R$</span>
                    <span className="text-xs font-bold text-[var(--ink)]">{formatBrl(sheet.grossMarginBrl)}</span>
                  </div>
                </div>

                <div className="text-xs text-[var(--muted)] space-y-1">
                  <p className="text-[11px] font-bold text-[var(--ink)]">Principais Ingredientes:</p>
                  <div className="flex flex-wrap gap-1">
                    {sheet.ingredients.slice(0, 4).map((ing, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[var(--surface2)] text-[10px] text-[var(--ink)] border border-[var(--line)]">
                        {ing.name}: {ing.quantityRecipeUnit} {ing.recipeUnit}
                      </span>
                    ))}
                    {sheet.ingredients.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                        +{sheet.ingredients.length - 4} mais
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Tempo Prep: {sheet.prepTimeMinutes} min</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Ver Ficha Completa</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALHE DA FICHA TÉCNICA */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase">
                  Ficha Técnica Completa · {selectedSheet.category}
                </span>
                <h2 className="text-xl font-black text-[var(--ink)] mt-1">{selectedSheet.dishName}</h2>
                <p className="text-xs text-[var(--muted)]">Estação de Produção: {selectedSheet.station} · Rendimento: {selectedSheet.servings} porção(ões)</p>
              </div>
              <button 
                onClick={() => setSelectedSheet(null)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] text-sm font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPIs da Receita */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Preço de Venda</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatBrl(selectedSheet.salePrice)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Custo Insumos</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{formatBrl(selectedSheet.theoreticalCost)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">CMV Teórico</span>
                <span className="text-base font-black text-sky-600 dark:text-sky-400">{selectedSheet.cmvPercent.toFixed(1)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Margem Bruta</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">{formatBrl(selectedSheet.grossMarginBrl)}</span>
              </div>
            </div>

            {/* Lista dos Ingredientes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Composição de Ingredientes (BOM Explosion):</h4>
              <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--surface2)] text-[var(--muted)] text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Ingrediente</th>
                      <th className="py-2.5 px-3 text-right">Qtd Usada</th>
                      <th className="py-2.5 px-3 text-right">Rendimento</th>
                      <th className="py-2.5 px-3 text-right">Custo Proporcional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {selectedSheet.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface2)]">
                        <td className="py-2 px-3 font-semibold text-[var(--ink)]">{ing.name}</td>
                        <td className="py-2 px-3 text-right font-bold text-[var(--ink)]">{ing.quantityRecipeUnit} {ing.recipeUnit}</td>
                        <td className="py-2 px-3 text-right text-[var(--muted)]">{ing.prepYieldPercent}%</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{formatBrl(ing.costShareBrl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observações do Chefe */}
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">Instruções do Sushiman &amp; Padrão Zuma:</span>
              <p className="text-[var(--ink)] leading-relaxed">{selectedSheet.chefNotes}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSheet(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] text-xs font-bold transition cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          ABA 3: ORDENS DE COMPRA & GESTÃO DE FORNECEDORES
      ============================================================================== */}
      {activeTab === "ordens_compra" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[var(--ink)] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Ordens de Compra &amp; Fornecedores Homologados
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Emita pedidos com 1 clique, envie via WhatsApp formatado ao representante e dê entrada no estoque físico na entrega do caminhão.
              </p>
            </div>
            <button
              onClick={() => handleOpenNewOcModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Ordem de Compra</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {purchaseOrders.map(po => {
              const isDelivered = po.status === "recebido";
              const isTransit = po.status === "em_transito";

              return (
                <div key={po.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">{po.orderNumber}</span>
                      <span className="text-sm font-extrabold text-[var(--ink)]">{po.supplierName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isDelivered 
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" 
                          : isTransit 
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 animate-pulse" 
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {po.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--muted)]">Previsão Entrega:</span>
                      <span className="font-bold text-[var(--ink)]">{new Date(po.expectedDeliveryDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-[var(--surface2)] text-[var(--muted)] text-[10px] uppercase font-bold">
                          <th className="py-2.5 px-3">Item Solicitado</th>
                          <th className="py-2.5 px-3 text-right">Qtd / Embalagem</th>
                          <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] font-mono-nums">
                        {po.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-[var(--surface2)]">
                            <td className="py-2 px-3 font-sans font-semibold text-[var(--ink)]">{it.rawMaterialName}</td>
                            <td className="py-2 px-3 text-right font-bold text-[var(--ink)]">{it.quantity} {it.purchaseUnit}</td>
                            <td className="py-2 px-3 text-right text-[var(--muted)]">{formatBrl(it.unitPrice)}</td>
                            <td className="py-2 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{formatBrl(it.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Rodapé da Ordem */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-[var(--muted)] space-y-0.5">
                      <p>Condição: <strong className="text-[var(--ink)]">{po.paymentMethod}</strong> (Vencimento: {po.dueDate})</p>
                      <p className="text-[11px] text-[var(--muted)]">{po.notes}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[var(--ink)] mr-2">
                        Total: <strong className="text-emerald-600 dark:text-emerald-400 text-base">{formatBrl(po.totalAmount)}</strong>
                      </span>

                      <button
                        onClick={() => handleCopyWhatsAppOrder(po)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] flex items-center gap-1.5 transition cursor-pointer"
                        title="Copiar texto para colar no WhatsApp do vendedor"
                      >
                        {copiedOcId === po.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedOcId === po.id ? "Copiado!" : "Copiar"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenWhatsAppWeb(po)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
                        title="Abrir diretamente no WhatsApp Web"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Abrir WhatsApp</span>
                      </button>

                      {!isDelivered && (
                        <button
                          onClick={() => receiveOcMutation.mutate({ orderId: po.id })}
                          disabled={receiveOcMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-98"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receber &amp; Dar Entrada</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================================
          ABA 4: ESTOQUE FÍSICO & PONTO DE REPOSIÇÃO (ROP)
      ============================================================================== */}
      {activeTab === "estoque_insumos" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[var(--ink)] flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-600" />
                Estoque Físico de Insumos &amp; Alertas de Ponto de Pedido (ROP)
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Ajuste rápido de saldos físicos com recálculo instantâneo das previsões de compras e proteção de câmara fria em Tangará da Serra.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar insumo (salmão, arroz, nori)..."
                value={buscaEstoque}
                onChange={(e) => setBuscaEstoque(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Filtros de Categoria de Estoque */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: "todas", label: `Todos (${rawMaterials.length})` },
              { id: "pescados", label: "Pescados & Frutos do Mar" },
              { id: "secos", label: "Secos & Grãos" },
              { id: "laticínios", label: "Laticínios & Óleos" },
              { id: "hortifrúti", label: "Hortifrúti" },
              { id: "embalagens", label: "Embalagens & Descartáveis" },
              { id: "critico", label: `Alerta ROP (${rawMaterials.filter(m => m.currentStock <= m.minStock).length})` }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFiltroCategoriaEstoque(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                  filtroCategoriaEstoque === cat.id
                    ? "bg-sky-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawMaterials
              .filter(mat => {
                const matchBusca = !buscaEstoque || mat.name.toLowerCase().includes(buscaEstoque.toLowerCase()) || mat.code.toLowerCase().includes(buscaEstoque.toLowerCase());
                if (filtroCategoriaEstoque === "critico") {
                  return matchBusca && mat.currentStock <= mat.minStock;
                }
                const matchCat = filtroCategoriaEstoque === "todas" || mat.category.toLowerCase().includes(filtroCategoriaEstoque.toLowerCase());
                return matchBusca && matchCat;
              })
              .map(mat => {
              const isBelowMin = mat.currentStock <= mat.minStock;

              return (
                <div key={mat.code} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{mat.category}</span>
                      <h4 className="text-sm font-black text-[var(--ink)] leading-tight mt-0.5">{mat.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isBelowMin ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {isBelowMin ? "Abaixo do Mínimo" : "Estável"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--surface2)] font-mono-nums text-center border border-[var(--line)]">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Estoque Atual</span>
                      <span className="text-base font-black text-[var(--ink)]">{mat.currentStock.toFixed(1)} {mat.recipeUnit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Estoque Mínimo</span>
                      <span className="text-base font-bold text-[var(--muted)]">{mat.minStock.toFixed(1)} {mat.recipeUnit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[var(--muted)] text-[11px] font-medium">{mat.storageType}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStockMutation.mutate({ code: mat.code, delta: -5 })}
                        className="w-7 h-7 rounded-lg bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] font-black flex items-center justify-center text-xs cursor-pointer"
                        title="Reduzir 5 unidades do estoque"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateStockMutation.mutate({ code: mat.code, delta: 10 })}
                        className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-slate-950 border border-amber-500/30 font-black flex items-center justify-center text-xs cursor-pointer"
                        title="Acrescentar 10 unidades ao estoque"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================================
          ABA 5: ALAVANCAS PREDITIVAS DO AKIRA & ZUMI IA
      ============================================================================== */}
      {activeTab === "alavancas" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Alavancas Autônomas de Receita &amp; Ocupação Zumi IA
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Ações preditivas baseadas na ocupação do Mapa de Calor 7x11, validade do lote de salmão fresco e dias de chuva em Tangará da Serra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alavanca 1 */}
              <div className="p-5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-500/20">
                      Alavanca 1 • Insumo Excedente
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+R$ 2.450,00</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[var(--ink)] mt-2">Almoço Executivo Quarta/Quinta (11h30 às 13h30)</h4>
                  <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                    Dispara no WhatsApp para 180 clientes corporativos do centro de Tangará da Serra promoção de Combo Sashimi Executivo para acelerar o giro do salmão fresco da 1ª remessa.
                  </p>
                </div>

                <button 
                  onClick={() => handleDispararAlavanca("Combo Executivo Almoço Corporativo", "promocao_excedente", 2450)}
                  disabled={dispararAlavancaMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar WhatsApp Zumi VIP</span>
                </button>
              </div>

              {/* Alavanca 2 */}
              <div className="p-5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase border border-rose-500/20">
                      Alavanca 2 • Blindagem de Cozinha
                    </span>
                    <span className="text-xs font-bold text-sky-600">SLA &lt; 20 min</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[var(--ink)] mt-2">Proteção de Cozinha no Pico Sexta-feira (20h às 21h30)</h4>
                  <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                    Suspende temporariamente no cardápio digital e iFood barcas ultra complexas, direcionando a demanda para Combinados Nobres Rápidos sem estrangular o sushibar.
                  </p>
                </div>

                <button 
                  onClick={() => handleDispararAlavanca("Blindagem de Cozinha Sexta-feira", "blindagem_cozinha", 1890)}
                  disabled={dispararAlavancaMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] font-bold text-xs border border-[var(--line)] flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Programar Restrição no Cardápio</span>
                </button>
              </div>

              {/* Alavanca 3 */}
              <div className="p-5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[10px] font-bold uppercase border border-sky-500/20">
                      Alavanca 3 • Operação Chuva
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+R$ 3.840,00</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[var(--ink)] mt-2">Reforço de Embalagens Térmicas &amp; Pratos Quentes</h4>
                  <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                    Ajusta o estoque mínimo de caixas térmicas estanques de delivery e aumenta a produção de Lamen e Hot Rolls aproveitando o pico de delivery na chuva de Tangará.
                  </p>
                </div>

                <button 
                  onClick={() => handleDispararAlavanca("Reforço Operação Chuva Tangará", "contingencia_chuva", 3840)}
                  disabled={dispararAlavancaMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Ativar Contingência de Chuva</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          MODAL INTERATIVO: NOVA ORDEM DE COMPRA PERSONALIZADA
      ============================================================================== */}
      {modalNewOcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase border border-emerald-500/20">
                  Gestão de Suprimentos Zuma
                </span>
                <h2 className="text-lg font-black text-[var(--ink)] mt-1">Gerar Nova Ordem de Compra Oficial</h2>
                <p className="text-xs text-[var(--muted)]">Integração automática com o contas a pagar e atualização de saldo de estoque.</p>
              </div>
              <button 
                onClick={() => setModalNewOcOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] text-sm font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor de Fornecedor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">Fornecedor Homologado:</label>
                <select
                  value={modalSupplierId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setModalSupplierId(newId);
                    const sup = suppliers.find(s => s.id === newId);
                    const supMaterials = rawMaterials.filter(m => m.supplierId === newId);
                    setModalItems(supMaterials.map(m => ({
                      rawMaterialCode: m.code,
                      rawMaterialName: m.name,
                      quantity: m.idealLot || 10,
                      purchaseUnit: m.purchaseUnit,
                      unitPrice: m.unitCost,
                      totalPrice: Math.round((m.idealLot || 10) * m.unitCost * 100) / 100,
                    })));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-amber-500"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">Condição de Pagamento:</label>
                <select
                  value={modalPaymentMethod}
                  onChange={(e) => setModalPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Boleto 14 dias">Boleto 14 dias</option>
                  <option value="Boleto 21 dias">Boleto 21 dias</option>
                  <option value="Boleto 28 dias">Boleto 28 dias</option>
                  <option value="Pix Faturado">Pix Faturado</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
            </div>

            {/* Lista dos Itens da Ordem de Compra */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--ink)]">Itens a Solicitar:</label>
                <span className="text-[11px] text-[var(--muted)]">Valores unitários da tabela homologada</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--line)] max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--surface2)] text-[var(--muted)] text-[10px] uppercase font-bold sticky top-0">
                      <th className="py-2 px-3">Insumo</th>
                      <th className="py-2 px-3 text-right">Qtd</th>
                      <th className="py-2 px-3 text-right">Preço Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] font-mono-nums">
                    {modalItems.map((item, index) => (
                      <tr key={item.rawMaterialCode} className="hover:bg-[var(--surface2)]">
                        <td className="py-2 px-3 font-sans font-semibold text-[var(--ink)]">
                          {item.rawMaterialName}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = Math.max(0, parseFloat(e.target.value) || 0);
                              const updated = [...modalItems];
                              updated[index] = {
                                ...item,
                                quantity: newQty,
                                totalPrice: Math.round(newQty * item.unitPrice * 100) / 100
                              };
                              setModalItems(updated);
                            }}
                            className="w-20 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--line)] text-right font-bold text-[var(--ink)] focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right text-[var(--muted)]">
                          {formatBrl(item.unitPrice)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                          {formatBrl(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total e Ações */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
              <div>
                <span className="text-xs text-[var(--muted)] block">Valor Total do Pedido:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatBrl(modalItems.reduce((acc, it) => acc + it.totalPrice, 0))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalNewOcOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    const sup = suppliers.find(s => s.id === modalSupplierId) || suppliers[0];
                    const deliveryDate = new Date(Date.now() + (modalDeliveryDaysAhead * 24 * 3600000)).toISOString();
                    
                    createOcMutation.mutate({
                      supplierId: sup.id,
                      supplierName: sup.name,
                      supplierPhone: sup.whatsapp || sup.phone,
                      expectedDeliveryDate: deliveryDate,
                      paymentMethod: modalPaymentMethod,
                      items: modalItems.filter(i => i.quantity > 0),
                      notes: `Emissão manual pelo Gestor de Suprimentos Zuma. Prazo: ${modalDeliveryDaysAhead} dias.`
                    });
                  }}
                  disabled={createOcMutation.isPending || modalItems.every(i => i.quantity === 0)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-xs cursor-pointer active:scale-98"
                >
                  {createOcMutation.isPending ? "Emitindo..." : "Confirmar & Emitir Ordem de Compra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrevisaoComprasSalmao;
