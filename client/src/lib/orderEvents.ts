// Sistema de Sincronização por Evento Interno Zuma 360°
// Prioriza abordagem de eventos internos com propagação em memória e cross-tab via StorageEvent

export interface SimulatedOrderEvent {
  orderId: string;
  timestamp: string;
  channel: "mesa" | "delivery" | "ifood";
  tableNumber?: number;
  customerName: string;
  items: Array<{
    name: string;
    praça: "sushibar" | "quente" | "fritura" | "bar" | "expedicao";
    fireOnDemand?: boolean;
    prepMinutes: number;
    price: number;
    salmonWeightGrams: number;
  }>;
  totalValue: number;
  status: "novo" | "preparo" | "concluido";
}

export interface MotoboyDispatchedDeliveryEvent {
  id: string;
  pedidoId: string;
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
    bairro: string;
    complemento?: string;
    lat: number;
    lng: number;
  };
  itens: string;
  taxaEntrega: number;
  valorTotal: number;
  formaPagamento: string;
  status: "aguardando" | "em_rota" | "entregue";
  codigoOtp: string;
  distanciaKm: number;
  tempoEstimadoMin: number;
  motoboyId: string;
  motoboyNome: string;
  motoboyPlaca?: string;
  timestamp: string;
}

export interface MesaDishReadyEvent {
  tableNumber: number;
  orderNumber: number;
  items: string[];
  station: string;
  waiter?: string;
  timestamp: string;
}

export interface TableClosedEvent {
  tableNumber: number;
  total: number;
  paymentMethod: string;
  operator: string;
  nfcNumber?: string;
  splitCount?: number;
  canal?: string;
  timestamp: string;
}

export interface ItemCancelledEvent {
  tableNumber: number;
  orderNumber?: number;
  itemIndex: number;
  itemName: string;
  itemPrice: number;
  cancelledBy: string;
  reason?: string;
  reallocatedTo?: {
    type: "mesa" | "delivery" | "ifood" | "balcao";
    identifier: string;
    orderId?: string;
  } | null;
  timestamp: string;
}

const EVENT_NAME = "zuma_internal_order_event";
const STORAGE_KEY = "zuma_last_simulated_order";

const DISPATCH_EVENT_NAME = "zuma_motoboy_dispatch_event";
const DISPATCH_STORAGE_KEY = "zuma_last_dispatched_delivery";

const MESA_READY_EVENT_NAME = "zuma_mesa_dish_ready_event";
const MESA_READY_STORAGE_KEY = "zuma_last_mesa_dish_ready";

const TABLE_CLOSED_EVENT_NAME = "zuma_table_closed_event";
const TABLE_CLOSED_STORAGE_KEY = "zuma_last_table_closed";

const ITEM_CANCELLED_EVENT_NAME = "zuma_item_cancelled_event";
const ITEM_CANCELLED_STORAGE_KEY = "zuma_last_item_cancelled";

export const orderEventBus = {
  // Dispara evento interno de novo pedido sincronizado
  emit(order: SimulatedOrderEvent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch (e) {
      console.warn("Erro ao salvar no storage:", e);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(EVENT_NAME, { detail: order });
      window.dispatchEvent(customEvent);
    }
  },

  // Inscreve ouvinte para receber eventos de novos pedidos
  subscribe(callback: (order: SimulatedOrderEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<SimulatedOrderEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("Erro ao parsear storage event:", err);
        }
      }
    };

    window.addEventListener(EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  // Dispara evento de despacho para a frota de motoboys
  emitDispatchToMotoboy(delivery: MotoboyDispatchedDeliveryEvent) {
    try {
      localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(delivery));
    } catch (e) {
      console.warn("Erro ao salvar despacho no storage:", e);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(DISPATCH_EVENT_NAME, { detail: delivery });
      window.dispatchEvent(customEvent);
    }
  },

  // Inscreve ouvinte no App do Entregador para receber despachos da cozinha KDS
  subscribeDispatchToMotoboy(callback: (delivery: MotoboyDispatchedDeliveryEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<MotoboyDispatchedDeliveryEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === DISPATCH_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("Erro ao parsear dispatch storage event:", err);
        }
      }
    };

    window.addEventListener(DISPATCH_EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(DISPATCH_EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  // Dispara evento de prato de mesa pronto no pass para o garçom
  emitMesaDishReady(mesaReady: MesaDishReadyEvent) {
    try {
      localStorage.setItem(MESA_READY_STORAGE_KEY, JSON.stringify(mesaReady));
    } catch (e) {
      console.warn("Erro ao salvar mesa ready no storage:", e);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(MESA_READY_EVENT_NAME, { detail: mesaReady });
      window.dispatchEvent(customEvent);
    }
  },

  // Inscreve ouvinte no Salão/Mesas para receber avisos da cozinha
  subscribeMesaDishReady(callback: (mesaReady: MesaDishReadyEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<MesaDishReadyEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === MESA_READY_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("Erro ao parsear mesa ready storage event:", err);
        }
      }
    };

    window.addEventListener(MESA_READY_EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(MESA_READY_EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  // Dispara evento de mesa encerrada/baixada (sincronização instantânea PDV, Salão e Garçom)
  emitTableClosed(tableClosed: TableClosedEvent) {
    try {
      localStorage.setItem(TABLE_CLOSED_STORAGE_KEY, JSON.stringify(tableClosed));
    } catch (e) {
      console.warn("Erro ao salvar mesa fechada no storage:", e);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(TABLE_CLOSED_EVENT_NAME, { detail: tableClosed });
      window.dispatchEvent(customEvent);
    }
  },

  // Inscreve ouvinte para receber encerramento e liberação de mesas em tempo real
  subscribeTableClosed(callback: (tableClosed: TableClosedEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<TableClosedEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === TABLE_CLOSED_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("Erro ao parsear table closed storage event:", err);
        }
      }
    };

    window.addEventListener(TABLE_CLOSED_EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(TABLE_CLOSED_EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  // Dispara evento de item cancelado na comanda para a Cozinha KDS (com auditoria e reaproveitamento)
  emitItemCancelled(cancelled: ItemCancelledEvent) {
    try {
      localStorage.setItem(ITEM_CANCELLED_STORAGE_KEY, JSON.stringify(cancelled));
    } catch (e) {
      console.warn("Erro ao salvar cancelamento no storage:", e);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(ITEM_CANCELLED_EVENT_NAME, { detail: cancelled });
      window.dispatchEvent(customEvent);
    }
  },

  // Inscreve ouvinte no KDS / Cozinha para alertas sonoros e visuais de cancelamento
  subscribeItemCancelled(callback: (cancelled: ItemCancelledEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<ItemCancelledEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === ITEM_CANCELLED_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("Erro ao parsear item cancelled storage event:", err);
        }
      }
    };

    window.addEventListener(ITEM_CANCELLED_EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(ITEM_CANCELLED_EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  getLastOrder(): SimulatedOrderEvent | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
