import { describe, expect, it } from "vitest";
import { MotorGrafoRedeLancamento } from "./grafo-rede-lancamento.ts";
import { ConectorRedesSociaisOsint } from "./integracao-redes-sociais-osint.ts";
import { ConectorVeiculosBensPatrimoniais } from "./integracao-veiculos-bens.ts";
import { ServicoConsulta360 } from "./servico.ts";
import { ValidadorIntegracoesCompletas } from "./validador-integracoes.ts";

describe("Módulo de Bens Patrimoniais e Veículos (Senatran / FIPE / CAR / ANAC)", () => {
  const conector = new ConectorVeiculosBensPatrimoniais();

  it("deve consultar bens patrimoniais detalhados de PF com veículos, FIPE e Renajud", async () => {
    const resultado = await conector.consultarBensPatrimoniais("00000000191", "PF", "RODRIGO GONCALVES");

    expect(resultado).toBeDefined();
    expect(resultado.tipoPessoa).toBe("PF");
    expect(resultado.veiculos.length).toBeGreaterThan(0);
    expect(resultado.totalVeiculosIdentificados).toBe(resultado.veiculos.length);
    expect(resultado.valorTotalVeiculosCentavos).toBeGreaterThan(0);

    const v1 = resultado.veiculos[0]!;
    expect(v1.placa).toBeDefined();
    expect(v1.marcaModelo).toBeDefined();
    expect(v1.valorVenalFipeCentavos).toBeGreaterThan(0);
    expect(v1.codigoFipe).toBeDefined();
    expect(typeof v1.bloqueioRenajud).toBe("boolean");
    expect(typeof v1.alienacaoFiduciariaGravame).toBe("boolean");
  });

  it("deve identificar imóveis rurais CAR e certificação INCRA SIGEF em MT", async () => {
    const resultado = await conector.consultarBensPatrimoniais("00000000191", "PF", "RODRIGO GONCALVES");

    expect(resultado.imoveisRurais.length).toBeGreaterThan(0);
    expect(resultado.areaTotalRuraisHectares).toBeGreaterThan(0);
    expect(resultado.valorTotalImoveisRuraisCentavos).toBeGreaterThan(0);

    const car = resultado.imoveisRurais[0]!;
    expect(car.codigoCar).toContain("MT-");
    expect(car.uf).toBe("MT");
    expect(car.municipio).toBe("Tangará da Serra");
    expect(car.statusCadastro).toBe("ATIVO");
    expect(car.certificacaoIncraSigef.statusGeorreferenciamento).toBe("CERTIFICADO");
  });

  it("deve mapear aeronaves ANAC RAB e embarcações Marinha SISGEMB", async () => {
    const resultado = await conector.consultarBensPatrimoniais("00000000191", "PF", "RODRIGO GONCALVES");

    expect(resultado.aeronaves.length).toBeGreaterThan(0);
    const aero = resultado.aeronaves[0]!;
    expect(aero.prefixo).toBeDefined();
    expect(aero.fabricante).toBeDefined();
    expect(aero.certificadoAeronavegabilidadeValido).toBe(true);

    expect(resultado.embarcacoes.length).toBeGreaterThan(0);
    const emb = resultado.embarcacoes[0]!;
    expect(emb.numeroInscricaoTie).toBeDefined();
    expect(emb.nomeEmbarcacao).toBeDefined();
    expect(emb.situacaoCadastral).toBe("REGULAR");
  });
});

describe("Módulo de Inteligência OSINT e Mídias Sociais", () => {
  const conector = new ConectorRedesSociaisOsint();

  it("deve realizar varredura multiplataforma (LinkedIn, Instagram, TikTok, X, YouTube)", async () => {
    const osint = await conector.consultarMidiasSociais("RODRIGO GONCALVES", "00000000191", "Tangará da Serra");

    expect(osint).toBeDefined();
    expect(osint.scorePresencaDigital).toBeGreaterThanOrEqual(0);
    expect(osint.scorePresencaDigital).toBeLessThanOrEqual(100);
    expect(["ALTA_EXPOSICAO", "MODERADA", "DISCRETA_RESTRITA", "SEM_PEGADA_DIGITAL"]).toContain(
      osint.classificacaoExposicaoPublica,
    );

    // LinkedIn
    expect(osint.linkedin.identificado).toBe(true);
    expect(osint.linkedin.headlineCargo).toBeDefined();
    expect(osint.linkedin.empresaAtual).toBeDefined();

    // Instagram
    expect(osint.instagram.identificado).toBe(true);
    expect(osint.instagram.username).toBeDefined();
    expect(osint.instagram.username.length).toBeGreaterThan(0);
    expect(osint.instagram.totalSeguidores).toBeGreaterThan(0);
    expect(osint.instagram.sinaisPatrimoniaisDetectados.length).toBeGreaterThan(0);

    // TikTok
    expect(osint.tiktok.identificado).toBe(true);
    expect(osint.tiktok.totalCurtidas).toBeGreaterThan(0);

    // Twitter / X & YouTube
    expect(osint.twitterX.identificado).toBe(true);
    expect(osint.youtube.identificado).toBe(true);
  });
});

describe("Motor de Grafo de Rede de Lançamento Imobiliário", () => {
  const motor = new MotorGrafoRedeLancamento();

  it("deve construir a topologia completa do lançamento com Ultra, Casanova, Lotes e Caixa", () => {
    const rede = motor.construirGrafoLancamento({
      titularDocumento: "00000000191",
      titularNome: "RODRIGO GONCALVES",
      cidade: "Tangará da Serra",
      uf: "MT",
    });

    expect(rede).toBeDefined();
    expect(rede.empreendimento.nome).toBe("Reserva Tangará Loteamento Fechado");
    expect(rede.empreendimento.municipio).toBe("Tangará da Serra");
    expect(rede.empreendimento.uf).toBe("MT");

    // Nós presentes
    const ids = rede.nos.map((n) => n.id);
    expect(ids).toContain(rede.empreendimento.id);
    expect(ids).toContain("corp-ultra-incorporadora");
    expect(ids).toContain("corp-casanova-imobiliaria");
    expect(ids).toContain("cartorio-1-oficio-tangara");
    expect(ids).toContain("banco-caixa-correspondente");

    // Lotes e Quadras
    const lotesNos = rede.nos.filter((n) => n.id.startsWith("lote-"));
    expect(lotesNos.length).toBeGreaterThanOrEqual(5);

    // Corretores CRECI
    const corretoresNos = rede.nos.filter((n) => n.tipo === "corretor");
    expect(corretoresNos.length).toBeGreaterThanOrEqual(3);

    // Proponente comprador e MGM
    const compradorNo = rede.nos.find((n) => n.id.startsWith("comprador-"));
    expect(compradorNo).toBeDefined();
    expect(compradorNo?.rotulo).toBe("RODRIGO GONCALVES");

    const parenteNo = rede.nos.find((n) => n.id === "comprador-indicado-parente");
    expect(parenteNo).toBeDefined();

    // Métricas Comerciais e VGV
    expect(rede.metricasComerciais.vgvTotalReais).toBe(85000000);
    expect(rede.metricasComerciais.percentualVendido).toBeGreaterThan(50);
    expect(rede.metricasComerciais.taxaAprovacaoBancariaCaixaPercentual).toBeGreaterThan(80);
  });
});

describe("Integração do Orquestrador Central ServicoConsulta360", () => {
  const servico = new ServicoConsulta360();

  it("deve enriquecer o dossiê completo com Bens, OSINT e Grafo de Lançamento", async () => {
    const dossie = await servico.consultar({
      cpf: "00000000191",
      nomeCompleto: "RODRIGO GONCALVES DOS SANTOS",
      cidade: "Tangará da Serra",
      uf: "MT",
    });

    expect(dossie).toBeDefined();
    expect(dossie.protocoloConsulta).toBeDefined();

    // Novos campos agregados no dossiê
    expect(dossie.patrimonioVeiculosBens).toBeDefined();
    expect(dossie.patrimonioVeiculosBens?.veiculos.length).toBeGreaterThan(0);
    expect(dossie.patrimonioVeiculosBens?.imoveisRurais.length).toBeGreaterThan(0);

    expect(dossie.osintMidiasSociais).toBeDefined();
    expect(dossie.osintMidiasSociais?.linkedin.identificado).toBe(true);
    expect(dossie.osintMidiasSociais?.instagram.identificado).toBe(true);

    expect(dossie.redeLancamentoGrafo).toBeDefined();
    expect(dossie.redeLancamentoGrafo?.empreendimento.nome).toBe("Reserva Tangará Loteamento Fechado");

    // Verificação de nós patrimoniais e OSINT injetados no grafo principal
    const tiposNos = dossie.grafo.nos.map((n) => n.tipo);
    expect(tiposNos).toContain("veiculo");
    expect(tiposNos).toContain("imovel_rural");
    expect(tiposNos).toContain("osint_midia");
  });
});

describe("Validador Pericial de Todas as 34 Integrações", () => {
  const validador = new ValidadorIntegracoesCompletas();

  it("deve testar e homologar todas as 48 integrações com 100% de disponibilidade operacional", async () => {
    const relatorio = await validador.validarTodas();

    expect(relatorio).toBeDefined();
    expect(relatorio.totalIntegracoes).toBe(48);
    expect(relatorio.integracoesOperacionais).toBe(48);
    expect(relatorio.taxaDisponibilidadePercentual).toBe(100);
    expect(relatorio.diagnosticos.length).toBe(48);

    const ids = relatorio.diagnosticos.map((d) => d.id);
    expect(ids).toContain("SENATRAN_RENAVAM_VEICULOS");
    expect(ids).toContain("RENAJUD_GRAVAMES_SNG");
    expect(ids).toContain("CAR_INCRA_RURAL");
    expect(ids).toContain("ANAC_RAB_AERONAVES");
    expect(ids).toContain("OSINT_LINKEDIN_PROFISSIONAL");
    expect(ids).toContain("OSINT_INSTAGRAM_LIFESTYLE");
    expect(ids).toContain("OSINT_TIKTOK_MULTIMIDIA");
    expect(ids).toContain("REDE_LANCAMENTO_IMOBILIARIO");

    // Todos devem estar operacionais
    relatorio.diagnosticos.forEach((d) => {
      expect(d.status).toBe("ONLINE_OPERACIONAL");
      expect(d.sucesso).toBe(true);
      expect(d.tempoRespostaMs).toBeGreaterThanOrEqual(0);
    });
  }, 90000);
});
