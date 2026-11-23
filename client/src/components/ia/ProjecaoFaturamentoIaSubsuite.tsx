import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Target,
  BarChart3,
  Flame,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  negocioAtivo?: string;
}

export const ProjecaoFaturamentoIaSubsuite: React.FC<Props> = ({ negocioAtivo = "zuma" }) => {
  // Configuração por modelo de negócio
  const configNegocio = useMemo(() => {
    switch (negocioAtivo) {
      case "zuma_roupas":
      case "roupas":
      case "moda":
        return {
          nome: "Zuma Loja de Roupas & Moda",
          icone: "👗",
          metaMensal: 180000,
          realizado: 128400,
          diasRestantes: 9,
          mediaDiaria: 5733,
          ticketMedio: 245,
          ocupacaoMedia: 81,
          canais: [
            { nome: "Vestuário Casual & Linha Premium", realizado: 64200, projetado: 90000, pct: 50 },
            { nome: "Calçados & Couro Selecionado", realizado: 38500, projetado: 54000, pct: 30 },
            { nome: "E-commerce & Delivery Rápido PWA", realizado: 17900, projetado: 25000, pct: 14 },
            { nome: "Coleções Exclusivas Zuma Concept", realizado: 7800, projetado: 11000, pct: 6 }
          ],
          historicoMeses: [
            { mes: "Jun/26", realizado: 145000, conservador: 138000, base: 145000, favoravel: 152000 },
            { mes: "Jul/26", realizado: 152000, conservador: 144000, base: 152000, favoravel: 160000 },
            { mes: "Ago/26", realizado: 164000, conservador: 155000, base: 164000, favoravel: 172000 },
            { mes: "Set/26", realizado: 158000, conservador: 150000, base: 158000, favoravel: 166000 },
            { mes: "Out/26", realizado: 172000, conservador: 162000, base: 172000, favoravel: 182000 },
            { mes: "Nov/26 (Atual)", realizado: 128400, conservador: 168000, base: 180000, favoravel: 195000 },
            { mes: "Dez/26 (Proj)", realizado: 0, conservador: 220000, base: 255000, favoravel: 285000 },
            { mes: "Jan/27 (Proj)", realizado: 0, conservador: 145000, base: 160000, favoravel: 175000 },
            { mes: "Fev/27 (Proj)", realizado: 0, conservador: 150000, base: 165000, favoravel: 180000 },
            { mes: "Mar/27 (Proj)", realizado: 0, conservador: 162000, base: 178000, favoravel: 192000 },
          ]
        };
      case "dino":
        return {
          nome: "Barbearia Dino & Salão",
          icone: "💈",
          metaMensal: 145000,
          realizado: 104200,
          diasRestantes: 9,
          mediaDiaria: 4736,
          ticketMedio: 185,
          ocupacaoMedia: 78,
          canais: [
            { nome: "Cortes & Barba Tradicionais", realizado: 52000, projetado: 72000, pct: 50 },
            { nome: "Assinaturas Dino Club (Recorrência)", realizado: 31000, projetado: 41000, pct: 28 },
            { nome: "Revenda Cosméticos & Perfumaria Árabe", realizado: 16200, projetado: 24000, pct: 16 },
            { nome: "Barber Bar & Bebidas", realizado: 5000, projetado: 8000, pct: 6 }
          ],
          historicoMeses: [
            { mes: "Jun/26", realizado: 118000, conservador: 110000, base: 118000, favoravel: 125000 },
            { mes: "Jul/26", realizado: 126000, conservador: 118000, base: 126000, favoravel: 135000 },
            { mes: "Ago/26", realizado: 134000, conservador: 122000, base: 134000, favoravel: 142000 },
            { mes: "Set/26", realizado: 131000, conservador: 125000, base: 131000, favoravel: 140000 },
            { mes: "Out/26", realizado: 142000, conservador: 132000, base: 142000, favoravel: 151000 },
            { mes: "Nov/26 (Atual)", realizado: 104200, conservador: 138000, base: 146800, favoravel: 156000 },
            { mes: "Dez/26 (Proj)", realizado: 0, conservador: 160000, base: 182000, favoravel: 205000 },
            { mes: "Jan/27 (Proj)", realizado: 0, conservador: 128000, base: 140000, favoravel: 152000 },
            { mes: "Fev/27 (Proj)", realizado: 0, conservador: 132000, base: 145000, favoravel: 158000 },
            { mes: "Mar/27 (Proj)", realizado: 0, conservador: 140000, base: 155000, favoravel: 168000 },
          ]
        };
      case "stallone":
        return {
          nome: "Stallone Nutre Sport & Fitness",
          icone: "💪",
          metaMensal: 210000,
          realizado: 158400,
          diasRestantes: 9,
          mediaDiaria: 7200,
          ticketMedio: 265,
          ocupacaoMedia: 84,
          canais: [
            { nome: "Whey Protein, Creatina & Aminoácidos", realizado: 88000, projetado: 118000, pct: 56 },
            { nome: "Moda Fitness & Acessórios Treino", realizado: 38400, projetado: 51000, pct: 24 },
            { nome: "Vitaminas, Minerais & Fitoterápicos", realizado: 22000, projetado: 29000, pct: 14 },
            { nome: "Snacks Proteicos & Isotônicos", realizado: 10000, projetado: 14000, pct: 6 }
          ],
          historicoMeses: [
            { mes: "Jun/26", realizado: 172000, conservador: 160000, base: 172000, favoravel: 182000 },
            { mes: "Jul/26", realizado: 185000, conservador: 170000, base: 185000, favoravel: 198000 },
            { mes: "Ago/26", realizado: 194000, conservador: 180000, base: 194000, favoravel: 206000 },
            { mes: "Set/26", realizado: 189000, conservador: 178000, base: 189000, favoravel: 201000 },
            { mes: "Out/26", realizado: 205000, conservador: 190000, base: 205000, favoravel: 218000 },
            { mes: "Nov/26 (Atual)", realizado: 158400, conservador: 202000, base: 216000, favoravel: 228000 },
            { mes: "Dez/26 (Proj)", realizado: 0, conservador: 220000, base: 245000, favoravel: 270000 },
            { mes: "Jan/27 (Proj)", realizado: 0, conservador: 240000, base: 268000, favoravel: 295000 },
            { mes: "Fev/27 (Proj)", realizado: 0, conservador: 215000, base: 235000, favoravel: 255000 },
            { mes: "Mar/27 (Proj)", realizado: 0, conservador: 225000, base: 248000, favoravel: 272000 },
          ]
        };
      case "agroopen":
        return {
          nome: "Agro Open Insumos & Pecuária",
          icone: "🌱",
          metaMensal: 850000,
          realizado: 620000,
          diasRestantes: 9,
          mediaDiaria: 28181,
          ticketMedio: 3450,
          ocupacaoMedia: 91,
          canais: [
            { nome: "Nutrição Animal & Sal Mineralizado", realizado: 310000, projetado: 420000, pct: 49 },
            { nome: "Sementes Pastagem & Milho Híbrido", realizado: 180000, projetado: 245000, pct: 29 },
            { nome: "Defensivos & Linha Veterinária", realizado: 95000, projetado: 135000, pct: 16 },
            { nome: "Ferragens & Equipamentos de Campo", realizado: 35000, projetado: 50000, pct: 6 }
          ],
          historicoMeses: [
            { mes: "Jun/26", realizado: 710000, conservador: 680000, base: 710000, favoravel: 760000 },
            { mes: "Jul/26", realizado: 740000, conservador: 700000, base: 740000, favoravel: 790000 },
            { mes: "Ago/26", realizado: 785000, conservador: 740000, base: 785000, favoravel: 830000 },
            { mes: "Set/26", realizado: 820000, conservador: 770000, base: 820000, favoravel: 865000 },
            { mes: "Out/26", realizado: 840000, conservador: 790000, base: 840000, favoravel: 890000 },
            { mes: "Nov/26 (Atual)", realizado: 620000, conservador: 815000, base: 868000, favoravel: 915000 },
            { mes: "Dez/26 (Proj)", realizado: 0, conservador: 890000, base: 950000, favoravel: 1020000 },
            { mes: "Jan/27 (Proj)", realizado: 0, conservador: 920000, base: 990000, favoravel: 1080000 },
            { mes: "Fev/27 (Proj)", realizado: 0, conservador: 880000, base: 940000, favoravel: 1010000 },
            { mes: "Mar/27 (Proj)", realizado: 0, conservador: 910000, base: 980000, favoravel: 1060000 },
          ]
        };
      default: // Zuma Cozinha Oriental
        return {
          nome: "Zuma Cozinha Oriental",
          icone: "🥢",
          metaMensal: 350000,
          realizado: 248600,
          diasRestantes: 9,
          mediaDiaria: 11300,
          ticketMedio: 138,
          ocupacaoMedia: 86,
          canais: [
            { nome: "Salão Nobre VIP & Tatames", realizado: 136700, projetado: 192000, pct: 55 },
            { nome: "Delivery PWA Próprio (Sem Taxa iFood)", realizado: 87000, projetado: 122500, pct: 35 },
            { nome: "Retirada Balcão / Takeaway", realizado: 14900, projetado: 21000, pct: 6 },
            { nome: "Eventos, Buffet VIP & Encomendas Barcas", realizado: 10000, projetado: 14500, pct: 4 }
          ],
          historicoMeses: [
            { mes: "Jun/26", realizado: 284000, conservador: 270000, base: 284000, favoravel: 298000 },
            { mes: "Jul/26", realizado: 302000, conservador: 285000, base: 302000, favoravel: 318000 },
            { mes: "Ago/26", realizado: 318000, conservador: 300000, base: 318000, favoravel: 335000 },
            { mes: "Set/26", realizado: 325000, conservador: 308000, base: 325000, favoravel: 342000 },
            { mes: "Out/26", realizado: 338000, conservador: 318000, base: 338000, favoravel: 356000 },
            { mes: "Nov/26 (Atual)", realizado: 248600, conservador: 328000, base: 350000, favoravel: 372000 },
            { mes: "Dez/26 (Proj)", realizado: 0, conservador: 380000, base: 425000, favoravel: 465000 },
            { mes: "Jan/27 (Proj)", realizado: 0, conservador: 310000, base: 335000, favoravel: 360000 },
            { mes: "Fev/27 (Proj)", realizado: 0, conservador: 320000, base: 345000, favoravel: 370000 },
            { mes: "Mar/27 (Proj)", realizado: 0, conservador: 340000, base: 368000, favoravel: 395000 },
          ]
        };
    }
  }, [negocioAtivo]);

  // Alavancas de simulação
  const [sliderOcupacao, setSliderOcupacao] = useState(0); // -15% a +15%
  const [sliderTicket, setSliderTicket] = useState(0); // -20 a +20 R$
  const [sliderEficiencia, setSliderEficiencia] = useState(0); // 0% a +20%

  // Cálculos dinâmicos
  const projecaoBase = configNegocio.historicoMeses.find(m => m.mes.includes("Nov"))?.base || 350000;
  const projecaoConservadora = configNegocio.historicoMeses.find(m => m.mes.includes("Nov"))?.conservador || 328000;
  const projecaoOtimista = configNegocio.historicoMeses.find(m => m.mes.includes("Nov"))?.favoravel || 372000;

  const impactoOcupacao = (projecaoBase * (sliderOcupacao / 100)) * 0.6;
  const impactoTicket = (projecaoBase * (sliderTicket / configNegocio.ticketMedio)) * 0.4;
  const impactoEficiencia = (projecaoBase * (sliderEficiencia / 100)) * 0.3;
  const projecaoSimulada = Math.round(projecaoBase + impactoOcupacao + impactoTicket + impactoEficiencia);

  const percentualAtingido = Math.min(100, Math.round((configNegocio.realizado / configNegocio.metaMensal) * 100));
  const valorRestante = Math.max(0, configNegocio.metaMensal - configNegocio.realizado);
  const ritmoNecessarioDia = Math.round(valorRestante / configNegocio.diasRestantes);

  // SVG Chart calculation
  const chartData = useMemo(() => {
    const dados = configNegocio.historicoMeses;
    const maxVal = Math.max(...dados.map(d => Math.max(d.realizado || 0, d.favoravel || 0))) * 1.08;
    const minVal = 0;
    const width = 640;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const stepX = chartW / (dados.length - 1);

    const getX = (idx: number) => padding.left + idx * stepX;
    const getY = (val: number) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    const pointsBase = dados.map((d, i) => `${getX(i)},${getY(d.base)}`).join(" ");
    const pointsConservador = dados.map((d, i) => `${getX(i)},${getY(d.conservador)}`).join(" ");
    const pointsFavoravel = dados.map((d, i) => `${getX(i)},${getY(d.favoravel)}`).join(" ");
    
    // Polygon area between conservador and favoravel
    const areaPoints = [
      ...dados.map((d, i) => `${getX(i)},${getY(d.favoravel)}`),
      ...[...dados].reverse().map((d, i) => `${getX(dados.length - 1 - i)},${getY(d.conservador)}`)
    ].join(" ");

    return { dados, maxVal, width, height, padding, getX, getY, pointsBase, pointsConservador, pointsFavoravel, areaPoints };
  }, [configNegocio]);

  return (
    <div className="space-y-6">
      {/* HEADER DE RECONHECIMENTO AUDITÁVEL & PROJEÇÃO IA */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-inner text-white font-black">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[var(--ink)]">
                  Previsão de Faturamento com IA Preditiva
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Auditável & Real
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Baseado em faturamento histórico, reservas futuras, capacidade de praças e ritmo diário por dia útil em Tangará da Serra.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Série histórica reprocessada pelo motor IA Kytto SetPoint!")}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar Forecast</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--ink)]">
              Mês Ativo: <span className="text-[var(--salmon)] font-black">Nov/2026</span>
            </div>
          </div>
        </div>

        {/* CARDS DE KPIS DO MÊS ATUAL */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Realizado no Mês</span>
            <div className="text-lg font-black font-mono text-[var(--ink)] mt-1">
              R$ {configNegocio.realizado.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{percentualAtingido}% da Meta</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Meta Oficial</span>
            <div className="text-lg font-black font-mono text-[var(--ink)] mt-1">
              R$ {configNegocio.metaMensal.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-semibold mt-1">
              Faltam R$ {valorRestante.toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] border-amber-500/30 bg-amber-500/5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Cenário Conservador</span>
            <div className="text-lg font-black font-mono text-amber-300 mt-1">
              R$ {projecaoConservadora.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-semibold mt-1">
              Volatilidade -6.3%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--salmon)]/40 bg-[var(--salmon)]/5">
            <span className="text-[10px] font-bold text-[var(--salmon)] uppercase tracking-wider block">Cenário Base (IA)</span>
            <div className="text-lg font-black font-mono text-[var(--salmon)] mt-1">
              R$ {projecaoBase.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              100.0% da Meta
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Cenário Otimista</span>
            <div className="text-lg font-black font-mono text-emerald-300 mt-1">
              R$ {projecaoOtimista.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              +6.3% vs Meta
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-indigo-500/30 bg-indigo-500/5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Ritmo Diário Nec.</span>
            <div className="text-lg font-black font-mono text-indigo-300 mt-1">
              R$ {ritmoNecessarioDia.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-semibold mt-1">
              {configNegocio.diasRestantes} dias úteis restantes
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO SVG RESPONSIVO: CURVAS DE PREVISÃO E INTERVALO DE CONFIANÇA */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--salmon)]" />
              <span>Série Histórica Real & Curvas Preditivas para os Próximos 4 Meses</span>
            </h3>
            <span className="text-[11px] text-[var(--muted)]">
              Faixa sombreada azul representa o corredor de probabilidade estatística de 95%.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--salmon)]" />
              <span className="text-[var(--ink)]">Cenário Base (IA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-amber-400 border-dashed" />
              <span className="text-amber-400">Conservador</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-emerald-400 border-dashed" />
              <span className="text-emerald-400">Otimista</span>
            </div>
          </div>
        </div>

        {/* SVG Container */}
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartData.width} ${chartData.height}`}
            className="w-full min-w-[580px] h-[220px] overflow-visible select-none"
          >
            {/* Linhas horizontais de grade */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const val = Math.round(chartData.maxVal * (1 - pct));
              const y = chartData.padding.top + (chartData.height - chartData.padding.top - chartData.padding.bottom) * pct;
              return (
                <g key={idx}>
                  <line
                    x1={chartData.padding.left}
                    y1={y}
                    x2={chartData.width - chartData.padding.right}
                    y2={y}
                    stroke="var(--line)"
                    strokeDasharray={pct === 1 ? undefined : "3 3"}
                    strokeOpacity={0.5}
                  />
                  <text
                    x={chartData.padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-[var(--muted)] font-mono"
                  >
                    {Math.round(val / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* Linha vertical separadora entre passado e futuro */}
            <line
              x1={chartData.getX(5)}
              y1={chartData.padding.top}
              x2={chartData.getX(5)}
              y2={chartData.height - chartData.padding.bottom}
              stroke="var(--salmon)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />

            {/* Faixa sombreada de incerteza */}
            <polygon
              points={chartData.areaPoints}
              fill="rgba(255, 107, 74, 0.08)"
            />

            {/* Linha Conservadora */}
            <polyline
              points={chartData.pointsConservador}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Linha Otimista */}
            <polyline
              points={chartData.pointsFavoravel}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Linha Base Principal */}
            <polyline
              points={chartData.pointsBase}
              fill="none"
              stroke="var(--salmon)"
              strokeWidth="3.5"
            />

            {/* Pontos nos meses */}
            {chartData.dados.map((d, i) => {
              const cx = chartData.getX(i);
              const cy = chartData.getY(d.base);
              const isCurrent = i === 5;
              const isFuture = i > 5;
              return (
                <g key={d.mes}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 6 : 4}
                    fill={isCurrent ? "#ff6b4a" : isFuture ? "var(--surface)" : "var(--salmon)"}
                    stroke="var(--salmon)"
                    strokeWidth={2}
                  />
                  <text
                    x={cx}
                    y={chartData.height - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${isCurrent ? "fill-[var(--salmon)] font-bold" : "fill-[var(--muted)]"}`}
                  >
                    {d.mes.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* DUAS COLUNAS: CANAIS DE RECEITA & SIMULADOR DE ALAVANCAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: CANAIS DE FATURAMENTO & PARTICIPAÇÃO */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Decomposição por Canais de Venda</span>
            </h3>
            <span className="text-[11px] text-[var(--muted)] font-mono">Realizado vs Meta</span>
          </div>

          <div className="space-y-3">
            {configNegocio.canais.map((canal, idx) => {
              const pctAtingido = Math.min(100, Math.round((canal.realizado / canal.projetado) * 100));
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--ink)]">{canal.nome}</span>
                    <span className="font-mono font-black text-[var(--salmon)]">
                      R$ {canal.realizado.toLocaleString("pt-BR")} / R$ {canal.projetado.toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-[var(--salmon)] transition-all duration-500 rounded-full"
                      style={{ width: `${pctAtingido}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span>Participação: {canal.pct}% da receita total</span>
                    <span className={pctAtingido >= 70 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {pctAtingido}% atingido
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA 2: SIMULADOR INTERATIVO DE ALAVANCAS GERENCIAIS */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Simulador de Cenários & Alavancas IA</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Ajuste os parâmetros para simular o fechamento com intervenções na operação.
              </p>
            </div>
            <button
              onClick={() => {
                setSliderOcupacao(0);
                setSliderTicket(0);
                setSliderEficiencia(0);
                toast.info("Simulador resetado para o cenário base.");
              }}
              className="p-1.5 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              title="Resetar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Ocupação do Salão / Vagas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[var(--ink)]">Ocupação / Encaixe em Horários Vazios</span>
                <span className={`font-mono ${sliderOcupacao > 0 ? "text-emerald-400" : sliderOcupacao < 0 ? "text-red-400" : "text-[var(--muted)]"}`}>
                  {sliderOcupacao > 0 ? `+${sliderOcupacao}%` : `${sliderOcupacao}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={sliderOcupacao}
                onChange={e => setSliderOcupacao(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>-15% (Queda Salão)</span>
                <span>Base (86%)</span>
                <span>+15% (Ocupação Total)</span>
              </div>
            </div>

            {/* Slider 2: Ticket Médio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[var(--ink)]">Variação no Ticket Médio (Cross-sell / Barcas Nobres)</span>
                <span className={`font-mono ${sliderTicket > 0 ? "text-emerald-400" : sliderTicket < 0 ? "text-red-400" : "text-[var(--muted)]"}`}>
                  {sliderTicket > 0 ? `+R$ ${sliderTicket}` : `R$ ${sliderTicket}`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="25"
                step="1"
                value={sliderTicket}
                onChange={e => setSliderTicket(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>-R$ 20 (Descontos)</span>
                <span>R$ {configNegocio.ticketMedio} (Atual)</span>
                <span>+R$ 25 (Sobremesas/Vinhos)</span>
              </div>
            </div>

            {/* Slider 3: Eficiência / Anti-Cancelamento */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[var(--ink)]">Redução de Desperdício & Fila Rápida KDS</span>
                <span className="font-mono text-indigo-400">
                  +{sliderEficiencia}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="2"
                value={sliderEficiencia}
                onChange={e => setSliderEficiencia(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>0% (Padrão)</span>
                <span>+10% KDS Otimizado</span>
                <span>+20% Giro Máximo</span>
              </div>
            </div>

            {/* Resultado da Simulação */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-[var(--surface2)] border border-[var(--salmon)]/30 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                    Resultado Projetado Simulado
                  </span>
                  <div className="text-xl font-black font-mono text-[var(--salmon)] mt-0.5">
                    R$ {projecaoSimulada.toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--muted)] block">Delta vs Meta</span>
                  <span className={`text-xs font-mono font-black ${projecaoSimulada >= configNegocio.metaMensal ? "text-emerald-400" : "text-amber-400"}`}>
                    {projecaoSimulada >= configNegocio.metaMensal
                      ? `+R$ ${(projecaoSimulada - configNegocio.metaMensal).toLocaleString("pt-BR")}`
                      : `-R$ ${(configNegocio.metaMensal - projecaoSimulada).toLocaleString("pt-BR")}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMENDAÇÕES DA IA ESTRATEGISTA COM GATILHOS DIRETOS */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Diagnóstico Gerencial & Recomendações Priorizadas pela IA</span>
            </h3>
            <span className="text-[11px] text-[var(--muted)]">
              Ações concretas baseadas em fatos operacionais observados para atingir a meta.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            3 Recomendações Críticas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                Alerta de Capacidade
              </span>
              <span className="text-[10px] text-[var(--muted)] font-mono">Sexta e Sábado</span>
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">Salão Lotado & Fila de Espera Excedente</h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              O salão atinge 100% de ocupação entre 20h e 22h, perdendo cerca de 18 clientes por fim de semana por desistência na calçada.
            </p>
            <div className="pt-2">
              <button
                onClick={() => toast.success("Campanha de Reserva Antecipada de Tatames VIP ativada para clientes do Clube Zumi!")}
                className="w-full py-2 rounded-xl bg-red-600/10 border border-red-500/30 text-red-300 text-[11px] font-black hover:bg-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ativar Antecipação VIP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Oportunidade de Margem
              </span>
              <span className="text-[10px] text-[var(--muted)] font-mono">Delivery PWA</span>
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">Cross-sell de Bebidas & Sobremesas Frias</h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Apenas 22% dos pedidos no PWA incluem bebidas nobres ou sobremesas japonesas (Harumaki Doce / Petit Gateau de Chá Verde).
            </p>
            <div className="pt-2">
              <button
                onClick={() => toast.success("Sugestão inteligente adicionada ao checkout com 1 clique no PWA!")}
                className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Habilitar 1-Click Upsell</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Alavanca de Retorno
              </span>
              <span className="text-[10px] text-[var(--muted)] font-mono">Reativação Churn</span>
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">142 Clientes VIP sem Pedidos há +30 Dias</h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Potencial de R$ 19.596 em caixa imediato disparando convites personalizados com o prato favorito de cada um.
            </p>
            <div className="pt-2">
              <button
                onClick={() => toast.success("Redirecionando para a Central de Reativação com IA!")}
                className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-black hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver Clientes Sumidos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
