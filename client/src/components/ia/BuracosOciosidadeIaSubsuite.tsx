import React, { useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Users,
  Send,
  Plus,
  X,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Lock,
  Unlock,
  Layers,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  negocioAtivo?: string;
}

interface BuracoOciosidade {
  id: string;
  diaSemana: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoMin: number;
  tipoRecurso: string; // "Salão VIP Tatames" | "Praça Sushi KDS" | "Delivery PWA"
  ocupacaoEsperadaPct: number;
  receitaPerdidaEst: number;
  status: "disponivel" | "bloqueado" | "encaixado";
  clienteEncaixado?: string;
  sugestoesClientes: {
    nome: string;
    telefone: string;
    historicoHorario: string;
    ticketMedio: number;
    pratoFavorito: string;
  }[];
}

export const BuracosOciosidadeIaSubsuite: React.FC<Props> = ({ negocioAtivo = "zuma" }) => {
  // Lista inicial de horários ociosos identificados pelo motor
  const buracosGastronomia: BuracoOciosidade[] = [
    {
      id: "b-1",
      diaSemana: "Terça-feira",
      data: "24/11/2026",
      horarioInicio: "18:00",
      horarioFim: "19:30",
      duracaoMin: 90,
      tipoRecurso: "Salão Tatames VIP (Mesas 1 a 6)",
      ocupacaoEsperadaPct: 25,
      receitaPerdidaEst: 1450,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Dr. André Lourenço",
          telefone: "65999112233",
          historicoHorario: "Costuma frequentar às terças antes das 19h",
          ticketMedio: 245,
          pratoFavorito: "Barca Nobre Zuma 32 Peças"
        },
        {
          nome: "Juliana Meireles",
          telefone: "65996655112",
          historicoHorario: "Já reservou tatame corporativo no início da noite",
          ticketMedio: 195,
          pratoFavorito: "Combo Hot Roll Trufado"
        }
      ]
    },
    {
      id: "b-2",
      diaSemana: "Quarta-feira",
      data: "25/11/2026",
      horarioInicio: "21:30",
      horarioFim: "23:00",
      duracaoMin: 90,
      tipoRecurso: "Delivery PWA & Motoboys Express",
      ocupacaoEsperadaPct: 30,
      receitaPerdidaEst: 1880,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Camila Guimarães",
          telefone: "65996655887",
          historicoHorario: "Pede delivery tarde da noite pelo PWA",
          ticketMedio: 188,
          pratoFavorito: "Uramaki Salmão Crispy Couve"
        },
        {
          nome: "Eng. Beatriz Fontana",
          telefone: "65999723456",
          historicoHorario: "Jantar tardio pós-plantão corporativo",
          ticketMedio: 192,
          pratoFavorito: "Tartar de Salmão Nobre"
        }
      ]
    },
    {
      id: "b-3",
      diaSemana: "Quinta-feira",
      data: "26/11/2026",
      horarioInicio: "18:00",
      horarioFim: "19:15",
      duracaoMin: 75,
      tipoRecurso: "Salão Nobre VIP (Mesas 7 a 14)",
      ocupacaoEsperadaPct: 35,
      receitaPerdidaEst: 1200,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Dr. Marcelo Arantes",
          telefone: "65999811234",
          historicoHorario: "Frequenta o salão no Happy Hour",
          ticketMedio: 188,
          pratoFavorito: "Sashimi Salmão Maçaricado"
        }
      ]
    },
    {
      id: "b-4",
      diaSemana: "Domingo Almoço",
      data: "29/11/2026",
      horarioInicio: "11:30",
      horarioFim: "12:30",
      duracaoMin: 60,
      tipoRecurso: "Praça Quente KDS & Almoço Executivo",
      ocupacaoEsperadaPct: 20,
      receitaPerdidaEst: 2100,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Roberto Meneghetti",
          telefone: "65999773344",
          historicoHorario: "Costuma pedir barcas familiares para o domingo",
          ticketMedio: 320,
          pratoFavorito: "Festival da Família Zuma 60 Peças"
        }
      ]
    }
  ];

  const buracosRoupas: BuracoOciosidade[] = [
    {
      id: "br-1",
      diaSemana: "Terça-feira",
      data: "24/11/2026",
      horarioInicio: "14:00",
      horarioFim: "15:30",
      duracaoMin: 90,
      tipoRecurso: "Provadores VIP & Consultoria de Estilo",
      ocupacaoEsperadaPct: 20,
      receitaPerdidaEst: 1850,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Dra. Camila Nogueira",
          telefone: "65999882233",
          historicoHorario: "Prefere atendimento tranquilo no início da tarde",
          ticketMedio: 380,
          pratoFavorito: "Vestido Linho Puro Midi"
        },
        {
          nome: "Mariana Vasconcelos",
          telefone: "65996655221",
          historicoHorario: "Gosta de provar looks completos sem fila",
          ticketMedio: 320,
          pratoFavorito: "Conjunto Alfaiataria Verão"
        }
      ]
    },
    {
      id: "br-2",
      diaSemana: "Quarta-feira",
      data: "25/11/2026",
      horarioInicio: "10:00",
      horarioFim: "11:30",
      duracaoMin: 90,
      tipoRecurso: "Araras Masculinas & Alfaiataria Slim",
      ocupacaoEsperadaPct: 25,
      receitaPerdidaEst: 1450,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Rafael Silveira",
          telefone: "65999771144",
          historicoHorario: "Costuma comprar camisas pela manhã",
          ticketMedio: 290,
          pratoFavorito: "Camisas Algodão Egípcio"
        }
      ]
    },
    {
      id: "br-3",
      diaSemana: "Segunda-feira",
      data: "30/11/2026",
      horarioInicio: "09:30",
      horarioFim: "11:00",
      duracaoMin: 90,
      tipoRecurso: "Salão de Vendas & Novos Lançamentos",
      ocupacaoEsperadaPct: 15,
      receitaPerdidaEst: 2200,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Thiago Prado",
          telefone: "65998123344",
          historicoHorario: "Aproveita lançamentos da semana",
          ticketMedio: 275,
          pratoFavorito: "Polo Piquet Pima"
        }
      ]
    }
  ];

  const [buracos, setBuracos] = useState<BuracoOciosidade[]>(
    negocioAtivo === "zuma_roupas" || negocioAtivo === "roupas" ? buracosRoupas : buracosGastronomia
  );

  React.useEffect(() => {
    setBuracos(negocioAtivo === "zuma_roupas" || negocioAtivo === "roupas" ? buracosRoupas : buracosGastronomia);
  }, [negocioAtivo]);

  // Lista fictícia ignorada abaixo
  const [dummy] = useState([
    {
      id: "b-1",
      diaSemana: "Terça-feira",
      data: "24/11/2026",
      horarioInicio: "18:00",
      horarioFim: "19:30",
      duracaoMin: 90,
      tipoRecurso: "Salão Tatames VIP (Mesas 1 a 6)",
      ocupacaoEsperadaPct: 25,
      receitaPerdidaEst: 1450,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Dr. André Lourenço",
          telefone: "65999112233",
          historicoHorario: "Costuma frequentar às terças antes das 19h",
          ticketMedio: 245,
          pratoFavorito: "Barca Nobre Zuma 32 Peças"
        },
        {
          nome: "Juliana Meireles",
          telefone: "65996655112",
          historicoHorario: "Já reservou tatame corporativo no início da noite",
          ticketMedio: 195,
          pratoFavorito: "Combo Hot Roll Trufado"
        }
      ]
    },
    {
      id: "b-2",
      diaSemana: "Quarta-feira",
      data: "25/11/2026",
      horarioInicio: "21:30",
      horarioFim: "23:00",
      duracaoMin: 90,
      tipoRecurso: "Delivery PWA & Motoboys Express",
      ocupacaoEsperadaPct: 30,
      receitaPerdidaEst: 1880,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Camila Guimarães",
          telefone: "65996655887",
          historicoHorario: "Pede delivery tarde da noite pelo PWA",
          ticketMedio: 188,
          pratoFavorito: "Uramaki Salmão Crispy Couve"
        },
        {
          nome: "Eng. Beatriz Fontana",
          telefone: "65999723456",
          historicoHorario: "Jantar tardio pós-plantão corporativo",
          ticketMedio: 192,
          pratoFavorito: "Tartar de Salmão Nobre"
        }
      ]
    },
    {
      id: "b-3",
      diaSemana: "Quinta-feira",
      data: "26/11/2026",
      horarioInicio: "18:00",
      horarioFim: "19:15",
      duracaoMin: 75,
      tipoRecurso: "Salão Nobre VIP (Mesas 7 a 14)",
      ocupacaoEsperadaPct: 35,
      receitaPerdidaEst: 1200,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Dr. Marcelo Arantes",
          telefone: "65999811234",
          historicoHorario: "Frequenta o salão no Happy Hour",
          ticketMedio: 188,
          pratoFavorito: "Sashimi Salmão Maçaricado"
        }
      ]
    },
    {
      id: "b-4",
      diaSemana: "Domingo Almoço",
      data: "29/11/2026",
      horarioInicio: "11:30",
      horarioFim: "12:30",
      duracaoMin: 60,
      tipoRecurso: "Praça Quente KDS & Almoço Executivo",
      ocupacaoEsperadaPct: 20,
      receitaPerdidaEst: 2100,
      status: "disponivel",
      sugestoesClientes: [
        {
          nome: "Roberto Meneghetti",
          telefone: "65999773344",
          historicoHorario: "Costuma pedir barcas familiares para o domingo",
          ticketMedio: 320,
          pratoFavorito: "Festival da Família Zuma 60 Peças"
        }
      ]
    }
  ]);

  // Estados de modal de encaixe
  const [modalEncaixeAberto, setModalEncaixeAberto] = useState<boolean>(false);
  const [buracoSelecionado, setBuracoSelecionado] = useState<BuracoOciosidade | null>(null);
  const [clienteEncaixeForm, setClienteEncaixeForm] = useState({
    nome: "",
    telefone: "",
    beneficio: "10% de Cashback no Clube Zumi ou Sobremesa Cortesia",
    observacao: ""
  });

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const buracosFiltrados = useMemo(() => {
    return buracos.filter(b => {
      if (filtroTipo === "todos") return true;
      return b.tipoRecurso.toLowerCase().includes(filtroTipo.toLowerCase());
    });
  }, [buracos, filtroTipo]);

  // Cálculos de impacto
  const receitaTotalOciosa = useMemo(() => {
    return buracos.filter(b => b.status === "disponivel").reduce((acc, curr) => acc + curr.receitaPerdidaEst, 0);
  }, [buracos]);

  const totalEncaixados = useMemo(() => {
    return buracos.filter(b => b.status === "encaixado").length;
  }, [buracos]);

  // Ação 1: Bloquear horário para contenção de custo
  const handleAlternarBloqueio = (id: string) => {
    setBuracos(prev => prev.map(b => {
      if (b.id !== id) return b;
      const novoStatus = b.status === "bloqueado" ? "disponivel" : "bloqueado";
      if (novoStatus === "bloqueado") {
        toast.info(`Slot de ${b.diaSemana} (${b.horarioInicio} - ${b.horarioFim}) bloqueado para contenção de equipe.`);
      } else {
        toast.success(`Slot de ${b.diaSemana} liberado para ocupação.`);
      }
      return { ...b, status: novoStatus };
    }));
  };

  // Ação 2: Abrir modal de encaixe rápido
  const handleAbrirEncaixe = (b: BuracoOciosidade, clienteSug?: any) => {
    setBuracoSelecionado(b);
    if (clienteSug) {
      setClienteEncaixeForm({
        nome: clienteSug.nome,
        telefone: clienteSug.telefone,
        beneficio: "Reserva VIP + Sobremesa Harumaki Cortesia",
        observacao: `Cliente com histórico favorável: ${clienteSug.historicoHorario}`
      });
    } else {
      setClienteEncaixeForm({
        nome: "",
        telefone: "",
        beneficio: "Reserva VIP de Tatame + Sobremesa Cortesia",
        observacao: ""
      });
    }
    setModalEncaixeAberto(true);
  };

  // Ação 3: Concluir encaixe rápido e abrir WhatsApp
  const handleConcluirEncaixe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buracoSelecionado || !clienteEncaixeForm.nome) return;

    const primeiroNome = clienteEncaixeForm.nome.split(" ")[0];
    const msg = `Olá ${primeiroNome}, tudo bem? Aqui é a Zumi do Zuma Cozinha Oriental! 🥢 Surgiu uma oportunidade VIP para você em nosso Salão Nobre nesta *${buracoSelecionado.diaSemana}* (${buracoSelecionado.data}) às *${buracoSelecionado.horarioInicio}*. Como você é nosso cliente preferencial, reservamos uma mesa especial com *${clienteEncaixeForm.beneficio}*! Posso confirmar seu lugar? Responda SIM para garantir sem fila de espera!`;

    setBuracos(prev => prev.map(b => {
      if (b.id !== buracoSelecionado.id) return b;
      return { ...b, status: "encaixado", clienteEncaixado: clienteEncaixeForm.nome };
    }));

    setModalEncaixeAberto(false);
    toast.success(`🎉 Encaixe realizado com sucesso para ${clienteEncaixeForm.nome}!`);

    if (clienteEncaixeForm.telefone) {
      const linkWa = `https://wa.me/55${clienteEncaixeForm.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
      window.open(linkWa, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CAÇA AOS BURACOS */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-inner text-white font-black">
              <Clock className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[var(--ink)]">
                  Caça aos Horários Ociosos & Ocupação Preditiva
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Preenchimento com IA
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Algoritmo mapeia vales de baixa ocupação no salão e delivery, combinando perfis de clientes para disparos de encaixe com 1 clique.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--ink)]">
              Slots Monitorados: <span className="text-amber-400 font-black">{buracos.length}</span>
            </div>
          </div>
        </div>

        {/* CARDS DE IMPACTO DA OCIOSIDADE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-red-500/30 bg-red-500/5">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Receita Ociosa em Risco</span>
            <div className="text-xl font-black font-mono text-red-300 mt-1">
              R$ {receitaTotalOciosa.toLocaleString("pt-BR")}
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold mt-1 block">
              Potencial perdido se não preencher
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Encaixes Realizados</span>
            <div className="text-xl font-black font-mono text-emerald-300 mt-1">
              {totalEncaixados} Slots
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
              Salvos nesta semana
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Horário Mais Crítico</span>
            <div className="text-sm font-black text-[var(--ink)] mt-1">
              Terça-feira 18h às 19h30
            </div>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">
              Ocupação de apenas 25%
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Conversão de Encaixe</span>
            <div className="text-xl font-black font-mono text-indigo-400 mt-1">
              34.2%
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold mt-1 block">
              Taxa de aceite dos convites VIP
            </span>
          </div>
        </div>
      </div>

      {/* FILTRO POR TIPO DE RECURSO */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[var(--muted)] mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrar Recurso:</span>
        </span>
        {["todos", "salão", "delivery", "kds"].map(t => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              filtroTipo === t
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* LISTA DE SLOTS OCIOSOS E SUGESTÕES DE ENCAIXE */}
      <div className="space-y-4">
        {buracosFiltrados.map(b => (
          <div
            key={b.id}
            className={`bg-[var(--surface)] border rounded-3xl p-5 shadow-sm space-y-4 transition-all ${
              b.status === "encaixado"
                ? "border-emerald-500/40 bg-emerald-500/5"
                : b.status === "bloqueado"
                  ? "border-neutral-700/60 opacity-60"
                  : "border-[var(--line)] hover:border-amber-500/40"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  b.status === "encaixado"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : b.status === "bloqueado"
                      ? "bg-neutral-800 text-neutral-400"
                      : "bg-amber-500/20 text-amber-400"
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[var(--ink)]">
                      {b.diaSemana} ({b.data}) · {b.horarioInicio} às {b.horarioFim}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      b.status === "encaixado"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : b.status === "bloqueado"
                          ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {b.status === "encaixado" ? "Encaixado" : b.status === "bloqueado" ? "Bloqueado" : "Ocioso"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] mt-0.5">
                    <span>Recurso: <b className="text-[var(--ink)]">{b.tipoRecurso}</b></span>
                    <span>·</span>
                    <span>Duração: {b.duracaoMin} min</span>
                    <span>·</span>
                    <span className="text-red-400 font-bold">Ocupação esperada: {b.ocupacaoEsperadaPct}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Receita Ociosa</span>
                  <span className="text-sm font-mono font-black text-red-400">
                    R$ {b.receitaPerdidaEst.toLocaleString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 border-l border-[var(--line)] pl-3">
                  <button
                    onClick={() => handleAlternarBloqueio(b.id)}
                    className="p-2 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    title={b.status === "bloqueado" ? "Desbloquear Slot" : "Bloquear para Redução de Escala"}
                  >
                    {b.status === "bloqueado" ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
                  </button>

                  {b.status !== "encaixado" && (
                    <button
                      onClick={() => handleAbrirEncaixe(b)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Encaixe Rápido</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SUGESTÕES INTELIGENTES DE CLIENTES PARA ESTE HORÁRIO */}
            {b.status === "disponivel" && b.sugestoesClientes.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[var(--muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clientes Recomendados pela IA para este Horário Específico:</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {b.sugestoesClientes.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--ink)]">{sug.nome}</span>
                          <span className="text-[10px] font-mono text-[var(--salmon)]">
                            Ticket R$ {sug.ticketMedio}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">{sug.historicoHorario}</p>
                        <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                          Favorito: {sug.pratoFavorito}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAbrirEncaixe(b, sug)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Convidar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SE JÁ ENCAIXADO */}
            {b.status === "encaixado" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Horário preenchido com sucesso por <b>{b.clienteEncaixado}</b> via convite VIP Zumi!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL DE ENCAIXE RÁPIDO */}
      {modalEncaixeAberto && buracoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)]">Encaixe Rápido de Horário</h3>
                  <span className="text-[10px] text-[var(--muted)]">
                    {buracoSelecionado.diaSemana} · {buracoSelecionado.horarioInicio} às {buracoSelecionado.horarioFim}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalEncaixeAberto(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConcluirEncaixe} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={clienteEncaixeForm.nome}
                  onChange={e => setClienteEncaixeForm({ ...clienteEncaixeForm, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold"
                  placeholder="Ex: Dr. André Lourenço"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Telefone WhatsApp</label>
                <input
                  type="text"
                  value={clienteEncaixeForm.telefone}
                  onChange={e => setClienteEncaixeForm({ ...clienteEncaixeForm, telefone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  placeholder="65 99999-9999"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Benefício do Convite VIP</label>
                <input
                  type="text"
                  value={clienteEncaixeForm.beneficio}
                  onChange={e => setClienteEncaixeForm({ ...clienteEncaixeForm, beneficio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold"
                  placeholder="Ex: Reserva VIP + Sobremesa Cortesia"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-[var(--line)] text-[11px] font-mono text-neutral-300">
                A Zumi IA formatará uma mensagem exclusiva e abrirá o WhatsApp do cliente para confirmação em 1 toque.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEncaixeAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Convite WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
