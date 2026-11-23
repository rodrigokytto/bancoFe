// ==============================================================================
// BARRAMENTO DE SINCRONIZAÇÃO POR EVENTO INTERNO: ULTRA x NOSSA GENTE
// Abordagem priorizada: Eventos em memória (CustomEvent) + StorageEvent cross-tab
// Zuma Cozinha Oriental · Tangará da Serra (MT)
// ==============================================================================

import { UltraSyncEvent } from "@shared/ultraData";

const ULTRA_EVENT_NAME = "ultra_internal_sync_event";
const ULTRA_STORAGE_KEY = "ultra_last_sync_event";
const ULTRA_EVENTS_LOG_KEY = "ultra_events_history_log";

export const ultraEventBus = {
  // Dispara evento interno com persistência local e propagação cross-tab
  emit(event: UltraSyncEvent) {
    if (typeof window === "undefined") return;

    // 1. Atualizar histórico local
    try {
      const existing = this.getHistory();
      const updated = [event, ...existing.slice(0, 49)];
      localStorage.setItem(ULTRA_EVENTS_LOG_KEY, JSON.stringify(updated));
      localStorage.setItem(ULTRA_STORAGE_KEY, JSON.stringify(event));
    } catch (e) {
      console.warn("[UltraSync] Erro ao gravar evento no localStorage:", e);
    }

    // 2. Disparar CustomEvent em memória
    const customEvent = new CustomEvent(ULTRA_EVENT_NAME, { detail: event });
    window.dispatchEvent(customEvent);
  },

  // Inscrever ouvinte para receber eventos de sincronização interna
  subscribe(callback: (event: UltraSyncEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const localHandler = (e: Event) => {
      const ce = e as CustomEvent<UltraSyncEvent>;
      if (ce.detail) {
        callback(ce.detail);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === ULTRA_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          console.warn("[UltraSync] Erro ao parsear storage event:", err);
        }
      }
    };

    window.addEventListener(ULTRA_EVENT_NAME, localHandler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(ULTRA_EVENT_NAME, localHandler);
      window.removeEventListener("storage", storageHandler);
    };
  },

  // Obter histórico de eventos
  getHistory(): UltraSyncEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(ULTRA_EVENTS_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Limpar histórico
  clearHistory() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(ULTRA_EVENTS_LOG_KEY);
      localStorage.removeItem(ULTRA_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  }
};
