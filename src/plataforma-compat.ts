import type { z } from "zod";

export interface ContextoPlataforma {
  tenantId: string;
  usuarioId?: string;
  permissoes?: string[];
}

export interface FerramentaAgente<E extends z.ZodType = z.ZodType> {
  nome: string;
  descricao: string;
  entrada: E;
  permissao: string;
  efeitoColateral: boolean;
  executar(ctx: ContextoPlataforma & { tenantId: string }, entrada: z.infer<E>): Promise<unknown>;
}

export interface BarramentoEventos {
  publicar(topico: string, payload: unknown): Promise<void>;
}

export interface DefinicaoModulo {
  nome: string;
  versao: string;
  descricao: string;
  dependeDe: string[];
  permissoes: string[];
  eventosPublicados: string[];
  eventosConsumidos?: Record<string, (payload: unknown) => Promise<void> | void>;
  router: unknown;
  ferramentas?: FerramentaAgente[];
  iniciar?(deps: unknown): void | Promise<void>;
}

export function definirModulo(def: DefinicaoModulo): DefinicaoModulo {
  if (!/^[a-z][a-z0-9-]*$/.test(def.nome)) {
    throw new Error(`Nome de módulo inválido: ${def.nome}`);
  }
  return def;
}

/**
 * Construtor fluente para rotas tRPC / Fastify com validação de permissões
 */
export function procedimentoComPermissao(permissao: string) {
  return {
    input<T extends z.ZodType>(schema: T) {
      return {
        query<R>(handler: (opts: { ctx: ContextoPlataforma; input: z.infer<T> }) => Promise<R> | R) {
          return {
            tipo: "query" as const,
            permissao,
            schema,
            executar: handler,
          };
        },
        mutation<R>(handler: (opts: { ctx: ContextoPlataforma; input: z.infer<T> }) => Promise<R> | R) {
          return {
            tipo: "mutation" as const,
            permissao,
            schema,
            executar: handler,
          };
        },
      };
    },
  };
}

export function router<T extends Record<string, unknown>>(rotas: T): T {
  return rotas;
}
