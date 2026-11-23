import React, { useState } from "react";
import { Wrench, Car, FileText, CheckCircle2, Search, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const PECAS_CATALOGO = [
  { id: "p1", codigo: "BD-4421", nome: "Pastilha de Freio Dianteira Cerâmica", veiculo: "Hilux / SW4 (2016-2024)", fabricante: "Cobreq", estoque: 14, preco: 185.00 },
  { id: "p2", codigo: "AM-9088", nome: "Amortecedor Dianteiro Pressurizado Turbogás", veiculo: "S10 / Trailblazer (2013-2023)", fabricante: "Cofap", estoque: 8, preco: 420.00 },
  { id: "p3", codigo: "FL-3301", nome: "Filtro de Óleo Blindado Lubrificante", veiculo: "Ranger 3.2 Diesel / Amarok V6", fabricante: "Tecfil", estoque: 32, preco: 48.00 },
  { id: "p4", codigo: "CR-1011", nome: "Correia Dentada do Comando de Válvulas", veiculo: "Corolla 2.0 / Civic 1.5 Turbo", fabricante: "Gates", estoque: 11, preco: 145.00 },
];

const ORDENS_SERVICO = [
  { id: "OS-8841", cliente: "Fazenda Rio Verde", veiculo: "Toyota Hilux CD 4x4 (Placa QBD-8901)", mecanico: "Carlos Alberto", servico: "Revisão Freios + Troca Amortecedores", total: 1850.00, status: "em_execucao" },
  { id: "OS-8842", cliente: "Transportes Pantanal", veiculo: "Scania R450 Cavalo Mecânico", mecanico: "Eduardo Silva", servico: "Substituição Filtros + Troca Óleo Motor", total: 2450.00, status: "aguardando_peca" },
  { id: "OS-8843", cliente: "Dr. Marcelo Fagundes", veiculo: "Jeep Compass 2.0 Diesel", mecanico: "Renato Diniz", servico: "Alinhamento 3D + Pastilhas Dianteiras", total: 680.00, status: "finalizado" },
];

export const ErpAutoPecasSubsuite: React.FC = () => {
  const [busca, setBusca] = useState("");
  const [osList, setOsList] = useState(ORDENS_SERVICO);

  const pecasFiltradas = PECAS_CATALOGO.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.veiculo.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
              Oficina Mecânica &amp; Autopeças • Kytto Auto
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Catálogo de Peças por Veículo &amp; Ordens de Serviço (O.S.)
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Aplicação veicular, controle de peças em estoque, mão de obra dos mecânicos e orçamentos para frotas agrícolas.
            </p>
          </div>

          <button
            onClick={() => toast.success("Nova Ordem de Serviço criada com sucesso!")}
            className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Abrir Nova O.S.
          </button>
        </div>

        {/* Ordens de Serviço em Andamento */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--ink)] block">Ordens de Serviço na Oficina:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {osList.map((os) => (
              <div key={os.id} className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <b className="text-[var(--salmon)] font-mono">{os.id}</b>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
                    os.status === "finalizado" ? "bg-emerald-600" : os.status === "em_execucao" ? "bg-blue-600" : "bg-amber-500"
                  }`}>
                    {os.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <b className="text-[var(--ink)] block">{os.cliente}</b>
                  <span className="text-[11px] text-[var(--muted)] block">{os.veiculo}</span>
                  <span className="text-[10px] text-[var(--muted)] block">Mecânico: {os.mecanico}</span>
                </div>
                <div className="pt-2 border-t border-[var(--line)]/60 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)] font-bold">{os.servico}</span>
                  <span className="font-mono-nums font-black text-[var(--ink)] text-sm">{formatBrl(os.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catálogo Técnico de Peças */}
        <div className="space-y-2 pt-3 border-t border-[var(--line)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--ink)]">Catálogo de Peças &amp; Aplicação Veicular:</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por peça, veículo ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] w-64"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            {pecasFiltradas.map((peca) => (
              <div key={peca.id} className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-[var(--surface)] px-1.5 py-0.5 rounded font-bold text-[var(--muted)]">{peca.codigo}</span>
                    <b className="text-[var(--ink)]">{peca.nome}</b>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] block mt-0.5">Aplicação: {peca.veiculo} • Fabricante: {peca.fabricante}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono-nums font-black text-sm text-[var(--ink)] block">{formatBrl(peca.preco)}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{peca.estoque} un em estoque</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
