import { describe, it, expect, beforeEach } from "vitest";
import { Cadastro360Store } from "../server/cadastro360Store";

describe("BancoFe - Cadastro 360°, Pré-Cadastro Documental & Central de Termos", () => {
  let store: Cadastro360Store;

  beforeEach(() => {
    store = Cadastro360Store.getInstance();
  });

  it("deve inicializar e carregar as 8 empresas parceiras do ecossistema BancoFe", () => {
    const clientes = store.listarClientes();
    expect(clientes.length).toBeGreaterThanOrEqual(8);

    const casanova = clientes.find((c) => c.cnpjCpf === "18.987.654/0001-99");
    expect(casanova).toBeDefined();
    expect(casanova?.razaoSocial).toContain("Casanova Empreendimentos");
    expect(casanova?.statusCadastral).toBe("homologado");

    const coopAgro = clientes.find((c) => c.cnpjCpf === "03.221.998/0001-44");
    expect(coopAgro).toBeDefined();
    expect(coopAgro?.empresaOrigemId).toBe("zuma_agro");

    const bancoFeCore = clientes.find((c) => c.empresaOrigemId === "bancofe" && c.cnpjCpf === "34.567.890/0001-12");
    expect(bancoFeCore).toBeDefined();
    expect(bancoFeCore?.limitesOperacionais.limiteGlobalAprovado).toBe(50000000);
  });

  it("deve filtrar empresas por unidade de negócio e status cadastral", () => {
    const agroClientes = store.listarClientes({ empresaOrigemId: "zuma_agro" });
    expect(agroClientes.length).toBeGreaterThanOrEqual(2);
    expect(agroClientes.every((c) => c.empresaOrigemId === "zuma_agro")).toBe(true);

    const homologados = store.listarClientes({ statusCadastral: "homologado" });
    expect(homologados.length).toBeGreaterThanOrEqual(8);

    const buscaPorNome = store.listarClientes({ busca: "Rota Norte" });
    expect(buscaPorNome.length).toBe(1);
    expect(buscaPorNome[0].razaoSocial).toContain("Rota Norte");
  });

  it("deve criar um novo pré-cadastro com checklist completo de 13 documentos e 7 termos regulatórios", () => {
    const novo = store.criarCliente({
      razaoSocial: "Tangará Distribuidora de Alimentos S.A.",
      nomeFantasia: "Tangará Alimentos",
      cnpjCpf: "34.112.990/0001-05",
      empresaOrigemId: "zuma_agro",
      empresaOrigemNome: "BancoFe Agro & Safra MT",
    });

    expect(novo.id).toBeDefined();
    expect(novo.codigo).toMatch(/^BFE-360-\d{4}$/);
    expect(novo.statusCadastral).toBe("pendente_documentos");

    // Validar se gerou 13 documentos no checklist
    const docs = store.listarDocumentosPorCliente(novo.id);
    expect(docs.length).toBe(13);

    // Validar se gerou 7 termos regulatórios digitais
    const termos = store.listarTermosPorCliente(novo.id);
    expect(termos.length).toBe(7);

    // Validar termos regulatórios obrigatórios
    const tiposTermos = termos.map((t) => t.tipoTermo);
    expect(tiposTermos).toContain("consentimento_scr_bacen");
    expect(tiposTermos).toContain("abertura_conta_grafica_domicilio");
    expect(tiposTermos).toContain("adesao_pld_ft_compliance");
    expect(tiposTermos).toContain("ccb_eletronica_credito");
  });

  it("deve permitir upload, verificação de hash SHA-256 e aprovação de documento no vault", () => {
    const clientes = store.listarClientes();
    const cliente = clientes[0];

    // Upload simulado de balanço patrimonial
    const doc = store.uploadDocumento(cliente.id, "balanco_patrimonial_dre", {
      arquivoNome: "balanco_auditado_2025.pdf",
      formato: "application/pdf",
      tamanhoBytes: 1024 * 850,
      validadeData: "2027-04-30",
    });

    expect(doc.status).toBe("em_analise");
    expect(doc.hashSha256).toBeDefined();
    expect(doc.hashSha256?.length).toBe(64); // SHA-256 hexadecimal

    // Aprovar documento
    const docAprovado = store.alterarStatusDocumento(doc.id, "aprovado", "Analista de Compliance Senior");
    expect(docAprovado.status).toBe("aprovado");
    expect(docAprovado.analisadoPor).toBe("Analista de Compliance Senior");
  });

  it("deve permitir recusa fundamentada de documento e registrar motivo de pendência", () => {
    const clientes = store.listarClientes();
    const cliente = clientes[0];

    const doc = store.uploadDocumento(cliente.id, "cnd_estadual_municipal", {
      arquivoNome: "cnd_antiga.pdf",
    });

    const docRejeitado = store.alterarStatusDocumento(
      doc.id,
      "rejeitado",
      "Mesa de Risco",
      "Certidão apresentada encontra-se vencida há mais de 60 dias."
    );

    expect(docRejeitado.status).toBe("rejeitado");
    expect(docRejeitado.justificativaRejeicao).toContain("vencida há mais de 60 dias");
  });

  it("deve assinar digitalmente termo regulatório com carimbo de tempo, IP e hash de integridade", () => {
    const clientes = store.listarClientes();
    const cliente = clientes[0];
    const termos = store.listarTermosPorCliente(cliente.id);
    const termoScr = termos.find((t) => t.tipoTermo === "consentimento_scr_bacen");
    expect(termoScr).toBeDefined();

    const termoAssinado = store.assinarTermo(termoScr!.id, {
      nome: "Rodrigo Ribeiro Gonçalves",
      cpf: "123.456.789-00",
      ip: "177.136.240.12",
    });

    expect(termoAssinado.status).toBe("assinado");
    expect(termoAssinado.signatarioNome).toBe("Rodrigo Ribeiro Gonçalves");
    expect(termoAssinado.signatarioIp).toBe("177.136.240.12");
    expect(termoAssinado.hashIntegridadeSha256.length).toBe(64);
  });

  it("deve executar varredura automatizada de compliance PLD-FT", () => {
    const clientes = store.listarClientes();
    const cliente = clientes[0];

    const atualizado = store.executarVarreduraCompliance(cliente.id);
    expect(atualizado.compliancePLD.scoreCompliance).toBeGreaterThanOrEqual(95);
    expect(atualizado.compliancePLD.nivelRisco).toBe("baixo");
    expect(atualizado.compliancePLD.ofacSanctions.status).toBe("nada_consta");
    expect(atualizado.compliancePLD.csnuOnu.status).toBe("nada_consta");
    expect(atualizado.compliancePLD.ceafGov.status).toBe("nada_consta");
    expect(atualizado.compliancePLD.trabalhoEscravoMte.status).toBe("nada_consta");
    expect(atualizado.statusCadastral).toBe("homologado");
  });

  it("deve calcular métricas executivas consolidadas do Cadastro 360", () => {
    const metricas = store.obterMetricasGerais();
    expect(metricas.totalClientesCadastrados).toBeGreaterThanOrEqual(8);
    expect(metricas.totalEmpresasHomologadas).toBeGreaterThanOrEqual(7);
    expect(metricas.volumeTotalLimitesAprovados).toBeGreaterThan(100000000); // Mais de R$ 100M em limites
    expect(metricas.volumeTotalLimitesDisponiveis).toBeGreaterThan(0);
    expect(metricas.taxaMediaCompletudeCadastral).toBeGreaterThanOrEqual(35);
  });
});
