type EventHandler = (event: IntegrationEvent) => Promise<void> | void;

export interface IntegrationEvent {
  id: string;
  topic: string;
  timestamp: string;
  source: string;
  data: Record<string, any>;
}

export class IntegrationEventBus {
  private static instance: IntegrationEventBus;
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventLog: IntegrationEvent[] = [];

  private constructor() {}

  public static getInstance(): IntegrationEventBus {
    if (!IntegrationEventBus.instance) {
      IntegrationEventBus.instance = new IntegrationEventBus();
    }
    return IntegrationEventBus.instance;
  }

  public subscribe(topic: string, handler: EventHandler): void {
    const list = this.handlers.get(topic) || [];
    list.push(handler);
    this.handlers.set(topic, list);
  }

  public async publish(topic: string, source: string, data: Record<string, any>): Promise<IntegrationEvent> {
    const event: IntegrationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topic,
      source,
      timestamp: new Date().toISOString(),
      data,
    };

    this.eventLog.unshift(event);
    if (this.eventLog.length > 200) {
      this.eventLog.pop();
    }

    const listeners = this.handlers.get(topic) || [];
    const wildcardListeners = this.handlers.get('*') || [];

    const allListeners = [...listeners, ...wildcardListeners];
    for (const listener of allListeners) {
      try {
        await listener(event);
      } catch (err) {
        console.error(`[EventBus] Erro ao processar evento ${topic}:`, err);
      }
    }

    return event;
  }

  public getRecentEvents(limit: number = 50): IntegrationEvent[] {
    return this.eventLog.slice(0, limit);
  }
}
