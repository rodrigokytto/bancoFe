import React, { useState } from "react";
import {
  Boxes,
  ShoppingCart,
  FileCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  Calendar,
  Layers,
  Search,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Cotacao {
  id: string;
  item: string;
  qtd: string;
  fornecedores: { nome: string; precoUnit: number; prazoDias: number; selecionado: boolean }[];
}

const COTACOES_INICIAIS: Cotacao[] = [
  {
    id: "COT-401",
    item: "Salmão Chileno Fresco Premium (Calibre 4-5kg)",
    qtd: "80 kg",
    fornecedores: [
      { nome: "Pescados Pantanal (Cuiabá)", precoUnit: 68.5, prazoDias: 1, selecionado: true },
      { nome: "Mar & Rio Pescados (MT)", precoUnit: 71.0, prazoDias: 2, selecionado: false },
      { nome: "Costa Sul Pescados", precoUnit: 69.9, prazoDias: 3, selecionado: false },
    ],
  },
  {
    id: "COT-402",
    item: "Arroz Grão Curto Especial p/ Sushi (Shari Tipo 1)",
    qtd: "150 kg (6 fardos)",
    fornecedores: [
      { nome: "Distribuidora Grãos Nobres MT", precoUnit: 14.2, prazoDias: 2, selecionado: true },
      { nome: "Atacadão Tangará da Serra", precoUnit: 15.5, prazoDias: 0, selecionado: false },
    ],
  },
  {
    id: "COT-403",
    item: "Cream Cheese Tradicional Balde 3.6kg",
    qtd: "12 baldes",
    fornecedores: [
      { nome: "Laticínios Tangará Distribuição", precoUnit: 98.0, prazoDias: 1, selecionado: true },
      { nome: "Danone / Polenghi Food Service", precoUnit: 104.5, prazoDias: 4, selecionado: false },
    ],
  },
];

export const ErpSuprimentosSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"cotacoes" | "matching" | "kardex" | "perdas">("cotacoes");
  const [cotacoes, setCotacoes] = useState<Cotacao[]>(COTACOES_INICIAIS);

  // Perdas state
  const [perdas, setPerdas] = useState([
    { id: "1", data: "21/11", item: "Aparas de Salmão da Toalete", qtd: "1.4 kg", motivo: "Aparas destinadas ao recheio de Hot Roll", impacto: 95.9, status: "Aproveitado" },
    { id: "2", data: "20/11", item: "Avocado Maduro (Ponto)", qtd: "3 un", motivo: "Oxidação natural antes do turno", impacto: 24.0, status: "Baixa Aprovada" },
  ]);

  const [novoItemPerda, setNovoItemPerda] = useState({
    item: "Salmão Fresco",
    qtd: "0.5 kg",
    motivo: "Quebra na fatiamento de Sashimi",
    impacto: 34.25,
  });

  const registrarPerda = (e: React.FormEvent) => {
    e.preventDefault();
    const nova = {
      id: String(Date.now()),
      data: "Hoje",
      item: novoItemPerda.item,
      qtd: novoItemPerda.qtd,
      motivo: novoItemPerda.motivo,
      impacto: novoItemPerda.impacto,
      status: "Registrado no Kardex",
    };
    setPerdas([nova, ...perdas]);
    toast.success("Ocorrência de perda registrada com sucesso no Kardex!");
  };

  return (
    <div className="space-y-5">
      {/* Sub-Header com Abas do Módulo Suprimentos */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)]">
              Supply Chain, Compras &amp; Kardex de Pescados
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Cotações de Fornecedores · 3-Way Matching · Rendimento do Salmão · Inventário de Perdas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
          {[
            { id: "cotacoes", label: "Cotações Fornecedores", icon: ShoppingCart },
            { id: "matching", label: "3-Way Matching", icon: FileCheck },
            { id: "kardex", label: "Rendimento Salmão", icon: Scale },
            { id: "perdas", label: "Inventário & Perdas", icon: TrendingDown },
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

      {/* 1. COTAÇÕES DE FORNECEDORES */}
      {subAba === "cotacoes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[var(--ink)]">
              Cotações Regionais Ativas (Cuiabá × Tangará da Serra)
            </h4>
            <button
              onClick={() => toast.info("Para nova cotação, selecione os insumos na tela de compras.")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white font-bold text-xs shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Cotação
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {cotacoes.map((c) => (
              <div
                key={c.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs">
                  <div>
                    <strong className="text-sm font-black text-[var(--ink)] block">{c.item}</strong>
                    <span className="text-[var(--muted)] font-mono">Volume Solicitado: {c.qtd}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--salmon)]">{c.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {c.fornecedores.map((f, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        f.selecionado
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "border-[var(--line)] bg-[var(--surface2)]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <strong className="text-[var(--ink)]">{f.nome}</strong>
                        {f.selecionado && (
                          <span className="text-[9.5px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            Melhor Oferta
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-black text-sm text-[var(--ink)]">
                        R$ {f.precoUnit.toFixed(2)} / un
                      </div>
                      <span className="text-[11px] text-[var(--muted)] block">
                        Prazo de Entrega: {f.prazoDias === 0 ? "Imediato (Balcão)" : `${f.prazoDias} dia(s)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 3-WAY MATCHING */}
      {subAba === "matching" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Conferência 3-Way Matching (NFe × Pedido de Compra × Entrada Física)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Validação automática para impedir divergências de preço faturado ou peso recebido na pesagem do salmão
            </p>
          </div>

          <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 font-mono">
              <div>
                <strong className="text-sm font-bold text-[var(--ink)] block">
                  Entrada de Salmão Fresco Eviscerado · Pescados Pantanal LTDA
                </strong>
                <span className="text-[var(--muted)]">NF-e nº 18492 · Chave 5126... · Pedido #PED-7712</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                100% Compatível (3-Way OK)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">1. Pedido de Compra</span>
                <div className="font-mono font-bold text-[var(--ink)]">60.00 kg @ R$ 68,50/kg</div>
                <span className="text-[11px] text-[var(--muted)]">Total Previsto: R$ 4.110,00</span>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">2. XML da NF-e Recebido</span>
                <div className="font-mono font-bold text-[var(--ink)]">60.00 kg @ R$ 68,50/kg</div>
                <span className="text-[11px] text-[var(--muted)]">Total Faturado: R$ 4.110,00</span>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--line)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">3. Pesagem Balança Docas</span>
                <div className="font-mono font-bold text-emerald-600">60.20 kg pesados (+0.2kg)</div>
                <span className="text-[11px] text-emerald-600 font-bold">Tolerância aceita · Aprovado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RENDIMENTO DO SALMÃO (KARDEX NOBRE) */}
      {subAba === "kardex" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--salmon)]" />
              <span>Calculadora de Rendimento e Ficha Técnica do Salmão Chileno</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Acompanhamento de perda por toalete, espinhaço, pele e aproveitamento de aparas no sushibar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)]">1. Peixe Eviscerado Bruto</span>
              <div className="text-xl font-mono font-black text-[var(--ink)]">100% (4.50 kg)</div>
              <span className="text-[11px] text-[var(--muted)]">Custo Base: R$ 68,50/kg</span>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">2. Filé Limpo Sashimi</span>
              <div className="text-xl font-mono font-black text-emerald-600">62% (2.79 kg)</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Custo Efetivo: R$ 110,48/kg</span>
            </div>
            <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">3. Aparas p/ Hot Roll &amp; Pasta</span>
              <div className="text-xl font-mono font-black text-amber-600">24% (1.08 kg)</div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Reaproveitamento nobre</span>
            </div>
            <div className="p-3.5 bg-red-500/10 rounded-xl border border-red-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-300">4. Descarte (Pele/Espinhas)</span>
              <div className="text-xl font-mono font-black text-red-600">14% (0.63 kg)</div>
              <span className="text-[11px] text-red-600 font-bold">Perda técnica normal</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVENTÁRIO & PERDAS */}
      {subAba === "perdas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-[var(--ink)] border-b border-[var(--line)] pb-2">
              Histórico de Perdas e Baixas de Insumos ({perdas.length})
            </h4>

            <div className="space-y-2">
              {perdas.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-[var(--ink)] block">{p.item} ({p.qtd})</strong>
                    <span className="text-[11px] text-[var(--muted)]">
                      {p.data} · Motivo: {p.motivo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-600 block">
                      R$ {p.impacto.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-[var(--ink)] border-b border-[var(--line)] pb-2">
              Registrar Ocorrência / Baixa Técnica
            </h4>

            <form onSubmit={registrarPerda} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Insumo:</label>
                <input
                  type="text"
                  value={novoItemPerda.item}
                  onChange={(e) => setNovoItemPerda({ ...novoItemPerda, item: e.target.value })}
                  className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Quantidade / Peso:</label>
                  <input
                    type="text"
                    value={novoItemPerda.qtd}
                    onChange={(e) => setNovoItemPerda({ ...novoItemPerda, qtd: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Impacto Financeiro (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoItemPerda.impacto}
                    onChange={(e) => setNovoItemPerda({ ...novoItemPerda, impacto: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Motivo da Baixa:</label>
                <input
                  type="text"
                  value={novoItemPerda.motivo}
                  onChange={(e) => setNovoItemPerda({ ...novoItemPerda, motivo: e.target.value })}
                  className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs"
              >
                Gravar Baixa no Kardex
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
