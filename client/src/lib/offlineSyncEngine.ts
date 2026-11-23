import { useState, useEffect, useCallback } from "react";
import { trpc } from "./trpc";
import { toast } from "sonner";

export interface OfflineOperation {
  id: string;
  type:
    | "abrir_mesa"
    | "adicionar_item"
    | "modificar_item"
    | "remover_item"
    | "editar_mesa"
    | "salvar_mesa"
    | "pagar_split"
    | "fechar_mesa"
    | "nfce_contingencia";
  tableNumber: number;
  payload?: any;
  timestamp: string;
  operator?: string;
}

const STORAGE_QUEUE_KEY = "zuma_offline_sync_queue_v1";
const STORAGE_TABLES_CACHE_KEY = "zuma_offline_tables_cache_v1";
const STORAGE_LAST_SYNC_KEY = "zuma_offline_last_sync_v1";
const STORAGE_SIMULATED_OFFLINE_KEY = "zuma_simulated_offline_v1";

// Gera ou recupera um Device ID único para o terminal/tablet
export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem("zuma_device_id");
  if (!devId) {
    const isWindows = navigator.userAgent.includes("Windows");
    const isMac = navigator.userAgent.includes("Macintosh");
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const prefix = isWindows ? "WIN" : isMac ? "MAC" : isIos ? "IOS" : "POS";
    devId = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    localStorage.setItem("zuma_device_id", devId);
  }
  return devId;
}

export function getOfflineQueue(): OfflineOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineOperation[]): void {
  try {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event("zuma_offline_queue_changed"));
  } catch (err) {
    console.warn("[OfflineSyncEngine] Erro ao salvar fila no localStorage:", err);
  }
}

export function addOperationToOfflineQueue(
  type: OfflineOperation["type"],
  tableNumber: number,
  payload?: any,
  operator: string = "Terminal Offline"
): OfflineOperation {
  const queue = getOfflineQueue();
  const op: OfflineOperation = {
    id: `OP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    type,
    tableNumber,
    payload,
    timestamp: new Date().toISOString(),
    operator,
  };
  queue.push(op);
  saveOfflineQueue(queue);
  return op;
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_QUEUE_KEY);
  window.dispatchEvent(new Event("zuma_offline_queue_changed"));
}

export function getCachedTables(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_TABLES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheTablesLocally(tables: any[]): void {
  try {
    localStorage.setItem(STORAGE_TABLES_CACHE_KEY, JSON.stringify(tables));
  } catch (err) {
    console.warn("[OfflineSyncEngine] Falha ao cachear mesas:", err);
  }
}

export function useOfflineSync() {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_SIMULATED_OFFLINE_KEY) === "true";
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const sim = localStorage.getItem(STORAGE_SIMULATED_OFFLINE_KEY) === "true";
    return !sim && (typeof navigator !== "undefined" ? navigator.onLine : true);
  });

  const [pendingQueue, setPendingQueue] = useState<OfflineOperation[]>(getOfflineQueue);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
  });

  const syncMutation = trpc.zuma.syncOfflineBatch.useMutation();
  const utils = trpc.useUtils();

  // Monitora conexões de rede e simulação
  useEffect(() => {
    const handleOnline = () => {
      if (!isSimulatedOffline) {
        setIsOnline(true);
        toast.success("Conexão com a Nuvem restabelecida!", {
          description: "Iniciando sincronização automática dos dados...",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Modo Offline Ativado", {
        description: "Operação local contínua. Os pedidos serão sincronizados quando a internet voltar.",
      });
    };

    const handleQueueChange = () => {
      setPendingQueue(getOfflineQueue());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("zuma_offline_queue_changed", handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("zuma_offline_queue_changed", handleQueueChange);
    };
  }, [isSimulatedOffline]);

  // Alternador de simulação offline (para testes operacionais)
  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_SIMULATED_OFFLINE_KEY, String(next));
      setIsOnline(!next && navigator.onLine);
      if (next) {
        toast.warning("Simulação de Queda de Internet Ativada", {
          description: "O sistema agora opera 100% offline localmente.",
        });
      } else {
        toast.success("Simulação de Queda de Internet Desativada", {
          description: "Conexão restaurada com Google Cloud Run.",
        });
      }
      return next;
    });
  }, []);

  // Executa sincronização com o Cloud Run
  const syncNow = useCallback(async (): Promise<{ success: boolean; processed: number; errors: string[] }> => {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      // Se não há fila de envio, apenas atualiza as mesas da nuvem
      try {
        await utils.zuma.listTables.refetch();
        const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSyncTime(now);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, now);
        return { success: true, processed: 0, errors: [] };
      } catch (err: any) {
        return { success: false, processed: 0, errors: [err.message] };
      }
    }

    if (!isOnline) {
      toast.error("Impossível sincronizar sem conexão", {
        description: "Verifique seu Wi-Fi / Cabo de rede ou desative a simulação offline.",
      });
      return { success: false, processed: 0, errors: ["Sem conexão com a nuvem"] };
    }

    setIsSyncing(true);
    const deviceId = getOrCreateDeviceId();

    try {
      const result = await syncMutation.mutateAsync({
        deviceId,
        operator: "Sincronizador Automático Zuma",
        operations: queue as any,
      });

      if (result.success) {
        // Limpa a fila sincronizada com sucesso
        clearOfflineQueue();
        setPendingQueue([]);
        const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSyncTime(now);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, now);

        // Cacheia novas mesas
        if (result.tables) {
          cacheTablesLocally(result.tables);
        }

        // Atualiza consultas tRPC ativas no cliente
        await utils.zuma.listTables.refetch();

        toast.success("Nuvem e PDV 100% Sincronizados!", {
          description: `${result.processedCount} operações enviadas com sucesso ao Cloud Run.`,
        });

        return {
          success: true,
          processed: result.processedCount,
          errors: result.errors || [],
        };
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      toast.error("Falha ao sincronizar com Cloud Run", {
        description: err.message || "Tentaremos novamente em instantes de forma automática.",
      });
      return {
        success: false,
        processed: 0,
        errors: [err.message || "Erro desconhecido"],
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, syncMutation, utils]);

  // Se voltar online e tiver itens pendentes, tenta sincronizar automaticamente
  useEffect(() => {
    if (isOnline && pendingQueue.length > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        syncNow();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingQueue.length, isSyncing, syncNow]);

  return {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingCount: pendingQueue.length,
    pendingOperations: pendingQueue,
    isSyncing,
    lastSyncTime,
    syncNow,
    queueAction: addOperationToOfflineQueue,
    clearQueue: clearOfflineQueue,
    deviceId: getOrCreateDeviceId(),
  };
}
