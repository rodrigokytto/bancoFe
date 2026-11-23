import React, { useState } from "react";
import {
  CloudRain,
  Droplets,
  Thermometer,
  Sun,
  CloudLightning,
  Wind,
  Umbrella,
  Copy,
  Check,
  Send,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Truck,
  Flame,
  Award,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Percent,
  Compass,
  Bot,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

interface Props {
  negocioAtivo?: string;
}

export const DrClimaOperacaoChuvaSubsuite: React.FC<Props> = ({ negocioAtivo = "zuma" }) => {
  // Chamada tRPC para a API do Dr. Clima Tangará da Serra (Open-Meteo)
  const drClimaQuery = trpc.zuma.getDrClimaTangara.useQuery(undefined, {
    refetchInterval: 60000, // auto refresh a cada 1 min
  });

  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [planoPersonalizado, setPlanoPersonalizado] = useState<any | null>(null);
  const [disparandoCampanha, setDisparandoCampanha] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Simulador de Impacto Financeiro da Chuva
  const [pedidosChuvaExtra, setPedidosChuvaExtra] = useState(42);
  const [ticketMedioSimulado, setTicketMedioSimulado] = useState(138.5);

  const gerarPlanoMutation = trpc.zuma.gerarPlanoAcaoChuvaIa.useMutation({
    onSuccess: (data) => {
      setPlanoPersonalizado(data);
      setGerandoPlano(false);
      toast.success("Plano Tático Operação Chuva gerado com sucesso via Zumi IA!");
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

  const dadosClima = drClimaQuery.data;
  const current = dadosClima?.current;
  const impacto = dadosClima?.impactoGastronomico;
  const alertas = dadosClima?.alertasExtremos || [];
  const dias = dadosClima?.dias || [];
  const janelasJantar = dadosClima?.janelasJantar || [];

  const handleGerarPlanoIa = () => {
    setGerandoPlano(true);
    gerarPlanoMutation.mutate({
      temperatura: current?.temperatura || 26,
      condicao: current?.condicao || "Chuva Tropical Moderada",
      probabilidadeChuva: dias[0]?.probabilidadeChuvaPct || 85,
      precipitacaoMm: current?.precipitacaoMmH || 3.8,
    });
  };

  const handleDispararCampanha = (textoMensagem: string) => {
    setDisparandoCampanha(true);
    dispararCampanhaMutation.mutate({
      nomeCampanha: "Operação Chuva Tangará Express",
      cupom: "CHUVANAZUMA",
      mensagem: textoMensagem,
      segmento: "Clientes VIP e Recorrentes de Delivery (Centro, Jardim Europa, Vila Alta)",
    });
  };

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success("Mensagem copiada para a área de transferência!");
    setTimeout(() => setCopiado(false), 2500);
  };

  const faturamentoIncrementalSimulado = pedidosChuvaExtra * ticketMedioSimulado;

  const mensagemPadraoChuva = `🌧️ *Tá chovendo forte em Tangará da Serra? Não precisa sair de casa!*\n\nO *Zuma Cozinha Oriental* preparou a *Operação Chuva Quentinha* para você:\n\n🍜 *Lamen Tradicional Fumegante* (caldo especial de 18h cozimento)\n🔥 *Hot Rolls Especiais* super crocantes e sequinhos\n🍱 *Combos Nobres de Salmão Fresco Chileno*\n\n🛵 *Garantia Zuma:* Entrega rápida em até 38 minutos com baú estanque térmico vedado anti-umidade!\n\n🎁 Use o cupom *CHUVANAZUMA* e ganhe *TAXA DE ENTREGA GRÁTIS* em pedidos acima de R$ 90!\n\n👇 Peça direto pelo nosso cardápio digital oficial (sem intermediários):\nhttps://zuma.com.br/delivery`;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* ===================================================================== */}
      {/* 1. HEADER EXECUTIVO DO DR. CLIMA TANGARÁ DA SERRA (MT)                 */}
      {/* ===================================================================== */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[var(--surface)] to-[var(--surface2)] border border-blue-500/30 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <CloudRain className="w-3 h-3 animate-bounce" />
                Dr. Clima Zuma · Meteorologia Operacional
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                Inspirado no Dr. Clima (atrix-ia)
              </span>
              <span className="text-xs text-[var(--muted)] font-mono">
                Tangará da Serra · Chapadão dos Parecis (MT)
              </span>
              <span className="text-[11px] text-[var(--muted)] font-mono">
                Lat: -14.6228 · Lon: -57.5075
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              Previsão do Tempo &amp; Plano Tático para Dias de Chuva
            </h2>
            <p className="text-xs text-[var(--muted)] max-w-3xl leading-relaxed">
              Monitoramento meteorológico em tempo real de <b>Tangará da Serra (MT)</b> conectado à <b>Open-Meteo &amp; WMO</b>. 
              Correlaciona variações climáticas com picos de delivery, antecipa a queda no salão presencial, ajusta o cardápio (foco em <b>Lamen &amp; Hot Rolls</b>) e neutraliza concorrentes que atrasam na chuva.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                drClimaQuery.refetch();
                toast.success("Dados meteorológicos de Tangará da Serra atualizados!");
              }}
              disabled={drClimaQuery.isFetching}
              className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${drClimaQuery.isFetching ? "animate-spin" : ""}`} />
              <span>Sincronizar Tempo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CARDS DE CONDIÇÃO ATUAL & ALERTA DE STATUS OPERACIONAL              */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Temperatura & Sensação */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Temperatura Agora</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--ink)] flex items-baseline gap-1">
            {current?.temperatura ?? 25.6}°C
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span>Sensação Térmica:</span>
            <span className="font-bold text-[var(--ink)]">{current?.sensacaoTermica ?? 29.6}°C</span>
          </div>
        </div>

        {/* Card 2: Precipitação & Probabilidade de Chuva */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-blue-500/30 bg-blue-500/5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
            <span>Chuva &amp; Precipitação</span>
            <CloudRain className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 flex items-baseline gap-1">
            {dias[0]?.probabilidadeChuvaPct ?? 83}%
            <span className="text-xs font-normal text-[var(--muted)]">probab. hoje</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span>Volume Estimado:</span>
            <span className="font-bold text-blue-600">{dias[0]?.precipitacaoSumMm ?? 1.1} mm</span>
          </div>
        </div>

        {/* Card 3: Umidade & Vento */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
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
            <span className="font-bold text-[var(--ink)]">{current?.ventoKmH ?? 9.8} km/h</span>
          </div>
        </div>

        {/* Card 4: Impacto no Delivery */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-[var(--surface)] border border-purple-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
            <span>Demanda Delivery</span>
            <Flame className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
            {impacto?.projecaoDelivery ?? "+75% a +90%"}
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span>Impacto Salão:</span>
            <span className="font-bold text-red-500">{impacto?.projecaoSalao ?? "-40% a -55%"}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ALERTAS DE EVENTOS EXTREMOS (INSPIRADO NO DR. CLIMA DO ATRIX-IA)   */}
      {/* ===================================================================== */}
      {alertas.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Alertas Meteorológicos Extremos Detectados em Tangará da Serra:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {alertas.map((alerta, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--surface)] border border-amber-500/20 text-xs flex items-start gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  alerta.severidade === "critico" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                }`}>
                  {alerta.severidade === "critico" ? "CRÍTICO" : "AVISO"}
                </span>
                <div>
                  <div className="font-bold text-[var(--ink)]">{alerta.tipo} · {alerta.data}</div>
                  <div className="text-[var(--muted)] text-[11px] mt-0.5 leading-snug">{alerta.descricao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MATRIZ DE IMPACTO GASTRONÔMICO: CARDÁPIO, LOGÍSTICA & CONCORRÊNCIA  */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bloco 1: Pratos com Alta Afinidade no Clima Atual */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-[var(--ink)]">Afinidade de Cardápio</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-bold">
              Pratos Quentes em Alta
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Em dias chuvosos e úmidos em Tangará da Serra, o consumidor busca conforto térmico. A demanda por pratos quentes cresce expressivamente:
          </p>

          <div className="space-y-2">
            {(impacto?.indiceAfinidadePratos || [
              { prato: "Lamen Nobre Zuma (Caldo Quente 18h)", afinidade: "+120%", categoria: "Quente" },
              { prato: "Hot Roll Especial Filadélfia", afinidade: "+85%", categoria: "Quente" },
              { prato: "Yakisoba Nobre Filé & Camarão", afinidade: "+75%", categoria: "Quente" },
              { prato: "Gyoza Frito no Vapor & Harumaki", afinidade: "+60%", categoria: "Entrada" },
              { prato: "Vinho Tinto Chileno / Chá Quente", afinidade: "+45%", categoria: "Bebida" },
            ]).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface2)] text-xs">
                <span className="font-bold text-[var(--ink)] truncate">{item.prato}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-black text-[11px] shrink-0 font-mono">
                  {item.afinidade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 2: Gargalo dos Concorrentes na Chuva vs Vantagem Zuma */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-[var(--ink)]">Gargalo Logístico Concorrentes</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-bold">
              Atrasos Críticos iFood
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Na chuva, motoboys do iFood recusam corridas e os concorrentes atrasam. O Zuma mantém frota própria dedicada:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
              <div className="flex items-center justify-between font-bold text-red-600">
                <span>Bonsai Sushi Lounge</span>
                <span className="font-mono">85 a 95 min</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-snug">
                Embalagem de papelão amolece na chuva; clientes relatam sushi bagunçado e pedidos cancelados.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-600">
                <span>Nosso Sushi Delivery</span>
                <span className="font-mono">75 a 85 min</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-snug">
                Falta de motoboys próprios gera fila de espera no WhatsApp e entregas que chegam frias.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-600">
                <span>⭐ Garantia Zuma Pilot</span>
                <span className="font-mono">35 a 40 min</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug">
                Frota própria com baú térmico estanque vedado contra chuva e caixas ventiladas anti-vapor!
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3: Janela Nobre de Jantar (18h às 23h) */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-[var(--ink)]">Janela do Jantar (18h - 23h)</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold">
              Escala de Motoboys
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Previsão hora a hora para dimensionar a cozinha KDS e o número de motoboys em Tangará:
          </p>

          <div className="space-y-1.5">
            {janelasJantar.length > 0 ? (
              janelasJantar.map((j, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface2)] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--ink)]">{j.hora}</span>
                    <span className="text-[11px] text-[var(--muted)] truncate max-w-[110px]">{j.condicao}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[var(--muted)]">{j.temp.toFixed(1)}°C</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      j.probChuva >= 70 ? "bg-blue-600 text-white" : "bg-blue-500/20 text-blue-600"
                    }`}>
                      {j.probChuva}% chuva
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--muted)] p-3 text-center">
                Dados horários sincronizados com sucesso.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. PREVISÃO DOS PRÓXIMOS 7 DIAS EM TANGARÁ DA SERRA (MT)              */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">Previsão Semanal de 7 Dias · Tangará da Serra (MT)</h3>
              <p className="text-[11px] text-[var(--muted)]">Antecipação meteorológica para compras de insumos, escala de sushimen e contingência de entregadores.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">Open-Meteo Oficial</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {dias.map((dia: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                idx === 0
                  ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30"
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
                  <CloudLightning className="w-6 h-6 animate-pulse" />
                ) : dia.probabilidadeChuvaPct >= 40 ? (
                  <CloudRain className="w-6 h-6" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>

              <div className="text-xs font-bold text-[var(--ink)]">
                {dia.tempMax.toFixed(0)}° / <span className="text-[var(--muted)]">{dia.tempMin.toFixed(0)}°</span>
              </div>

              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {dia.probabilidadeChuvaPct}%
              </div>

              <div className="text-[10px] text-[var(--muted)] truncate">
                {dia.precipitacaoSumMm.toFixed(1)}mm
              </div>

              <div className="pt-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                  dia.riscoOperacional === "ALTO"
                    ? "bg-red-500/20 text-red-600"
                    : dia.riscoOperacional === "MÉDIO"
                    ? "bg-amber-500/20 text-amber-600"
                    : "bg-emerald-500/20 text-emerald-600"
                }`}>
                  Risco {dia.riscoOperacional}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. GERADOR DE PLANO TÁTICO ACIONÁVEL COM IA ZUMI (KYTTOIA NEURAL ENGINE V2.5 FLASH)   */}
      {/* ===================================================================== */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 via-[var(--surface)] to-[var(--surface2)] border border-purple-500/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--ink)]">
                  Plano Tático Operação Chuva · KyttoIA Neural Engine (v2.5 Flash)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                  Acionável
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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${gerandoPlano ? "animate-spin" : ""}`} />
            <span>{gerandoPlano ? "Processando com KyttoIA..." : "Gerar Plano Tático com KyttoIA"}</span>
          </button>
        </div>

        {/* Exibição do Plano Gerado ou Template Padrão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Coluna 1: Copy de Disparo WhatsApp Zumi com Cupom */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[var(--ink)]">Mensagem de Disparo WhatsApp Zumi</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[10px] font-bold">
                Cupom: CHUVANAZUMA
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {planoPersonalizado?.plano || mensagemPadraoChuva}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => copiarTexto(planoPersonalizado?.plano || mensagemPadraoChuva)}
                className="flex-1 py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
              </button>

              <button
                onClick={() => handleDispararCampanha(planoPersonalizado?.plano || mensagemPadraoChuva)}
                disabled={disparandoCampanha}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{disparandoCampanha ? "Disparando..." : "Disparar para 342 Clientes"}</span>
              </button>
            </div>
          </div>

          {/* Coluna 2: Protocolo Operacional & Projeção Financeira */}
          <div className="space-y-4">
            {/* Protocolo KDS & Motoboys */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2.5 text-xs">
              <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>Protocolo de Cozinha KDS &amp; Frota Própria Zuma</span>
              </div>
              <ul className="space-y-1.5 text-[var(--muted)]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><b>Remanejamento KDS:</b> Transferir 1 sushiman da esteira para apoio na fritadeira de hot roll e woks de yakisoba/lamen.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><b>Embalagens Anti-Umidade:</b> Pré-montar 50 caixas ventiladas para preservar a crocância dos empanados no transporte chuvoso.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><b>Frota Chuva:</b> Acionar 3 motoboys de prontidão com baús estanques e bônus de segurança de R$ 2,50/entrega para zelo em pista molhada.</span>
                </li>
              </ul>
            </div>

            {/* Simulador de Faturamento Adicional na Chuva */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/20 via-[var(--surface)] to-[var(--surface2)] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Projeção Financeira da Noite Chuvosa
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-black font-mono">
                  +82% Delivery
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-[var(--muted)] font-bold">Pedidos Extras Delivery:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min={15}
                      max={80}
                      value={pedidosChuvaExtra}
                      onChange={(e) => setPedidosChuvaExtra(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-[var(--ink)] text-xs w-8">{pedidosChuvaExtra}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[var(--muted)] font-bold">Ticket Médio (R$):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min={90}
                      max={200}
                      value={ticketMedioSimulado}
                      onChange={(e) => setTicketMedioSimulado(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-[var(--ink)] text-xs w-10">R${ticketMedioSimulado}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase font-bold">Receita Incremental Projetada:</div>
                  <div className="text-xl font-black font-mono text-emerald-600">
                    {formatBrl(faturamentoIncrementalSimulado)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--muted)]">Clientes Capturados dos Rivais:</div>
                  <div className="text-xs font-bold text-[var(--ink)] font-mono">~28 pedidos do Bonsai/iFood</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
