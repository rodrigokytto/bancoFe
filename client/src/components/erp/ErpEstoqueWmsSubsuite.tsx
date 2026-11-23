import React, { useState } from "react";
import {
  Boxes,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Building,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  FileText,
  RotateCw,
  Printer,
  Sparkles,
  Scissors,
  PieChart,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface MovimentoKardex {
  id: string;
  data: string;
  tipo: "Entrada (NF-e)" | "Saída (Venda Salão)" | "Saída (Delivery)" | "Ajuste Inventário" | "Perda Toalete";
  documento: string;
  qtd: number;
  unidade: string;
  custoUnit: number;
  custoTotal: number;
  saldoQtd: number;
  saldoValor: number;
}

const KARDEX_SALMAO: MovimentoKardex[] = [
  { id: "1", data: "20/11/2026 09:15", tipo: "Entrada (NF-e)", documento: "NF-e 41289", qtd: 120.0, unidade: "kg", custoUnit: 68.50, custoTotal: 8220.0, saldoQtd: 120.0, saldoValor: 8220.0 },
  { id: "2", data: "20/11/2026 18:30", tipo: "Perda Toalete", documento: "REQ-TOAL-01", qtd: -9.6, unidade: "kg", custoUnit: 68.50, custoTotal: -657.6, saldoQtd: 110.4, saldoValor: 7562.4 },
  { id: "3", data: "20/11/2026 23:59", tipo: "Saída (Venda Salão)", documento: "CUPOM-LOTE-20", qtd: -18.1, unidade: "kg", custoUnit: 68.50, custoTotal: -1239.85, saldoQtd: 92.3, saldoValor: 6322.55 },
];

export const ErpEstoqueWmsSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"kardex" | "toalete" | "lotes" | "inventario" | "fichas" | "depositos">("kardex");
  const [filtroProduto, setFiltroProduto] = useState("Salmão Fresco Chileno");
  const [pesoSalmaoBruto, setPesoSalmaoBruto] = useState<number>(10.0); // 10 kg para simulação

  // Lotes e Rastreabilidade ANVISA
  const lotesSanitarios = [
    { lote: "LOT-SAL-20261120", produto: "Salmão Fresco Chileno Premium", fornecedor: "Pescados Pantanal", entrada: "20/11/2026", validade: "25/11/2026", diasRestantes: 4, qtdInicial: "120 kg", qtdAtual: "92.3 kg", tempArmazenamento: "-1.5°C (Câmara Fria 1)", status: "Perfeito / Consumo Ativo" },
    { lote: "LOT-POL-20261115", produto: "Polvo Espanhol Limpo", fornecedor: "Pescados Pantanal", entrada: "15/11/2026", validade: "15/02/2027", diasRestantes: 86, qtdInicial: "25 kg", qtdAtual: "18.0 kg", tempArmazenamento: "-18.0°C (Freezer 2)", status: "Congelado Seguro" },
    { lote: "LOT-CRM-20261110", produto: "Cream Cheese Balde 3.6kg", fornecedor: "Laticínios Tangará", entrada: "10/11/2026", validade: "10/12/2026", diasRestantes: 19, qtdInicial: "15 un", qtdAtual: "8 un", tempArmazenamento: "+4.0°C (Câmara Laticínios)", status: "Perfeito / Consumo Ativo" },
    { lote: "LOT-SHA-20261101", produto: "Arroz Especial Japonês Shari Tipo 1", fornecedor: "Grãos Nobres MT", entrada: "01/11/2026", validade: "01/05/2027", diasRestantes: 161, qtdInicial: "300 kg", qtdAtual: "140 kg", tempArmazenamento: "Ambiente Seco / Ventilado", status: "Almoxarifado Seco" },
  ];

  // Inventário Cíclico & Contagem Cega
  const itensInventario = [
    { codigo: "INS-001", descricao: "Salmão Fresco Chileno", unidade: "kg", classeABC: "A", estoqueTeorico: 92.3, estoqueFisico: 91.8, divergencia: -0.5, valorDivergencia: -34.25, acuracidade: "99.4%", pontoPedido: 40.0, status: "Aprovado" },
    { codigo: "INS-002", descricao: "Arroz Grão Curto Shari", unidade: "kg", classeABC: "B", estoqueTeorico: 140.0, estoqueFisico: 140.0, divergencia: 0.0, valorDivergencia: 0.00, acuracidade: "100.0%", pontoPedido: 80.0, status: "Perfeito" },
    { codigo: "INS-003", descricao: "Cream Cheese Balde 3.6kg", unidade: "baldes", classeABC: "A", estoqueTeorico: 8.0, estoqueFisico: 8.0, divergencia: 0.0, valorDivergencia: 0.00, acuracidade: "100.0%", pontoPedido: 4.0, status: "Perfeito" },
    { codigo: "INS-004", descricao: "Camarão Cinza Limpo 30/40", unidade: "kg", classeABC: "A", estoqueTeorico: 35.0, estoqueFisico: 34.2, divergencia: -0.8, valorDivergencia: -44.00, acuracidade: "97.7%", pontoPedido: 15.0, status: "Aprovado" },
    { codigo: "INS-005", descricao: "Alga Nori Premium Gold (50fls)", unidade: "pcts", classeABC: "C", estoqueTeorico: 24.0, estoqueFisico: 24.0, divergencia: 0.0, valorDivergencia: 0.00, acuracidade: "100.0%", pontoPedido: 10.0, status: "Perfeito" },
  ];

  // Fichas Técnicas / Engenharia de Cardápio (BOM)
  const fichasTecnicas = [
    {
      prato: "Combo Nakato (32 peças)",
      precoVenda: 275.00,
      custoTotalInsumos: 68.20,
      cmvTeorico: "24.8%",
      cmvReal: "25.5%",
      margemContribuicao: 206.80,
      ingredientes: [
        { nome: "Salmão Limpo (Toalete)", qtd: "380 g", custo: 26.03 },
        { nome: "Arroz Shari Temperado", qtd: "280 g", custo: 3.98 },
        { nome: "Cream Cheese", qtd: "90 g", custo: 2.45 },
        { nome: "Alga Nori Gold", qtd: "3 folhas", custo: 2.10 },
        { nome: "Embalagem Nobre Zuma + Hashis + Shoyu", qtd: "1 kit", custo: 4.80 },
      ]
    },
    {
      prato: "Sashimi Salmão Fresco (12 fatias)",
      precoVenda: 59.90,
      custoTotalInsumos: 16.83,
      cmvTeorico: "28.1%",
      cmvReal: "28.4%",
      margemContribuicao: 43.07,
      ingredientes: [
        { nome: "Lombo Salmão Fresco", qtd: "210 g", custo: 14.39 },
        { nome: "Gengibre Gari + Wasabi", qtd: "40 g", custo: 1.20 },
        { nome: "Embalagem / Prato Apresentação", qtd: "1 kit", custo: 1.24 },
      ]
    }
  ];

  const finalizarInventario = () => {
    toast.success("Inventário Cíclico concluído com 99.3% de acuracidade física! Ajustes lançados no Kardex e na contabilidade.");
  };

  // Cálculo da Toalete do Salmão
  const lomboNobreKg = pesoSalmaoBruto * 0.62;
  const aparasNobresKg = pesoSalmaoBruto * 0.18;
  const peleSkinKg = pesoSalmaoBruto * 0.07;
  const caldosKg = pesoSalmaoBruto * 0.05;
  const perdasKg = pesoSalmaoBruto * 0.08;
  const custoKgBruto = 68.50;
  const custoTotalBruto = pesoSalmaoBruto * custoKgBruto;
  const custoEfetivoLomboKg = (custoTotalBruto - (aparasNobresKg * 45.0) - (peleSkinKg * 20.0)) / lomboNobreKg;
  const fatorCorrecao = (pesoSalmaoBruto / lomboNobreKg).toFixed(2);

  return (
    <div className="space-y-5">
      {/* Top Banner WMS & Kardex */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <span>WMS, Kardex &amp; Engenharia de Insumos 360°</span>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                PEPS / FIFO Contábil + RDC 216 ANVISA + Toalete BOM
              </span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Ficha Kardex · Rendimento de Toalete (FC) · Lotes &amp; Rastreabilidade · Inventário Cego · Fichas Técnicas
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas do WMS */}
        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs flex-wrap">
          {[
            { id: "kardex", label: "Ficha Kardex", icon: FileText },
            { id: "toalete", label: "Toalete & Rendimento", icon: Scissors },
            { id: "lotes", label: "Lotes & Validade", icon: Calendar },
            { id: "inventario", label: "Inventário & Curva ABC", icon: Scale },
            { id: "fichas", label: "Fichas Técnicas (BOM)", icon: Layers },
            { id: "depositos", label: "Multidepósitos", icon: Building },
          ].map((item) => {
            const Icon = item.icon;
            const active = subAba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubAba(item.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. FICHA KARDEX (MOVIMENTAÇÃO E CUSTO MÉDIO) */}
      {subAba === "kardex" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <span>Ficha Kardex Contábil (PEPS / FIFO - Primeiro a Entrar, Primeiro a Sair)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Histórico de movimentação, toaletes de peixe e custo médio ponderado</p>
            </div>
            <select
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-bold text-[var(--ink)]"
            >
              <option value="Salmão Fresco Chileno">Salmão Fresco Chileno (Cód INS-001)</option>
              <option value="Arroz Shari Japonês">Arroz Shari Japonês (Cód INS-002)</option>
              <option value="Cream Cheese Balde">Cream Cheese Balde (Cód INS-003)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Tipo Movimentação</th>
                  <th className="py-2.5 px-3">Documento Ref.</th>
                  <th className="py-2.5 px-3 text-right">Qtd Movimentada</th>
                  <th className="py-2.5 px-3 text-right">Custo Unitário</th>
                  <th className="py-2.5 px-3 text-right">Impacto Total</th>
                  <th className="py-2.5 px-3 text-right font-black text-cyan-600">Saldo Físico</th>
                  <th className="py-2.5 px-3 text-right font-black text-[var(--ink)]">Saldo Financeiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {KARDEX_SALMAO.map((k) => (
                  <tr key={k.id} className="hover:bg-[var(--surface2)]">
                    <td className="py-3 px-3 font-sans font-medium text-[var(--ink)]">{k.data}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        k.tipo.includes("Entrada")
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : k.tipo.includes("Perda")
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                      }`}>
                        {k.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--muted)]">{k.documento}</td>
                    <td className={`py-3 px-3 text-right font-bold ${k.qtd > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {k.qtd > 0 ? `+${k.qtd}` : k.qtd} {k.unidade}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--muted)]">{formatBrl(k.custoUnit)}</td>
                    <td className={`py-3 px-3 text-right font-bold ${k.custoTotal > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {formatBrl(k.custoTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-cyan-600">{k.saldoQtd.toFixed(1)} {k.unidade}</td>
                    <td className="py-3 px-3 text-right font-black text-[var(--ink)]">{formatBrl(k.saldoValor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. RENDIMENTO DE TOALETE & FATOR DE CORREÇÃO (FC) */}
      {subAba === "toalete" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[var(--salmon)]" />
                <span>Simulador de Toalete, Rendimento &amp; Fator de Correção (FC)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Decomposição de corte nobre do salmão chileno: aproveitamento de lombos, aparas, pele e cálculo do CMV real
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted)]">Peixe Inteiro Bruto:</span>
              <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)]">
                {[5, 10, 20].map((kg) => (
                  <button
                    key={kg}
                    onClick={() => setPesoSalmaoBruto(kg)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      pesoSalmaoBruto === kg
                        ? "bg-[var(--salmon)] text-white shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {kg} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards de Métricas de Toalete */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Peso Bruto Eviscerado</span>
              <span className="text-base font-black font-mono text-[var(--ink)]">{pesoSalmaoBruto.toFixed(1)} kg</span>
              <span className="text-[10px] text-[var(--muted)] block">Custo Bruto: {formatBrl(custoTotalBruto)}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono block">Lombos Nobres (62%)</span>
              <span className="text-base font-black font-mono text-emerald-600">{lomboNobreKg.toFixed(2)} kg</span>
              <span className="text-[10px] text-emerald-600 font-bold block">Sashimi &amp; Niguiri VIP</span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase font-mono block">Fator de Correção (FC)</span>
              <span className="text-base font-black font-mono text-indigo-600">{fatorCorrecao}x</span>
              <span className="text-[10px] text-indigo-600 font-bold block">PB ÷ PL = 1.61</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--salmon)]/10 border border-[var(--salmon)]/20">
              <span className="text-[10px] text-[var(--salmon)] uppercase font-mono block">Custo Efetivo do Lombo</span>
              <span className="text-base font-black font-mono text-[var(--salmon)]">{formatBrl(custoEfetivoLomboKg)} /kg</span>
              <span className="text-[10px] text-[var(--salmon)] font-bold block">Ajustado por subprodutos</span>
            </div>
          </div>

          {/* Detalhamento das Frações de Toalete */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Fração da Toalete</th>
                  <th className="py-2 px-3">Destinação na Cozinha</th>
                  <th className="py-2 px-3 text-right">Rendimento (%)</th>
                  <th className="py-2 px-3 text-right">Peso Obtido</th>
                  <th className="py-2 px-3 text-right font-black text-[var(--ink)]">Valor Agregado (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-emerald-600">Lombo Nobre Superior / Ventreche</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--ink)]">Sashimi Omakase, Niguiris Maçaricados &amp; Joy</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">62.0%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{lomboNobreKg.toFixed(2)} kg</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-600">{formatBrl(lomboNobreKg * 115.0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-blue-600">Aparas Nobres de Corte</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--ink)]">Uramakis Filadélfia, Hot Rolls, Tartar &amp; Pates</td>
                  <td className="py-2.5 px-3 text-right text-blue-600">18.0%</td>
                  <td className="py-2.5 px-3 text-right text-blue-600">{aparasNobresKg.toFixed(2)} kg</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-600">{formatBrl(aparasNobresKg * 45.0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-amber-600">Pele Limpa Desescamada</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--ink)]">Salmão Skin Frito Crocante com Tarê</td>
                  <td className="py-2.5 px-3 text-right text-amber-600">7.0%</td>
                  <td className="py-2.5 px-3 text-right text-amber-600">{peleSkinKg.toFixed(2)} kg</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600">{formatBrl(peleSkinKg * 20.0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-neutral-500">Cabeça &amp; Espinhaço</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--ink)]">Fundo de Pescados &amp; Sopa Missoshiro</td>
                  <td className="py-2.5 px-3 text-right text-neutral-500">5.0%</td>
                  <td className="py-2.5 px-3 text-right text-neutral-500">{caldosKg.toFixed(2)} kg</td>
                  <td className="py-2.5 px-3 text-right text-neutral-500">{formatBrl(caldosKg * 8.0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-bold text-red-500">Descarte Inevitável (Sangrias/Gordura)</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--muted)]">Perda Operacional Sanitária (RDC 216)</td>
                  <td className="py-2.5 px-3 text-right text-red-500 font-bold">8.0%</td>
                  <td className="py-2.5 px-3 text-right text-red-500 font-bold">{perdasKg.toFixed(2)} kg</td>
                  <td className="py-2.5 px-3 text-right text-red-500">R$ 0,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LOTES SANITÁRIOS & RASTREABILIDADE ANVISA */}
      {subAba === "lotes" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Controle de Lotes &amp; Rastreabilidade Sanitária (ANVISA RDC 216)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Controle de validade residual, registros de temperatura e laudos de origem SIF</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lotesSanitarios.map((l, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[var(--muted)]">{l.lote}</span>
                    <h5 className="font-bold text-sm text-[var(--ink)]">{l.produto}</h5>
                    <span className="text-xs text-[var(--salmon)] font-medium">Fornecedor: {l.fornecedor}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    l.diasRestantes <= 5
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    Validade: {l.diasRestantes} dias
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--line)] font-mono">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Entrada:</span>
                    <span className="text-[var(--ink)]">{l.entrada}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Validade Final:</span>
                    <strong className="text-[var(--ink)]">{l.validade}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Estoque Inicial / Atual:</span>
                    <span className="text-[var(--ink)]">{l.qtdInicial} / <strong className="text-emerald-600">{l.qtdAtual}</strong></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Armazenamento:</span>
                    <span className="text-cyan-600 font-bold">{l.tempArmazenamento}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. INVENTÁRIO CÍCLICO & CURVA ABC COM PONTO DE REPOSIÇÃO */}
      {subAba === "inventario" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>Inventário Cíclico &amp; Curva ABC com Ponto de Pedido (ROP)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Contagem física cega via balança e apuração de divergências patrimoniais</p>
            </div>
            <button
              onClick={finalizarInventario}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Concluir &amp; Ajustar Inventário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Insumo</th>
                  <th className="py-2.5 px-3 text-center">Curva ABC</th>
                  <th className="py-2.5 px-3 text-right">Estoque Teórico</th>
                  <th className="py-2.5 px-3 text-right">Contagem Balança</th>
                  <th className="py-2.5 px-3 text-right">Ponto Pedido</th>
                  <th className="py-2.5 px-3 text-right">Divergência</th>
                  <th className="py-2.5 px-3 text-center">Acuracidade</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {itensInventario.map((inv, i) => (
                  <tr key={i} className="hover:bg-[var(--surface2)]">
                    <td className="py-2.5 px-3 text-[var(--muted)]">{inv.codigo}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-[var(--ink)]">{inv.descricao}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        inv.classeABC === "A"
                          ? "bg-red-500/15 text-red-700 font-bold"
                          : inv.classeABC === "B"
                          ? "bg-amber-500/15 text-amber-700 font-bold"
                          : "bg-blue-500/15 text-blue-700 font-bold"
                      }`}>
                        Classe {inv.classeABC}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">{inv.estoqueTeorico} {inv.unidade}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600">{inv.estoqueFisico} {inv.unidade}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[var(--salmon)]">{inv.pontoPedido} {inv.unidade}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${inv.divergencia < 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {inv.divergencia === 0 ? "0.0" : inv.divergencia} {inv.unidade}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{inv.acuracidade}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. FICHAS TÉCNICAS & ENGENHARIA DE PRODUTO (BOM) */}
      {subAba === "fichas" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Fichas Técnicas &amp; Engenharia de Cardápio (BOM)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Composição detalhada de insumos, custo por porção e apuração de CMV Teórico vs Real</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fichasTecnicas.map((ft, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-[var(--ink)]">{ft.prato}</h5>
                    <span className="text-xs text-[var(--muted)]">Preço Venda: <strong className="text-[var(--ink)] font-mono">{formatBrl(ft.precoVenda)}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--muted)] uppercase block">CMV Teórico</span>
                    <strong className="text-emerald-600 font-mono font-black">{ft.cmvTeorico}</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[var(--line)] text-xs">
                  {ft.ingredientes.map((ing, j) => (
                    <div key={j} className="flex justify-between text-[var(--muted)]">
                      <span>• {ing.nome} ({ing.qtd})</span>
                      <span className="font-mono text-[var(--ink)] font-medium">{formatBrl(ing.custo)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex justify-between text-xs font-mono">
                  <span>Custo Total Insumos: <strong className="text-red-500">{formatBrl(ft.custoTotalInsumos)}</strong></span>
                  <span>Margem Contribuição: <strong className="text-emerald-600 font-black">{formatBrl(ft.margemContribuicao)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MULTIDEPÓSITOS & ALMOXARIFADOS */}
      {subAba === "depositos" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span>Multidepósitos &amp; Câmaras Frigoríficas</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Saldos distribuídos por almoxarifado físico com controle térmico independente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-[var(--ink)]">Câmara Fria Pescados 1</h5>
                <span className="text-xs font-mono font-bold text-cyan-600">-1.8°C</span>
              </div>
              <p className="text-xs text-[var(--muted)]">Salmão Fresco, Atum e Peixes Nobres do sushibar.</p>
              <div className="text-xs font-mono font-bold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
                Valor Estocado: R$ 14.850,00
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-[var(--ink)]">Freezer Congelados 2</h5>
                <span className="text-xs font-mono font-bold text-cyan-600">-18.5°C</span>
              </div>
              <p className="text-xs text-[var(--muted)]">Camarões, Polvos, Sobremesas Hot Nutella e Sorvetes.</p>
              <div className="text-xs font-mono font-bold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
                Valor Estocado: R$ 9.420,00
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-[var(--ink)]">Almoxarifado Seco Central</h5>
                <span className="text-xs font-mono font-bold text-amber-600">+22.0°C</span>
              </div>
              <p className="text-xs text-[var(--muted)]">Arroz Shari, Algas Nori, Farinhas Panko, Embalagens e Shoyu.</p>
              <div className="text-xs font-mono font-bold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
                Valor Estocado: R$ 12.300,00
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
