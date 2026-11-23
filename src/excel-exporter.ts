import ExcelJS from "exceljs";
import type { DossieConsulta360Completo } from "./tipos.ts";

/**
 * Exportador Corporativo de Planilhas Excel (.xlsx) com 6 Abas Estruturadas
 * Conforme Padrões Institucionais Kytto / Casa Nova Imóveis / Ultra Construtora
 */
export async function gerarPlanilhaExcelDossie(dossie: DossieConsulta360Completo): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Plataforma Imob Fácil - Consulta360 / DataGraph Brasil";
  workbook.lastModifiedBy = dossie.usuarioSolicitante || "Mesa de Crédito Kytto";
  workbook.created = new Date();
  workbook.modified = new Date();

  const corPrimaria = "1E3A8A"; // Azul Marinho Corporativo Kytto
  const _corSecundaria = "0D9488"; // Verde Petróleo
  const corCabecalho = "1F2937"; // Cinza Escuro

  // ==========================================
  // ABA 1: RESUMO EXECUTIVO & SCORE
  // ==========================================
  const wsResumo = workbook.addWorksheet("Resumo Executivo", {
    views: [{ showGridLines: true }],
  });

  wsResumo.columns = [
    { header: "Campo / Indicador", key: "campo", width: 35 },
    { header: "Valor / Informação Oficial", key: "valor", width: 65 },
  ];

  wsResumo.mergeCells("A1:B1");
  const titulo1 = wsResumo.getCell("A1");
  titulo1.value = "DOSSIÊ PERICIAL CADASTRAL 360 & DILIGÊNCIA CORPORATIVA";
  titulo1.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFF" } };
  titulo1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: corPrimaria } };
  titulo1.alignment = { horizontal: "center", vertical: "middle" };
  wsResumo.getRow(1).height = 32;

  const dadosResumo = [
    ["Protocolo da Consulta", dossie.protocoloConsulta],
    ["Data e Hora da Emissão", dossie.consultadoEm],
    ["Titular Pesquisado", dossie.identificacao.nomeCompleto],
    ["Documento Oficial", `${dossie.identificacao.documento} (${dossie.identificacao.tipoPessoa})`],
    ["Situação Cadastral RFB", `${dossie.identificacao.situacaoCadastralRfb} (Auditado Módulo 11)`],
    [
      "Região Fiscal da Receita",
      `${dossie.identificacao.regiaoFiscalRfb.regiao} - Sede: ${dossie.identificacao.regiaoFiscalRfb.sedeFiscal}`,
    ],
    [
      "Município / UF",
      `${dossie.identificacao.enderecos[0]?.cidade || "Tangará da Serra"}/${dossie.identificacao.enderecos[0]?.uf || "MT"}`,
    ],
    ["Escolaridade / Formação", dossie.escolaridade.cursoPrincipal || "Superior Completo"],
    [
      "Score de Risco Kytto 360",
      `${dossie.capacidadeCredito.scoreKytto360} / 1000 (Rating ${dossie.capacidadeCredito.classificacaoRating})`,
    ],
    [
      "Renda Mensal Estimada",
      `R$ ${(dossie.capacidadeCredito.rendaEstimadaMensalCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${dossie.capacidadeCredito.faixaRendaMensalDescricao})`,
    ],
    [
      "Patrimônio Declarado / Estimado",
      `R$ ${(dossie.capacidadeCredito.patrimonioLiquidoEstimadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    [
      "Limite Mensal Locação Sugerido",
      `R$ ${(dossie.capacidadeCredito.limiteMensalLocacaoRecomendadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    [
      "Limite Financiamento Imobiliário",
      `R$ ${(dossie.capacidadeCredito.limiteFinanciamentoImobiliarioSugeridoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    ["Índice de Pontualidade", `${dossie.capacidadeCredito.indicePontualidadePagamento} %`],
    ["Total de Empresas no QSA", dossie.societarioQsa.length.toString()],
    ["Total de Processos Judiciais", dossie.processos.length.toString()],
    ["Total de Protestos em Cartório", dossie.protestos.length.toString()],
    ["Conformidade LGPD", dossie.conformidadeLgpd.baseLegalPrincipal],
    ["Hash Criptográfico SHA-256", dossie.conformidadeLgpd.hashIntegridadeSha256],
    ["Parecer da Mesa de Crédito", dossie.capacidadeCredito.parecerMesaCredito],
    ["Síntese de IA (GCP Gemini 2.5)", dossie.sinteseIaGcp.resumoExecutivoDiligencia],
  ];

  for (const [campo, valor] of dadosResumo) {
    const row = wsResumo.addRow({ campo, valor });
    row.getCell("campo").font = { name: "Arial", bold: true, color: { argb: "374151" } };
    row.getCell("valor").font = { name: "Arial" };
    row.getCell("campo").border = {
      top: { style: "thin", color: { argb: "E5E7EB" } },
      bottom: { style: "thin", color: { argb: "E5E7EB" } },
      left: { style: "thin", color: { argb: "E5E7EB" } },
      right: { style: "thin", color: { argb: "E5E7EB" } },
    };
    row.getCell("valor").border = {
      top: { style: "thin", color: { argb: "E5E7EB" } },
      bottom: { style: "thin", color: { argb: "E5E7EB" } },
      left: { style: "thin", color: { argb: "E5E7EB" } },
      right: { style: "thin", color: { argb: "E5E7EB" } },
    };
  }

  // ==========================================
  // ABA 2: VÍNCULOS SOCIETÁRIOS & QSA
  // ==========================================
  const wsSoc = workbook.addWorksheet("Societário & QSA", { views: [{ showGridLines: true }] });
  wsSoc.columns = [
    { header: "CNPJ da Empresa", key: "cnpj", width: 22 },
    { header: "Razão Social", key: "razaoSocial", width: 35 },
    { header: "Nome Fantasia", key: "fantasia", width: 25 },
    { header: "Qualificação", key: "qualificacao", width: 25 },
    { header: "Participação (%)", key: "percentual", width: 16 },
    { header: "Capital Social (R$)", key: "capital", width: 20 },
    { header: "Situação RFB", key: "situacao", width: 16 },
    { header: "CNAE Principal", key: "cnae", width: 35 },
    { header: "Outros Sócios", key: "outros", width: 40 },
  ];

  wsSoc.getRow(1).height = 26;
  wsSoc.getRow(1).font = { name: "Arial", bold: true, color: { argb: "FFFFFF" } };
  wsSoc.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: corCabecalho } };

  for (const s of dossie.societarioQsa) {
    const row = wsSoc.addRow({
      cnpj: s.cnpjEmpresa,
      razaoSocial: s.razaoSocial,
      fantasia: s.nomeFantasia || "-",
      qualificacao: s.qualificacaoSocio,
      percentual: `${s.participacaoCapitalPercentual}%`,
      capital: (s.capitalSocialCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      situacao: s.situacaoCadastralEmpresa,
      cnae: `${s.cnaePrincipalCodigo} - ${s.cnaePrincipalDescricao}`,
      outros: s.outrosSocios.map((o) => `${o.nome} (${o.qualificacao})`).join("; ") || "Sócio Único",
    });
    row.alignment = { vertical: "middle" };
  }

  // ==========================================
  // ABA 3: PROCESSOS & JURÍDICO
  // ==========================================
  const wsProc = workbook.addWorksheet("Processos & Jurídico", { views: [{ showGridLines: true }] });
  wsProc.columns = [
    { header: "Número dos Autos", key: "numero", width: 28 },
    { header: "Tribunal", key: "tribunal", width: 12 },
    { header: "Polo", key: "polo", width: 14 },
    { header: "Classe Processual", key: "classe", width: 30 },
    { header: "Assunto Principal", key: "assunto", width: 30 },
    { header: "Comarca / Vara", key: "comarca", width: 35 },
    { header: "Valor da Causa (R$)", key: "valor", width: 20 },
    { header: "Situação", key: "situacao", width: 16 },
    { header: "Impacto no Crédito", key: "risco", width: 18 },
  ];

  wsProc.getRow(1).height = 26;
  wsProc.getRow(1).font = { name: "Arial", bold: true, color: { argb: "FFFFFF" } };
  wsProc.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: corCabecalho } };

  if (dossie.processos.length === 0) {
    wsProc.addRow({ numero: "NENHUM PROCESSO JUDICIAL ATIVO IDENTIFICADO NO DATAJUD" });
  } else {
    for (const p of dossie.processos) {
      wsProc.addRow({
        numero: p.numeroProcesso,
        tribunal: p.tribunal,
        polo: p.polo,
        classe: p.classe,
        assunto: p.assunto,
        comarca: p.comarcaVara,
        valor: (p.valorCausaCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        situacao: p.situacao,
        risco: p.riscoImpactoCredito,
      });
    }
  }

  // ==========================================
  // ABA 4: VÍNCULOS EMPREGATÍCIOS & RENDA
  // ==========================================
  const wsEmp = workbook.addWorksheet("Emprego & Renda", { views: [{ showGridLines: true }] });
  wsEmp.columns = [
    { header: "Empregador", key: "empregador", width: 35 },
    { header: "CNPJ do Empregador", key: "cnpj", width: 22 },
    { header: "Cargo Ocupado", key: "cargo", width: 30 },
    { header: "CBO", key: "cbo", width: 35 },
    { header: "Data de Admissão", key: "admissao", width: 18 },
    { header: "Salário Estimado (R$)", key: "salario", width: 22 },
    { header: "Estabilidade (Anos)", key: "estabilidade", width: 18 },
    { header: "Fonte Comprobatória", key: "fonte", width: 18 },
    { header: "Vínculo Ativo", key: "ativo", width: 14 },
  ];

  wsEmp.getRow(1).height = 26;
  wsEmp.getRow(1).font = { name: "Arial", bold: true, color: { argb: "FFFFFF" } };
  wsEmp.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: corCabecalho } };

  for (const e of dossie.empregoRenda) {
    wsEmp.addRow({
      empregador: e.razaoSocialEmpregador,
      cnpj: e.cnpjEmpregador,
      cargo: e.cargo,
      cbo: e.cbo,
      admissao: e.dataAdmissao,
      salario: (e.salarioEstimadoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      estabilidade: e.estabilidadeAnos,
      fonte: e.fonte,
      ativo: e.vinculoAtivo ? "SIM (ATIVO)" : "DESLIGADO",
    });
  }

  // ==========================================
  // ABA 5: REDE DE RELACIONAMENTOS & GRAFO
  // ==========================================
  const wsGrafo = workbook.addWorksheet("Grafo & Relacionamentos", { views: [{ showGridLines: true }] });
  wsGrafo.columns = [
    { header: "ID do Nó", key: "id", width: 25 },
    { header: "Entidade / Rótulo", key: "rotulo", width: 35 },
    { header: "Tipo da Entidade", key: "tipo", width: 18 },
    { header: "Categoria", key: "categoria", width: 18 },
    { header: "Grau de Distância", key: "grau", width: 18 },
    { header: "Centralidade de Grau", key: "centralidade", width: 20 },
    { header: "É Nó Hub", key: "hub", width: 14 },
    { header: "Documento / Ref", key: "ref", width: 25 },
  ];

  wsGrafo.getRow(1).height = 26;
  wsGrafo.getRow(1).font = { name: "Arial", bold: true, color: { argb: "FFFFFF" } };
  wsGrafo.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: corCabecalho } };

  for (const n of dossie.grafo.nos) {
    wsGrafo.addRow({
      id: n.id,
      rotulo: n.rotulo,
      tipo: n.tipo,
      categoria: n.categoria,
      grau: n.grauDistancia === 0 ? "Titular (Raiz)" : `${n.grauDistancia}º Grau`,
      centralidade: n.centralidadeGrau,
      hub: n.isHub ? "SIM (HUB)" : "NÃO",
      ref: n.documentoOuReferencia || "-",
    });
  }

  // ==========================================
  // ABA 6: ESG & SANÇÕES ADMINISTRATIVAS
  // ==========================================
  const wsEsg = workbook.addWorksheet("ESG & Sanções", { views: [{ showGridLines: true }] });
  wsEsg.columns = [
    { header: "Tipo de Certidão / Apontamento", key: "tipo", width: 30 },
    { header: "Órgão Regulador Emissor", key: "orgao", width: 40 },
    { header: "Situação / Resultado", key: "situacao", width: 25 },
    { header: "Código de Autenticidade", key: "codigo", width: 30 },
    { header: "Data de Validade", key: "validade", width: 18 },
  ];

  wsEsg.getRow(1).height = 26;
  wsEsg.getRow(1).font = { name: "Arial", bold: true, color: { argb: "FFFFFF" } };
  wsEsg.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: corCabecalho } };

  for (const c of dossie.certidoes) {
    wsEsg.addRow({
      tipo: c.tipo,
      orgao: c.orgaoEmissor,
      situacao: c.situacao,
      codigo: c.codigoAutenticidade,
      validade: c.validadeAte,
    });
  }

  for (const e of dossie.esgSancoes) {
    wsEsg.addRow({
      tipo: e.tipo,
      orgao: e.orgao,
      situacao: `AUTUAÇÃO ATIVA: ${e.motivo}`,
      codigo: e.numeroTermoAutuacao,
      validade: "EMBARGO ATIVO",
    });
  }

  // Retorna o buffer gerado
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
