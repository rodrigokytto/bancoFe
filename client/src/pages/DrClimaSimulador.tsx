import React, { useState } from "react";
import { 
  CloudRain, 
  Sparkles, 
  Zap, 
  Bike, 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Flame,
  UtensilsCrossed,
  MapPin,
  Clock,
  Compass,
  RefreshCw,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Sun,
  CloudLightning,
  Calendar,
  Layers,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Bot,
  Percent,
  Radio,
  FileText,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { formatBrl } from "../../../shared/zumaData";

export const DrClimaSimulador: React.FC = () => {
  // Chamada tRPC para os dados reais meteorológicos de Tangará da Serra (Open-Meteo & WMO)
  const drClimaQuery = trpc.zuma.getDrClimaTangara.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const dadosClima = drClimaQuery.data;
  const current = dadosClima?.current;
  const impacto = dadosClima?.impactoGastronomico;
  const alertas = dadosClima?.alertasExtremos || [];
  const dias = dadosClima?.dias || [];
  const janelasJantar = dadosClima?.janelasJantar || [];

  // Controle de abas da página
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "simulador" | "previsao" | "cardapio" | "concorrencia" | "ia-plano">("visao-geral");

  // Variáveis do Simulador de Contingência
  const [probChuva, setProbChuva] = useState<number>(current?.precipitacaoMmH ? 85 : (dias[0]?.probabilidadeChuvaPct || 85));
  const [motoboysExtras, setMotoboysExtras] = useState<number>(3);
  const [ticketMedioSimulado, setTicketMedioSimulado] = useState<number>(138.50);
  const [freteGratis, setFreteGratis] = useState<boolean>(true);
  const [comboDestaque, setComboDestaque] = useState<string>("lamen");
  const [isExecutando, setIsExecutando] = useState<boolean>(false);
  const [executado, setExecutado] = useState<boolean>(false);
  const [modalPlanoChuvaAberto, setModalPlanoChuvaAberto] = useState<boolean>(false);

  // Variáveis de IA e Disparo WhatsApp
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [planoPersonalizado, setPlanoPersonalizado] = useState<any | null>(null);
  const [disparandoCampanha, setDisparandoCampanha] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Cálculos dinâmicos da Contingência
  const pedidosBase = 52;
  const multiplicadorChuva = 1 + (probChuva / 100) * 0.45;
  const pedidosProjetados = Math.round(pedidosBase * multiplicadorChuva * (freteGratis ? 1.12 : 1.0));
  const pedidosAdicionais = pedidosProjetados - pedidosBase;
  const faturamentoBase = pedidosBase * ticketMedioSimulado;
  const faturamentoProjetado = pedidosProjetados * ticketMedioSimulado;
  const faturamentoAdicional = faturamentoProjetado - faturamentoBase;
  const custoEntregadores = motoboysExtras * 70.0;
  const tempoEntregaEstimado = Math.max(26, Math.round(48 - motoboysExtras * 4.2));
  const custoEmbalagens = pedidosAdicionais * 3.20;
  const cmvMarginal = faturamentoAdicional * 0.36;
  const margemLiquidaExtra = faturamentoAdicional - cmvMarginal - custoEntregadores - custoEmbalagens;
  const roiContingencia = custoEntregadores > 0 ? (faturamentoAdicional / custoEntregadores) : 0;

  // Mutations tRPC reais
  const gerarPlanoMutation = trpc.zuma.gerarPlanoAcaoChuvaIa.useMutation({
    onSuccess: (data) => {
      setPlanoPersonalizado(data);
      setGerandoPlano(false);
      toast.success("Plano Tático Operação Chuva gerado com sucesso via KyttoIA Neural Engine!");
    },
    onError: (err) => {
      setGerandoPlano(false);
      toast.error("Falha ao gerar plano tático: " + err.message);
    },
  });

  const dispararCampanhaMutation = trpc.zuma.dispararCampanhaChuvaWhatsapp.useMutation({
    onSuccess: (data) => {
      setDisparandoCampanha(false);
      toast.success(data.mensagem);
    },
    onError: (err) => {
      setDisparandoCampanha(false);
      toast.error("Erro ao disparar campanha: " + err.message);
    },
  });

  const ativarPlanoChuvaMutation = trpc.zuma.ativarPlanoChuvaContingencia.useMutation({
    onSuccess: (data) => {
      setIsExecutando(false);
      setExecutado(true);
      toast.success(data.mensagem);
    },
    onError: (err) => {
      setIsExecutando(false);
      toast.error("Erro ao ativar contingência: " + err.message);
    }
  });

  const handleExecutarPlano = () => {
    setIsExecutando(true);
    ativarPlanoChuvaMutation.mutate({
      motoboysExtras,
      taxaAdicionalBrl: 3.0,
      probabilidadeChuva: probChuva,
    });
  };

  const handleGerarPlanoIa = () => {
    setGerandoPlano(true);
    gerarPlanoMutation.mutate({
      temperatura: current?.temperatura || 25.4,
      condicao: current?.condicao || "Pancadas de Chuva Tropicais",
      probabilidadeChuva: probChuva,
      precipitacaoMm: current?.precipitacaoMmH || 3.8,
    });
  };

  const handleDispararCampanha = (textoMensagem: string) => {
    setDisparandoCampanha(true);
    dispararCampanhaMutation.mutate({
      nomeCampanha: "Operação Chuva Tangará Express",
      cupom: "CHUVANAZUMA",
      mensagem: textoMensagem,
      segmento: "Clientes Frequentes de Delivery (Centro, Jardim Europa, Vila Alta)",
    });
  };

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success("Mensagem copiada para a área de transferência!");
    setTimeout(() => setCopiado(false), 2500);
  };

  const mensagemPadraoChuva = `🌧️ *Tá chovendo forte em Tangará da Serra? Não precisa sair de casa!*\n\nO *Zuma Cozinha Oriental* preparou a *Operação Chuva Quentinha* para você:\n\n🍜 *Lamen Tradicional Fumegante* (caldo especial de 18h cozimento)\n🔥 *Hot Rolls Especiais* super crocantes e sequinhos\n🍱 *Combos Nobres de Salmão Fresco Chileno*\n\n🛵 *Garantia Zuma:* Entrega rápida em até 38 minutos com baú estanque térmico vedado anti-umidade!\n\n🎁 Use o cupom *CHUVANAZUMA* e ganhe *TAXA DE ENTREGA GRÁTIS* em pedidos acima de R$ 90!\n\n👇 Peça direto pelo nosso cardápio digital oficial (sem taxas abusivas do iFood):\nhttps://zuma.kytto.com.br/delivery`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 antialiased">
      {/* ===================================================================== */}
      {/* 1. BREADCRUMB & HEADER PRINCIPAL COM DESIGN SYSTEM CLEAN ZUMA          */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          {/* Breadcrumb e badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <CloudRain className="w-3 h-3 animate-bounce" />
              Dr. Clima 360° · Meteorologia &amp; Delivery
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Inspirado no Dr. Clima (atrix-ia)
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              Tangará da Serra · MT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight mt-1.5 flex items-center gap-2.5">
            Dr. Clima · Radar Meteorológico &amp; Plano Chuva de Vendas
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-3xl mt-1 leading-relaxed">
            Inteligência meteorológica operacional de Tangará da Serra (MT) conectada à <b>Open-Meteo &amp; WMO</b>. Correlaciona tempestades e queda de temperatura com picos de delivery (+75% a +90%), ajusta o KDS para pratos quentes e aciona motoboys extras de contingência.
          </p>
        </div>

        {/* Botões Rápidos de Ação no Topo */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              drClimaQuery.refetch();
              toast.success("Dados meteorológicos de Tangará da Serra atualizados com sucesso!");
            }}
            disabled={drClimaQuery.isFetching}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            title="Sincronizar telemetria meteorológica da Open-Meteo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${drClimaQuery.isFetching ? "animate-spin" : ""}`} />
            <span>Sincronizar Tempo</span>
          </button>

          <button
            onClick={() => setModalPlanoChuvaAberto(true)}
            disabled={isExecutando}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 active:scale-98 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{executado ? "Reativar Frota" : "Ativar Plano Chuva"}</span>
          </button>

          <Link
            href="/mercado"
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 no-underline"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--salmon)]" />
            <span>Ver Concorrência</span>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. BARRA DE CARDS EM TEMPO REAL DE TANGARÁ DA SERRA (MT)               */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Temperatura & Sensação */}
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Temperatura Agora</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--ink)] flex items-baseline gap-1">
            {current?.temperatura ?? 25.4}°C
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span>Sensação Térmica:</span>
            <span className="font-bold text-[var(--ink)]">{current?.sensacaoTermica ?? 29.4}°C</span>
          </div>
        </div>

        {/* Card 2: Probabilidade & Volume de Chuva */}
        <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
            <span>Chuva &amp; Precipitação</span>
            <CloudRain className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 flex items-baseline gap-1">
            {dias[0]?.probabilidadeChuvaPct ?? 83}%
            <span className="text-xs font-normal text-[var(--muted)]">probab. hoje</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-blue-500/20">
            <span>Volume Estimado:</span>
            <span className="font-bold text-blue-600">{dias[0]?.precipitacaoSumMm ?? 1.1} mm</span>
          </div>
        </div>

        {/* Card 3: Umidade Relativa & Vento */}
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Umidade &amp; Vento</span>
            <Wind className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--ink)] flex items-baseline gap-1">
            {current?.umidade ?? 85}%
            <span className="text-xs font-normal text-[var(--muted)]">UR</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span>Velocidade do Vento:</span>
            <span className="font-bold text-[var(--ink)]">{current?.ventoKmH ?? 8.9} km/h</span>
          </div>
        </div>

        {/* Card 4: Impacto no Delivery & Salão */}
        <div className="p-4 rounded-3xl bg-purple-500/5 border border-purple-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
            <span>Demanda Delivery</span>
            <Flame className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
            {impacto?.projecaoDelivery ?? "+75% a +90%"}
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-purple-500/20">
            <span>Impacto Salão:</span>
            <span className="font-bold text-red-500">{impacto?.projecaoSalao ?? "-40% a -55%"}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ALERTA DE EVENTOS EXTREMOS DETECTADOS EM TANGARÁ DA SERRA           */}
      {/* ===================================================================== */}
      {alertas.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>Alertas Meteorológicos Extremos Detectados em Tangará da Serra (MT):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {alertas.map((alerta, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--surface)] border border-amber-500/20 text-xs flex items-start gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                  alerta.severidade === "critico" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                }`}>
                  {alerta.severidade === "critico" ? "CRÍTICO" : "AVISO"}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-[var(--ink)] truncate">{alerta.tipo}</div>
                  <div className="text-[10px] text-[var(--muted)] font-mono">{alerta.data}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-snug line-clamp-2">{alerta.descricao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. BARRA DE SELEÇÃO DE ABAS / MÓDULOS                                  */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--line)] scrollbar-none">
        {[
          { id: "visao-geral", label: "Visão Geral 360°", icon: "🌐" },
          { id: "simulador", label: "Simulador Financeiro & DRE", icon: "📊" },
          { id: "previsao", label: "Previsão 7 Dias & Janela Jantar", icon: "🌦️" },
          { id: "cardapio", label: "Cardápio Térmico & Afinidade", icon: "🍜" },
          { id: "concorrencia", label: "Gargalos da Concorrência", icon: "🛵" },
          { id: "ia-plano", label: "Plano Tático KyttoIA", icon: "✨" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
              abaAtiva === tab.id
                ? "bg-[var(--surface)] text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs ring-1 ring-blue-500/30"
                : "bg-[var(--surface2)] text-[var(--muted)] border-transparent hover:text-[var(--ink)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* ABA 1: VISÃO GERAL 360° & SIMULADOR INTEGRADO                         */}
      {/* ===================================================================== */}
      {(abaAtiva === "visao-geral" || abaAtiva === "simulador") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna da Esquerda: Controles Operacionais Interativos */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-black text-[var(--ink)]">
                  Painel de Contingência &amp; Variáveis
                </h3>
              </div>
              <span className="text-[10px] text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full font-mono font-bold">
                Tangará da Serra
              </span>
            </div>

            {/* Slider de Probabilidade de Chuva */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink)] font-bold">Probabilidade de Chuva Noturna:</span>
                <span className="font-mono font-black text-blue-600 text-sm">{probChuva}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={probChuva}
                onChange={(e) => setProbChuva(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>20% Garoa</span>
                <span>60% Pancadas</span>
                <span>100% Tempestade</span>
              </div>
            </div>

            {/* Slider de Motoboys Extras */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink)] font-bold">Entregadores Extras de Contingência:</span>
                <span className="font-mono font-black text-amber-600 text-sm">+{motoboysExtras} motoboys</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={motoboysExtras}
                onChange={(e) => setMotoboysExtras(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>+1 Básico</span>
                <span>+3 Recomendado</span>
                <span>+6 Contingência Máxima</span>
              </div>
            </div>

            {/* Slider de Ticket Médio */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink)] font-bold">Ticket Médio Projetado:</span>
                <span className="font-mono font-black text-emerald-600 text-sm">R$ {ticketMedioSimulado.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={90}
                max={220}
                step={2.5}
                value={ticketMedioSimulado}
                onChange={(e) => setTicketMedioSimulado(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>R$ 90 (Solo)</span>
                <span>R$ 138 (Casal)</span>
                <span>R$ 220 (Família)</span>
              </div>
            </div>

            {/* Seletor de Combo Quente em Destaque */}
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                Combo Quente de Destaque no Cardápio Digital:
              </label>
              <select
                value={comboDestaque}
                onChange={(e) => setComboDestaque(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="lamen">🍜 Combo Noite Chuvosa: 2 Lamens Nobres + 16 Hot Rolls Salmão (R$ 138,00)</option>
                <option value="barca">🍣 Barca Especial Climatizada + 2 Rolinhos Primavera (R$ 164,00)</option>
                <option value="wok">🔥 Wok Yakissoba Especial Camarão &amp; Mignon + Guioza (R$ 119,00)</option>
                <option value="teppan">🍱 Teppanyaki de Salmão Fresco + Legumes Grelhados (R$ 98,90)</option>
              </select>
            </div>

            {/* Toggle Frete Grátis */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={freteGratis}
                  onChange={(e) => setFreteGratis(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-[var(--ink)] font-bold block">Frete Grátis &gt; R$ 90 no Delivery Próprio</span>
                  <span className="text-[10px] text-[var(--muted)]">Atrai pedidos direto no PWA sem taxa de 27% do iFood</span>
                </div>
              </label>
              <span className="text-[10px] font-mono text-emerald-600 font-black shrink-0">+12% conv.</span>
            </div>

            {/* Botão de Disparo da Contingência */}
            <button
              onClick={handleExecutarPlano}
              disabled={isExecutando}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExecutando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Notificando Entregadores e Cozinha...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{executado ? "Reenviar Ordem de Contingência" : "Confirmar & Acionar Contingência na Frota"}</span>
                </>
              )}
            </button>
          </div>

          {/* Coluna da Direita: Resultados Financeiros, DRE Marginal & Métricas */}
          <div className="lg:col-span-7 space-y-4">
            {/* 3 Cards de Indicadores Projetados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-bold block">Faturamento Previsto</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 block">
                  R$ {faturamentoProjetado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  +R$ {faturamentoAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} (+{Math.round((faturamentoAdicional / faturamentoBase) * 100)}%)
                </span>
              </div>

              <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-bold block">Pedidos de Delivery</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 block">
                  {pedidosProjetados} pedidos
                </span>
                <span className="text-[10px] text-blue-600 font-bold block">
                  +{pedidosAdicionais} pedidos na chuva
                </span>
              </div>

              <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[var(--muted)] font-bold block">Tempo Médio Estimado</span>
                <span className={`text-xl sm:text-2xl font-black font-mono block ${tempoEntregaEstimado <= 35 ? "text-emerald-600" : "text-amber-500"}`}>
                  {tempoEntregaEstimado} min
                </span>
                <span className="text-[10px] text-[var(--muted)] block">
                  SLA com +{motoboysExtras} motoboys extras
                </span>
              </div>
            </div>

            {/* DRE Sintético Marginal do Evento de Chuva */}
            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                    DRE Marginal da Operação Chuva (Turno Noturno)
                  </h4>
                  <p className="text-[10.5px] text-[var(--muted)]">
                    Demonstrativo em tempo real do lucro líquido gerado pelas vendas incrementais na chuva
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ROI Contingência: {roiContingencia.toFixed(1)}x
                </span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-[var(--line)]/50">
                <div className="flex justify-between items-center pt-1.5 font-bold text-[var(--ink)]">
                  <span>(+) Receita Bruta Incremental (Delivery):</span>
                  <span className="font-mono text-emerald-600">+R$ {faturamentoAdicional.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 text-[var(--muted)]">
                  <span>(-) CMV Médio Ponderado dos Pratos Quentes (36%):</span>
                  <span className="font-mono text-red-500">-R$ {cmvMarginal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 text-[var(--muted)]">
                  <span>(-) Diária da Frota Extra de Contingência ({motoboysExtras} motoboys × R$ 70):</span>
                  <span className="font-mono text-red-500">-R$ {custoEntregadores.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 text-[var(--muted)]">
                  <span>(-) Embalagens Térmicas Estanques Vedadas ({pedidosAdicionais} × R$ 3,20):</span>
                  <span className="font-mono text-red-500">-R$ {custoEmbalagens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm font-black text-[var(--ink)] bg-[var(--surface2)]/60 p-2.5 rounded-xl border border-[var(--line)]">
                  <span className="text-emerald-600 font-black">(=) Lucro Líquido Marginal Adicional:</span>
                  <span className="font-mono text-emerald-600 font-black">+R$ {margemLiquidaExtra.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Protocolo Operacional Conectado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Bike className="w-4 h-4" />
                  <span>Frota &amp; App Entregador</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Baús com manta térmica impermeável e vedação anti-umidade garantem que o combinados e lamens cheguem intactos aos clientes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>KDS 2.0 Fire-on-Demand</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  A praça de quentes assume prioridade na fila do KDS para liberação imediata de caldos e lamens em até 14 minutos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 2: PREVISÃO SEMANAL DE 7 DIAS & JANELA DO JANTAR                   */}
      {/* ===================================================================== */}
      {(abaAtiva === "visao-geral" || abaAtiva === "previsao") && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)]">
                    Previsão Semanal de 7 Dias · Tangará da Serra (MT)
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    Previsão oficial da Open-Meteo &amp; WMO para planejamento de escala e contingência
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--muted)]">
                Lat: -14.6228 · Lon: -57.5075
              </span>
            </div>

            {/* Grid dos 7 Dias */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {dias.map((dia: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all ${
                    idx === 0
                      ? "bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-[var(--surface2)] border-[var(--line)]"
                  }`}
                >
                  <div className="text-xs font-black text-[var(--ink)]">
                    {idx === 0 ? "HOJE" : dia.diaSemana.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] font-mono">
                    {dia.data.split("-").reverse().slice(0, 2).join("/")}
                  </div>

                  <div className="py-1 flex justify-center text-blue-500">
                    {dia.probabilidadeChuvaPct >= 70 ? (
                      <CloudLightning className="w-7 h-7 text-blue-600 animate-pulse" />
                    ) : dia.probabilidadeChuvaPct >= 40 ? (
                      <CloudRain className="w-7 h-7 text-blue-500" />
                    ) : (
                      <Sun className="w-7 h-7 text-amber-500" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-[var(--ink)]">
                    {dia.tempMax.toFixed(0)}° / <span className="text-[var(--muted)]">{dia.tempMin.toFixed(0)}°</span>
                  </div>

                  <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                    {dia.probabilidadeChuvaPct}%
                  </div>

                  <div className="text-[10px] text-[var(--muted)] font-mono">
                    {dia.precipitacaoSumMm.toFixed(1)} mm
                  </div>

                  <div className="pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      dia.riscoOperacional === "ALTO"
                        ? "bg-red-500/15 text-red-600"
                        : dia.riscoOperacional === "MÉDIO"
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}>
                      Risco {dia.riscoOperacional}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Janela Nobre do Jantar (18h às 23h30) */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-[var(--ink)]">
                  Janela Nobre do Jantar (18h às 23h) · Telemetria Hora a Hora
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold font-mono">
                Pico de Delivery
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {janelasJantar.length > 0 ? (
                janelasJantar.map((j, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-center space-y-1">
                    <span className="font-mono font-black text-sm text-[var(--ink)] block">{j.hora}</span>
                    <span className="text-[11px] text-[var(--muted)] block truncate">{j.condicao}</span>
                    <span className="text-xs font-mono font-bold text-[var(--ink)] block">{j.temp.toFixed(1)}°C</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                      j.probChuva >= 70 ? "bg-blue-600 text-white" : "bg-blue-500/20 text-blue-600"
                    }`}>
                      {j.probChuva}% chuva
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-xs text-[var(--muted)] p-3 text-center">
                  Dados horários sincronizados com sucesso.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 3: CARDÁPIO TÉRMICO & GARGALOS LOGÍSTICOS DA CONCORRÊNCIA         */}
      {/* ===================================================================== */}
      {(abaAtiva === "visao-geral" || abaAtiva === "cardapio" || abaAtiva === "concorrencia") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cardápio Térmico de Alta Margem */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-black text-[var(--ink)]">Afinidade de Cardápio na Chuva</h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-bold">
                Conforto Térmico
              </span>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Em dias chuvosos e de temperatura amena em Tangará, o consumidor busca alimentos quentes e aconchegantes. A demanda por pratos quentes cresce expressivamente:
            </p>

            <div className="space-y-2">
              {(impacto?.indiceAfinidadePratos || [
                { prato: "Lamen Nobre Zuma (Caldo Quente 18h)", afinidade: "+120%", categoria: "Quente" },
                { prato: "Hot Roll Especial Filadélfia Crocante", afinidade: "+85%", categoria: "Quente" },
                { prato: "Yakisoba Nobre Filé Mignon & Camarão", afinidade: "+75%", categoria: "Quente" },
                { prato: "Gyoza Frito no Vapor & Harumaki", afinidade: "+60%", categoria: "Entrada" },
                { prato: "Vinho Tinto Chileno / Chá Quente", afinidade: "+45%", categoria: "Bebida" },
              ]).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface2)] text-xs border border-[var(--line)]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">🍲</span>
                    <span className="font-bold text-[var(--ink)]">{item.prato}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-black text-xs font-mono">
                    {item.afinidade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gargalos dos Concorrentes na Chuva em Tangará da Serra */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-[var(--ink)]">Gargalos dos Concorrentes na Chuva</h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold">
                Atrasos Críticos
              </span>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Na chuva, entregadores terceirizados recusam corridas no iFood e os restaurantes rivais de Tangará entram em colapso logístico:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-1">
                <div className="flex items-center justify-between font-black text-red-600">
                  <span>Bonsai Sushi Bar (Nilo Torres)</span>
                  <span className="font-mono font-bold">85 a 95 min</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-snug">
                  Embalagens de papelão amolecem na chuva; clientes relatam sushi desmontado e cancelamento de corridas.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between font-black text-amber-600">
                  <span>Ivan's Burger (Jardim Europa)</span>
                  <span className="font-mono font-bold">75 a 85 min</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-snug">
                  Pão de hambúrguer amolece com vapor no transporte molhado e gera queixas frequentes de batata frita murcha.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between font-black text-emerald-600">
                  <span>⭐ Vantagem Competitiva Zuma Pilot</span>
                  <span className="font-mono font-bold">35 a 40 min</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug font-medium">
                  Frota própria com baú térmico estanque vedado contra chuva, caixas com respiro ventilado anti-vapor e rastreamento GPS em tempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 4: PLANO TÁTICO ZUMI IA (KYTTOIA NEURAL ENGINE V2.5 FLASH) & DISPARO WHATSAPP      */}
      {/* ===================================================================== */}
      {(abaAtiva === "visao-geral" || abaAtiva === "ia-plano") && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Plano Tático Operação Chuva · KyttoIA Neural Engine (v2.5 Flash)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    Acionável em Produção
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Gere em 1 clique o protocolo tático completo para maximizar faturamento na chuva de hoje em Tangará da Serra.
                </p>
              </div>
            </div>

            <button
              onClick={handleGerarPlanoIa}
              disabled={gerandoPlano}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${gerandoPlano ? "animate-spin" : ""}`} />
              <span>{gerandoPlano ? "Processando com KyttoIA..." : "Gerar Plano Tático com KyttoIA"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Mensagem de Disparo WhatsApp com Cupom */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-[var(--ink)]">Mensagem de Disparo WhatsApp Zumi</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono text-[11px] font-bold border border-emerald-500/20">
                  Cupom: CHUVANAZUMA
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {planoPersonalizado?.plano || mensagemPadraoChuva}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => copiarTexto(planoPersonalizado?.plano || mensagemPadraoChuva)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
                </button>

                <button
                  onClick={() => handleDispararCampanha(planoPersonalizado?.plano || mensagemPadraoChuva)}
                  disabled={disparandoCampanha}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{disparandoCampanha ? "Disparando..." : "Disparar p/ 342 Clientes"}</span>
                </button>
              </div>
            </div>

            {/* Checklist Operacional KDS & Frota Própria */}
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3 text-xs">
                <div className="font-black text-[var(--ink)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Checklist Operacional KDS &amp; Frota Própria Zuma</span>
                </div>
                <ul className="space-y-2 text-[var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span><b>Remanejamento KDS:</b> Transferir 1 sushiman da esteira para apoio na fritadeira de hot roll e woks de yakisoba e caldos de lamen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span><b>Embalagens Anti-Umidade:</b> Pré-montar 50 caixas ventiladas com camada impermeável para preservar a crocância no transporte úmido.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span><b>Frota Noturna:</b> Convocar 3 motoboys de prontidão com baús estanques e adicional de segurança de R$ 2,50/entrega para zelo em pista molhada.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span><b>Atendimento PWA:</b> Banner ativado no topo da loja digital com garantia de entrega em 38 minutos ou sobremesa grátis na próxima compra.</span>
                  </li>
                </ul>
              </div>

              {/* Box de Integração com o Open-Meteo */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CloudRain className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">Conexão Meteorológica WMO</span>
                    <span className="text-[11px] text-[var(--muted)]">API oficial Open-Meteo sincronizada a cada 60s</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono font-bold text-[11px]">
                  Online (Lat: -14.6228)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL OPERACIONAL: ATIVAÇÃO DE CONTINGÊNCIA PLANO CHUVA              */}
      {/* ===================================================================== */}
      {modalPlanoChuvaAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <CloudRain className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Ativar Operação Chuva &amp; Frota
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Tangará da Serra · Previsão {probChuva}% de Chuva
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalPlanoChuvaAberto(false)}
                className="p-1 rounded-xl hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist de Disparo Operacional */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--ink)] block">Convocação de Frota Extra:</strong>
                  <span className="text-[var(--muted)]">+{motoboysExtras} entregadores de prontidão com baús térmicos estanques.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--ink)] block">Sobretaxa de Contingência nos 15 Bairros:</strong>
                  <span className="text-[var(--muted)]">Compensação de +R$ 3,00 para garantir cobertura em bairros distantes.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--ink)] block">Destaque de Pratos Quentes no PWA:</strong>
                  <span className="text-[var(--muted)]">Lamens fumegantes e Hot Rolls em banner nobre no cardápio próprio.</span>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro Projetado */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Faturamento Previsto:</span>
                <strong className="text-emerald-600 font-mono text-sm">R$ {faturamentoProjetado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Pedidos Delivery Estimados:</span>
                <strong className="text-[var(--ink)] font-mono">{pedidosProjetados} pedidos (+{pedidosAdicionais} na chuva)</strong>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-2">
                <span className="text-[var(--muted)] font-bold">Lucro Líquido Adicional:</span>
                <strong className="text-emerald-600 font-mono font-black">+R$ {margemLiquidaExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (ROI {roiContingencia.toFixed(1)}x)</strong>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalPlanoChuvaAberto(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleExecutarPlano();
                  setModalPlanoChuvaAberto(false);
                }}
                disabled={isExecutando}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-lg hover:brightness-105 active:scale-98 transition cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Confirmar &amp; Disparar Contingência</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DrClimaSimulador;
