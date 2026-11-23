import type { BarramentoEventos } from "./plataforma-compat.ts";

export const EVENTOS_CONSULTA360 = [
  "consulta360.consulta.realizada",
  "consulta360.grafo.atualizado",
  "consulta360.alerta.risco",
  "consulta360.dossie.exportado",
] as const;

export type TipoEventoConsulta360 = (typeof EVENTOS_CONSULTA360)[number];

export interface EventoConsultaRealizada {
  protocolo: string;
  documento: string;
  tipoPessoa: "PF" | "PJ";
  nome: string;
  scoreKytto: number;
  rating: string;
  consultadoEm: string;
  tenantId: string;
}

export interface EventoAlertaRisco {
  protocolo: string;
  documento: string;
  nome: string;
  motivoAlerta: string;
  criticidade: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  tenantId: string;
}

/**
 * Publicador oficial de eventos do módulo Consulta360
 */
export class PublicadorEventosConsulta360 {
  constructor(private eventos?: BarramentoEventos) {}

  async publicarConsultaRealizada(evento: EventoConsultaRealizada): Promise<void> {
    if (!this.eventos) return;
    await this.eventos.publicar("consulta360.consulta.realizada", evento);
  }

  async publicarAlertaRisco(evento: EventoAlertaRisco): Promise<void> {
    if (!this.eventos) return;
    await this.eventos.publicar("consulta360.alerta.risco", evento);
  }
}
