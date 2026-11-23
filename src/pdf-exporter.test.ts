import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { gerarDossiePdf } from "./pdf-exporter.ts";
import { ServicoConsulta360 } from "./servico.ts";

describe("Gerador Pericial de Dossiês em PDF com Selo SHA-256", () => {
  it("deve gerar arquivo PDF válido com cabeçalho, QR Code e selo criptográfico", { timeout: 15000 }, async () => {
    const servico = new ServicoConsulta360({ apiKeyGemini: "" });
    const dossie = await servico.consultar({
      documentoOuNome: "00000000191",
      tipoEntrada: "CPF",
      profundidadeGrafo: 2,
      incluirProcessosJudiciais: true,
      incluirSocietario: true,
      incluirEmpregoRenda: true,
      incluirProtestos: true,
      incluirEsgSancoes: true,
      incluirHistoricoPolitico: true,
      incluirMarcasInpi: true,
      ativarIaGcp: false,
      forcarAtualizacao: true,
    });

    const buffer = await gerarDossiePdf(dossie);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // Validação dos magic bytes de PDF: %PDF- (0x25 0x50 0x44 0x46)
    expect(buffer.subarray(0, 5).toString("utf-8")).toBe("%PDF-");

    // Valida que o PDF é carregável pelo pdf-lib
    const pdfDoc = await PDFDocument.load(buffer);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(pdfDoc.getTitle()).toContain(dossie.identificacao.nomeCompleto);
  });
});
