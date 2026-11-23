import React, { useState } from "react";
import {
  Bike,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface FaixaEntrega {
  id: string;
  nome: string;
  bairros: string;
  distanciaMaxKm: number;
  prazoMin: number;
  valorFrete: number;
  freteGratisAcimaDe: number;
  ativo: boolean;
}

const FAIXAS_INICIAIS: FaixaEntrega[] = [
  {
    id: "FX-01",
    nome: "Zona 1 · Centro & Bairros Nobres",
    bairros: "Centro, Jardim Europa, Vila Alta",
    distanciaMaxKm: 3.5,
    prazoMin: 35,
    valorFrete: 8.0,
    freteGratisAcimaDe: 150.0,
    ativo: true,
  },
  {
    id: "FX-02",
    nome: "Zona 2 · Bairros Intermediários",
    bairros: "Parque Tangará, Morada do Sol, Jardim América",
    distanciaMaxKm: 6.0,
    prazoMin: 45,
    valorFrete: 12.0,
    freteGratisAcimaDe: 190.0,
    ativo: true,
  },
  {
    id: "FX-03",
    nome: "Zona 3 · Extensão & Expansão",
    bairros: "Tarumã, Tangará II, Alto da Boa Vista",
    distanciaMaxKm: 9.0,
    prazoMin: 55,
    valorFrete: 15.0,
    freteGratisAcimaDe: 250.0,
    ativo: true,
  },
  {
    id: "FX-04",
    nome: "Zona 4 · Polo Industrial & Rodovias",
    bairros: "Distrito Industrial, Frigorífico, MT-358 Perímetro",
    distanciaMaxKm: 14.0,
    prazoMin: 65,
    valorFrete: 22.0,
    freteGratisAcimaDe: 350.0,
    ativo: true,
  },
];

export const ErpDeliveryRulesEditor: React.FC = () => {
  const [faixas, setFaixas] = useState<FaixaEntrega[]>(FAIXAS_INICIAIS);

  const adicionarFaixa = () => {
    const nova: FaixaEntrega = {
      id: `FX-0${faixas.length + 1}`,
      nome: `Zona ${faixas.length + 1} · Nova Região`,
      bairros: "Novos Bairros",
      distanciaMaxKm: 5.0,
      prazoMin: 40,
      valorFrete: 10.0,
      freteGratisAcimaDe: 180.0,
      ativo: true,
    };
    setFaixas([...faixas, nova]);
    toast.success("Nova faixa de atendimento de motoboy adicionada!");
  };

  const removerFaixa = (id: string) => {
    setFaixas(faixas.filter((f) => f.id !== id));
    toast.info("Faixa de entrega removida.");
  };

  const salvarRegras = () => {
    toast.success("Regras de frete e roteirização de Tangará da Serra salvas com sucesso!");
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        <div>
          <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <Bike className="w-5 h-5 text-[var(--salmon)]" />
            <span>Editor de Faixas e Taxas de Entrega Própria · Tangará da Serra</span>
          </h4>
          <p className="text-xs text-[var(--muted)]">
            Parametrização de frete por raio (km), bairros atendidos, prazos estimados e gratuidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={adicionarFaixa}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] text-[var(--ink)] border border-[var(--line)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--line)]"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Faixa
          </button>
          <button
            onClick={salvarRegras}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Regras
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {faixas.map((f, index) => (
          <div
            key={f.id}
            className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)] text-[var(--salmon)]">
                  {f.id}
                </span>
                <strong className="text-sm font-black text-[var(--ink)]">{f.nome}</strong>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] font-bold text-[var(--muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.ativo}
                    onChange={(e) => {
                      const updated = [...faixas];
                      updated[index].ativo = e.target.checked;
                      setFaixas(updated);
                    }}
                    className="accent-[var(--salmon)]"
                  />
                  <span>Ativa</span>
                </label>
                <button
                  onClick={() => removerFaixa(f.id)}
                  className="p-1 text-[var(--muted)] hover:text-red-600 transition-colors"
                  title="Remover faixa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10.5px] font-bold text-[var(--muted)] block mb-1">
                  Bairros Atendidos (separados por vírgula):
                </label>
                <input
                  type="text"
                  value={f.bairros}
                  onChange={(e) => {
                    const updated = [...faixas];
                    updated[index].bairros = e.target.value;
                    setFaixas(updated);
                  }}
                  className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[var(--muted)] block mb-1">
                  Taxa de Entrega (R$):
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={f.valorFrete}
                  onChange={(e) => {
                    const updated = [...faixas];
                    updated[index].valorFrete = parseFloat(e.target.value) || 0;
                    setFaixas(updated);
                  }}
                  className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--salmon)]"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[var(--muted)] block mb-1">
                  Frete Grátis Acima de (R$):
                </label>
                <input
                  type="number"
                  step="5.00"
                  value={f.freteGratisAcimaDe}
                  onChange={(e) => {
                    const updated = [...faixas];
                    updated[index].freteGratisAcimaDe = parseFloat(e.target.value) || 0;
                    setFaixas(updated);
                  }}
                  className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-mono font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--muted)] pt-1">
              <span>Raio Máximo: <b>{f.distanciaMaxKm} km</b></span>
              <span>·</span>
              <span>Tempo Estimado: <b>~{f.prazoMin} minutos</b></span>
              <span>·</span>
              <span>Roteamento Inteligente: <b>KyttoIA GPS Ativo</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
