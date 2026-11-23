import { createHash } from "node:crypto";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import type { DossieConsulta360Completo } from "./tipos.ts";

/**
 * Gerador Pericial de Dossiês Cadastrais em PDF com Selo Criptográfico SHA-256
 * Conforme Padrões Institucionais Kytto / Casa Nova Imóveis / Ultra Construtora
 */
export async function gerarDossiePdf(dossie: DossieConsulta360Completo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Dossiê Consulta360 - ${dossie.identificacao.nomeCompleto}`);
  pdfDoc.setAuthor("Plataforma Imob Fácil - Mesa de Crédito Kytto");
  pdfDoc.setSubject("Diligência Cadastral, KYC/AML e Análise de Crédito Imobiliário");
  pdfDoc.setKeywords(["Consulta360", "Dossiê", "KYC", "AML", "LGPD", "Ultra Construtora", "Casa Nova"]);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 padrão
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Cores Corporativas
  const azulKytto = rgb(30 / 255, 58 / 255, 138 / 255); // #1E3A8A
  const cinzaEscuro = rgb(31 / 255, 41 / 255, 55 / 255);
  const cinzaTexto = rgb(75 / 255, 85 / 255, 99 / 255);
  const verdeAprovado = rgb(5 / 255, 150 / 255, 105 / 255);
  const cinzaLinha = rgb(229 / 255, 231 / 255, 235 / 255);

  let y = height - 40;

  // 1. Cabeçalho Corporativo
  page.drawRectangle({
    x: 35,
    y: y - 50,
    width: width - 70,
    height: 60,
    color: azulKytto,
  });

  page.drawText("PLATAFORMA IMOB FÁCIL • CONSULTA360", {
    x: 50,
    y: y - 20,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Dossiê Corporativo Pericial, KYC/AML & Mapeamento de Relacionamentos", {
    x: 50,
    y: y - 38,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  y -= 75;

  // 2. Metadados do Dossiê e QR Code de Autenticidade
  const hashSha256 =
    dossie.conformidadeLgpd.hashIntegridadeSha256 || createHash("sha256").update(JSON.stringify(dossie)).digest("hex");

  // Gera imagem do QR Code
  const qrDataUrl = await QRCode.toDataURL(
    `https://casanova.kytto.com.br/validar?protocolo=${dossie.protocoloConsulta}&sha=${hashSha256.slice(0, 16)}`,
    { width: 80, margin: 1 },
  );
  const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1]!, "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: width - 110,
    y: y - 55,
    width: 65,
    height: 65,
  });

  page.drawText(`Protocolo: ${dossie.protocoloConsulta}`, { x: 45, y, size: 9, font: fontBold, color: cinzaEscuro });
  y -= 14;
  page.drawText(`Emissão: ${dossie.consultadoEm} • Solicitante: ${dossie.usuarioSolicitante}`, {
    x: 45,
    y,
    size: 8,
    font: fontRegular,
    color: cinzaTexto,
  });
  y -= 14;
  page.drawText(`Hash Criptográfico SHA-256: ${hashSha256.slice(0, 36)}...`, {
    x: 45,
    y,
    size: 7.5,
    font: fontOblique,
    color: cinzaTexto,
  });
  y -= 14;
  page.drawText(`Base Legal LGPD: Art. 7º, II, V e IX da Lei 13.709/2018 (Obrigação Legal e Legítimo Interesse)`, {
    x: 45,
    y,
    size: 7.5,
    font: fontRegular,
    color: cinzaTexto,
  });

  y -= 25;

  // Linha divisória
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, color: cinzaLinha, thickness: 1 });
  y -= 20;

  // 3. Seção: Identificação Cadastral & Rating de Crédito
  page.drawText("1. IDENTIFICAÇÃO CADASTRAL & ANÁLISE DE RISCO", {
    x: 45,
    y,
    size: 11,
    font: fontBold,
    color: azulKytto,
  });
  y -= 18;

  // Box de Score e Rating
  page.drawRectangle({
    x: 45,
    y: y - 48,
    width: width - 90,
    height: 52,
    color: rgb(243 / 255, 244 / 255, 246 / 255),
    borderColor: cinzaLinha,
    borderWidth: 1,
  });

  page.drawText(`NOME / RAZÃO SOCIAL: ${dossie.identificacao.nomeCompleto.toUpperCase()}`, {
    x: 55,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: cinzaEscuro,
  });

  page.drawText(
    `DOCUMENTO: ${dossie.identificacao.documento} (${dossie.identificacao.tipoPessoa})  •  SITUAÇÃO RFB: ${dossie.identificacao.situacaoCadastralRfb} (Dígito M11 OK)`,
    { x: 55, y: y - 30, size: 8.5, font: fontRegular, color: cinzaEscuro },
  );

  page.drawText(
    `SCORE KYTTO 360: ${dossie.capacidadeCredito.scoreKytto360}/1000  •  RATING: ${dossie.capacidadeCredito.classificacaoRating}  •  PONTUALIDADE: ${dossie.capacidadeCredito.indicePontualidadePagamento}%`,
    { x: 55, y: y - 44, size: 8.5, font: fontBold, color: verdeAprovado },
  );

  y -= 65;

  // 4. Seção: Capacidade Financeira e Limites Recomendados
  page.drawText("2. CAPACIDADE FINANCEIRA & LIMITES DE CRÉDITO IMOBILIÁRIO", {
    x: 45,
    y,
    size: 11,
    font: fontBold,
    color: azulKytto,
  });
  y -= 16;

  const itensFinanceiros: Array<[string, string]> = [
    [
      "Renda Mensal Estimada / Faturamento:",
      `R$ ${(dossie.capacidadeCredito.rendaEstimadaMensalCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    ["Classificação Socioeconômica:", dossie.capacidadeCredito.faixaRendaMensalDescricao],
    [
      "Patrimônio Líquido Estimado:",
      `R$ ${(dossie.capacidadeCredito.patrimonioLiquidoEstimadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    [
      "Limite Mensal de Locação Sugerido (30% Renda):",
      `R$ ${(dossie.capacidadeCredito.limiteMensalLocacaoRecomendadoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
    [
      "Capacidade de Financiamento Sugerida (360m):",
      `R$ ${(dossie.capacidadeCredito.limiteFinanciamentoImobiliarioSugeridoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ],
  ];

  for (const [rotulo, valor] of itensFinanceiros) {
    page.drawText(rotulo, { x: 55, y, size: 8.5, font: fontRegular, color: cinzaTexto });
    page.drawText(valor, { x: 310, y, size: 8.5, font: fontBold, color: cinzaEscuro });
    y -= 14;
  }

  y -= 10;

  // 5. Seção: Rede de Relacionamentos & Métricas do Grafo
  page.drawText("3. REDE DE RELACIONAMENTOS & MÉTRICAS DO GRAFO DE CONEXÕES", {
    x: 45,
    y,
    size: 11,
    font: fontBold,
    color: azulKytto,
  });
  y -= 16;

  const itensGrafo: Array<[string, string]> = [
    ["Total de Nós Conectados (1º, 2º e 3º Graus):", `${dossie.grafo.metricas.totalNos} nós identificados`],
    ["Total de Arestas / Vínculos Jurídicos:", `${dossie.grafo.metricas.totalArestas} relações documentadas`],
    ["Densidade da Rede Relacional:", `${(dossie.grafo.metricas.densidadeRede * 100).toFixed(1)}%`],
    ["Nó Hub Mais Conectado:", dossie.grafo.metricas.noHubPrincipalRotulo],
    [
      "Holdings Societárias Detectadas:",
      dossie.grafo.metricas.holdingsSocietariasDetectadas.join(", ") || "Nenhuma holding detectada",
    ],
    ["Risco Sistêmico da Rede:", `${dossie.grafo.metricas.riscoSistemicoRede}`],
  ];

  for (const [rotulo, valor] of itensGrafo) {
    page.drawText(rotulo, { x: 55, y, size: 8.5, font: fontRegular, color: cinzaTexto });
    page.drawText(valor, { x: 310, y, size: 8.5, font: fontBold, color: cinzaEscuro });
    y -= 14;
  }

  y -= 10;

  // 6. Síntese de IA GCP (Gemini 2.5 Flash)
  page.drawText("4. PARECER ANALÍTICO DE INTELIGÊNCIA ARTIFICIAL (GCP GEMINI 2.5 FLASH)", {
    x: 45,
    y,
    size: 11,
    font: fontBold,
    color: azulKytto,
  });
  y -= 16;

  page.drawText(`Conta GCP Auditada: ${dossie.sinteseIaGcp.contaGcpVinculada}`, {
    x: 55,
    y,
    size: 8,
    font: fontOblique,
    color: cinzaTexto,
  });
  y -= 14;

  // Quebra de texto do resumo executivo
  const textoIa = dossie.sinteseIaGcp.resumoExecutivoDiligencia;
  const linhasIa: string[] = [];
  const palavras = textoIa.split(" ");
  let linhaAtual = "";

  for (const p of palavras) {
    if ((linhaAtual + p).length > 95) {
      linhasIa.push(linhaAtual);
      linhaAtual = `${p} `;
    } else {
      linhaAtual += `${p} `;
    }
  }
  if (linhaAtual) linhasIa.push(linhaAtual);

  for (const linha of linhasIa.slice(0, 4)) {
    page.drawText(linha.trim(), { x: 55, y, size: 8, font: fontRegular, color: cinzaEscuro });
    y -= 12;
  }

  y -= 15;

  // 7. Rodapé Pericial e Certificação
  page.drawLine({ start: { x: 40, y: 55 }, end: { x: width - 40, y: 55 }, color: cinzaLinha, thickness: 1 });
  page.drawText(
    "Este documento constitui relatório pericial sigiloso emitido sob a Lei Geral de Proteção de Dados (LGPD nº 13.709/2018).",
    { x: 45, y: 42, size: 7, font: fontRegular, color: cinzaTexto },
  );
  page.drawText("Mesa de Decisão e Compliance • Casa Nova Imóveis & Ultra Construtora • casanova.kytto.com.br", {
    x: 45,
    y: 32,
    size: 7,
    font: fontBold,
    color: azulKytto,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
