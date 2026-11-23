import React, { useState } from "react";
import { 
  Pizza, 
  Flame, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Tv, 
  Truck, 
  Utensils, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const SABORES_PIZZA = [
  { id: "1", nome: "Calabresa Especial com Cebola Roxa", preco: 62.00, desc: "Calabresa artesanal defumada e orégano fresco" },
  { id: "2", nome: "Filadélfia Premium (Salmão & Cream Cheese)", preco: 78.00, desc: "Salmão selado com gergelim e cream cheese Philadelphia" },
  { id: "3", nome: "Quatro Queijos Gratinada", preco: 68.00, desc: "Mussarela, provolone, gorgonzola e catupiry legítimo" },
  { id: "4", nome: "Frango Desfiado com Catupiry", preco: 64.00, desc: "Peito de frango temperado e Catupiry D.O.P." },
  { id: "5", nome: "Marguerita Tradicional com Manjericão", preco: 58.00, desc: "Molho de tomate italiano pelatti e folhas frescas" },
  { id: "6", nome: "Nutella com Morangos Frescos", preco: 65.00, desc: "Creme de avelã Nutella e morangos fatiados" },
];

const BORDAS = [
  { id: "b0", nome: "Sem Borda Recheada", preco: 0 },
  { id: "b1", nome: "Borda Catupiry Original", preco: 14.00 },
  { id: "b2", nome: "Borda Cheddar Cremoso", preco: 12.00 },
  { id: "b3", nome: "Borda Vulcão Doce de Leite Viçosa", preco: 16.00 },
];

export const ErpPizzariaSubsuite: React.FC = () => {
  const [tamanho, setTamanho] = useState<"grande" | "gigante" | "media">("grande");
  const [sabor1, setSabor1] = useState(SABORES_PIZZA[0]);
  const [sabor2, setSabor2] = useState(SABORES_PIZZA[1]);
  const [borda, setBorda] = useState(BORDAS[1]);
  const [regraPreco, setRegraPreco] = useState<"maior" | "media">("maior");

  const precoBasePizza = regraPreco === "maior" 
    ? Math.max(sabor1.preco, sabor2.preco) 
    : (sabor1.preco + sabor2.preco) / 2;

  const multiplicadorTamanho = tamanho === "gigante" ? 1.25 : tamanho === "media" ? 0.85 : 1.0;
  const precoTotal = (precoBasePizza * multiplicadorTamanho) + borda.preco;

  const [pedidosForno, setPedidosForno] = useState([
    { id: "pz-101", mesa: "Mesa 08", tempo: "12 min", pizza: "1/2 Filadélfia + 1/2 Quatro Queijos (Grande)", borda: "Borda Catupiry", status: "forno" },
    { id: "pz-102", mesa: "Delivery #34", tempo: "06 min", pizza: "Calabresa Especial Inteira (Grande)", borda: "Sem Borda", status: "montagem" },
    { id: "pz-103", mesa: "Mesa 15", tempo: "18 min", pizza: "1/2 Frango Catupiry + 1/2 Nutella (Gigante)", borda: "Borda Vulcão", status: "pronto" },
  ]);

  const handleEnviarAoForno = () => {
    const novaPizza = {
      id: `pz-${Math.floor(Math.random() * 900) + 100}`,
      mesa: "Mesa 12",
      tempo: "0 min",
      pizza: `1/2 ${sabor1.nome.split(" ")[0]} + 1/2 ${sabor2.nome.split(" ")[0]} (${tamanho})`,
      borda: borda.nome,
      status: "montagem"
    };
    setPedidosForno(prev => [novaPizza, ...prev]);
    toast.success(`Pizza ${novaPizza.pizza} (${formatBrl(precoTotal)}) enviada ao KDS Forno a Lenha!`);
  };

  return (
    <div className="space-y-4">
      {/* Header do Módulo Pizzaria */}
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-500/10 px-2.5 py-0.5 rounded-md">
              Módulo Especializado • Forneria &amp; Pizzaria Kytto
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Montador de Pizza Fracionada (Meio-a-Meio), Bordas &amp; KDS Forno
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Cálculo automatizado por maior valor ou média, controle de tempos de cocção no forno e despacho multicanal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-500/10 px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5" /> Forno: 320°C (Lenha Ecológica)
            </span>
          </div>
        </div>

        {/* Montador de Pizza Interativo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {/* Seletor de Tamanho */}
            <div>
              <span className="text-xs font-bold text-[var(--ink)] block mb-1">Tamanho da Pizza:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "media", nome: "Média (6 fatias)", mult: "0.85x" },
                  { id: "grande", nome: "Grande (8 fatias)", mult: "Padrão" },
                  { id: "gigante", nome: "Gigante (12 fatias)", mult: "1.25x" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTamanho(t.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs ${
                      tamanho === t.id
                        ? "bg-[var(--salmon)] text-white border-[var(--salmon)] font-bold shadow-xs"
                        : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                    }`}
                  >
                    <b>{t.nome}</b>
                    <span className="text-[10px] block opacity-80">{t.mult}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sabores Meio a Meio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--ink)] block">1º Sabor (50%):</span>
                <select
                  value={sabor1.id}
                  onChange={(e) => setSabor1(SABORES_PIZZA.find(s => s.id === e.target.value) || SABORES_PIZZA[0])}
                  className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)]"
                >
                  {SABORES_PIZZA.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} ({formatBrl(s.preco)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--ink)] block">2º Sabor (50%):</span>
                <select
                  value={sabor2.id}
                  onChange={(e) => setSabor2(SABORES_PIZZA.find(s => s.id === e.target.value) || SABORES_PIZZA[1])}
                  className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)]"
                >
                  {SABORES_PIZZA.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} ({formatBrl(s.preco)})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Borda Recheada */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--ink)] block">Borda Recheada:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BORDAS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBorda(b)}
                    className={`p-2 rounded-xl border text-center transition-all text-[11px] ${
                      borda.id === b.id
                        ? "bg-[var(--salmon)] text-white border-[var(--salmon)] font-bold shadow-xs"
                        : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                    }`}
                  >
                    <b>{b.nome}</b>
                    <span className="block text-[10px] opacity-80">{b.preco === 0 ? "Incluso" : `+${formatBrl(b.preco)}`}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo da Montagem e Envio ao KDS */}
          <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Preço Calculado:</span>
              <div className="text-3xl font-black font-mono-nums text-[var(--ink)]">
                {formatBrl(precoTotal)}
              </div>
              <div className="text-xs text-[var(--muted)] space-y-1">
                <div>Regra: <b>{regraPreco === "maior" ? "Maior Valor dos Sabores" : "Média"}</b></div>
                <div>Borda: <b>{borda.nome}</b></div>
              </div>
            </div>

            <button
              onClick={handleEnviarAoForno}
              className="w-full py-3 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4" /> Disparar para o Forno KDS
            </button>
          </div>
        </div>

        {/* Fila do KDS Forno */}
        <div className="space-y-2 pt-2 border-t border-[var(--line)]">
          <span className="text-xs font-bold text-[var(--ink)] block">
            KDS Forno &amp; Esteira Contínua em Tempo Real:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {pedidosForno.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <b className="text-[var(--salmon)] font-mono">{p.id} • {p.mesa}</b>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
                    p.status === "forno" ? "bg-red-500 animate-pulse" : p.status === "pronto" ? "bg-emerald-600" : "bg-amber-500"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-[var(--ink)] block">{p.pizza}</span>
                  <span className="text-[10px] text-[var(--muted)] block">{p.borda}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] border-t border-[var(--line)]/50 pt-1.5">
                  <span>No forno há: <b className="text-[var(--ink)]">{p.tempo}</b></span>
                  <button
                    onClick={() => toast.success(`Pedido ${p.id} marcado como pronto!`)}
                    className="text-[10px] font-bold text-[var(--salmon)] hover:underline"
                  >
                    Avançar Etapa &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
