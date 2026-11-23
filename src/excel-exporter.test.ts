import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { gerarPlanilhaExcelDossie } from "./excel-exporter.ts";
import { ServicoConsulta360 } from "./servico.ts";

describe("Exportador Corporativo de Planilhas Excel (.xlsx) em 6 Abas", () => {
  it("deve gerar arquivo Excel válido contendo as 6 abas temáticas obrigatórias", async () => {
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
      ativarIaGcp: false, // rápido para teste unitário
      forcarAtualizacao: true,
    });

    const buffer = await gerarPlanilhaExcelDossie(dossie);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // Validação dos magic bytes de arquivo ZIP/XLSX: PK\x03\x04 (0x50 0x4B 0x03 0x04)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);

    // Lê a planilha gerada com ExcelJS para verificar as 6 abas
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);

    const nomesAbas = wb.worksheets.map((ws) => ws.name);
    expect(nomesAbas).toContain("Resumo Executivo");
    expect(nomesAbas).toContain("Societário & QSA");
    expect(nomesAbas).toContain("Processos & Jurídico");
    expect(nomesAbas).toContain("Emprego & Renda");
    expect(nomesAbas).toContain("Grafo & Relacionamentos");
    expect(nomesAbas).toContain("ESG & Sanções");
    expect(nomesAbas.length).toBe(6);

    const wsResumo = wb.getWorksheet("Resumo Executivo")!;
    expect(wsResumo.rowCount).toBeGreaterThan(15);
  });
});
