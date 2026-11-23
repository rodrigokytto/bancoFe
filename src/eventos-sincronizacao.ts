import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import type { DossieConsulta360Completo } from "./tipos.ts";

export interface EventoInternoBase {
  idEvento: string;
  topico: string;
  timestamp: string;
  origem: "NOSSA_GENTE" | "ULTRA" | "CONSULTA360";
  destino: "NOSSA_GENTE" | "ULTRA" | "AMBOS";
  tenantId: string;
  hashIntegridade: string;
}

export interface EventoColaboradorAdmitido extends EventoInternoBase {
  topico: "interno.nossa_gente.colaborador.admitido";
  origem: "NOSSA_GENTE";
  payload: {
    cpf: string;
    nomeCompleto: string;
    cargo: string;
    departamento: string;
    remuneracaoCentavos: number;
    dataAdmissao: string;
    empresaCnpj: string;
  };
}

export interface EventoFornecedorHomologado extends EventoInternoBase {
  topico: "interno.ultra.fornecedor.homologado";
  origem: "ULTRA";
  payload: {
    cnpj: string;
    razaoSocial: string;
    categoriaFornecimento: string;
    valorContratoGlobalCentavos: number;
    obraVinculada: string;
    exigeDueDiligenceEsg: boolean;
  };
}

export interface EventoSincronizacaoScore extends EventoInternoBase {
  topico: "interno.consulta360.score.atualizado";
  origem: "CONSULTA360";
  payload: {
    documento: string;
    nome: string;
    scoreKytto360: number;
    rating: string;
    limiteLocacaoCentavos: number;
    limiteFinanciamentoCentavos: number;
    apontamentosCriticos: number;
  };
}

export type EventoInternoPlataforma = EventoColaboradorAdmitido | EventoFornecedorHomologado | EventoSincronizacaoScore;

export type TratadorEventoInterno = (evento: EventoInternoPlataforma) => Promise<void> | void;

/**
 * Barramento Corporativo de Sincronização por Evento Interno
 * Comunicação direta e atômica entre os sistemas Nossa Gente e Ultra Construtora
 */
export class BarramentoSincronizacaoInterna {
  private emissor = new EventEmitter();
  private historicoEventos: EventoInternoPlataforma[] = [];

  constructor() {
    this.emissor.setMaxListeners(50);
  }

  /**
   * Registra um ouvinte para um tópico de evento interno
   */
  inscrever(topico: string, tratador: TratadorEventoInterno): void {
    this.emissor.on(topico, async (evento: EventoInternoPlataforma) => {
      try {
        await tratador(evento);
      } catch (err) {
        console.error(`[Eventos Internos] Erro no processamento do tópico ${topico}:`, err);
      }
    });
  }

  /**
   * Publica evento interno com hash SHA-256 e entrega síncrona/assíncrona
   */
  async publicarEventoInterno<T extends EventoInternoPlataforma>(
    evento: Omit<T, "idEvento" | "timestamp" | "hashIntegridade">,
  ): Promise<T> {
    const timestamp = new Date().toISOString();
    const idEvento = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const payloadString = JSON.stringify(evento);
    const hashIntegridade = createHash("sha256").update(`${idEvento}:${timestamp}:${payloadString}`).digest("hex");

    const eventoCompleto = {
      ...evento,
      idEvento,
      timestamp,
      hashIntegridade,
    } as T;

    this.historicoEventos.push(eventoCompleto);
    if (this.historicoEventos.length > 500) {
      this.historicoEventos.shift();
    }

    this.emissor.emit(eventoCompleto.topico, eventoCompleto);
    return eventoCompleto;
  }

  /**
   * Dispara sincronização a partir de um dossiê concluído
   */
  async sincronizarDossie(dossie: DossieConsulta360Completo): Promise<EventoSincronizacaoScore> {
    return this.publicarEventoInterno<EventoSincronizacaoScore>({
      topico: "interno.consulta360.score.atualizado",
      origem: "CONSULTA360",
      destino: "AMBOS",
      tenantId: dossie.tenantId,
      payload: {
        documento: dossie.identificacao.documento,
        nome: dossie.identificacao.nomeCompleto,
        scoreKytto360: dossie.capacidadeCredito.scoreKytto360,
        rating: dossie.capacidadeCredito.classificacaoRating,
        limiteLocacaoCentavos: dossie.capacidadeCredito.limiteMensalLocacaoRecomendadoCentavos,
        limiteFinanciamentoCentavos: dossie.capacidadeCredito.limiteFinanciamentoImobiliarioSugeridoCentavos,
        apontamentosCriticos: dossie.processos.length + dossie.protestos.length + dossie.esgSancoes.length,
      },
    });
  }

  /**
   * Retorna os últimos eventos processados no barramento
   */
  obterAuditoriaEventos(): EventoInternoPlataforma[] {
    return [...this.historicoEventos];
  }
}
