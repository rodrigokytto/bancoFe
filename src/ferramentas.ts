import { z } from "zod";
import type { FerramentaAgente } from "./plataforma-compat.ts";
import type { ServicoConsulta360 } from "./servico.ts";

export function criarFerramentasConsulta360(servico: ServicoConsulta360): FerramentaAgente[] {
  const schemaBuscar = z.object({
    documentoOuNome: z.string().min(3).max(200),
    uf: z.string().length(2).optional().default("MT"),
    cidade: z.string().max(100).optional().default("Tangará da Serra"),
    profundidadeGrafo: z.number().int().min(1).max(3).optional().default(2),
  });

  const ferramentaBuscar: FerramentaAgente = {
    nome: "consulta360_buscar",
    descricao:
      "Realiza consulta cadastral pericial, diligência KYC/AML, vínculos societários, empregatícios, patrimônio e antecedentes de CPF, CNPJ ou Nome Completo. Nunca invente dados.",
    entrada: schemaBuscar,
    permissao: "consulta360.consultar",
    efeitoColateral: false,
    async executar(_ctx, bruto) {
      const entrada = schemaBuscar.parse(bruto);
      const dossie = await servico.consultar({
        documentoOuNome: entrada.documentoOuNome,
        tipoEntrada: "AUTO",
        uf: entrada.uf,
        cidade: entrada.cidade,
        profundidadeGrafo: entrada.profundidadeGrafo,
        incluirProcessosJudiciais: true,
        incluirSocietario: true,
        incluirEmpregoRenda: true,
        incluirProtestos: true,
        incluirEsgSancoes: true,
        incluirHistoricoPolitico: true,
        incluirMarcasInpi: true,
        ativarIaGcp: true,
        forcarAtualizacao: false,
      });

      return {
        protocolo: dossie.protocoloConsulta,
        nome: dossie.identificacao.nomeCompleto,
        documento: dossie.identificacao.documento,
        situacaoRfb: dossie.identificacao.situacaoCadastralRfb,
        scoreKytto360: dossie.capacidadeCredito.scoreKytto360,
        rating: dossie.capacidadeCredito.classificacaoRating,
        rendaEstimadaMensal: dossie.capacidadeCredito.rendaEstimadaMensalCentavos / 100,
        limiteLocacaoSugerido: dossie.capacidadeCredito.limiteMensalLocacaoRecomendadoCentavos / 100,
        limiteFinanciamentoSugerido: dossie.capacidadeCredito.limiteFinanciamentoImobiliarioSugeridoCentavos / 100,
        totalSocietario: dossie.societarioQsa.length,
        totalProcessos: dossie.processos.length,
        totalProtestos: dossie.protestos.length,
        resumoIaGcp: dossie.sinteseIaGcp.resumoExecutivoDiligencia,
        propensaoSetorial: dossie.sinteseIaGcp.propensaoSetorialImobiliaria,
      };
    },
  };

  const schemaGrafo = z.object({
    documentoOuNome: z.string().min(3).max(200),
    profundidade: z.number().int().min(1).max(3).optional().default(2),
  });

  const ferramentaGrafo: FerramentaAgente = {
    nome: "consulta360_expandir_grafo",
    descricao:
      "Mapeia dinamicamente e calcula métricas do grafo de relacionamentos (1º, 2º e 3º graus): centralidade, nós hub, densidade de rede e holdings societárias.",
    entrada: schemaGrafo,
    permissao: "consulta360.ler",
    efeitoColateral: false,
    async executar(_ctx, bruto) {
      const entrada = schemaGrafo.parse(bruto);
      const dossie = await servico.consultar({
        documentoOuNome: entrada.documentoOuNome,
        tipoEntrada: "AUTO",
        profundidadeGrafo: entrada.profundidade,
        incluirProcessosJudiciais: true,
        incluirSocietario: true,
        incluirEmpregoRenda: true,
        incluirProtestos: true,
        incluirEsgSancoes: true,
        incluirHistoricoPolitico: false,
        incluirMarcasInpi: false,
        ativarIaGcp: false,
        forcarAtualizacao: false,
      });

      return {
        metricas: dossie.grafo.metricas,
        totalNos: dossie.grafo.nos.length,
        totalArestas: dossie.grafo.arestas.length,
        hubPrincipal: dossie.grafo.metricas.noHubPrincipalRotulo,
        nos: dossie.grafo.nos.slice(0, 20).map((n) => ({
          id: n.id,
          rotulo: n.rotulo,
          tipo: n.tipo,
          grau: n.grauDistancia,
          isHub: n.isHub,
        })),
      };
    },
  };

  const schemaExportar = z.object({
    documentoOuNome: z.string().min(3).max(200),
    formato: z.enum(["EXCEL", "PDF", "AMBOS"]).optional().default("AMBOS"),
  });

  const ferramentaExportar: FerramentaAgente = {
    nome: "consulta360_exportar_dossie",
    descricao:
      "Exporta o dossiê completo em Excel de 6 abas (.xlsx) ou PDF pericial com selo SHA-256 e conformidade LGPD.",
    entrada: schemaExportar,
    permissao: "consulta360.exportar",
    efeitoColateral: false,
    async executar(_ctx, bruto) {
      const entrada = schemaExportar.parse(bruto);
      const dossie = await servico.consultar({
        documentoOuNome: entrada.documentoOuNome,
        tipoEntrada: "AUTO",
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
      });

      let excelTamanho = 0;
      let pdfTamanho = 0;

      if (entrada.formato === "EXCEL" || entrada.formato === "AMBOS") {
        const buf = await servico.exportarExcel(dossie);
        excelTamanho = buf.length;
      }
      if (entrada.formato === "PDF" || entrada.formato === "AMBOS") {
        const buf = await servico.exportarPdf(dossie);
        pdfTamanho = buf.length;
      }

      return {
        protocolo: dossie.protocoloConsulta,
        hashSha256: dossie.conformidadeLgpd.hashIntegridadeSha256,
        excelGeradoBytes: excelTamanho,
        pdfGeradoBytes: pdfTamanho,
        sucesso: true,
      };
    },
  };

  return [ferramentaBuscar, ferramentaGrafo, ferramentaExportar];
}
