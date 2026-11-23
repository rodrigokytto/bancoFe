#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { ServicoConsulta360 } from "./servico.ts";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
================================================================================
          CONSULTA360 / DATAGRAPH ENTERPRISE - CLI CORPORATIVA
================================================================================
Uso:
  consulta360 <documento_ou_nome> [opcoes]

Exemplos:
  consulta360 00000000191 --export
  consulta360 30680829000143 --profundidade 3
  consulta360 "RODRIGO GONCALVES" --uf MT

Opções:
  --export             Gera automaticamente os arquivos Excel (.xlsx) e PDF (.pdf)
  --profundidade <n>   Profundidade do grafo em cascata (1, 2 ou 3) [padrão: 2]
  --uf <sigla>         UF para filtros territoriais [padrão: MT]
  --cidade <nome>      Cidade para filtros territoriais [padrão: Tangará da Serra]
  --sem-ia             Desativa síntese generativa do GCP Gemini
  --json               Emite resultado completo em JSON no stdout
================================================================================
`);
    process.exit(0);
  }

  const documentoOuNome = args[0];
  const deveExportar = args.includes("--export");
  const saidaJson = args.includes("--json");
  const semIa = args.includes("--sem-ia");

  let profundidade = 2;
  const idxProf = args.indexOf("--profundidade");
  if (idxProf !== -1 && args[idxProf + 1]) {
    profundidade = parseInt(args[idxProf + 1]!, 10) || 2;
  }

  let uf = "MT";
  const idxUf = args.indexOf("--uf");
  if (idxUf !== -1 && args[idxUf + 1]) {
    uf = args[idxUf + 1]!;
  }

  let cidade = "Tangará da Serra";
  const idxCidade = args.indexOf("--cidade");
  if (idxCidade !== -1 && args[idxCidade + 1]) {
    cidade = args[idxCidade + 1]!;
  }

  const servico = new ServicoConsulta360({
    apiKeyGemini: semIa ? "" : process.env.GEMINI_API_KEY,
  });

  if (!saidaJson) {
    console.log(`\n🔍 Iniciando Consulta360 Pericial para: "${documentoOuNome}"...`);
  }

  const inicio = Date.now();
  const dossie = await servico.consultar({
    documentoOuNome,
    tipoEntrada: "AUTO",
    uf,
    cidade,
    profundidadeGrafo: profundidade,
    incluirProcessosJudiciais: true,
    incluirSocietario: true,
    incluirEmpregoRenda: true,
    incluirProtestos: true,
    incluirEsgSancoes: true,
    incluirHistoricoPolitico: true,
    incluirMarcasInpi: true,
    ativarIaGcp: !semIa,
    forcarAtualizacao: false,
  });
  const duracao = Date.now() - inicio;

  if (saidaJson) {
    console.log(JSON.stringify(dossie, null, 2));
    process.exit(0);
  }

  const localidade = dossie.identificacao.tituloEleitor
    ? `${dossie.identificacao.tituloEleitor.municipio}/${dossie.identificacao.tituloEleitor.uf}`
    : dossie.identificacao.regiaoFiscalRfb.estados.join(", ");

  console.log(`\n${"=".repeat(75)}`);
  console.log(`               DOSSIÊ CADASTRAL 360 - PROTOCOLO: ${dossie.protocoloConsulta}`);
  console.log("=".repeat(75));
  console.log(
    `• Emissor Oficial:  ${CONFIG_OFICIAL_KYTTO.empresa.razaoSocial} (CNPJ ${CONFIG_OFICIAL_KYTTO.empresa.cnpj} | IM ${CONFIG_OFICIAL_KYTTO.empresa.inscricaoMunicipal})`,
  );
  console.log(`• Titular:          ${dossie.identificacao.nomeCompleto}`);
  console.log(`• Documento:        ${dossie.identificacao.documento} (${dossie.identificacao.tipoPessoa})`);
  console.log(`• Situação RFB:     ${dossie.identificacao.situacaoCadastralRfb}`);
  console.log(`• Localidade:       ${localidade}`);
  console.log(`• Hash SHA-256:     ${dossie.conformidadeLgpd.hashIntegridadeSha256}`);
  console.log(`• Tempo Coleta:     ${duracao}ms`);
  console.log("-".repeat(75));
  console.log("                      CAPACIDADE FINANCEIRA & 5 Cs");
  console.log("-".repeat(75));
  console.log(
    `• Score Kytto 360:  ${dossie.capacidadeCredito.scoreKytto360} / 1000  (Rating: ${dossie.capacidadeCredito.classificacaoRating})`,
  );
  console.log(
    `• Renda Estimada:   R$ ${(dossie.capacidadeCredito.rendaEstimadaMensalCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  );
  console.log(
    `• Limite Locação:   R$ ${(dossie.capacidadeCredito.limiteMensalLocacaoRecomendadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês`,
  );
  console.log(
    `• Limite Financ.:   R$ ${(dossie.capacidadeCredito.limiteFinanciamentoImobiliarioSugeridoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  );
  console.log(
    `• Patrimônio Est.:  R$ ${(dossie.capacidadeCredito.patrimonioLiquidoEstimadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  );
  console.log("-".repeat(75));
  console.log("                  TOPOLOGIA EM GRAFOS (1º, 2º e 3º GRAUS)");
  console.log("-".repeat(75));
  console.log(`• Nós no Grafo:     ${dossie.grafo.nos.length} entidades mapeadas`);
  console.log(`• Arestas / Conex.: ${dossie.grafo.arestas.length} relacionamentos`);
  console.log(`• Densidade Rede:   ${(dossie.grafo.metricas.densidadeRede * 100).toFixed(2)}%`);
  console.log(`• Nó Hub Principal: ${dossie.grafo.metricas.noHubPrincipalRotulo}`);
  console.log(`• Vínculos QSA:     ${dossie.societarioQsa.length} empresa(s) vinculada(s)`);
  console.log(
    `• Apontamentos:     ${dossie.processos.length} processo(s) | ${dossie.protestos.length} protesto(s) | ${dossie.esgSancoes.length} sanções ESG`,
  );
  console.log("-".repeat(75));
  console.log("                  SÍNTESE EXECUTIVA DE IA (GCP GEMINI)");
  console.log("-".repeat(75));
  console.log(`• Parecer:          ${dossie.sinteseIaGcp.resumoExecutivoDiligencia}`);
  console.log(
    `• Alertas:          ${dossie.sinteseIaGcp.alertasDiligenciaisCompliance.length > 0 ? dossie.sinteseIaGcp.alertasDiligenciaisCompliance.join(" | ") : "Nenhum apontamento crítico"}`,
  );
  console.log(
    `• Propensão Invest: Score ${dossie.sinteseIaGcp.propensaoSetorialImobiliaria.perfilInvestidorRenda.score}/100`,
  );

  if (deveExportar) {
    const dirStorage = resolve(process.cwd(), "storage");
    mkdirSync(dirStorage, { recursive: true });

    const arqExcel = resolve(dirStorage, `dossie_${dossie.identificacao.documentoLimpo}.xlsx`);
    const arqPdf = resolve(dirStorage, `dossie_${dossie.identificacao.documentoLimpo}.pdf`);

    const bufExcel = await servico.exportarExcel(dossie);
    writeFileSync(arqExcel, bufExcel);

    const bufPdf = await servico.exportarPdf(dossie);
    writeFileSync(arqPdf, bufPdf);

    console.log("-".repeat(75));
    console.log(`📁 Arquivos corporativos gerados com sucesso:`);
    console.log(`  📊 Excel (6 abas): ${arqExcel} (${bufExcel.length} bytes)`);
    console.log(`  📄 PDF Pericial:   ${arqPdf} (${bufPdf.length} bytes)`);
  }
  console.log(`${"=".repeat(75)}\n`);
}

main().catch((err) => {
  console.error("❌ Erro fatal na execução:", err);
  process.exit(1);
});
