import { describe, expect, it } from "vitest";
import { BarramentoSincronizacaoInterna } from "./eventos-sincronizacao.ts";
import { AdaptadorFontesPublicas } from "./fontes-publicas.ts";
import { criarModuloConsulta360 } from "./index.ts";
import { StorageSeguroConsulta360 } from "./storage-seguro.ts";

describe("Integrações Avançadas, Fontes Reais e Eventos Internos", () => {
  it("deve coletar taxas macroeconômicas oficiais (Selic, CDI, IPCA) ao vivo", async () => {
    const adaptador = new AdaptadorFontesPublicas();
    const taxas = await adaptador.consultarTaxasOficiais();

    expect(taxas).toBeDefined();
    expect(taxas.selic).toBeGreaterThan(0);
    expect(taxas.cdi).toBeGreaterThan(0);
    expect(taxas.ipca).toBeGreaterThan(0);
    expect(taxas.coletadoEm).toBeDefined();
  });

  it("deve consultar CEP com geocodificação e coordenadas territoriais", async () => {
    const adaptador = new AdaptadorFontesPublicas();
    const cepGeo = await adaptador.consultarCepGeocodificado("78300000");

    expect(cepGeo).toBeDefined();
    expect(cepGeo?.cidade).toBe("Tangará da Serra");
    expect(cepGeo?.uf).toBe("MT");
  });

  it("deve armazenar cópia segura de arquivo com hash SHA-256 e validação de integridade", async () => {
    const storage = new StorageSeguroConsulta360();
    const buffer = Buffer.from("DADOS_CONFIDENCIAIS_DILIGENCIA_PERICIAL_360");

    const salvo = await storage.salvarArquivoSeguro({
      buffer,
      nomeOriginal: "documento_comprovatorio.pdf",
      tipoMime: "application/pdf",
      tenantId: "casanova-ultra",
      sistemaOrigem: "ULTRA",
    });

    expect(salvo.id).toBeDefined();
    expect(salvo.hashSha256.length).toBe(64);
    expect(salvo.uriGcpStorage).toContain("gs://");

    const recuperado = storage.recuperarArquivoSeguro(salvo.caminhoLocal);
    expect(recuperado.integro).toBe(true);
    expect(recuperado.buffer.toString()).toBe("DADOS_CONFIDENCIAIS_DILIGENCIA_PERICIAL_360");
  });

  it("deve sincronizar eventos internos entre Nossa Gente e Ultra Construtora", async () => {
    const barramento = new BarramentoSincronizacaoInterna();
    let eventoRecebido: any = null;

    barramento.inscrever("interno.nossa_gente.colaborador.admitido", async (evt) => {
      eventoRecebido = evt;
    });

    await barramento.publicarEventoInterno({
      topico: "interno.nossa_gente.colaborador.admitido",
      origem: "NOSSA_GENTE",
      destino: "ULTRA",
      tenantId: "casanova-ultra",
      payload: {
        cpf: "000.000.001-91",
        nomeCompleto: "RODRIGO GONCALVES DOS SANTOS",
        cargo: "Diretor de Operações e Novos Negócios",
        departamento: "Diretoria Executiva",
        remuneracaoCentavos: 1850000,
        dataAdmissao: "2017-03-01",
        empresaCnpj: "30.680.829/0001-43",
      },
    });

    expect(eventoRecebido).toBeDefined();
    expect(eventoRecebido.topico).toBe("interno.nossa_gente.colaborador.admitido");
    expect(eventoRecebido.hashIntegridade.length).toBe(64);
    expect(eventoRecebido.payload.nomeCompleto).toBe("RODRIGO GONCALVES DOS SANTOS");
  });

  it("deve instanciar o módulo com barramento interno e storage seguro ativos", () => {
    const { modulo, barramentoInterno, storageSeguro } = criarModuloConsulta360();

    expect(modulo.nome).toBe("consulta360");
    expect(barramentoInterno).toBeDefined();
    expect(storageSeguro).toBeDefined();
    expect(modulo.eventosPublicados).toContain("interno.ultra.fornecedor.homologado");
  });
});
