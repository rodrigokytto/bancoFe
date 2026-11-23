import React, { useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  FileText,
  DollarSign,
  Truck,
  Building,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

export interface OrdemServico {
  id: string;
  equipamentoOuVeiculo: string;
  setor: "Cozinha & Sushibar" | "Câmara Fria & Refrigeração" | "Frota Delivery Motos" | "Salão & Climatização";
  responsavelTecnico: string;
  defeitoRelatado: string;
  laudoTecnico: string;
  pecasTrocadas: { nome: string; qtd: number; valorUnit: number }[];
  valorMaoDeObra: number;
  valorTotal: number;
  status: "Aberta" | "Em Execução" | "Aguardando Peça" | "Concluída";
  dataAbertura: string;
}

const OS_INICIAIS: OrdemServico[] = [
  {
    id: "OS-2026-104",
    equipamentoOuVeiculo: "Câmara Fria de Congelamento de Salmão (-20°C)",
    setor: "Câmara Fria & Refrigeração",
    responsavelTecnico: "Eng. Clóvis Mendes (Refrigeração MT)",
    defeitoRelatado: "Sensor IoT acusou oscilação de temperatura para -14°C no degelo",
    laudoTecnico: "Substituição da válvula de expansão termostática e recarga de gás ecológico R-404A",
    pecasTrocadas: [
      { nome: "Válvula de Expansão Danfoss", qtd: 1, valorUnit: 480.00 },
      { nome: "Fluido Refrigerante R-404A (cilindro)", qtd: 1, valorUnit: 350.00 }
    ],
    valorMaoDeObra: 650.00,
    valorTotal: 1480.00,
    status: "Concluída",
    dataAbertura: "20/11/2026",
  },
  {
    id: "OS-2026-105",
    equipamentoOuVeiculo: "Moto Delivery Honda CG 160 Fan (Placa RAZ-3K11)",
    setor: "Frota Delivery Motos",
    responsavelTecnico: "Oficina Central Tangará",
    defeitoRelatado: "Revisão preventiva de 10.000 km e troca de lona de freio",
    laudoTecnico: "Troca de óleo semissintético, filtro de ar e pastilhas de freio dianteiras",
    pecasTrocadas: [
      { nome: "Óleo 10W30 Genuíno Honda", qtd: 1, valorUnit: 48.00 },
      { nome: "Pastilha de Freio Dianteira Cobreq", qtd: 1, valorUnit: 65.00 },
      { nome: "Filtro de Ar Esportivo", qtd: 1, valorUnit: 35.00 }
    ],
    valorMaoDeObra: 120.00,
    valorTotal: 268.00,
    status: "Concluída",
    dataAbertura: "21/11/2026",
  },
  {
    id: "OS-2026-106",
    equipamentoOuVeiculo: "Ar Condicionado Inverter 36.000 BTUs (Salão Principal)",
    setor: "Salão & Climatização",
    responsavelTecnico: "Técnico Tiago Lima",
    defeitoRelatado: "Higienização periódica e verificação de dreno de condensação",
    laudoTecnico: "Limpeza de serpentina e filtros com bactericida hospitalar",
    pecasTrocadas: [],
    valorMaoDeObra: 280.00,
    valorTotal: 280.00,
    status: "Em Execução",
    dataAbertura: "21/11/2026",
  },
];

export const ErpOrdemServicoSubsuite: React.FC = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>(OS_INICIAIS);
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [modalNovaOs, setModalNovaOs] = useState(false);

  const [novaOs, setNovaOs] = useState({
    equipamentoOuVeiculo: "",
    setor: "Cozinha & Sushibar" as OrdemServico["setor"],
    responsavelTecnico: "",
    defeitoRelatado: "",
    valorMaoDeObra: 150.0,
  });

  const handleSalvarOs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaOs.equipamentoOuVeiculo || !novaOs.defeitoRelatado) {
      toast.error("Preencha o equipamento e o defeito relatado!");
      return;
    }

    const criada: OrdemServico = {
      id: `OS-2026-${100 + ordens.length + 1}`,
      equipamentoOuVeiculo: novaOs.equipamentoOuVeiculo,
      setor: novaOs.setor,
      responsavelTecnico: novaOs.responsavelTecnico || "Equipe Interna",
      defeitoRelatado: novaOs.defeitoRelatado,
      laudoTecnico: "Diagnóstico inicial registrado. Aguardando execução.",
      pecasTrocadas: [],
      valorMaoDeObra: Number(novaOs.valorMaoDeObra),
      valorTotal: Number(novaOs.valorMaoDeObra),
      status: "Aberta",
      dataAbertura: new Date().toLocaleDateString("pt-BR"),
    };

    setOrdens([criada, ...ordens]);
    setModalNovaOs(false);
    toast.success(`Ordem de Serviço ${criada.id} aberta com sucesso!`);
  };

  const ordensFiltradas = filtroSetor === "todos"
    ? ordens
    : ordens.filter(o => o.setor.toLowerCase().includes(filtroSetor.toLowerCase()));

  const totalGastoManutencao = ordens.reduce((acc, o) => acc + o.valorTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header OS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-stone-900 to-amber-950/30 border border-orange-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-100">Ordens de Serviço & Manutenção 360°</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Preventiva & Corretiva
              </span>
            </div>
            <p className="text-sm text-stone-400">
              Câmaras frias, balcões refrigerados, frota de entrega, ar-condicionado e laudos técnicos
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalNovaOs(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Ordem de Serviço
        </button>
      </div>

      {/* KPIs de Manutenção */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
          <div className="text-xs text-stone-400">Total Investido em Manutenção</div>
          <div className="text-2xl font-black text-orange-400 font-mono mt-1">{formatBrl(totalGastoManutencao)}</div>
          <div className="text-xs text-stone-400 mt-1">{ordens.length} ordens abertas no período</div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
          <div className="text-xs text-stone-400">Disponibilidade Operacional</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">99.4%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> Câmaras frias e gerador 100% ativos
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
          <div className="text-xs text-stone-400">Frota de Delivery Ativa</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">6 motocicletas</div>
          <div className="text-xs text-stone-400 mt-1">Revisão preventiva em dia</div>
        </div>
      </div>

      {/* Lista de Ordens de Serviço */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="font-bold text-stone-100 text-base">Histórico de Ordens de Serviço</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950/60 text-xs uppercase text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-3">Número OS</th>
                <th className="py-3 px-3">Equipamento / Veículo</th>
                <th className="py-3 px-3">Setor</th>
                <th className="py-3 px-3">Defeito & Laudo</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs">
              {ordensFiltradas.map((o) => (
                <tr key={o.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-orange-400">{o.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-100">{o.equipamentoOuVeiculo}</div>
                    <div className="text-stone-400 text-xs">Técnico: {o.responsavelTecnico}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-stone-800 text-stone-300">
                      {o.setor}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-stone-300 font-medium">{o.defeitoRelatado}</div>
                    <div className="text-stone-500 text-xs mt-0.5">{o.laudoTecnico}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-100">
                    {formatBrl(o.valorTotal)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.status === "Concluída"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova OS */}
      {modalNovaOs && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100">Abrir Nova Ordem de Serviço</h3>
              <button onClick={() => setModalNovaOs(false)} className="text-stone-400 hover:text-stone-200 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSalvarOs} className="space-y-4">
              <div>
                <label className="text-xs text-stone-400 font-medium">Equipamento ou Veículo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Balcão Refrigerado Sushibar 02"
                  value={novaOs.equipamentoOuVeiculo}
                  onChange={(e) => setNovaOs({ ...novaOs, equipamentoOuVeiculo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 font-medium">Setor</label>
                  <select
                    value={novaOs.setor}
                    onChange={(e) => setNovaOs({ ...novaOs, setor: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Cozinha & Sushibar">Cozinha & Sushibar</option>
                    <option value="Câmara Fria & Refrigeração">Câmara Fria & Refrigeração</option>
                    <option value="Frota Delivery Motos">Frota Delivery Motos</option>
                    <option value="Salão & Climatização">Salão & Climatização</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-medium">Técnico Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome do técnico"
                    value={novaOs.responsavelTecnico}
                    onChange={(e) => setNovaOs({ ...novaOs, responsavelTecnico: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 font-medium">Defeito Relatado / Ocorrência</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva a falha ou o serviço solicitado..."
                  value={novaOs.defeitoRelatado}
                  onChange={(e) => setNovaOs({ ...novaOs, defeitoRelatado: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalNovaOs(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Emitir O.S.
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
