import React, { useState } from "react";
import {
  Scale,
  Wheat,
  Truck,
  Building,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Thermometer,
  Gauge,
  Plus,
  RefreshCw,
  Search,
  Check,
  Send,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

export interface TicketBalanca {
  id: string;
  placa: string;
  motorista: string;
  produto: string;
  tipo: "Entrada (Compra/Recebimento)" | "Saída (Expedição/Venda)";
  pesoBrutoKg: number;
  pesoTaraKg: number;
  pesoLiquidoKg: number;
  umidadePct: number;
  impurezaPct: number;
  sacas60Kg: number;
  status: "Pesagem Bruta" | "Concluído" | "Em Romaneio";
  dataHora: string;
  fazendaOrigem: string;
}

export interface SiloArmazenamento {
  id: string;
  nome: string;
  grao: string;
  capacidadeSacas: number;
  ocupacaoSacas: number;
  temperaturaC: number;
  umidadeInternaPct: number;
  aeracaoAtiva: boolean;
  status: "Operação Normal" | "Atenção Temperatura" | "Carregando";
}

const SILOS_INICIAIS: SiloArmazenamento[] = [
  {
    id: "SILO-01",
    nome: "Silo Pulmão Norte (Tangará)",
    grao: "Soja em Grãos Safra 25/26",
    capacidadeSacas: 60000,
    ocupacaoSacas: 51200,
    temperaturaC: 22.4,
    umidadeInternaPct: 12.8,
    aeracaoAtiva: true,
    status: "Operação Normal",
  },
  {
    id: "SILO-02",
    nome: "Silo Central (Campo Novo)",
    grao: "Milho Segunda Safra (Safrinha)",
    capacidadeSacas: 80000,
    ocupacaoSacas: 74800,
    temperaturaC: 24.1,
    umidadeInternaPct: 13.5,
    aeracaoAtiva: true,
    status: "Operação Normal",
  },
  {
    id: "SILO-03",
    nome: "Silo Reservatório Sul",
    grao: "Arroz Grão Curto Japonês (Shari MT)",
    capacidadeSacas: 30000,
    ocupacaoSacas: 18500,
    temperaturaC: 20.8,
    umidadeInternaPct: 11.9,
    aeracaoAtiva: false,
    status: "Operação Normal",
  },
  {
    id: "SILO-04",
    nome: "Silo Grãos Especiais",
    grao: "Gergelim & Especiarias Gourmet",
    capacidadeSacas: 15000,
    ocupacaoSacas: 13900,
    temperaturaC: 25.2,
    umidadeInternaPct: 13.8,
    aeracaoAtiva: true,
    status: "Atenção Temperatura",
  },
];

const TICKETS_INICIAIS: TicketBalanca[] = [
  {
    id: "TCK-8921",
    placa: "RBL-4E29 (Bitrem Scania)",
    motorista: "Claudio Valério Antunes",
    produto: "Arroz Especial Grão Curto Japonês (Shari)",
    tipo: "Entrada (Compra/Recebimento)",
    pesoBrutoKg: 49800,
    pesoTaraKg: 16200,
    pesoLiquidoKg: 33600,
    umidadePct: 12.4,
    impurezaPct: 0.8,
    sacas60Kg: 556,
    status: "Concluído",
    dataHora: "21/11/2026 14:32",
    fazendaOrigem: "Fazenda Santa Luzia - Tangará da Serra (MT)",
  },
  {
    id: "TCK-8922",
    placa: "QBG-9102 (Rodotrem Volvo)",
    motorista: "Marcos Aurelio Peixoto",
    produto: "Soja em Grãos Exportação / Prensagem Óleo",
    tipo: "Entrada (Compra/Recebimento)",
    pesoBrutoKg: 74500,
    pesoTaraKg: 22100,
    pesoLiquidoKg: 52400,
    umidadePct: 13.1,
    impurezaPct: 1.0,
    sacas60Kg: 865,
    status: "Concluído",
    dataHora: "21/11/2026 15:45",
    fazendaOrigem: "Agropecuária Vale Verde - Nova Olímpia (MT)",
  },
  {
    id: "TCK-8923",
    placa: "RRN-7B88 (Truck Mercedes)",
    motorista: "Sebastião Dias",
    produto: "Milho Grão Seco p/ Ração Pescados",
    tipo: "Saída (Expedição/Venda)",
    pesoBrutoKg: 28400,
    pesoTaraKg: 11200,
    pesoLiquidoKg: 17200,
    umidadePct: 12.8,
    impurezaPct: 0.5,
    sacas60Kg: 286,
    status: "Concluído",
    dataHora: "21/11/2026 16:15",
    fazendaOrigem: "Entrega Indústria de Rações Pescados MT",
  },
];

export const ErpAgroSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"balanca" | "romaneios" | "silos" | "safras">("balanca");
  const [tickets, setTickets] = useState<TicketBalanca[]>(TICKETS_INICIAIS);
  const [silos, setSilos] = useState<SiloArmazenamento[]>(SILOS_INICIAIS);

  // Form de Pesagem de Balança
  const [novoTicket, setNovoTicket] = useState({
    placa: "",
    motorista: "",
    produto: "Arroz Especial Grão Curto Japonês (Shari)",
    tipo: "Entrada (Compra/Recebimento)" as TicketBalanca["tipo"],
    pesoBrutoKg: 48000,
    pesoTaraKg: 16000,
    umidadePct: 12.5,
    impurezaPct: 0.7,
    fazendaOrigem: "Fazenda Primavera - Tangará da Serra",
  });

  const [modalNovoTicket, setModalNovoTicket] = useState(false);

  const calcularPesoLiquido = (bruto: number, tara: number) => Math.max(0, bruto - tara);
  const calcularSacas = (bruto: number, tara: number, umidade: number, impureza: number) => {
    const liquido = calcularPesoLiquido(bruto, tara);
    const descUmidade = Math.max(0, (umidade - 13) / 100);
    const descImpureza = impureza / 100;
    const liquidoDescontado = liquido * (1 - descUmidade - descImpureza);
    return Math.floor(liquidoDescontado / 60);
  };

  const handleSalvarTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTicket.placa || !novoTicket.motorista) {
      toast.error("Preencha a placa e o motorista para registrar a pesagem!");
      return;
    }

    const liq = calcularPesoLiquido(novoTicket.pesoBrutoKg, novoTicket.pesoTaraKg);
    const sacas = calcularSacas(novoTicket.pesoBrutoKg, novoTicket.pesoTaraKg, novoTicket.umidadePct, novoTicket.impurezaPct);

    const ticketCriado: TicketBalanca = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      placa: novoTicket.placa.toUpperCase(),
      motorista: novoTicket.motorista,
      produto: novoTicket.produto,
      tipo: novoTicket.tipo,
      pesoBrutoKg: Number(novoTicket.pesoBrutoKg),
      pesoTaraKg: Number(novoTicket.pesoTaraKg),
      pesoLiquidoKg: liq,
      umidadePct: Number(novoTicket.umidadePct),
      impurezaPct: Number(novoTicket.impurezaPct),
      sacas60Kg: sacas,
      status: "Concluído",
      dataHora: new Date().toLocaleString("pt-BR"),
      fazendaOrigem: novoTicket.fazendaOrigem,
    };

    setTickets([ticketCriado, ...tickets]);
    setModalNovoTicket(false);
    toast.success(`Ticket ${ticketCriado.id} registrado com sucesso na Balança Rodoviária!`);
    setNovoTicket({
      placa: "",
      motorista: "",
      produto: "Arroz Especial Grão Curto Japonês (Shari)",
      tipo: "Entrada (Compra/Recebimento)",
      pesoBrutoKg: 48000,
      pesoTaraKg: 16000,
      umidadePct: 12.5,
      impurezaPct: 0.7,
      fazendaOrigem: "Fazenda Primavera - Tangará da Serra",
    });
  };

  const alternarAeracaoSilo = (id: string) => {
    setSilos(silos.map(s => {
      if (s.id === id) {
        const novoStatus = !s.aeracaoAtiva;
        toast.info(`Aeração do ${s.nome} ${novoStatus ? "LIGADA" : "DESLIGADA"}`);
        return { ...s, aeracaoAtiva: novoStatus };
      }
      return s;
    }));
  };

  const totalSacasArmazenadas = silos.reduce((acc, s) => acc + s.ocupacaoSacas, 0);
  const capacidadeTotalSilos = silos.reduce((acc, s) => acc + s.capacidadeSacas, 0);
  const ocupacaoGeralPct = Math.round((totalSacasArmazenadas / capacidadeTotalSilos) * 100);

  return (
    <div className="space-y-6">
      {/* Header do Módulo Agro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-amber-950/30 border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-100">Módulo Agro & Safra MT</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Holding Kytto × Agro-Open
              </span>
            </div>
            <p className="text-sm text-stone-400">
              Balança rodoviária, romaneios de grãos, safras de Mato Grosso e telemetria de silos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNovoTicket(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            Nova Pesagem Rodoviária
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>Sacas em Silos</span>
            <Wheat className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">{totalSacasArmazenadas.toLocaleString("pt-BR")} sc</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {ocupacaoGeralPct}% da capacidade total ({capacidadeTotalSilos.toLocaleString("pt-BR")} sc)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>Cargas Pesadas Hoje</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">{tickets.length} bitrens</div>
          <div className="text-xs text-stone-400 mt-1">
            {tickets.reduce((acc, t) => acc + t.pesoLiquidoKg, 0).toLocaleString("pt-BR")} kg líquidos
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>Silos com Telemetria</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">{silos.length} unidades</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> Sensores IoT Aeração Online
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>Cotação Arroz Especial (sc 60kg)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">R$ 138,50</div>
          <div className="text-xs text-emerald-400 mt-1">+2.8% vs média MT Tangará</div>
        </div>
      </div>

      {/* Navegação de Sub-abas */}
      <div className="flex gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setSubAba("balanca")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            subAba === "balanca"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Scale className="w-4 h-4" />
          Balança Rodoviária ({tickets.length})
        </button>
        <button
          onClick={() => setSubAba("silos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            subAba === "silos"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Building className="w-4 h-4" />
          Silos & Telemetria ({silos.length})
        </button>
        <button
          onClick={() => setSubAba("safras")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            subAba === "safras"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Wheat className="w-4 h-4" />
          Calendário de Safras MT
        </button>
      </div>

      {/* Conteúdo da Sub-aba: BALANÇA RODOVIÁRIA */}
      {subAba === "balanca" && (
        <div className="bg-stone-900/60 rounded-2xl border border-stone-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-100">Tickets de Pesagem em Tempo Real</h3>
              <p className="text-xs text-stone-400">Balança Rodoviária 80 Toneladas com calibração INMETRO</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Protocolo Balança: Prix Toledo 8200 Conectada
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950/60 text-xs uppercase text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Ticket / Placa</th>
                  <th className="py-3 px-3">Motorista & Origem</th>
                  <th className="py-3 px-3">Produto</th>
                  <th className="py-3 px-3 text-right">Peso Bruto</th>
                  <th className="py-3 px-3 text-right">Tara</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-400">Peso Líquido</th>
                  <th className="py-3 px-3 text-right">Sacas (60kg)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-mono text-xs">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-stone-100">{t.id}</div>
                      <div className="text-xs text-emerald-400 font-mono">{t.placa}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="text-stone-200">{t.motorista}</div>
                      <div className="text-xs text-stone-500">{t.fazendaOrigem}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-xs bg-stone-800 text-stone-300">
                        {t.produto}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">{t.pesoBrutoKg.toLocaleString("pt-BR")} kg</td>
                    <td className="py-3 px-3 text-right text-stone-500">{t.pesoTaraKg.toLocaleString("pt-BR")} kg</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {t.pesoLiquidoKg.toLocaleString("pt-BR")} kg
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-200">
                      {t.sacas60Kg} sc
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <button
                        onClick={() => toast.success(`Imprimindo Romaneio Fiscal do ticket ${t.id} no Spooler ESC/POS...`)}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs transition-colors cursor-pointer"
                      >
                        Imprimir Romaneio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo da Sub-aba: SILOS */}
      {subAba === "silos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {silos.map((silo) => {
            const pct = Math.round((silo.ocupacaoSacas / silo.capacidadeSacas) * 100);
            return (
              <div key={silo.id} className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-100">{silo.nome}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                        {silo.id}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-0.5 font-medium">{silo.grao}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    silo.status === "Operação Normal"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {silo.status}
                  </span>
                </div>

                {/* Barra de Progresso de Ocupação */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Ocupação do Silo</span>
                    <span className="font-bold text-stone-200">{pct}% ({silo.ocupacaoSacas.toLocaleString("pt-BR")} / {silo.capacidadeSacas.toLocaleString("pt-BR")} sc)</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Métricas de Telemetria IoT */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800/80 text-center">
                  <div className="p-2 rounded-lg bg-stone-950/40">
                    <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Temp.</span>
                    </div>
                    <div className="font-bold text-stone-100">{silo.temperaturaC} °C</div>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-950/40">
                    <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      <span>Umidade</span>
                    </div>
                    <div className="font-bold text-stone-100">{silo.umidadeInternaPct} %</div>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-950/40">
                    <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                      <Zap className={`w-3.5 h-3.5 ${silo.aeracaoAtiva ? "text-emerald-400" : "text-stone-500"}`} />
                      <span>Aeração</span>
                    </div>
                    <button
                      onClick={() => alternarAeracaoSilo(silo.id)}
                      className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                        silo.aeracaoAtiva ? "bg-emerald-500/20 text-emerald-300" : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {silo.aeracaoAtiva ? "LIGADA" : "DESLIGADA"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Conteúdo da Sub-aba: SAFRAS MT */}
      {subAba === "safras" && (
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-100">Calendário de Safras de Mato Grosso & Impacto no Zuma</h3>
              <p className="text-xs text-stone-400">Correlação entre colheita regional, liquidez financeira de produtores e demanda gastronômica</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Região Médio-Norte & Chapada dos Parecis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="text-xs font-bold uppercase text-emerald-400">Fase Atual · Fim da Safra (Out/Nov)</div>
              <div className="text-lg font-bold text-stone-100">Liquidez Máxima Regional</div>
              <p className="text-xs text-stone-400">
                Fechamento de contratos de soja e algodão. Momento de maior circulação de dinheiro em Tangará da Serra. Picos no salão aos fins de semana com consumo de combos premium e saquês importados.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="text-xs font-bold uppercase text-blue-400">Próxima Fase · Plantio da Safrinha (Jan/Fev)</div>
              <div className="text-lg font-bold text-stone-100">Demanda Corporativa & Almoços</div>
              <p className="text-xs text-stone-400">
                Intensa movimentação de agrônomos, revendas de sementes e maquinários. Janela ideal para ativar o Almoço Executivo corporativo no Zuma (11h às 14h) para atender empresas da Av. Brasil.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="text-xs font-bold uppercase text-amber-400">Contratos de Abastecimento Próprio</div>
              <div className="text-lg font-bold text-stone-100">Arroz Japonês Shari MT</div>
              <p className="text-xs text-stone-400">
                Aquisição direta de 1.800 sacas de arroz grão curto cultivado sob irrigação no Vale do Parecis, reduzindo o CMV do Zuma em 14% comparado ao arroz importado de SP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Pesagem */}
      {modalNovoTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-stone-100">Registrar Pesagem de Balança Rodoviária</h3>
              </div>
              <button
                onClick={() => setModalNovoTicket(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 font-medium">Placa do Veículo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: RBL-4E29"
                    value={novoTicket.placa}
                    onChange={(e) => setNovoTicket({ ...novoTicket, placa: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-medium">Nome do Motorista</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={novoTicket.motorista}
                    onChange={(e) => setNovoTicket({ ...novoTicket, motorista: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 font-medium">Produto / Carga</label>
                <select
                  value={novoTicket.produto}
                  onChange={(e) => setNovoTicket({ ...novoTicket, produto: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Arroz Especial Grão Curto Japonês (Shari)">Arroz Especial Grão Curto Japonês (Shari)</option>
                  <option value="Soja em Grãos Exportação / Prensagem Óleo">Soja em Grãos Exportação / Prensagem Óleo</option>
                  <option value="Milho Grão Seco p/ Ração Pescados">Milho Grão Seco p/ Ração Pescados</option>
                  <option value="Gergelim Branco & Preto Especial">Gergelim Branco & Preto Especial</option>
                  <option value="Embalagens & Descartáveis Térmicos">Embalagens & Descartáveis Térmicos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 font-medium">Peso Bruto (kg)</label>
                  <input
                    type="number"
                    required
                    value={novoTicket.pesoBrutoKg}
                    onChange={(e) => setNovoTicket({ ...novoTicket, pesoBrutoKg: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-medium">Peso Tara (kg)</label>
                  <input
                    type="number"
                    required
                    value={novoTicket.pesoTaraKg}
                    onChange={(e) => setNovoTicket({ ...novoTicket, pesoTaraKg: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex justify-between items-center text-xs">
                <span className="text-stone-400">Peso Líquido Calculado:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {calcularPesoLiquido(novoTicket.pesoBrutoKg, novoTicket.pesoTaraKg).toLocaleString("pt-BR")} kg
                  {" "}(~{calcularSacas(novoTicket.pesoBrutoKg, novoTicket.pesoTaraKg, novoTicket.umidadePct, novoTicket.impurezaPct)} sacas 60kg)
                </span>
              </div>

              <div>
                <label className="text-xs text-stone-400 font-medium">Origem / Destino</label>
                <input
                  type="text"
                  value={novoTicket.fazendaOrigem}
                  onChange={(e) => setNovoTicket({ ...novoTicket, fazendaOrigem: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalNovoTicket(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  Confirmar e Emitir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
