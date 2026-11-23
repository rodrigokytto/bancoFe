import { z } from "zod";
import { procedimentoComPermissao, router } from "./plataforma-compat.ts";
import type { ServicoConsulta360 } from "./servico.ts";
import { EntradaConsulta360Schema } from "./tipos.ts";

export const PERMISSOES_CONSULTA360 = [
  "consulta360.ler",
  "consulta360.consultar",
  "consulta360.exportar",
  "consulta360.administrar",
] as const;

export function criarRouterConsulta360(servico: ServicoConsulta360) {
  return router({
    consultar: procedimentoComPermissao("consulta360.consultar")
      .input(EntradaConsulta360Schema)
      .mutation(async ({ ctx, input }) => {
        return servico.consultar(input, ctx.tenantId);
      }),

    obterDossie: procedimentoComPermissao("consulta360.ler")
      .input(z.object({ documento: z.string().min(3).max(200) }))
      .query(async ({ ctx, input }) => {
        return servico.consultar(
          {
            documentoOuNome: input.documento,
            tipoEntrada: "AUTO",
            uf: "MT",
            cidade: "Tangará da Serra",
            profundidadeGrafo: 2,
            incluirProcessosJudiciais: true,
            incluirSocietario: true,
            incluirEmpregoRenda: true,
            incluirProtestos: true,
            incluirEsgSancoes: true,
            incluirHistoricoPolitico: true,
            incluirMarcasInpi: true,
            ativarIaGcp: true,
            forcarAtualizacao: false,
          },
          ctx.tenantId,
        );
      }),

    expandirGrafo: procedimentoComPermissao("consulta360.ler")
      .input(
        z.object({
          documento: z.string().min(3).max(200),
          profundidade: z.number().int().min(1).max(3).optional().default(2),
        }),
      )
      .query(async ({ ctx, input }) => {
        const dossie = await servico.consultar(
          {
            documentoOuNome: input.documento,
            tipoEntrada: "AUTO",
            uf: "MT",
            cidade: "Tangará da Serra",
            profundidadeGrafo: input.profundidade,
            incluirProcessosJudiciais: true,
            incluirSocietario: true,
            incluirEmpregoRenda: true,
            incluirProtestos: true,
            incluirEsgSancoes: true,
            incluirHistoricoPolitico: false,
            incluirMarcasInpi: false,
            ativarIaGcp: false,
            forcarAtualizacao: false,
          },
          ctx.tenantId,
        );
        return dossie.grafo;
      }),

    exportarExcelBase64: procedimentoComPermissao("consulta360.exportar")
      .input(EntradaConsulta360Schema)
      .mutation(async ({ ctx, input }) => {
        const dossie = await servico.consultar(input, ctx.tenantId);
        const buffer = await servico.exportarExcel(dossie);
        return {
          protocolo: dossie.protocoloConsulta,
          nomeArquivo: `dossie_consulta360_${dossie.identificacao.documentoLimpo}.xlsx`,
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          base64: buffer.toString("base64"),
          tamanhoBytes: buffer.length,
          hashSha256: dossie.conformidadeLgpd.hashIntegridadeSha256,
        };
      }),

    exportarPdfBase64: procedimentoComPermissao("consulta360.exportar")
      .input(EntradaConsulta360Schema)
      .mutation(async ({ ctx, input }) => {
        const dossie = await servico.consultar(input, ctx.tenantId);
        const buffer = await servico.exportarPdf(dossie);
        return {
          protocolo: dossie.protocoloConsulta,
          nomeArquivo: `dossie_pericial_360_${dossie.identificacao.documentoLimpo}.pdf`,
          mimeType: "application/pdf",
          base64: buffer.toString("base64"),
          tamanhoBytes: buffer.length,
          hashSha256: dossie.conformidadeLgpd.hashIntegridadeSha256,
        };
      }),

    analisarCapacidade: procedimentoComPermissao("consulta360.consultar")
      .input(z.object({ documento: z.string().min(3).max(200) }))
      .query(async ({ ctx, input }) => {
        const dossie = await servico.consultar(
          {
            documentoOuNome: input.documento,
            tipoEntrada: "AUTO",
            uf: "MT",
            cidade: "Tangará da Serra",
            profundidadeGrafo: 1,
            incluirProcessosJudiciais: true,
            incluirSocietario: true,
            incluirEmpregoRenda: true,
            incluirProtestos: true,
            incluirEsgSancoes: true,
            incluirHistoricoPolitico: false,
            incluirMarcasInpi: false,
            ativarIaGcp: false,
            forcarAtualizacao: false,
          },
          ctx.tenantId,
        );
        return dossie.capacidadeCredito;
      }),

    metricasGrafo: procedimentoComPermissao("consulta360.ler")
      .input(z.object({ documento: z.string().min(3).max(200) }))
      .query(async ({ ctx, input }) => {
        const dossie = await servico.consultar(
          {
            documentoOuNome: input.documento,
            tipoEntrada: "AUTO",
            uf: "MT",
            cidade: "Tangará da Serra",
            profundidadeGrafo: 2,
            incluirProcessosJudiciais: true,
            incluirSocietario: true,
            incluirEmpregoRenda: true,
            incluirProtestos: true,
            incluirEsgSancoes: true,
            incluirHistoricoPolitico: false,
            incluirMarcasInpi: false,
            ativarIaGcp: false,
            forcarAtualizacao: false,
          },
          ctx.tenantId,
        );
        return dossie.grafo.metricas;
      }),
  });
}
