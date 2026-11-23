import React, { useState } from "react";
import { 
  Wine, 
  Beer, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Plus, 
  Split, 
  Receipt, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface ComandaBar {
  id: string;
  mesa: string;
  cliente: string;
  itens: { id: string; nome: string; qtd: number; preco: number; status: "preparando" | "pronto" | "entregue" }[];
  status: "aberta" | "em_pagamento" | "fechada";
}

const COMANDAS_BAR_MOCK: ComandaBar[] = [
  {
    id: "cmd-301",
    mesa: "Mesa 04 (Deck)",
    cliente: "Bruno Henrique",
    itens: [
      { id: "i1", nome: "Chopp Artesanal Pilsen 500ml", qtd: 3, preco: 18.00, status: "entregue" },
      { id: "i2", nome: "Caipirinha Saquê com Kiwi", qtd: 2, preco: 32.00, status: "pronto" },
      { id: "i3", nome: "Porção Guioza Suína na Chapa (6un)", qtd: 1, preco: 38.00, status: "preparando" },
    ],
    status: "aberta"
  },
  {
    id: "cmd-302",
    mesa: "Mesa 10 (Salão Nobre)",
    cliente: "Dra. Camila Toledo",
    itens: [
      { id: "i4", nome: "Moscow Mule Oriental (com espuma de gengibre)", qtd: 2, preco: 36.00, status: "pronto" },
      { id: "i5", nome: "Vinho Branco Torrontés Argentino", qtd: 1, preco: 120.00, status: "entregue" },
      { id: "i6", nome: "Carpaccio de Salmão com Alcaparras", qtd: 1, preco: 65.00, status: "entregue" },
    ],
    status: "aberta"
  },
  {
    id: "cmd-303",
    mesa: "Balcão Sushibar 02",
    cliente: "Thiago Mendes",
    itens: [
      { id: "i7", nome: "Saquê Junmai Dourado Dose", qtd: 2, preco: 28.00, status: "entregue" },
      { id: "i8", nome: "Edamame com Flor de Sal", qtd: 1, preco: 32.00, status: "entregue" },
    ],
    status: "aberta"
  }
];

export const ErpBarSubsuite: React.FC = () => {
  const [comandas, setComandas] = useState<ComandaBar[]>(COMANDAS_BAR_MOCK);
  const [comandaAtivaId, setComandaAtivaId] = useState<string>(COMANDAS_BAR_MOCK[0].id);

  // Divisor de Conta
  const [numPagadores, setNumPagadores] = useState(3);

  const comandaAtiva = comandas.find(c => c.id === comandaAtivaId) || comandas[0];
  const totalComanda = comandaAtiva.itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const valorPorPagador = totalComanda / numPagadores;

  const handleFecharComanda = () => {
    toast.success(`Conta da ${comandaAtiva.mesa} fechada e dividida em ${numPagadores}x de ${formatBrl(valorPorPagador)}!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar & Comandas */}
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
              Gestão de Bar &amp; Balcão • Kytto Bar
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Comandas Eletrônicas, Divisão de Conta &amp; KDS de Bebidas/Chopp
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Controle ágil de comandas individuais, divisão de conta em múltiplos pagadores e estação de drinks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Beer className="w-3.5 h-3.5" /> Chopeira: 3 Bicos Ativos (Pilsen, IPA, Weiss)
            </span>
          </div>
        </div>

        {/* Layout: Comandas à Esquerda e Detalhes/Divisão à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lista de Comandas Abertas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
              <span>Comandas em Aberto:</span>
              <span className="text-[10px] text-[var(--muted)]">{comandas.length} mesas ativas</span>
            </div>

            <div className="space-y-1.5">
              {comandas.map((c) => {
                const total = c.itens.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
                const isSelected = comandaAtivaId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setComandaAtivaId(c.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-sm"
                        : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <b className="text-xs">{c.mesa}</b>
                      <span className="font-mono-nums font-black text-xs">{formatBrl(total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                      <span>{c.cliente}</span>
                      <span>{c.itens.length} itens pedidos</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalhes da Comanda & Divisor de Conta */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                <div>
                  <h4 className="text-base font-black text-[var(--ink)]">{comandaAtiva.mesa} • {comandaAtiva.cliente}</h4>
                  <span className="text-xs text-[var(--muted)]">Comanda #{comandaAtiva.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--muted)] uppercase block">Total Consumido:</span>
                  <span className="text-xl font-black font-mono-nums text-[var(--ink)]">{formatBrl(totalComanda)}</span>
                </div>
              </div>

              {/* Tabela de Itens da Comanda */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[var(--ink)] block">Itens da Comanda:</span>
                <div className="space-y-1">
                  {comandaAtiva.itens.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--surface2)] flex items-center justify-center font-bold text-[10px] text-[var(--ink)]">
                          {item.qtd}x
                        </span>
                        <span className="font-semibold text-[var(--ink)]">{item.nome}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.status === "entregue" ? "bg-emerald-500/10 text-emerald-600" : item.status === "pronto" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {item.status}
                        </span>
                        <span className="font-mono-nums font-black text-[var(--ink)]">
                          {formatBrl(item.preco * item.qtd)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisor de Conta Automático */}
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--salmon)] flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5" /> Divisão de Conta Inteligente:
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">Selecione o número de pagadores</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumPagadores(n)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        numPagadores === n
                          ? "bg-[var(--salmon)] text-white shadow-xs"
                          : "bg-[var(--surface2)] text-[var(--ink)] hover:border-[var(--salmon)] border border-[var(--line)]"
                      }`}
                    >
                      {n === 1 ? "Conta Inteira" : `${n} Pessoas`}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface2)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Valor por Pessoa ({numPagadores}x):</span>
                    <span className="text-lg font-black font-mono-nums text-emerald-600">
                      {formatBrl(valorPorPagador)}
                    </span>
                  </div>
                  <button
                    onClick={handleFecharComanda}
                    className="py-2 px-4 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs"
                  >
                    Fechar Conta &amp; Emitir NFC-e
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
