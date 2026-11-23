import { z } from "zod";
import type { DadosCpfEnriquecidos } from "../clientes/clientes-prequalificados.ts";

export type StatusPreCadastro =
  | "novo"
  | "em_qualificacao"
  | "aprovado_autonomo"
  | "mesa_credito"
  | "pendente_documentos"
  | "concluido";

export type ProdutoPretendidoBancoFe =
  | "abertura_conta_digital"
  | "financiamento_imobiliario"
  | "credito_rural_agro"
  | "capital_giro_pj"
  | "emprestimo_consignado"
  | "cartao_credito_black";

export interface ItemPendenciaDocumental {
  id: string;
  descricao: string;
  obrigatorio: boolean;
  status: "pendente" | "anexado" | "aprovado";
}

export interface CertificadoAprovacaoAutonoma {
  codigoCertificado: string;
  emitidoEm: string;
  hashSha256: string;
  limiteAprovado: number;
  prazoMesesAprovado: number;
  sistema: "SAC" | "PRICE";
  taxaJurosMensal: number;
  validadeDias: number;
  instituicaoEmissora: string;
}

export interface SimulacaoCreditoPreCadastro {
  valorSolicitado: number;
  prazoMeses: number;
  sistemaAmortizacao: "SAC" | "PRICE";
  taxaJurosMensal: number;
  valorPrimeiraParcela: number;
  capacidadeParcela30Pct: number;
  comprometimentoRendaPct: number;
  aprovadoAutomaticamente: boolean;
  motivoStatus: string;
  certificado?: CertificadoAprovacaoAutonoma;
}

export interface RegistroPreCadastroBancoFe {
  id: string;
  codigoProtocolo: string;
  dataCriacao: string;
  dataAtualizacao: string;
  status: StatusPreCadastro;
  produtoPretendido: ProdutoPretendidoBancoFe;
  titular: {
    nomeCompleto: string;
    cpfOuCnpj: string;
    cpfLimpo: string;
    email: string;
    telefone: string;
    rendaMensalDeclarada: number;
    logradouro?: string;
    cidade: string;
    uf: string;
    cep?: string;
  };
  empresaParceira?: string; // Casa Nova Imóveis, UISA, Dino, Ultra, etc.
  autorizacaoLgpd: boolean;
  scoreSerasaEstimado?: number;
  dados360Enriquecidos?: Partial<DadosCpfEnriquecidos>;
  simulacao?: SimulacaoCreditoPreCadastro;
  pendencias: ItemPendenciaDocumental[];
  historicoNotas: Array<{
    data: string;
    autor: string;
    nota: string;
  }>;
}

export const CriarPreCadastroSchema = z.object({
  nomeCompleto: z.string().min(3),
  cpfOuCnpj: z.string().min(11),
  email: z.string().email(),
  telefone: z.string().min(8),
  rendaMensalDeclarada: z.number().min(0),
  cidade: z.string().default("Tangará da Serra"),
  uf: z.string().default("MT"),
  produtoPretendido: z.enum([
    "abertura_conta_digital",
    "financiamento_imobiliario",
    "credito_rural_agro",
    "capital_giro_pj",
    "emprestimo_consignado",
    "cartao_credito_black",
  ]),
  empresaParceira: z.string().optional(),
  valorPretendido: z.number().optional().default(100000),
  prazoMeses: z.number().optional().default(120),
  sistemaAmortizacao: z.enum(["SAC", "PRICE"]).optional().default("SAC"),
  autorizacaoLgpd: z.boolean().default(true),
});

export const SimulacaoCreditoSchema = z.object({
  valor: z.number().positive(),
  prazoMeses: z.number().int().positive(),
  sistema: z.enum(["SAC", "PRICE"]),
  rendaMensal: z.number().positive(),
  score: z.number().optional().default(800),
});

export const AtualizarStatusPreCadastroSchema = z.object({
  novoStatus: z.enum([
    "novo",
    "em_qualificacao",
    "aprovado_autonomo",
    "mesa_credito",
    "pendente_documentos",
    "concluido",
  ]),
  nota: z.string().optional(),
});
