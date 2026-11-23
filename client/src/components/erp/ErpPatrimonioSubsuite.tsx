import React, { useState } from "react";
import {
  Building2,
  Wrench,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Tag,
  Search,
  Printer,
  Download,
  X,
  FileCheck,
  ShieldCheck,
  Percent
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface Ativo {
  id: string;
  codigoTombamento: string;
  descricao: string;
  categoria: string;
  setor: string;
  dataAquisicao: string;
  valorAquisicao: number;
  depreciacaoAnualPct: number;
  vidaUtilAnos: number;
  mesesDecorridos: number;
  estadoConservacao: "Ótimo" | "Bom" | "Requer Manutenção";
  proximaManutencao: string;
  numeroSerie?: string;
}

const ATIVOS_INICIAIS: Ativo[] = [
  {
    id: "1",
    codigoTombamento: "ZUM-PAT-001",
    descricao: "Balcão Refrigerado Vitrine Sushibar Inox (Vidro Curvo)",
    categoria: "Equipamentos de Refrigeração",
    setor: "Sushibar / Balcão",
    dataAquisicao: "15/01/2022",
    valorAquisicao: 28500.0,
    depreciacaoAnualPct: 10.0,
    vidaUtilAnos: 10,
    mesesDecorridos: 58,
    estadoConservacao: "Ótimo",
    proximaManutencao: "15/12/2026 (Limpeza de condensadora)",
    numeroSerie: "GEL-2022-8812A"
  },
  {
    id: "2",
    codigoTombamento: "ZUM-PAT-002",
    descricao: "Ultracongelador de Pescados -40°C (Congelamento Rápido)",
    categoria: "Equipamentos de Refrigeração",
    setor: "Câmara Fria / Pré-Preparo",
    dataAquisicao: "20/03/2022",
    valorAquisicao: 42000.0,
    depreciacaoAnualPct: 10.0,
    vidaUtilAnos: 10,
    mesesDecorridos: 56,
    estadoConservacao: "Ótimo",
    proximaManutencao: "10/01/2027 (Calibração termostato digital)",
    numeroSerie: "ULTRA-40-9941"
  },
  {
    id: "3",
    codigoTombamento: "ZUM-PAT-003",
    descricao: "Fogão Industrial 6 Bocas de Alta Pressão com Queimador Wok",
    categoria: "Equipamentos de Cocção",
    setor: "Cozinha Quente",
    dataAquisicao: "10/01/2022",
    valorAquisicao: 12500.0,
    depreciacaoAnualPct: 10.0,
    vidaUtilAnos: 10,
    mesesDecorridos: 58,
    estadoConservacao: "Bom",
    proximaManutencao: "05/12/2026 (Descarbonização dos bicos)",
    numeroSerie: "FOG-IND-0043"
  },
  {
    id: "4",
    codigoTombamento: "ZUM-PAT-004",
    descricao: "Kit de Facas Japonesas Artesanais Yanagiba & Deba Aço Branco",
    categoria: "Utensílios Nobres",
    setor: "Sushibar / Balcão",
    dataAquisicao: "05/06/2023",
    valorAquisicao: 6800.0,
    depreciacaoAnualPct: 20.0,
    vidaUtilAnos: 5,
    mesesDecorridos: 41,
    estadoConservacao: "Ótimo",
    proximaManutencao: "Semanal (Afiação pedra de água 8000)",
    numeroSerie: "YAN-SAKAI-77"
  },
  {
    id: "5",
    codigoTombamento: "ZUM-PAT-005",
    descricao: "4 Conjuntos de Tatames Orientais em Madeira Maciça VIP",
    categoria: "Mobiliário Temático",
    setor: "Reservado VIP Tatames",
    dataAquisicao: "18/01/2022",
    valorAquisicao: 24000.0,
    depreciacaoAnualPct: 10.0,
    vidaUtilAnos: 10,
    mesesDecorridos: 58,
    estadoConservacao: "Ótimo",
    proximaManutencao: "Mensal (Impermeabilização e higienização)",
    numeroSerie: "TAT-VIP-KIT4"
  },
  {
    id: "6",
    codigoTombamento: "ZUM-PAT-006",
    descricao: "Balança Toledo Prix 3 Fit Computadora com Bateria Recarregável",
    categoria: "Automação Comercial",
    setor: "Câmara Fria / Recepção",
    dataAquisicao: "10/04/2023",
    valorAquisicao: 2890.0,
    depreciacaoAnualPct: 20.0,
    vidaUtilAnos: 5,
    mesesDecorridos: 43,
    estadoConservacao: "Ótimo",
    proximaManutencao: "15/03/2027 (Aferição Periódica IPEM/INMETRO)",
    numeroSerie: "TOL-PRIX3-88129"
  }
];

export const ErpPatrimonioSubsuite: React.FC = () => {
  const [ativos, setAtivos] = useState<Ativo[]>(ATIVOS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("TODOS");
  const [ativoVisualizandoQr, setAtivoVisualizandoQr] = useState<Ativo | null>(null);

  // Cálculos CPC 27
  const totalAquisicao = ativos.reduce((acc, a) => acc + a.valorAquisicao, 0);
  
  // Depreciação contábil acumulada real calculada item a item
  const depreciacaoAcumulada = ativos.reduce((acc, a) => {
    const depreciacaoMensal = (a.valorAquisicao * (a.depreciacaoAnualPct / 100)) / 12;
    const acum = Math.min(a.valorAquisicao, depreciacaoMensal * a.mesesDecorridos);
    return acc + acum;
  }, 0);

  const valorResidual = totalAquisicao - depreciacaoAcumulada;

  return (
    <div className="space-y-5">
      {/* Header com Indicadores Patrimoniais */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Controle Patrimonial &amp; Ativos Imobilizados (CPC 27)</span>
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Equipamentos de refrigeração, cocção, sushibar, mobiliário, etiquetas QR Code e depreciação contábil mensal
            </p>
          </div>
          <button
            onClick={() => toast.info("Abrir formulário de cadastro de novo bem imobilizado")}
            className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Imobilizado
          </button>
        </div>

        {/* 4 Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] font-mono">Bens Tombados</span>
            <div className="text-xl font-mono font-black text-[var(--ink)]">{ativos.length} Itens</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Etiquetados QR</span>
          </div>

          <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] font-mono">Custo Histórico Aquisição</span>
            <div className="text-xl font-mono font-black text-[var(--ink)]">
              {formatBrl(totalAquisicao)}
            </div>
            <span className="text-[10px] text-[var(--muted)]">Valor Contábil Bruto</span>
          </div>

          <div className="p-3.5 bg-red-500/10 rounded-xl border border-red-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-300 font-mono">Depreciação Acumulada</span>
            <div className="text-xl font-mono font-black text-red-600">
              - {formatBrl(depreciacaoAcumulada)}
            </div>
            <span className="text-[10px] text-red-600 font-bold">Linear Método das Quotas</span>
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 font-mono">Valor Contábil Residual</span>
            <div className="text-xl font-mono font-black text-emerald-600">
              {formatBrl(valorResidual)}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Patrimônio Líquido Ativo</span>
          </div>
        </div>

        {/* Barra de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1.5 flex-1">
            <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Buscar por código de tombamento, descrição ou número de série..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] flex-1"
            />
          </div>
          <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
            className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)]"
          >
            <option value="TODOS">Todos os Setores</option>
            <option value="Sushibar">Sushibar / Balcão</option>
            <option value="Câmara Fria">Câmara Fria / Pré-Preparo</option>
            <option value="Cozinha Quente">Cozinha Quente</option>
            <option value="Reservado VIP">Reservado VIP Tatames</option>
          </select>
        </div>

        {/* Tabela de Ativos Tombados com Detalhamento CPC 27 */}
        <div className="space-y-2">
          {ativos
            .filter((a) => {
              const matchBusca =
                a.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                a.codigoTombamento.toLowerCase().includes(busca.toLowerCase()) ||
                (a.numeroSerie && a.numeroSerie.toLowerCase().includes(busca.toLowerCase()));
              const matchSetor = setorFiltro === "TODOS" || a.setor.includes(setorFiltro);
              return matchBusca && matchSetor;
            })
            .map((a) => {
              const depMensal = (a.valorAquisicao * (a.depreciacaoAnualPct / 100)) / 12;
              const depAcumItem = Math.min(a.valorAquisicao, depMensal * a.mesesDecorridos);
              const residualItem = a.valorAquisicao - depAcumItem;

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-[var(--surface)] text-indigo-600 border border-indigo-500/20">
                        {a.codigoTombamento}
                      </span>
                      <strong className="text-sm font-black text-[var(--ink)]">{a.descricao}</strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
                      <span>Setor: <b>{a.setor}</b></span>
                      <span>·</span>
                      <span>Categoria: <b>{a.categoria}</b></span>
                      <span>·</span>
                      <span>Aquisição: <b>{a.dataAquisicao}</b></span>
                      {a.numeroSerie && (
                        <>
                          <span>·</span>
                          <span>Série: <b className="font-mono">{a.numeroSerie}</b></span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>Próxima Manutenção: {a.proximaManutencao}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-0.5 font-mono">
                      <span className="text-[10px] text-[var(--muted)] block">Valor Residual CPC 27</span>
                      <div className="font-black text-sm text-emerald-600">
                        {formatBrl(residualItem)}
                      </div>
                      <span className="text-[9px] text-neutral-400 block">
                        Original: {formatBrl(a.valorAquisicao)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAtivoVisualizandoQr(a)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--salmon)] font-bold transition-all flex items-center gap-1"
                        title="Ver Etiqueta de Tombamento com QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Etiqueta
                      </button>
                      <button
                        onClick={() => toast.success(`Ordem de serviço de manutenção preventiva aberta para ${a.descricao}!`)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white font-bold transition-all"
                        title="Agendar Manutenção Preventiva"
                      >
                        Manutenção
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* MODAL DE ETIQUETA PATRIMONIAL DE TOMBAMENTO COM QR CODE */}
      {ativoVisualizandoQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <span className="font-mono text-xs font-bold text-[var(--muted)]">ETIQUETA DE TOMBAMENTO PATRIMONIAL</span>
              </div>
              <button
                onClick={() => setAtivoVisualizandoQr(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout da Etiqueta de Metal / Vinil Indelével */}
            <div className="border-2 border-neutral-900 rounded-2xl p-5 bg-white text-neutral-900 space-y-4 text-center">
              <div>
                <div className="text-base font-black tracking-tight text-[var(--salmon)]">ZUMA GASTRONOMIA</div>
                <div className="text-[10px] font-mono text-neutral-500">KYTTO HOLDING · CNPJ 36.296.848/0001-57</div>
                <div className="text-[9px] text-neutral-400">PATRIMÔNIO ATIVO IMOBILIZADO INVIOLÁVEL</div>
              </div>

              {/* QR Code Simulado em Alta Resolução */}
              <div className="w-36 h-36 mx-auto bg-neutral-900 rounded-xl p-3 flex flex-col justify-between items-center text-white">
                <div className="flex justify-between w-full">
                  <div className="w-7 h-7 border-2 border-white rounded-xs" />
                  <div className="w-7 h-7 border-2 border-white rounded-xs" />
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-300">
                  {ativoVisualizandoQr.codigoTombamento}
                </span>
                <div className="flex justify-between w-full">
                  <div className="w-7 h-7 border-2 border-white rounded-xs" />
                  <div className="w-3 h-3 bg-indigo-400 rounded-full" />
                </div>
              </div>

              <div>
                <div className="text-lg font-black font-mono tracking-wider text-indigo-900">
                  {ativoVisualizandoQr.codigoTombamento}
                </div>
                <div className="font-bold text-xs text-neutral-800 mt-1 leading-tight">
                  {ativoVisualizandoQr.descricao}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">
                  Setor: {ativoVisualizandoQr.setor} · Série: {ativoVisualizandoQr.numeroSerie || "N/A"}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:text-[var(--salmon)] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Etiqueta (Zebra/Argox)
              </button>

              <button
                onClick={() => {
                  toast.success(`Etiqueta de ${ativoVisualizandoQr.codigoTombamento} exportada para impressão térmica.`);
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                Baixar Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
