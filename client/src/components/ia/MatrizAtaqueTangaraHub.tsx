import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import {
  Target,
  Zap,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Clock,
  Star,
  MapPin,
  AlertTriangle,
  ShoppingBag,
  Send,
  CloudRain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Flame,
  Award,
  Sliders,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { CONCORRENTES_TANGARA } from "../../pages/MercadoBenchmark";

export function MatrizAtaqueTangaraHub() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<"todos" | "gastronomia" | "roupas">("todos");
  const [eixoExecutandoId, setEixoExecutandoId] = useState<string | null>(null);

  // Queries e Mutations tRPC
  const analyticsQuery = trpc.zuma.getMercadoTangaraAnalytics.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const acoesQuery = trpc.zuma.listAcoesConcorrencia.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const dispararAtaqueMutation = trpc.zuma.dispararAtaqueMercado.useMutation({
    onSuccess: (data) => {
      acoesQuery.refetch();
      toast.success(data.mensagem, {
        description: `Projeção: +${data.projecao.conversoesEsperadas} novos pedidos · ROI projetado de ${data.projecao.roiEsperado} · Canais: ${data.canaisAtivados.join(", ")}`,
      });
      setEixoExecutandoId(null);
    },
    onError: (err) => {
      toast.error("Falha ao disparar eixo de ataque: " + err.message);
      setEixoExecutandoId(null);
    }
  });

  const handleDispararEixo = (eixo: any) => {
    setEixoExecutandoId(eixo.id);
    dispararAtaqueMutation.mutate({
      eixoId: eixo.id,
      titulo: eixo.titulo,
      alvoNome: eixo.concorrenteAlvo,
      alvoId: eixo.id,
      bairros: eixo.bairros,
      canais: eixo.canais,
      estrategia: eixo.estrategia,
      cupom: eixo.cupom,
      orcamentoDiario: 65,
    });
  };

  // Simulador de conquista de mercado
  const [capturaBonsai, setCapturaBonsai] = useState<number>(12);
  const [capturaNossoSushi, setCapturaNossoSushi] = useState<number>(15);
  const [capturaBoutiques, setCapturaBoutiques] = useState<number>(10);

  // Cálculos dinâmicos
  const receitaCapturadaBonsai = (115000 * capturaBonsai) / 100;
  const receitaCapturadaNossoSushi = (95000 * capturaNossoSushi) / 100;
  const receitaCapturadaBoutiques = (145000 * capturaBoutiques) / 100;
  const totalCapturadoMes = receitaCapturadaBonsai + receitaCapturadaNossoSushi + receitaCapturadaBoutiques;
  const totalCapturadoAno = totalCapturadoMes * 12;

  const concorrentesFiltrados = CONCORRENTES_TANGARA.filter(c => {
    if (c.id === "zuma") return false;
    if (categoriaFiltro === "todos") return true;
    if (categoriaFiltro === "gastronomia") return (c.categoriaNegocio || "gastronomia") === "gastronomia";
    if (categoriaFiltro === "roupas") return c.categoriaNegocio === "roupas";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. HEADER DO HUB: PANORAMA DEMOGRÁFICO & ECONÔMICO DE TANGARÁ DA SERRA */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 animate-pulse" />
                Matriz Tática de Ataque &amp; Conquista
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-bold">
                Tangará da Serra (MT) · Polo Agro Médio-Norte
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => analyticsQuery.refetch()}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsQuery.isFetching ? 'animate-spin text-amber-400' : ''}`} />
                <span>Atualizar Inteligência</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Onde e Como Atacar no Mercado de Tangará da Serra
            </h1>
            <p className="text-sm text-neutral-400 max-w-3xl mt-1">
              Mapeamento de alta resolução dos quadrantes viários de Tangará da Serra (MT), fragilidades operacionais comprovadas dos concorrentes de gastronomia e boutiques de moda, e gatilhos de disparo com APIs reais para captura de market share.
            </p>
          </div>

          {/* Cards de Métricas Chave do Município */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">População Municipal</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">106.840 hab</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">5º maior PIB de MT · Agro Nobre</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Food Service Gastronomia</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">R$ 4,85 M<span className="text-xs font-normal text-neutral-400">/mês</span></div>
              <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">Zuma lidera com 53.2% share</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Mercado Moda &amp; Vestuário</div>
              <div className="text-xl sm:text-2xl font-black text-purple-400 mt-0.5">R$ 6,20 M<span className="text-xs font-normal text-neutral-400">/mês</span></div>
              <div className="text-[10px] text-purple-300 font-semibold mt-0.5">Zuma Boutique: 18.5% share</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Potencial de Captura Imediata</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">+R$ 145 K<span className="text-xs font-normal text-neutral-400">/mês</span></div>
              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">Com os 5 Eixos Estratégicos</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. DEMOGRAFIA VIÁRIA: ONDE ESTÁ A RENDA EM TANGARÁ DA SERRA (MT)      */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <h2 className="text-lg font-black text-[var(--ink)]">
                Quadrantes Viários &amp; Concentração de Renda (Onde Atacar)
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Mapeamento geolocalizado de poder aquisitivo, presença de produtores do agronegócio e penetração atual do ecossistema Zuma.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
            62 Bairros Catalogados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quadrante 1: Norte Nobre */}
          <div className="p-4 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-black uppercase">
                  Alvo Nobre VIP #1
                </span>
                <h3 className="text-base font-black text-[var(--ink)] mt-1.5">Quadrante Norte Nobre</h3>
                <div className="text-xs font-bold text-red-600">Jd. Europa · Jd. dos Ipês · Pq. Tangará · Barcelona</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">Renda Média</div>
                <div className="text-sm font-black text-emerald-600">R$ 18.500/mês</div>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Residências de grandes produtores rurais de soja e milho, médicos, pecuaristas e juristas. Alta demanda por <b>Salmão Chileno Nobre</b>, barcas de 50 peças e vestidos de linho/seda da Zuma Moda Boutique.
            </p>

            <div className="p-2.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] text-xs space-y-1">
              <div className="font-bold text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Ponto Fraco dos Concorrentes:</span>
              </div>
              <div className="text-[var(--ink)] text-[11px]">
                Bonsai e outros atrasam de 65 a 85 min subindo a Av. Tancredo Neves nos fins de semana. Comida chega fria e revirada.
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--muted)]">Penetração Zuma: <b className="text-[var(--ink)]">64%</b></span>
              <span className="text-emerald-600 font-black">+R$ 55.000/mês em captura</span>
            </div>
          </div>

          {/* Quadrante 2: Centro Comercial */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase">
                  Alvo Corporativo #2
                </span>
                <h3 className="text-base font-black text-[var(--ink)] mt-1.5">Centro Comercial &amp; Financeiro</h3>
                <div className="text-xs font-bold text-amber-600">Av. Brasil · Celso Rosa Lima · Hitler Sansão</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">Renda Média</div>
                <div className="text-sm font-black text-emerald-600">R$ 14.200/mês</div>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Sedes de tradings multinacionais (Amaggi, Cargill, Dreyfus), agências Sicredi Sudoeste, Sicoob, consultórios e cartórios. Forte demanda de almoço executivo, reuniões fechadas e faturamento PJ mensal.
            </p>

            <div className="p-2.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] text-xs space-y-1">
              <div className="font-bold text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Ponto Fraco dos Concorrentes:</span>
              </div>
              <div className="text-[var(--ink)] text-[11px]">
                Restaurantes sem isolamento acústico nos tatames; recusa ou lentidão para emitir NF-e corporativa com fatura mensal via boleto/PIX.
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--muted)]">Penetração Zuma: <b className="text-[var(--ink)]">72%</b></span>
              <span className="text-emerald-600 font-black">+R$ 48.000/mês em captura</span>
            </div>
          </div>

          {/* Quadrante 3: Sul Residencial */}
          <div className="p-4 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-black uppercase">
                  Alvo de Volume #3
                </span>
                <h3 className="text-base font-black text-[var(--ink)] mt-1.5">Sul Residencial &amp; Logístico</h3>
                <div className="text-xs font-bold text-blue-600">Vila Alta · Tarumã · Cidade Alta · Tangará II</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">População</div>
                <div className="text-sm font-black text-blue-600">38.000 hab</div>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Bairros populosos com famílias do agronegócio, transporte de grãos e comércio. Pedidos familiares volumosos nos finais de semana (combos de 30 a 50 peças) e busca por delivery sem taxas abusivas de marketplace.
            </p>

            <div className="p-2.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] text-xs space-y-1">
              <div className="font-bold text-blue-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Ponto Fraco dos Concorrentes:</span>
              </div>
              <div className="text-[var(--ink)] text-[11px]">
                Cobram frete abusivo de R$ 18 a R$ 25 pelo iFood e entregam sushis de buffet requentado que ressecam no transporte.
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--muted)]">Penetração Zuma: <b className="text-[var(--ink)]">42%</b></span>
              <span className="text-emerald-600 font-black">+R$ 42.000/mês em captura</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. OS 5 EIXOS ESTRATÉGICOS DE ATAQUE IMEDIATO (COM DISPARO DE APIS)   */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-black text-[var(--ink)]">
                Os 5 Eixos Estratégicos de Ataque Imediato
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Ações táticas prontas para execução em 1 toque, conectadas aos hubs de Meta Ads, WhatsApp Business Zumi, Google Maps Routes e SEFAZ-MT.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Pronto para Disparo
          </span>
        </div>

        <div className="space-y-4">
          {analyticsQuery.data?.eixosAtaque.map((eixo, idx) => {
            const isRunning = eixoExecutandoId === eixo.id;
            return (
              <div
                key={eixo.id}
                className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] hover:border-red-500/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-black text-[var(--ink)]">
                        {eixo.titulo}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold text-[var(--ink)]">
                        Alvo: {eixo.concorrenteAlvo}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span><b>Horário Crítico:</b> {eixo.horarioCritico}</span>
                      <span>·</span>
                      <span><b>Bairros Alvo:</b> {eixo.bairros.join(", ")}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Impacto Projetado</div>
                    <div className="text-base font-black text-emerald-600">+{eixo.impactoEstimadoMes}</div>
                  </div>
                </div>

                {/* Diagnóstico & Estratégia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-950 dark:text-red-200">
                    <div className="font-black text-red-600 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Fragilidade Comprovada do Concorrente:</span>
                    </div>
                    <div className="leading-relaxed">{eixo.diagnostico}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
                    <div className="font-black text-emerald-600 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nossa Estratégia de Neutralização:</span>
                    </div>
                    <div className="leading-relaxed">{eixo.estrategia}</div>
                  </div>
                </div>

                {/* Canais e Botão de Ação */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[var(--muted)]">Canais de Integração Ativados:</span>
                    {eixo.canais.map((c: string) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)]"
                      >
                        {c === "meta_ads" && "📸 Meta Ads (Instagram / Facebook)"}
                        {c === "whatsapp_zumi" && "💬 WhatsApp Business Zumi IA"}
                        {c === "google_maps" && "🗺️ Google Maps Routes (GCP)"}
                        {c === "sefaz_agro" && "🏛️ SEFAZ-MT NF-e Instantânea"}
                        {c === "dr_clima" && "🌧️ Dr. Clima Logística Estanque"}
                      </span>
                    ))}
                    {eixo.cupom && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                        Cupom: {eixo.cupom}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDispararEixo(eixo)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-xs shadow-md shadow-red-600/20 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Disparando APIs Reais...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Disparar Eixo de Ataque</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. RADAR DA CONCORRÊNCIA: GASTRONOMIA VS BOUTIQUES DE MODA            */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-black text-[var(--ink)]">
                Radar de Concorrentes Mapeados em Tangará da Serra ({CONCORRENTES_TANGARA.length})
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Dados auditados de CNPJ, endereço físico, Google Reviews, faturamento estimado e pontos de vulnerabilidade operacional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--line)] text-xs font-bold">
            <button
              onClick={() => setCategoriaFiltro("todos")}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                categoriaFiltro === "todos" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Todos ({CONCORRENTES_TANGARA.length - 1})
            </button>
            <button
              onClick={() => setCategoriaFiltro("gastronomia")}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                categoriaFiltro === "gastronomia" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              🍣 Gastronomia &amp; Sushi
            </button>
            <button
              onClick={() => setCategoriaFiltro("roupas")}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                categoriaFiltro === "roupas" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              👗 Moda &amp; Boutique
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concorrentesFiltrados.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] hover:border-[var(--salmon)]/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      c.categoriaNegocio === "roupas"
                        ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                    }`}>
                      {c.categoriaNegocio === "roupas" ? "👗 Moda Boutique" : "🍣 Gastronomia"}
                    </span>
                    <h3 className="text-base font-black text-[var(--ink)] mt-1">{c.fantasia}</h3>
                    <div className="text-[11px] text-[var(--muted)]">{c.bairro} · {c.distanciaZumaKm} km da base</div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    c.nivelAmeaca === "Alto" ? "bg-red-500/20 text-red-600" :
                    c.nivelAmeaca === "Médio" ? "bg-amber-500/20 text-amber-600" : "bg-neutral-500/20 text-neutral-600"
                  }`}>
                    Ameaça {c.nivelAmeaca}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[var(--muted)] font-bold">Faturamento</div>
                    <div className="font-black text-[var(--ink)]">R$ {(c.faturamentoEst / 1000).toFixed(0)}k</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)] font-bold">Ticket</div>
                    <div className="font-black text-[var(--ink)]">R$ {c.ticketMedio}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)] font-bold">Google</div>
                    <div className="font-black text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{c.googleRating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-red-500 text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Fragilidade Crítica:</span>
                  </div>
                  <p className="text-[var(--ink)] text-[11px] leading-relaxed">
                    {c.vulnerabilidades[0] || "Dependência de atendimentos manuais sem integração de aplicativo."}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)] font-bold mb-1">Nosso Plano de Ataque:</div>
                <div className="text-[11px] text-emerald-600 font-semibold mb-3">
                  {c.planoAtaqueZuma}
                </div>
                <button
                  onClick={() => {
                    handleDispararEixo({
                      id: `ataque_direto_${c.id}`,
                      titulo: `Contra-Ataque Direto: ${c.fantasia}`,
                      concorrenteAlvo: c.fantasia,
                      bairros: [c.bairro.split("·")[0].trim() || "Centro"],
                      canais: ["meta_ads", "whatsapp_zumi"],
                      estrategia: c.planoAtaqueZuma,
                      cupom: "ZUMAVIP15"
                    });
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3 h-3" />
                  <span>Contra-Atacar Concorrente</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. SIMULADOR DE CONQUISTA DE CLIENTES E CRESCIMENTO DE RECEITA        */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-black text-[var(--ink)]">
                Simulador de Captura de Clientes dos Concorrentes
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Simule a captura percentual de faturamento do Bonsai, Nosso Sushi/S.kamoto e Boutiques de Tangará e veja o impacto financeiro real.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
            Receita Líquida Holding Zuma
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="space-y-4 lg:col-span-2">
            {/* Slider Bonsai */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Captura de Clientes do Bonsai Sushi Bar (Delivery de Pico):</span>
                <span className="text-red-500 font-mono font-black">{capturaBonsai}% (+R$ {receitaCapturadaBonsai.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={capturaBonsai}
                onChange={(e) => setCapturaBonsai(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Slider Nosso Sushi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Captura de Clientes do Nosso Sushi / S.kamoto (Fresco vs Buffet):</span>
                <span className="text-amber-500 font-mono font-black">{capturaNossoSushi}% (+R$ {receitaCapturadaNossoSushi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={capturaNossoSushi}
                onChange={(e) => setCapturaNossoSushi(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider Boutiques */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Captura de Clientes das Boutiques (Florella / Belaví via Mala Condicional):</span>
                <span className="text-purple-500 font-mono font-black">{capturaBoutiques}% (+R$ {receitaCapturadaBoutiques.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={capturaBoutiques}
                onChange={(e) => setCapturaBoutiques(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Resultado Financeiro */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white space-y-3 shadow-lg">
            <div className="text-xs uppercase font-bold text-white/80 tracking-wider">Incremento Projetado Holding Zuma</div>
            <div className="text-3xl font-black">+R$ {totalCapturadoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-xs font-normal text-white/80">/mês</span></div>
            <div className="text-xs text-white/90">
              Impacto Anualizado: <b>+R$ {totalCapturadoAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</b> em nova receita bruta para Tangará da Serra.
            </div>
            <div className="pt-2 border-t border-white/20 text-[11px] text-white/80 leading-relaxed">
              * Baseado no ticket médio de R$ 138 (Gastronomia) e R$ 260 (Moda Boutique) com recompra estimada de 2.2x ao mês.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
