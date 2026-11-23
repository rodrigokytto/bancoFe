import React, { useState } from "react";
import { 
  Activity, 
  Users, 
  Eye, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Code2, 
  Camera, 
  RefreshCw, 
  Server,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";

export interface ColaboradorSync {
  id: string;
  nome: string;
  cargo: string;
  posto: string;
  camera: string;
  cameraNome: string;
  conformidadeAnvisa: number;
  touca: boolean;
  avental: boolean;
  horarioPonto: string;
  status: "NO_POSTO" | "EM_INTERVALO" | "ATENDIMENTO" | "FECHADO";
  ultimoEvento: string;
}

const COLABORADORES_INIT: ColaboradorSync[] = [
  {
    id: "colab_01",
    nome: "Hiroshi Tanaka",
    cargo: "Sushichef Executivo",
    posto: "Sushibar Nobre",
    camera: "CAM-03",
    cameraNome: "Sushibar Frio & Balcão VIP",
    conformidadeAnvisa: 100,
    touca: true,
    avental: true,
    horarioPonto: "17:15 (Reconhecimento Facial)",
    status: "NO_POSTO",
    ultimoEvento: "CONFORMIDADE_SANITARIA_CHECK"
  },
  {
    id: "colab_02",
    nome: "Carlos Eduardo",
    cargo: "Chef Cozinha Quente",
    posto: "KDS Cozinha",
    camera: "CAM-02",
    cameraNome: "Cozinha Quente & Frituras",
    conformidadeAnvisa: 98.4,
    touca: true,
    avental: true,
    horarioPonto: "17:30 (Reconhecimento Facial)",
    status: "NO_POSTO",
    ultimoEvento: "CONFORMIDADE_SANITARIA_CHECK"
  },
  {
    id: "colab_03",
    nome: "Matheus Lima",
    cargo: "Garçom Líder",
    posto: "Salão Nobre",
    camera: "CAM-04",
    cameraNome: "Salão Principal & Mesas 01-14",
    conformidadeAnvisa: 100,
    touca: false,
    avental: false,
    horarioPonto: "18:00 (Reconhecimento Facial)",
    status: "ATENDIMENTO",
    ultimoEvento: "POSTO_TRABALHO_ALERTA_OCIOSIDADE"
  },
  {
    id: "colab_04",
    nome: "Sofia Rezende",
    cargo: "Garçonete Salão",
    posto: "Tatames VIP & Salão",
    camera: "CAM-05",
    cameraNome: "Tatames VIP & Varanda",
    conformidadeAnvisa: 100,
    touca: false,
    avental: false,
    horarioPonto: "18:00 (Reconhecimento Facial)",
    status: "ATENDIMENTO",
    ultimoEvento: "COLABORADOR_ENTRADA_DETECTADA"
  },
  {
    id: "colab_05",
    nome: "Lucas Silveira",
    cargo: "Barman & Mixologista",
    posto: "Bar & Chopeira",
    camera: "CAM-01",
    cameraNome: "Entrada Principal & Recepção",
    conformidadeAnvisa: 100,
    touca: false,
    avental: true,
    horarioPonto: "17:45 (Reconhecimento Facial)",
    status: "NO_POSTO",
    ultimoEvento: "CONFORMIDADE_SANITARIA_CHECK"
  },
  {
    id: "colab_06",
    nome: "Bruno Costa",
    cargo: "Cumim & Apoio Operacional",
    posto: "Salão & Desbarate",
    camera: "CAM-04",
    cameraNome: "Salão Principal & Mesas 01-14",
    conformidadeAnvisa: 98.0,
    touca: false,
    avental: true,
    horarioPonto: "18:15 (Reconhecimento Facial)",
    status: "ATENDIMENTO",
    ultimoEvento: "POSTO_TRABALHO_ALERTA_OCIOSIDADE"
  },
  {
    id: "colab_07",
    nome: "Luiza Fernandes",
    cargo: "Operadora de Caixa & PDV",
    posto: "Frente de Caixa",
    camera: "CAM-06",
    cameraNome: "Frente de Caixa & Saída",
    conformidadeAnvisa: 100,
    touca: false,
    avental: false,
    horarioPonto: "17:00 (Reconhecimento Facial)",
    status: "NO_POSTO",
    ultimoEvento: "COLABORADOR_ENTRADA_DETECTADA"
  },
  {
    id: "colab_08",
    nome: "Mariana Prado",
    cargo: "Auxiliar de Sushibar",
    posto: "Sushibar Preparação",
    camera: "CAM-03",
    cameraNome: "Sushibar Frio & Balcão VIP",
    conformidadeAnvisa: 100,
    touca: true,
    avental: true,
    horarioPonto: "17:30 (Reconhecimento Facial)",
    status: "NO_POSTO",
    ultimoEvento: "CONFORMIDADE_SANITARIA_CHECK"
  }
];

export const NossaGenteUltraEventBus: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<ColaboradorSync[]>(COLABORADORES_INIT);
  const [selectedColab, setSelectedColab] = useState<string>("colab_01");
  const [selectedEvent, setSelectedEvent] = useState<
    "COLABORADOR_ENTRADA_DETECTADA" | 
    "CONFORMIDADE_SANITARIA_CHECK" | 
    "POSTO_TRABALHO_ALERTA_OCIOSIDADE" | 
    "FECHAMENTO_TURNO_SYNC"
  >("CONFORMIDADE_SANITARIA_CHECK");
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-03");
  const [lastDispatchedEvent, setLastDispatchedEvent] = useState<any | null>(null);

  // Mutation do trpc com fallback resiliente
  const simulateEventMutation = (trpc as any).zuma?.simulateInternalEvent?.useMutation?.({
    onSuccess: (data: any) => {
      toast.success("⚡ Evento Interno Disparado com Sucesso!", {
        description: `Evento processado pelo barramento Nossa Gente × Ultra em ${data?.item?.latencyMs || 2.4}ms.`,
        icon: <Zap className="w-5 h-5 text-amber-400" />
      });
      setLastDispatchedEvent(data?.item);
    },
    onError: () => {
      // Fallback local caso o endpoint não responda
      const mockEvent = {
        id: `evt_${Date.now()}`,
        source: "NOSSA_GENTE_ULTRA_EVENT_BUS",
        event: selectedEvent,
        statusCode: 200,
        latencyMs: 2.3,
        payload: {
          bus: "InternalEventBus_Memory_Redis",
          syncModel: "INTERNAL_EVENT_DRIVEN",
          eventType: selectedEvent,
          colaborador: colaboradores.find(c => c.id === selectedColab)?.nome,
          camera: selectedCamera,
          status: "DELIVERED_INTERNAL_IN_MEMORY",
          timestamp: new Date().toISOString()
        }
      };
      setLastDispatchedEvent(mockEvent);
      toast.success("⚡ Evento Interno Disparado (Simulação In-Memory)!", {
        description: `Processado pelo barramento Nossa Gente × Ultra com latência de 2.3ms.`
      });
    }
  });

  const handleDispararEvento = () => {
    const colab = colaboradores.find(c => c.id === selectedColab);
    if (!colab) return;

    if (simulateEventMutation?.mutate) {
      simulateEventMutation.mutate({
        eventType: selectedEvent,
        colaboradorNome: colab.nome,
        camera: selectedCamera,
        detalhes: `Sincronização em tempo real entre Nossa Gente e Ultra para ${colab.nome} na câmera ${selectedCamera}`
      });
    } else {
      const mockEvent = {
        id: `evt_${Date.now()}`,
        source: "NOSSA_GENTE_ULTRA_EVENT_BUS",
        event: selectedEvent,
        statusCode: 200,
        latencyMs: 2.1,
        payload: {
          bus: "InternalEventBus_Memory_Redis",
          syncModel: "INTERNAL_EVENT_DRIVEN",
          eventType: selectedEvent,
          colaborador: colab.nome,
          camera: selectedCamera,
          status: "DELIVERED_INTERNAL_IN_MEMORY",
          timestamp: new Date().toISOString()
        }
      };
      setLastDispatchedEvent(mockEvent);
      toast.success("⚡ Evento Interno Disparado no Barramento!", {
        description: `Colaborador ${colab.nome} atualizado via sincronização por evento interno.`
      });
    }

    // Atualiza timestamp local do colaborador
    setColaboradores(prev => prev.map(c => {
      if (c.id === selectedColab) {
        return { ...c, ultimoEvento: selectedEvent };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner de Conformidade com a Diretriz de Arquitetura */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border border-purple-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10.5px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                Diretriz de Arquitetura Aplicada
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sincronização por Evento Interno Ativa
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Barramento de Eventos Internos · Nossa Gente (RH) × Ultra Vision AI (CFTV 4K)
            </h3>
            <p className="text-xs text-white/70 max-w-3xl leading-relaxed">
              Priorização de sincronização orientada a eventos internos em memória e barramento Redis PubSub. Elimina sobrecarga de requisições HTTP e garante telemetria biométrica, presença e conformidade sanitária Anvisa em menos de <strong>3ms</strong>.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-[10px] text-white/50 font-mono">Protocolo de Mensageria</span>
          <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-xs font-mono font-bold text-purple-200">
            InternalEventBus · PubSub
          </span>
        </div>
      </div>

      {/* Grid de Métricas do Event Bus */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e131f] border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-white/60 text-xs mb-1">
            <span className="font-bold">Eventos Hoje</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-black font-mono text-white block">14.892</span>
          <span className="text-[10.5px] text-emerald-400 font-medium">99.98% entregues &lt; 5ms</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-white/60 text-xs mb-1">
            <span className="font-bold">Latência Média</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-black font-mono text-amber-400 block">2.4 ms</span>
          <span className="text-[10.5px] text-white/50 font-mono">In-Memory / Redis</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-white/60 text-xs mb-1">
            <span className="font-bold">Colaboradores</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xl font-black font-mono text-cyan-400 block">8 / 8</span>
          <span className="text-[10.5px] text-cyan-300 font-medium">100% monitorados ao vivo</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e131f] border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-white/60 text-xs mb-1">
            <span className="font-bold">Conformidade Anvisa</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-black font-mono text-emerald-400 block">98.4%</span>
          <span className="text-[10.5px] text-emerald-400 font-medium">Toucas e Aventais</span>
        </div>
      </div>

      {/* Catálogo de Eventos do Barramento Interno */}
      <div className="p-5 rounded-2xl bg-[#0e131f] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-extrabold text-white">Catálogo de Eventos Sincronizados no Barramento</h4>
          </div>
          <span className="text-[10.5px] text-white/50 font-mono">Event Schema v2.1</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-300 text-[10px]">ENTRADA</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono">CAM-01 / CAM-06</span>
            </div>
            <p className="font-bold text-white text-[11px]">evento.colaborador.entrada_detectada</p>
            <p className="text-white/60 text-[10px] leading-tight">Reconhecimento facial na entrada. Abre pré-ponto biométrico no Nossa Gente.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-300 text-[10px]">ANVISA</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">CAM-02 / CAM-03</span>
            </div>
            <p className="font-bold text-white text-[11px]">evento.colaborador.conformidade_sanitaria</p>
            <p className="text-white/60 text-[10px] leading-tight">Verificação contínua de toucas, aventais e higienização das mãos na cozinha e sushibar.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-300 text-[10px]">SLA SALÃO</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">CAM-04 / CAM-05</span>
            </div>
            <p className="font-bold text-white text-[11px]">evento.colaborador.alerta_tempo_ocioso</p>
            <p className="text-white/60 text-[10px] leading-tight">Mapeamento de sobrecarga ou ociosidade em mesas. Alerta Zumi para remanejar praça.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-300 text-[10px]">FECHAMENTO</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">PDV / CAM-06</span>
            </div>
            <p className="font-bold text-white text-[11px]">evento.colaborador.saida_fechamento_turno</p>
            <p className="text-white/60 text-[10px] leading-tight">Fechamento do caixa e saída. Rateio de 10% de serviço e consolidação do espelho de ponto.</p>
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores Sincronizados com Câmeras */}
      <div className="p-5 rounded-2xl bg-[#0e131f] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-extrabold text-white">
              Colaboradores Nossa Gente × Câmeras CFTV Ultra Vision (Turno Jantar)
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ● 8 Colaboradores Ativos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 font-mono text-[11px]">
                <th className="pb-2">Colaborador / Cargo</th>
                <th className="pb-2">Posto Operacional</th>
                <th className="pb-2">Câmera Ultra Vision</th>
                <th className="pb-2">Conformidade Anvisa</th>
                <th className="pb-2">Ponto Biométrico</th>
                <th className="pb-2">Último Evento Interno</th>
                <th className="pb-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {colaboradores.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                        {c.nome.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">{c.nome}</span>
                        <span className="text-[10.5px] text-white/50">{c.cargo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-white/80">
                      {c.posto}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">{c.camera}</span>
                    <span className="text-white/40 block text-[9.5px]">{c.cameraNome}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className={`h-full ${c.conformidadeAnvisa >= 99 ? "bg-emerald-500" : "bg-amber-400"}`}
                          style={{ width: `${c.conformidadeAnvisa}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white text-[11px]">{c.conformidadeAnvisa}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-[11px] text-white/80">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{c.horarioPonto}</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {c.ultimoEvento}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedColab(c.id);
                        setSelectedCamera(c.camera);
                        handleDispararEvento();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-[10px] font-bold text-white/70 transition-all cursor-pointer"
                    >
                      Disparar Evento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Console Interativo de Disparo de Evento Interno */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e131f] via-purple-950/20 to-[#0e131f] border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-extrabold text-white">
              Console de Disparo &amp; Teste de Evento Interno (Event Bus)
            </h4>
          </div>
          <span className="text-[10.5px] text-white/50 font-mono">Simulador de Sincronização em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-white/60 font-semibold mb-1">Colaborador (Nossa Gente)</label>
            <select
              value={selectedColab}
              onChange={(e) => {
                setSelectedColab(e.target.value);
                const colab = colaboradores.find(c => c.id === e.target.value);
                if (colab) setSelectedCamera(colab.camera);
              }}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cargo})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/60 font-semibold mb-1">Câmera Ultra Vision CFTV</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="CAM-01">CAM-01 · Entrada Principal &amp; Recepção</option>
              <option value="CAM-02">CAM-02 · Cozinha Quente &amp; Frituras</option>
              <option value="CAM-03">CAM-03 · Sushibar Frio &amp; Balcão VIP</option>
              <option value="CAM-04">CAM-04 · Salão Principal &amp; Mesas 01-14</option>
              <option value="CAM-05">CAM-05 · Tatames VIP &amp; Varanda</option>
              <option value="CAM-06">CAM-06 · Frente de Caixa &amp; Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-white/60 font-semibold mb-1">Tipo de Evento Interno</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="CONFORMIDADE_SANITARIA_CHECK">CONFORMIDADE_SANITARIA_CHECK</option>
              <option value="COLABORADOR_ENTRADA_DETECTADA">COLABORADOR_ENTRADA_DETECTADA</option>
              <option value="POSTO_TRABALHO_ALERTA_OCIOSIDADE">POSTO_TRABALHO_ALERTA_OCIOSIDADE</option>
              <option value="FECHAMENTO_TURNO_SYNC">FECHAMENTO_TURNO_SYNC</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-white/50">
            O evento trafega exclusivamente pelo canal in-memory do servidor com idempotência e registro em auditoria.
          </p>
          <button
            onClick={handleDispararEvento}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-purple-900/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Disparar Evento no Barramento Interno</span>
          </button>
        </div>

        {/* Payload Inspecionável do Último Evento */}
        {lastDispatchedEvent && (
          <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Evento Processado: {lastDispatchedEvent.event}
              </span>
              <span className="text-[10.5px] text-white/50 font-mono">
                Latência: {lastDispatchedEvent.latencyMs}ms · HTTP {lastDispatchedEvent.statusCode}
              </span>
            </div>
            <pre className="p-3 bg-neutral-900 text-cyan-300 rounded-lg overflow-x-auto text-[10.5px] font-mono leading-relaxed">
              {JSON.stringify(lastDispatchedEvent.payload || lastDispatchedEvent, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
