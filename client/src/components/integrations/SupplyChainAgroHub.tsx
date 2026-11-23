import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Truck,
  Boxes,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Flame,
  Scale
} from "lucide-react";
import { toast } from "sonner";

export const SupplyChainAgroHub: React.FC = () => {
  const [dolarPtax, setDolarPtax] = useState(5.72);
  const [precoSalmaoUsd, setPrecoSalmaoUsd] = useState(12.80);
  const [simulandoHedge, setSimulandoHedge] = useState(false);

  // Preço do Salmão Chileno Nobre Fresco em BRL/kg
  const precoSalmaoBrl = precoSalmaoUsd * dolarPtax;

  // Commodities do Mato Grosso (Tangará da Serra e Região)
  const commodities = [
    {
      nome: "Soja Grão (Disponível Tangará/MT)",
      preco: "R$ 134,50",
      unidade: "Saca 60kg",
      variacao: "+1.2%",
      fonte: "CEPEA / ESALQ",
      tendencia: "Alta",
      impactoZuma: "Forte liquidez dos produtores rurais de Tangará no restaurante e na boutique"
    },
    {
      nome: "Milho Safrinha MT (Balcão)",
      preco: "R$ 56,20",
      unidade: "Saca 60kg",
      variacao: "+0.8%",
      fonte: "B3 / IMEA",
      tendencia: "Estável",
      impactoZuma: "Estabilidade de custos de granjas locais e fornecedores de insumos"
    },
    {
      nome: "Boi Gordo MT (Média Estado)",
      preco: "R$ 228,00",
      unidade: "@ à vista",
      variacao: "-0.5%",
      fonte: "IMEA / CEPEA",
      tendencia: "Estável",
      impactoZuma: "Referência de valor de proteínas nobres nos pratos quentes e rodízios executivos"
    },
    {
      nome: "Salmão Chileno Nobre Fresco (CIF)",
      preco: `R$ ${precoSalmaoBrl.toFixed(2)}`,
      unidade: "kg eviscerado",
      variacao: "-1.8%",
      fonte: "AquaChile / PTAX BACEN",
      tendencia: "Favorável",
      impactoZuma: "Insumo âncora do Zuma Gastronomia (consumo médio de 140 kg/semana)"
    }
  ];

  // Estoque Estratégico com Ponto de Reposição (ROP)
  const lotesEstoque = [
    {
      lote: "LOT-2026-CH-914",
      item: "Salmão Fresco Chileno Nobre (Salmo salar)",
      origem: "Puerto Montt · Chile (AquaChile)",
      quantidadeKg: 85.5,
      temperaturaCadeiaFria: "1.8°C",
      statusAnvisa: "CONFORME (ANVISA RDC 216)",
      dataEntrada: "21/11/2026",
      validadeDiasRestantes: 6,
      pontoReposicao: "140 kg / 48h antes da sexta-feira"
    },
    {
      lote: "LOT-2026-SH-402",
      item: "Arroz Grão Curto Japonês (Shari Nobre Tipo 1)",
      origem: "Cooperativa Vale do Paranapanema",
      quantidadeKg: 420.0,
      temperaturaCadeiaFria: "Ambiente Seco 22°C",
      statusAnvisa: "CONFORME",
      dataEntrada: "15/11/2026",
      validadeDiasRestantes: 74,
      pontoReposicao: "Estoque seguro para 45 dias"
    },
    {
      lote: "LOT-2026-EM-882",
      item: "Embalagens Isotérmicas Vedadas Anti-Chuva",
      origem: "Polímero Kraft Impermeável",
      quantidadeKg: 1200,
      unidadeTexto: "unidades",
      temperaturaCadeiaFria: "Armazém Logístico",
      statusAnvisa: "CONFORME",
      dataEntrada: "10/11/2026",
      validadeDiasRestantes: 180,
      pontoReposicao: "Ativo para dias de tempestade"
    }
  ];

  const dispararPedidoCompraSalmao = () => {
    toast.success("Pedido de compra programado enviado ao Frigorífico Pescados Nobres (120 kg de Salmão Fresco Chileno Nobre para entrega na quinta-feira)!");
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL DE COMMODITIES E CADEIA DE SUPRIMENTOS               */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Cadeia de Frio &amp; Suprimentos
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Dólar PTAX: R$ {dolarPtax.toFixed(2)} (Banco Central)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                Tangará da Serra · MT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              Supply Chain, Cotação de Salmão Chileno &amp; Commodities Agro MT
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Monitoramento cambial do Salmão Chileno Nobre Fresco (Salmo salar), rastreabilidade de temperatura da cadeia fria (1.8°C), cálculo dinâmico de CMV e cotações das commodities agrícolas de Tangará da Serra (Soja, Milho, Boi) para tomada de decisão de compras.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={dispararPedidoCompraSalmao}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Programar Compra Salmão</span>
            </button>
            <button
              onClick={() => toast.success("Cotações PTAX e CEPEA atualizadas em tempo real!")}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
              title="Atualizar cotações"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 KPIs de Suprimentos & Margem */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Custo Salmão Nobre (BRL/kg)
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              R$ {precoSalmaoBrl.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              US$ {precoSalmaoUsd.toFixed(2)} CIF Tangará
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              CMV Alvo Gastronomia
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              31.8%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Meta controlada com compras programadas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Estoque Físico em Câmara Fria
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              85.5 kg
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Suficiente para 4.2 dias de operação
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Temperatura Cadeia Fria
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-emerald-500" />
              1.8°C
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              Sensor IoT ANVISA Homologado
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TABELA DE COMMODITIES E IMPACTO NO NEGÓCIO                            */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--ink)]">
            Painel de Commodities &amp; Indicadores Econômicos de Tangará da Serra
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Alinhamento entre o faturamento corporativo B2B do agronegócio e a precificação de insumos nobres
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {commodities.map((c, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[var(--ink)] block">{c.nome}</strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{c.fonte} · {c.unidade}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black font-mono text-[var(--ink)]">{c.preco}</div>
                  <span className={`text-[10px] font-black font-mono ${
                    c.variacao.startsWith("+") ? "text-emerald-500" : "text-amber-500"
                  }`}>
                    {c.variacao}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-1 border-t border-[var(--line)]">
                💡 <b>Impacto na Decisão:</b> {c.impactoZuma}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
