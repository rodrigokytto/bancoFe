import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Bike, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Filter, 
  Layers, 
  Sparkles, 
  Truck, 
  MapPin, 
  ChevronRight, 
  Check, 
  ExternalLink, 
  Phone, 
  Send, 
  ShieldCheck, 
  PlusCircle, 
  X, 
  UtensilsCrossed,
  Fish,
  PackageCheck,
  RotateCcw
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { kdsAudio } from "../lib/kdsAudio";
import { 
  orderEventBus, 
  SimulatedOrderEvent, 
  MotoboyDispatchedDeliveryEvent, 
  MesaDishReadyEvent,
  ItemCancelledEvent
} from "../lib/orderEvents";

export interface ItemComanda {
  id: string;
  name: string;
  qty: number;
  station: "sushibar" | "quente" | "fritura";
  status: "aguardando" | "preparando" | "pronto" | "cancelado";
  fireOnDemand?: boolean;
  tempoPreparoMinutos: number;
  observacoes?: string;
  cancelReason?: string;
  reallocatedTo?: string;
  reallocatedFrom?: string;
}

export interface Comanda {
  id: string;
  numero: number;
  origem: "mesa" | "delivery" | "balcao";
  identificador: string;
  clienteNome?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  bairro?: string;
  taxaEntrega?: number;
  formaPagamento?: string;
  valorTotal?: number;
  horaCriacao: string;
  segundosDecorridos: number;
  slaMinutos: number;
  status: "pendente" | "preparando" | "pronto" | "despachado";
  fireOnDemandAtivo: boolean;
  fireLiberado: boolean;
  checklistExpedicao?: {
    hashi: boolean;
    shoyuSache: boolean;
    molhoTare: boolean;
    gengibreWasabi: boolean;
    lacreInviolavel: boolean;
  };
  itens: ItemComanda[];
  orderId?: string;
  motoboyAtribuido?: string;
}

// Bairros Reais de Tangará da Serra (MT) para Cálculo de Despacho
const BAIRROS_TANGARA = [
  { nome: "Centro", taxa: 8.0, lat: -14.6238, lng: -57.4917, distanciaKm: 1.2, tempoMin: 5 },
  { nome: "Jardim Europa", taxa: 10.0, lat: -14.6315, lng: -57.5021, distanciaKm: 2.4, tempoMin: 8 },
  { nome: "Vila Alta", taxa: 10.0, lat: -14.6150, lng: -57.4850, distanciaKm: 2.1, tempoMin: 7 },
  { nome: "Jardim Shangri-lá", taxa: 12.0, lat: -14.6402, lng: -57.5105, distanciaKm: 3.5, tempoMin: 11 },
  { nome: "Tarumã", taxa: 14.0, lat: -14.6450, lng: -57.4750, distanciaKm: 4.2, tempoMin: 13 },
  { nome: "Tangará II", taxa: 15.0, lat: -14.6340, lng: -57.4820, distanciaKm: 3.1, tempoMin: 9 }
];

export function CozinhaKds2() {
  const [stationFilter, setStationFilter] = useState<"todas" | "sushibar" | "quente" | "fritura" | "expedicao">("todas");
  const [viewMode, setViewMode] = useState<"comandas" | "allday">("comandas");
  const [origemFilter, setOrigemFilter] = useState<"todas" | "mesa" | "delivery" | "balcao">("todas");
  const [somAtivo, setSomAtivo] = useState(true);
  const [modoIndustrial, setModoIndustrial] = useState(false);
  const [horarioAtual, setHorarioAtual] = useState("");
  const [cancelAlert, setCancelAlert] = useState<ItemCancelledEvent | null>(null);

  // Modal de Despacho de Motoboy
  const [modalDespacho, setModalDespacho] = useState<Comanda | null>(null);
  const [selectedMotoboyId, setSelectedMotoboyId] = useState<string>("");
  const [mensagemWhatsappPersonalizada, setMensagemWhatsappPersonalizada] = useState<string>("");
  const [enviandoDespacho, setEnviandoDespacho] = useState(false);

  // Modal de Simulação de Novo Pedido
  const [modalNovoPedido, setModalNovoPedido] = useState(false);
  const [simOrigem, setSimOrigem] = useState<"mesa" | "delivery">("delivery");
  const [simCliente, setSimCliente] = useState("Camila Guimarães");
  const [simMesaNum, setSimMesaNum] = useState(4);
  const [simBairro, setSimBairro] = useState("Jardim Europa");

  // Histórico de Comandas Finalizadas na Sessão
  const [comandasFinalizadas, setComandasFinalizadas] = useState<Array<Comanda & { finalizadoAs: string }>>([]);
  const [drawerHistorico, setDrawerHistorico] = useState(false);

  // tRPC Queries & Mutations
  const { data: motoboysData, refetch: refetchMotoboys } = trpc.zuma.listMotoboys.useQuery(undefined, {
    refetchInterval: 10000
  });
  const assignMotoboyMutation = trpc.zuma.assignOrderToMotoboy.useMutation();
  const ifoodDispatchMutation = trpc.zuma.ifoodDispatchOrder.useMutation();

  // Comandas Ativas em Produção
  const [comandas, setComandas] = useState<Comanda[]>([
    {
      id: "cmd_104",
      numero: 104,
      origem: "mesa",
      identificador: "Mesa #07 • Salão Nobre",
      clienteNome: "Família Barbosa",
      horaCriacao: "19:42",
      segundosDecorridos: 1240, // 20m 40s
      slaMinutos: 25,
      status: "preparando",
      fireOnDemandAtivo: true,
      fireLiberado: false,
      itens: [
        {
          id: "it_104_1",
          name: "Combinado Salmão Lovers (32 pçs)",
          qty: 1,
          station: "sushibar",
          status: "pronto",
          tempoPreparoMinutos: 15,
          observacoes: "Sem gergelim no sashimi, bastante wasabi"
        },
        {
          id: "it_104_2",
          name: "Hot Filadélfia Especial (12 pçs)",
          qty: 2,
          station: "fritura",
          status: "aguardando",
          fireOnDemand: true,
          tempoPreparoMinutos: 6,
          observacoes: "Aguardando Fire on Demand para sair crocante com o combinado"
        },
        {
          id: "it_104_3",
          name: "Robata de Salmão com Tare (3 espetos)",
          qty: 1,
          station: "quente",
          status: "preparando",
          tempoPreparoMinutos: 8
        }
      ]
    },
    {
      id: "cmd_105",
      numero: 105,
      origem: "delivery",
      identificador: "Delivery #ZUM-8921 • iFood",
      clienteNome: "Dr. Eduardo Fagundes",
      clienteTelefone: "(65) 99981-2299",
      clienteEndereco: "Rua Antonio Hortolani, 412 - Apto 302",
      bairro: "Jardim Europa",
      taxaEntrega: 10.0,
      formaPagamento: "Pix Antecipado",
      valorTotal: 184.50,
      horaCriacao: "19:48",
      segundosDecorridos: 880, // 14m 40s
      slaMinutos: 35,
      status: "preparando",
      fireOnDemandAtivo: false,
      fireLiberado: true,
      checklistExpedicao: {
        hashi: true,
        shoyuSache: true,
        molhoTare: false,
        gengibreWasabi: true,
        lacreInviolavel: false
      },
      itens: [
        {
          id: "it_105_1",
          name: "Poke Salmão Premium Especial",
          qty: 2,
          station: "sushibar",
          status: "pronto",
          tempoPreparoMinutos: 10,
          observacoes: "Molho ponzu à parte, adicionar manga"
        },
        {
          id: "it_105_2",
          name: "Guioza Bupim Suíno Crocante (6 pçs)",
          qty: 1,
          station: "quente",
          status: "pronto",
          tempoPreparoMinutos: 7
        }
      ]
    },
    {
      id: "cmd_106",
      numero: 106,
      origem: "mesa",
      identificador: "Mesa #12 • Tatame VIP",
      clienteNome: "Rodrigo Gonçalves",
      horaCriacao: "19:54",
      segundosDecorridos: 520, // 8m 40s
      slaMinutos: 20,
      status: "preparando",
      fireOnDemandAtivo: true,
      fireLiberado: false,
      itens: [
        {
          id: "it_106_1",
          name: "Sashimi Barriga Trufado c/ Flor de Sal (10 pçs)",
          qty: 1,
          station: "sushibar",
          status: "preparando",
          tempoPreparoMinutos: 8
        },
        {
          id: "it_106_2",
          name: "Uramaki Ebi Spicy Crispy (8 pçs)",
          qty: 1,
          station: "sushibar",
          status: "aguardando",
          tempoPreparoMinutos: 6
        },
        {
          id: "it_106_3",
          name: "Tempurá Misto Nobre (Camarão e Legumes)",
          qty: 1,
          station: "fritura",
          status: "aguardando",
          fireOnDemand: true,
          tempoPreparoMinutos: 7,
          observacoes: "Subir junto com os sashimis para não murchar"
        }
      ]
    },
    {
      id: "cmd_107",
      numero: 107,
      origem: "delivery",
      identificador: "Delivery #ZUM-8924 • WhatsApp",
      clienteNome: "Juliana Mendes",
      clienteTelefone: "(65) 99654-1102",
      clienteEndereco: "Av. Brasil, 1850 - Edifício Tangará Tower",
      bairro: "Centro",
      taxaEntrega: 8.0,
      formaPagamento: "Cartão de Crédito na Entrega",
      valorTotal: 142.0,
      horaCriacao: "19:59",
      segundosDecorridos: 220, // 3m 40s
      slaMinutos: 30,
      status: "pendente",
      fireOnDemandAtivo: false,
      fireLiberado: true,
      checklistExpedicao: {
        hashi: true,
        shoyuSache: false,
        molhoTare: false,
        gengibreWasabi: false,
        lacreInviolavel: false
      },
      itens: [
        {
          id: "it_107_1",
          name: "Yakisoba Nobre Filé Mignon e Camarão",
          qty: 1,
          station: "quente",
          status: "aguardando",
          tempoPreparoMinutos: 14,
          observacoes: "Pouco sal no molho da Wok"
        },
        {
          id: "it_107_2",
          name: "Harumaki de Queijo c/ Goiabada (4 pçs)",
          qty: 1,
          station: "fritura",
          status: "aguardando",
          tempoPreparoMinutos: 5
        }
      ]
    }
  ]);

  // Relógio do KDS e Contador de SLA
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setHorarioAtual(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      setComandas(prev => prev.map(cmd => {
        const novosSegundos = cmd.segundosDecorridos + 1;
        return {
          ...cmd,
          segundosDecorridos: novosSegundos
        };
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Escutar eventos de novos pedidos e cancelamentos com som e visual no KDS
  useEffect(() => {
    const unsubscribe = orderEventBus.subscribe((event: SimulatedOrderEvent) => {
      if (somAtivo) {
        kdsAudio.playNewOrderChime();
      }

      const novaCmd: Comanda = {
        id: `cmd_${Date.now()}`,
        numero: Math.floor(108 + Math.random() * 50),
        origem: event.channel === "mesa" ? "mesa" : "delivery",
        identificador: event.channel === "mesa" 
          ? `Mesa #${event.tableNumber || "01"} • Salão` 
          : `Delivery #${event.orderId.toUpperCase()} • App`,
        clienteNome: event.customerName,
        horaCriacao: event.timestamp || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        segundosDecorridos: 0,
        slaMinutos: event.channel === "mesa" ? 22 : 35,
        status: "pendente",
        fireOnDemandAtivo: event.items.some(i => i.fireOnDemand),
        fireLiberado: !event.items.some(i => i.fireOnDemand),
        bairro: event.channel === "delivery" ? "Centro" : undefined,
        checklistExpedicao: event.channel === "delivery" ? {
          hashi: false,
          shoyuSache: false,
          molhoTare: false,
          gengibreWasabi: false,
          lacreInviolavel: false
        } : undefined,
        itens: event.items.map((it, idx) => ({
          id: `it_${Date.now()}_${idx}`,
          name: it.name,
          qty: 1,
          station: it.praça as "sushibar" | "quente" | "fritura",
          status: "aguardando",
          fireOnDemand: it.fireOnDemand,
          tempoPreparoMinutos: it.prepMinutes || 10
        }))
      };

      setComandas(prev => [novaCmd, ...prev]);
      toast.info(`🔔 Novo Pedido Recebido no KDS: #${novaCmd.numero}`, {
        description: `${novaCmd.identificador} • ${novaCmd.itens.length} itens para preparo imediato.`
      });
    });

    // Subscrição ao evento de Cancelamento de Item (Alerta Sonoro e Visual Imediato)
    const unsubCancelled = orderEventBus.subscribeItemCancelled((event: ItemCancelledEvent) => {
      if (somAtivo) {
        kdsAudio.playCancellationAlertChime();
      }

      setCancelAlert(event);

      // Atualiza comandas em tela: marca item cancelado ou reatribuído
      setComandas(prev => {
        return prev.map(cmd => {
          const isOriginTable = cmd.origem === "mesa" && (
            cmd.identificador.includes(String(event.tableNumber)) ||
            cmd.identificador.includes(String(event.tableNumber).padStart(2, "0"))
          );
          const isDestOrder = event.reallocatedTo && (
            cmd.identificador.toLowerCase().includes(event.reallocatedTo.identifier.toLowerCase())
          );

          let updatedItens = cmd.itens;

          if (isOriginTable) {
            updatedItens = cmd.itens.map(it => {
              if (it.name.toLowerCase().trim() === event.itemName.toLowerCase().trim() && it.status !== "cancelado") {
                return {
                  ...it,
                  status: "cancelado" as const,
                  cancelReason: event.reason,
                  reallocatedTo: event.reallocatedTo?.identifier
                };
              }
              return it;
            });
          } else if (isDestOrder) {
            updatedItens = cmd.itens.map(it => {
              if (it.name.toLowerCase().trim() === event.itemName.toLowerCase().trim() && !it.reallocatedFrom) {
                return {
                  ...it,
                  reallocatedFrom: `Mesa ${String(event.tableNumber).padStart(2, "0")}`
                };
              }
              return it;
            });
          }

          return {
            ...cmd,
            itens: updatedItens
          };
        });
      });

      if (event.reallocatedTo) {
        toast.error(`⚠️ CANCELAMENTO & REAPROVEITAMENTO: Mesa #${event.tableNumber}`, {
          description: `"${event.itemName}" cancelado na Mesa #${event.tableNumber}. Produção repassada para ${event.reallocatedTo.identifier} (Zero Desperdício)!`,
          duration: 9000
        });
      } else {
        toast.error(`🛑 ALERTA COZINHA: ITEM CANCELADO NA MESA #${event.tableNumber}`, {
          description: `Interromper preparo de "${event.itemName}" imediatamente (${event.reason || "Desistência"}). Solicitado por ${event.cancelledBy}.`,
          duration: 9000
        });
      }
    });

    return () => {
      unsubscribe();
      unsubCancelled();
    };
  }, [somAtivo]);

  // Alerta sonoro de SLA caso algum pedido estoure
  const toggleAudio = () => {
    const novoStatus = !somAtivo;
    setSomAtivo(novoStatus);
    if (novoStatus) {
      kdsAudio.playSlaWarningChime();
      toast.success("Áudio do KDS ativado: Bipes de novos pedidos e SLAs ligados!");
    } else {
      toast.info("Áudio do KDS silenciado.");
    }
  };

  // Funções de manipulação das comandas
  const liberarFireOnDemand = (comandaId: string) => {
    setComandas(prev => prev.map(cmd => {
      if (cmd.id !== comandaId) return cmd;
      return {
        ...cmd,
        fireLiberado: true,
        itens: cmd.itens.map(it => it.fireOnDemand ? { ...it, status: "preparando" } : it)
      };
    }));

    if (somAtivo) {
      kdsAudio.playReadyChime();
    }

    toast.warning("🔥 Fire on Demand Liberado!", {
      description: "Itens quentes/frituras liberados para preparo sincronizado com o sushibar!"
    });
  };

  const marcarItemPronto = (comandaId: string, itemId: string) => {
    setComandas(prev => prev.map(cmd => {
      if (cmd.id !== comandaId) return cmd;
      const novosItens = cmd.itens.map(it => {
        if (it.id !== itemId) return it;
        const novoStatus: ItemComanda["status"] = it.status === "aguardando" ? "preparando" : "pronto";
        return { ...it, status: novoStatus };
      });

      const todosProntos = novosItens.every(i => i.status === "pronto");

      return {
        ...cmd,
        itens: novosItens,
        status: todosProntos ? "pronto" : cmd.status
      };
    }));

    if (somAtivo) {
      kdsAudio.playReadyChime();
    }
  };

  const toggleChecklist = (comandaId: string, key: keyof NonNullable<Comanda["checklistExpedicao"]>) => {
    setComandas(prev => prev.map(cmd => {
      if (cmd.id !== comandaId || !cmd.checklistExpedicao) return cmd;
      return {
        ...cmd,
        checklistExpedicao: {
          ...cmd.checklistExpedicao,
          [key]: !cmd.checklistExpedicao[key]
        }
      };
    }));
  };

  // Agregação de itens para a visão All-Day KDS
  const allDayItems = useMemo(() => {
    const map = new Map<string, { name: string; station: "sushibar" | "quente" | "fritura"; totalQty: number; readyQty: number; comandaIds: string[] }>();
    comandas.forEach(cmd => {
      cmd.itens.forEach(it => {
        const key = `${it.station}-${it.name}`;
        const existing = map.get(key) || { name: it.name, station: it.station, totalQty: 0, readyQty: 0, comandaIds: [] };
        existing.totalQty += it.qty;
        if (it.status === "pronto") existing.readyQty += it.qty;
        if (!existing.comandaIds.includes(cmd.id)) existing.comandaIds.push(cmd.id);
        map.set(key, existing);
      });
    });
    return Array.from(map.values());
  }, [comandas]);

  // Incrementar pronto em lote no All-Day
  const produzirLoteAllDay = (itemNome: string, station: string) => {
    setComandas(prev => {
      let alterou = false;
      return prev.map(cmd => {
        if (alterou) return cmd;
        const itemAlvo = cmd.itens.find(i => i.name === itemNome && i.station === station && i.status !== "pronto");
        if (itemAlvo) {
          alterou = true;
          return {
            ...cmd,
            itens: cmd.itens.map(i => i.id === itemAlvo.id ? { ...i, status: "pronto" } : i)
          };
        }
        return cmd;
      });
    });
  };

  // Listener do Bump Bar via Teclado Físico / Pedais Industriais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      
      if (e.key === "1") setStationFilter("sushibar");
      else if (e.key === "2") setStationFilter("quente");
      else if (e.key === "3") setStationFilter("fritura");
      else if (e.key === "4") setStationFilter("expedicao");
      else if (e.key === "0") setStationFilter("todas");
      else if (e.key === "a" || e.key === "A") setViewMode(prev => prev === "comandas" ? "allday" : "comandas");
      else if (e.key === "f" || e.key === "F") {
        const cmdFire = comandas.find(c => c.fireOnDemandAtivo && !c.fireLiberado);
        if (cmdFire) liberarFireOnDemand(cmdFire.id);
      }
      else if (e.key === "Enter") {
        const cmdPronta = comandas.find(c => c.itens.every(i => i.status === "pronto"));
        if (cmdPronta) {
          if (cmdPronta.origem === "mesa") handleLiberarMesaParaGarcom(cmdPronta);
          else handleAbrirModalDespacho(cmdPronta);
        }
      }
      else if (e.key === " ") {
        e.preventDefault();
        const primeira = comandas[0];
        if (primeira) {
          const pendente = primeira.itens.find(i => i.status !== "pronto");
          if (pendente) marcarItemPronto(primeira.id, pendente.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [comandas]);

  // Ação de Salão / Mesa: Liberar Pratos para o Garçom no Pass
  const handleLiberarMesaParaGarcom = (cmd: Comanda) => {
    if (somAtivo) kdsAudio.playReadyChime();
    
    const matchMesa = cmd.identificador.match(/Mesa #?(\d+)/i);
    const mesaNum = matchMesa ? parseInt(matchMesa[1], 10) : 7;

    const eventPayload: MesaDishReadyEvent = {
      tableNumber: mesaNum,
      orderNumber: cmd.numero,
      items: cmd.itens.map(i => `${i.qty}x ${i.name}`),
      station: "Pass Central Sushibar / Cozinha",
      waiter: "Garçom de Salão",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    orderEventBus.emitMesaDishReady(eventPayload);

    toast.success(`🔔 Garçom Acionado para Mesa #${mesaNum}!`, {
      description: `Pratos finalizados no Pass do Sushibar. Notificação enviada ao painel do salão.`
    });

    setComandasFinalizadas(prev => [{ ...cmd, status: "pronto", finalizadoAs: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    setComandas(prev => prev.filter(c => c.id !== cmd.id));
  };

  // Abrir Modal de Despacho para Motoboy
  const handleAbrirModalDespacho = (cmd: Comanda) => {
    setModalDespacho(cmd);
    const mbDisponivel = motoboysData?.find(m => m.status === "disponivel");
    const motoboyInicial = mbDisponivel ? mbDisponivel.id : (motoboysData?.[0]?.id || "moto_1");
    setSelectedMotoboyId(motoboyInicial);

    const mbNome = motoboysData?.find(m => m.id === motoboyInicial)?.name || "Tiago Silva";
    setMensagemWhatsappPersonalizada(
      `🛵 Olá, ${cmd.clienteNome || "Cliente"}! Seu pedido #${cmd.numero} do Zuma Oriental acabou de ser conferido e despachado com nosso entregador ${mbNome}! Previsão de entrega: 12 a 16 minutos. Código de segurança: ${Math.floor(1000 + Math.random() * 9000)}. Bom apetite!`
    );
  };

  // Confirmar Despacho do Motoboy
  const handleConfirmarDespachoMotoboy = async () => {
    if (!modalDespacho) return;
    setEnviandoDespacho(true);

    try {
      const motoboySelecionado = motoboysData?.find(m => m.id === selectedMotoboyId) || {
        id: selectedMotoboyId || "moto_1",
        name: "Tiago Silva",
        plate: "QBM-4819 (Honda Fan 160)",
        phone: "(65) 99812-4011"
      };

      const bairroInfo = BAIRROS_TANGARA.find(b => b.nome.toLowerCase() === (modalDespacho.bairro || "centro").toLowerCase()) || BAIRROS_TANGARA[0];
      const otpGerado = Math.floor(1000 + Math.random() * 9000).toString();

      try {
        if (modalDespacho.orderId) {
          await ifoodDispatchMutation.mutateAsync({
            orderId: Number(modalDespacho.orderId || modalDespacho.numero),
            motoboyId: motoboySelecionado.id
          });
        }
      } catch (errBackend) {
        console.warn("Aviso na mutação de backend:", errBackend);
      }

      const dispatchEvent: MotoboyDispatchedDeliveryEvent = {
        id: `CORR-${modalDespacho.numero}`,
        pedidoId: `ZUM-${modalDespacho.numero}`,
        cliente: {
          nome: modalDespacho.clienteNome || "Cliente Zuma",
          telefone: modalDespacho.clienteTelefone || "(65) 99872-1144",
          endereco: modalDespacho.clienteEndereco || `Rua dos Ipês, nº ${modalDespacho.numero}`,
          bairro: modalDespacho.bairro || "Centro",
          complemento: "Residencial",
          lat: bairroInfo.lat,
          lng: bairroInfo.lng
        },
        itens: modalDespacho.itens.map(i => `${i.qty}x ${i.name}`).join(" + "),
        taxaEntrega: modalDespacho.taxaEntrega || bairroInfo.taxa,
        valorTotal: modalDespacho.valorTotal || 178.0,
        formaPagamento: modalDespacho.formaPagamento || "Online Pago",
        status: "em_rota",
        codigoOtp: otpGerado,
        distanciaKm: bairroInfo.distanciaKm,
        tempoEstimadoMin: bairroInfo.tempoMin,
        motoboyId: motoboySelecionado.id,
        motoboyNome: motoboySelecionado.name,
        motoboyPlaca: motoboySelecionado.plate,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };

      orderEventBus.emitDispatchToMotoboy(dispatchEvent);

      if (somAtivo) kdsAudio.playReadyChime();

      toast.success(`🛵 Pedido #${modalDespacho.numero} Despachado com Sucesso!`, {
        description: `Atribuído a ${motoboySelecionado.name} (${motoboySelecionado.plate}). Rota sincronizada no App do Entregador GPS.`
      });

      setComandasFinalizadas(prev => [{
        ...modalDespacho,
        status: "despachado",
        motoboyAtribuido: motoboySelecionado.name,
        finalizadoAs: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }, ...prev]);

      setComandas(prev => prev.filter(c => c.id !== modalDespacho.id));
      setModalDespacho(null);
      refetchMotoboys();
    } catch (e: any) {
      toast.error("Erro ao despachar pedido: " + (e.message || "Erro desconhecido"));
    } finally {
      setEnviandoDespacho(false);
    }
  };

  // Simular Novo Pedido Rápido
  const handleSimularPedido = () => {
    const isMesa = simOrigem === "mesa";
    const novoOrder: SimulatedOrderEvent = {
      orderId: `sim-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      channel: isMesa ? "mesa" : "delivery",
      tableNumber: isMesa ? simMesaNum : undefined,
      customerName: isMesa ? `Mesa #${simMesaNum < 10 ? "0" + simMesaNum : simMesaNum}` : simCliente,
      items: [
        {
          name: "Hot Roll Salmão Crocante (8 un)",
          praça: "quente",
          prepMinutes: 10,
          price: 38.0,
          salmonWeightGrams: 90
        },
        {
          name: "Sashimi Salmão Maçaricado Trufado (10 un)",
          praça: "sushibar",
          fireOnDemand: true,
          prepMinutes: 8,
          price: 54.0,
          salmonWeightGrams: 160
        },
        {
          name: "Guioza de Salmão ao Vapor (6 un)",
          praça: "quente",
          prepMinutes: 12,
          price: 36.0,
          salmonWeightGrams: 80
        }
      ],
      totalValue: 128.0,
      status: "novo"
    };

    orderEventBus.emit(novoOrder);
    setModalNovoPedido(false);
  };

  // Métricas HUD em tempo real
  const metrics = useMemo(() => {
    const total = comandas.length;
    const atrasadas = comandas.filter(c => (c.segundosDecorridos / 60) > c.slaMinutos).length;
    const alerta = comandas.filter(c => {
      const min = c.segundosDecorridos / 60;
      return min <= c.slaMinutos && min > (c.slaMinutos * 0.75);
    }).length;

    const tempoMedioSeg = total > 0 
      ? Math.round(comandas.reduce((acc, c) => acc + c.segundosDecorridos, 0) / total) 
      : 0;

    const prontosExpedicao = comandas.filter(c => 
      c.itens.every(i => i.status === "pronto")
    ).length;

    const motoboysDisponiveis = motoboysData?.filter(m => m.status === "disponivel").length ?? 1;
    const motoboysEmRota = motoboysData?.filter(m => m.status === "em_rota").length ?? 2;

    return {
      total,
      atrasadas,
      alerta,
      tempoMedioFormat: formatMinSec(tempoMedioSeg),
      prontosExpedicao,
      motoboysDisponiveis,
      motoboysEmRota
    };
  }, [comandas, motoboysData]);

  // Filtragem de Comandas pelas Praças e Canais
  const comandasFiltradas = useMemo(() => {
    return comandas.filter(cmd => {
      if (origemFilter !== "todas" && cmd.origem !== origemFilter) {
        return false;
      }

      if (stationFilter === "todas") return true;
      if (stationFilter === "expedicao") {
        return cmd.origem === "delivery" || cmd.itens.every(i => i.status === "pronto");
      }
      return cmd.itens.some(item => item.station === stationFilter);
    });
  }, [comandas, stationFilter, origemFilter]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      modoIndustrial 
        ? "bg-slate-950 text-slate-100" 
        : "bg-[var(--surface2)] text-[var(--ink)]"
    } p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1720px] mx-auto`}>
      
      {/* 1. TOPBAR PADRONIZADA COM DESIGN SYSTEM ZUMA */}
      <header className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm ${
        modoIndustrial 
          ? "bg-slate-900 border-slate-800 text-white" 
          : "bg-[var(--surface)] border-[var(--line)]"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 animate-pulse text-orange-500" />
                KDS 2.0 Cozinha Inteligente
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Fire on Demand Sincronizado
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
                <Truck className="w-3 h-3" />
                GPS Tangará ({metrics.motoboysDisponiveis} motos livres)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
                {horarioAtual || "19:00:00"} · Tangará da Serra (UTC-4)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>Cozinha Inteligente & Expedição 360°</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-4xl leading-relaxed ${
              modoIndustrial ? "text-slate-400" : "text-[var(--muted)]"
            }`}>
              Controle de produção em 4 praças simultâneas com sincronização milimétrica entre Sushibar frio e Wok quente, despacho direto para o pool de motoboys GPS e notificação instantânea no salão e aplicativos.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Modo Comandas vs All-Day */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode("comandas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "comandas" ? "bg-orange-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Comandas ({comandas.length})
              </button>
              <button
                onClick={() => setViewMode("allday")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "allday" ? "bg-orange-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All-Day ({allDayItems.length} SKUs)</span>
              </button>
            </div>

            {/* Botão de Áudio SLA */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                somAtivo 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25" 
                  : "bg-slate-500/15 border-slate-500/30 text-slate-500 hover:bg-slate-500/25"
              }`}
              title={somAtivo ? "Desativar avisos sonoros de SLA" : "Ativar bipes de SLA e novos pedidos"}
            >
              {somAtivo ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
              <span>{somAtivo ? "Bip SLA Ativo" : "Silenciado"}</span>
            </button>

            {/* Alternar Modo Industrial */}
            <button
              onClick={() => setModoIndustrial(!modoIndustrial)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                modoIndustrial 
                  ? "bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20" 
                  : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
              }`}
            >
              {modoIndustrial ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{modoIndustrial ? "Tema Normal" : "Modo Monitor Cozinha"}</span>
            </button>

            {/* Simular Novo Pedido */}
            <button
              onClick={() => setModalNovoPedido(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simular Pedido</span>
            </button>

            {/* Histórico Despachados */}
            <button
              onClick={() => setDrawerHistorico(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                modoIndustrial 
                  ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" 
                  : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Concluídos ({comandasFinalizadas.length})</span>
            </button>

            {/* Atalhos Rápidos */}
            <Link href="/mesas">
              <button className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                modoIndustrial ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}>
                27 Mesas
              </button>
            </Link>
            <Link href="/entregador">
              <button className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                modoIndustrial ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}>
                App Motoboy
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HUD DE MÉTRICAS & INDICADORES DE PRODUÇÃO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className={`p-3.5 rounded-2xl border transition ${
          modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[var(--muted)]">
            <span>Comandas Fila</span>
            <Layers className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black">{metrics.total}</div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">{metrics.prontosExpedicao} prontas p/ entrega</div>
        </div>

        <div className={`p-3.5 rounded-2xl border transition ${
          modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[var(--muted)]">
            <span>SLA Crítico (&gt;25m)</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.atrasadas > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`} />
          </div>
          <div className={`text-2xl font-black ${metrics.atrasadas > 0 ? "text-red-500" : "text-emerald-500"}`}>
            {metrics.atrasadas}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">{metrics.alerta} em fase de alerta</div>
        </div>

        <div className={`p-3.5 rounded-2xl border transition ${
          modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[var(--muted)]">
            <span>Tempo Médio Hoje</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black">{metrics.tempoMedioFormat}</div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Meta operacional: 18m</div>
        </div>

        <div className={`p-3.5 rounded-2xl border transition ${
          modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[var(--muted)]">
            <span>Fire on Demand</span>
            <Flame className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-500">
            {comandas.filter(c => c.fireOnDemandAtivo && !c.fireLiberado).length}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Sushibar aguardando</div>
        </div>

        <div className={`p-3.5 rounded-2xl border transition ${
          modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[var(--muted)]">
            <span>Frota Motoboys</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">
            <span className="text-emerald-500">{metrics.motoboysDisponiveis}</span>
            <span className="text-sm font-normal text-[var(--muted)]"> livres / </span>
            <span className="text-blue-500">{metrics.motoboysEmRota}</span>
            <span className="text-sm font-normal text-[var(--muted)]"> rota</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Sincronizado PWA GPS</div>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL: MODO ALL-DAY OU COMANDAS */}
      {viewMode === "allday" ? (
        /* VISÃO ALL-DAY KDS: Consolidação por Praça para Produção em Lote */
        <div className="space-y-6">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black">ALL-DAY KDS • PRODUÇÃO CONSOLIDADA POR PRAÇA</h2>
                <p className="text-xs text-[var(--muted)]">Agrupamento em tempo real de todos os pratos pedidos no salão e delivery para preparo em lote.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                Atalho [A] Alternar
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["sushibar", "quente", "fritura"] as const).map(station => {
              const stationItems = allDayItems.filter(i => i.station === station);
              const stationTitle = station === "sushibar" ? "Sushibar Nobre & Frios" : station === "quente" ? "Cozinha Quente & Wok" : "Frituras & Hot Rolls";
              const stationColor = station === "sushibar" ? "border-blue-500/40 text-blue-400" : station === "quente" ? "border-orange-500/40 text-orange-400" : "border-amber-500/40 text-amber-400";
              
              return (
                <div key={station} className={`rounded-2xl border p-4 space-y-4 shadow-xl ${
                  modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
                }`}>
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${stationColor}`}>
                      <span>{stationTitle}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                      {stationItems.reduce((acc, i) => acc + (i.totalQty - i.readyQty), 0)} pendentes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stationItems.length === 0 ? (
                      <p className="text-xs text-[var(--muted)] italic py-4 text-center">Nenhum item pendente nesta praça.</p>
                    ) : (
                      stationItems.map(item => {
                        const pendente = item.totalQty - item.readyQty;
                        const pct = item.totalQty > 0 ? Math.round((item.readyQty / item.totalQty) * 100) : 0;

                        return (
                          <div key={item.name} className={`p-3 rounded-xl border space-y-2 ${
                            modoIndustrial ? "bg-slate-950 border-slate-800/80" : "bg-[var(--surface2)] border-[var(--line)]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-bold">{item.name}</h4>
                                <span className="text-[10px] text-[var(--muted)] font-mono">
                                  {item.comandaIds.length} comanda(s) aguardando
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-black font-mono text-orange-400">
                                  {pendente}x
                                </span>
                                <button
                                  onClick={() => produzirLoteAllDay(item.name, item.station)}
                                  disabled={pendente === 0}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11px] font-bold cursor-pointer transition shadow-xs"
                                >
                                  +1 Pronto
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] font-mono text-[var(--muted)]">
                                <span>{item.readyQty} prontos</span>
                                <span>Total: {item.totalQty}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISÃO COMANDAS TRADICIONAIS + FILTROS */
        <>
          {/* Praças e Canais de Filtro */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "todas", label: "Todas as 4 Praças", count: comandas.length, icon: Layers },
                { id: "sushibar", label: "Sushibar Nobre", count: comandas.filter(c => c.itens.some(i => i.station === "sushibar")).length, icon: Fish },
                { id: "quente", label: "Cozinha Quente & Wok", count: comandas.filter(c => c.itens.some(i => i.station === "quente")).length, icon: Flame },
                { id: "fritura", label: "Hot Rolls & Frituras", count: comandas.filter(c => c.itens.some(i => i.station === "fritura")).length, icon: Sparkles },
                { id: "expedicao", label: "Expedição Delivery", count: comandas.filter(c => c.origem === "delivery").length, icon: PackageCheck }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = stationFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStationFilter(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                        : modoIndustrial 
                        ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800" 
                        : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] border border-[var(--line)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isSelected ? "bg-black/30 text-white" : modoIndustrial ? "bg-slate-800 text-slate-300" : "bg-[var(--surface2)] text-[var(--ink)]"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 self-start sm:self-auto bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--line)]">
              {[
                { id: "todas", label: "Todos Canais" },
                { id: "mesa", label: "Salão (Mesas)" },
                { id: "delivery", label: "Delivery (App/iFood)" },
                { id: "balcao", label: "Balcão" }
              ].map(orig => (
                <button
                  key={orig.id}
                  onClick={() => setOrigemFilter(orig.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    origemFilter === orig.id
                      ? "bg-orange-600 text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {orig.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerta Visual de Cancelamento e Reaproveitamento Inteligente */}
          {cancelAlert && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/95 via-red-900/90 to-red-950/95 border-2 border-red-500 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-red-600 rounded-xl animate-bounce shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs tracking-wider uppercase px-2.5 py-0.5 rounded bg-red-800 border border-red-400 text-white">
                      ALERTA URGENTE COZINHA • ITEM CANCELADO
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-red-200">
                      Mesa #{String(cancelAlert.tableNumber).padStart(2, "0")} • {cancelAlert.timestamp}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      por {cancelAlert.cancelledBy}
                    </span>
                  </div>
                  <p className="text-base font-black text-white mt-1">
                    Prato: <span className="text-amber-300 underline underline-offset-4">{cancelAlert.itemName}</span> {cancelAlert.reason && <span className="text-xs font-normal text-zinc-300">({cancelAlert.reason})</span>}
                  </p>
                  {cancelAlert.reallocatedTo ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg">
                      <span>♻️</span>
                      <span>REAPROVEITAMENTO INTELIGENTE (ZERO DESPERDÍCIO): Produção transferida automaticamente para <strong>{cancelAlert.reallocatedTo.identifier}</strong>! Não descarte o prato.</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg">
                      <span>🛑</span>
                      <span>INTERROMPER PREPARO IMEDIATAMENTE: Suspender cocção/montagem no pass para evitar desperdício de insumos.</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    if (somAtivo) kdsAudio.playReadyChime();
                    setCancelAlert(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-black rounded-xl border border-white/30 transition cursor-pointer"
                >
                  ✓ Ciente / Fechar Alerta
                </button>
              </div>
            </div>
          )}

          {/* Grid de Comandas */}
          {comandasFiltradas.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              modoIndustrial ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
            }`}>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Nenhuma comanda pendente nesta praça!</h3>
              <p className="text-xs text-[var(--muted)] mt-1">Todas as preparações foram finalizadas ou filtradas. Bom trabalho à equipe!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comandasFiltradas.map(cmd => {
                const minutos = cmd.segundosDecorridos / 60;
                const statusSla = minutos > cmd.slaMinutos ? "atrasado" : minutos > cmd.slaMinutos * 0.75 ? "alerta" : "ok";
                const activeItens = cmd.itens.filter(i => i.status !== "cancelado");
                const todosProntos = activeItens.length > 0 && activeItens.every(i => i.status === "pronto");

                return (
                  <div 
                    key={cmd.id}
                    className={`flex flex-col rounded-2xl border transition shadow-xl ${
                      statusSla === "atrasado" 
                        ? "border-red-500/80 shadow-red-500/10 ring-1 ring-red-500/50" 
                        : statusSla === "alerta"
                        ? "border-amber-500/80 shadow-amber-500/10"
                        : modoIndustrial ? "border-slate-800 bg-slate-900" : "border-[var(--line)] bg-[var(--surface)]"
                    }`}
                  >
                    {/* Header da Comanda */}
                    <div className="p-3.5 border-b border-[var(--line)] flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black tracking-tight">#{cmd.numero}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cmd.origem === "mesa" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          }`}>
                            {cmd.origem}
                          </span>
                        </div>
                        <p className="text-xs font-bold mt-0.5 truncate max-w-[200px]">{cmd.identificador}</p>
                        {cmd.clienteNome && (
                          <p className="text-[11px] text-[var(--muted)] truncate">{cmd.clienteNome}</p>
                        )}
                      </div>

                      {/* SLA Timer */}
                      <div className={`flex flex-col items-end px-2.5 py-1 rounded-xl font-mono text-xs font-black ${
                        statusSla === "atrasado" 
                          ? "bg-red-500 text-white animate-pulse" 
                          : statusSla === "alerta"
                          ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                          : "bg-black/5 dark:bg-white/5 text-[var(--ink)]"
                      }`}>
                        <span>{formatMinSec(cmd.segundosDecorridos)}</span>
                        <span className="text-[9px] opacity-75">SLA {cmd.slaMinutos}m</span>
                      </div>
                    </div>

                    {/* Banner de Fire on Demand */}
                    {cmd.fireOnDemandAtivo && (
                      <div className={`p-2.5 border-b text-xs flex items-center justify-between ${
                        cmd.fireLiberado 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                          : "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-bold text-[11px]">
                            {cmd.fireLiberado ? "Fire Liberado (Grelhando)" : "Fire on Demand Travado"}
                          </span>
                        </div>
                        {!cmd.fireLiberado && (
                          <button
                            onClick={() => liberarFireOnDemand(cmd.id)}
                            className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
                          >
                            Liberar Wok/Fritura
                          </button>
                        )}
                      </div>
                    )}

                    {/* Lista de Itens da Comanda */}
                    <div className="p-3.5 space-y-2.5 flex-1">
                      {cmd.itens.map(item => {
                        const isCancelado = item.status === "cancelado";
                        const isPronto = item.status === "pronto";
                        const isPrep = item.status === "preparando";

                        return (
                          <div 
                            key={item.id}
                            onClick={() => !isCancelado && marcarItemPronto(cmd.id, item.id)}
                            className={`p-2.5 rounded-xl border transition select-none ${
                              isCancelado
                                ? "bg-red-500/15 border-red-500/50 text-red-400 cursor-not-allowed"
                                : isPronto 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-pointer" 
                                : isPrep
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 cursor-pointer"
                                : "bg-[var(--surface2)] border-[var(--line)] cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black ${
                                  isCancelado
                                    ? "bg-red-600 text-white line-through"
                                    : isPronto ? "bg-emerald-600 text-white" : "bg-black/10 dark:bg-white/10"
                                }`}>
                                  {item.qty}x
                                </span>
                                <div>
                                  <h4 className={`text-xs font-bold leading-snug ${
                                    isCancelado ? "line-through text-red-400 opacity-90" : isPronto ? "line-through opacity-80" : ""
                                  }`}>
                                    {item.name}
                                  </h4>
                                  <span className="text-[10px] text-[var(--muted)] font-mono uppercase">
                                    Praça: {item.station}
                                  </span>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isCancelado
                                  ? "bg-red-600 text-white animate-pulse"
                                  : isPronto 
                                  ? "bg-emerald-500 text-white" 
                                  : isPrep 
                                  ? "bg-orange-500 text-white" 
                                  : "bg-slate-700 text-slate-300"
                              }`}>
                                {isCancelado ? "CANCELADO" : item.status}
                              </span>
                            </div>

                            {/* Alerta de Cancelamento ou Reaproveitamento no Card */}
                            {isCancelado && (
                              <div className="mt-1.5 pl-7 text-[10px]">
                                {item.reallocatedTo ? (
                                  <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
                                    <span>♻️</span>
                                    <span>Produção repassada para {item.reallocatedTo} (Zero Desperdício)</span>
                                  </div>
                                ) : (
                                  <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 font-bold flex items-center gap-1">
                                    <span>🛑</span>
                                    <span>INTERROMPER PREPARO IMEDIATAMENTE ({item.cancelReason || "Desistência"})</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Badge de Produção Adiantada/Reaproveitada de outra mesa */}
                            {item.reallocatedFrom && (
                              <div className="mt-1.5 pl-7 text-[10px]">
                                <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                                  <span>♻️</span>
                                  <span>PRODUÇÃO REAPROVEITADA DA {item.reallocatedFrom} (Zero Desperdício) - Priorizar Entrega!</span>
                                </div>
                              </div>
                            )}

                            {item.observacoes && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic pl-7">
                                ⚠ {item.observacoes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Rodapé da Comanda: Botões de Ação */}
                    <div className="p-3 border-t border-[var(--line)] space-y-2">
                      {cmd.origem === "mesa" ? (
                        <button
                          disabled={!todosProntos}
                          onClick={() => handleLiberarMesaParaGarcom(cmd)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                          <span>Liberar p/ Garçom no Pass</span>
                        </button>
                      ) : (
                        <button
                          disabled={!todosProntos}
                          onClick={() => handleAbrirModalDespacho(cmd)}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Despachar Motoboy GPS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* BUMP BAR VIRTUAL INTERATIVO & ATALHOS DE TECLADO / PEDAIS */}
      <div className="sticky bottom-2 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <strong className="text-white">BUMP BAR TOUCH &amp; HARDWARE</strong>
          <span className="text-[11px] text-slate-400 hidden sm:inline">· Atalhos de teclado [1..4, A, F, Enter, Space] ou pedais</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            onClick={() => setStationFilter("sushibar")}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold border transition ${
              stationFilter === "sushibar" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            [1] Sushibar
          </button>
          <button
            onClick={() => setStationFilter("quente")}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold border transition ${
              stationFilter === "quente" ? "bg-orange-600 text-white border-orange-500" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            [2] Quente
          </button>
          <button
            onClick={() => setStationFilter("fritura")}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold border transition ${
              stationFilter === "fritura" ? "bg-amber-600 text-white border-amber-500" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            [3] Fritura
          </button>
          <button
            onClick={() => setStationFilter("expedicao")}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold border transition ${
              stationFilter === "expedicao" ? "bg-purple-600 text-white border-purple-500" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            [4] Expedição
          </button>
          <button
            onClick={() => setViewMode(prev => prev === "comandas" ? "allday" : "comandas")}
            className="px-2.5 py-1 rounded-lg font-mono font-bold bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700"
          >
            [A] All-Day
          </button>
          <button
            onClick={() => {
              const cmd = comandas.find(c => c.itens.every(i => i.status === "pronto"));
              if (cmd) {
                if (cmd.origem === "mesa") handleLiberarMesaParaGarcom(cmd);
                else handleAbrirModalDespacho(cmd);
              }
            }}
            className="px-3 py-1 rounded-lg font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-xs"
          >
            [ENTER] Despachar
          </button>
        </div>
      </div>

      {/* 5. MODAL DE DESPACHO COM MOTOBOY */}
      {modalDespacho && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-500" />
                  Expedição &amp; Despacho • Pedido #{modalDespacho.numero}
                </h3>
                <p className="text-xs text-[var(--muted)]">{modalDespacho.clienteNome} • {modalDespacho.bairro || "Tangará da Serra"}</p>
              </div>
              <button onClick={() => setModalDespacho(null)} className="p-1 text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist de Conferência */}
            {modalDespacho.checklistExpedicao && (
              <div className="space-y-2">
                <label className="text-xs font-bold block">Checklist de Saída e Lacração</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "hashi", label: "Hashis Inclusos" },
                    { key: "shoyuSache", label: "Sachês Shoyu" },
                    { key: "molhoTare", label: "Tarê Extra" },
                    { key: "gengibreWasabi", label: "Wasabi & Gengibre" },
                    { key: "lacreInviolavel", label: "Lacre de Segurança" }
                  ].map(chk => {
                    const k = chk.key as keyof NonNullable<Comanda["checklistExpedicao"]>;
                    const checked = modalDespacho.checklistExpedicao![k];
                    return (
                      <button
                        key={chk.key}
                        onClick={() => toggleChecklist(modalDespacho.id, k)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition ${
                          checked ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)]"
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${checked ? "text-emerald-500" : "text-[var(--muted)]"}`} />
                        <span>{chk.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seleção do Motoboy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">Selecionar Entregador da Frota GPS</label>
              <select
                value={selectedMotoboyId}
                onChange={e => setSelectedMotoboyId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
              >
                {motoboysData?.map(mb => (
                  <option key={mb.id} value={mb.id}>
                    {mb.name} • {mb.plate} ({mb.status === "disponivel" ? "Livre" : "Em rota"})
                  </option>
                ))}
              </select>
            </div>

            {/* WhatsApp automático */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">Mensagem WhatsApp p/ Cliente</label>
              <textarea
                value={mensagemWhatsappPersonalizada}
                onChange={e => setMensagemWhatsappPersonalizada(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => setModalDespacho(null)}
                className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={enviandoDespacho}
                onClick={handleConfirmarDespachoMotoboy}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>{enviandoDespacho ? "Despachando..." : "Confirmar & Chamar GPS"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE SIMULAÇÃO DE NOVO PEDIDO */}
      {modalNovoPedido && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-base font-black flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-500" />
                Injetar Pedido Rápido de Teste
              </h3>
              <button onClick={() => setModalNovoPedido(false)} className="p-1 text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Canal de Origem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimOrigem("delivery")}
                    className={`py-2 rounded-xl border font-bold text-center ${
                      simOrigem === "delivery" ? "bg-purple-600 text-white border-purple-500" : "bg-[var(--surface2)] border-[var(--line)]"
                    }`}
                  >
                    Delivery (iFood/App)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimOrigem("mesa")}
                    className={`py-2 rounded-xl border font-bold text-center ${
                      simOrigem === "mesa" ? "bg-blue-600 text-white border-blue-500" : "bg-[var(--surface2)] border-[var(--line)]"
                    }`}
                  >
                    Salão (Mesa)
                  </button>
                </div>
              </div>

              {simOrigem === "delivery" ? (
                <>
                  <div>
                    <label className="font-bold block mb-1">Nome do Cliente</label>
                    <input
                      type="text"
                      value={simCliente}
                      onChange={e => setSimCliente(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Bairro de Entrega</label>
                    <select
                      value={simBairro}
                      onChange={e => setSimBairro(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]"
                    >
                      {BAIRROS_TANGARA.map(b => (
                        <option key={b.nome} value={b.nome}>{b.nome} (Taxa R$ {b.taxa.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="font-bold block mb-1">Número da Mesa (01 a 27)</label>
                  <input
                    type="number"
                    min={1}
                    max={27}
                    value={simMesaNum}
                    onChange={e => setSimMesaNum(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-700 dark:text-orange-400">
                ✨ Este pedido inclui <strong>Hot Roll Frito</strong> e <strong>Sashimi Trufado</strong> com <strong>Fire on Demand ativado</strong> para demonstrar a sincronização fria/quente!
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => setModalNovoPedido(false)}
                className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSimularPedido}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
              >
                Injetar Pedido no KDS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DRAWER DE COMANDAS CONCLUÍDAS HOJE */}
      {drawerHistorico && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-[var(--surface)] text-[var(--ink)] border-l border-[var(--line)] w-full max-w-md h-full p-5 space-y-4 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Comandas Concluídas na Sessão
                </h3>
                <p className="text-xs text-[var(--muted)]">Histórico de pratos entregues no pass e despachados</p>
              </div>
              <button onClick={() => setDrawerHistorico(false)} className="p-1 text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {comandasFinalizadas.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted)]">
                Nenhum pedido despachado nesta sessão ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {comandasFinalizadas.map(fin => (
                  <div key={fin.id} className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">#{fin.numero}</span>
                      <span className="text-[10px] text-[var(--muted)] font-mono">{fin.finalizadoAs}</span>
                    </div>
                    <p className="font-bold">{fin.identificador}</p>
                    <div className="text-[11px] text-[var(--muted)]">
                      {fin.itens.map(i => `${i.qty}x ${i.name}`).join(", ")}
                    </div>
                    {fin.motoboyAtribuido && (
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Despachado com: {fin.motoboyAtribuido}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatMinSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default CozinhaKds2;
