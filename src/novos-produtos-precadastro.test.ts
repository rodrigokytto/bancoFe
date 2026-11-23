import { describe, expect, it } from "vitest";
import { ServicoPreCadastroBancoFe } from "./precadastro/servico-precadastro.js";

describe("Esteira de Pré-Cadastro e Produtos Expandidos BancoFé", () => {
  const servico = new ServicoPreCadastroBancoFe();

  it("deve simular e pré-aprovar Financiamento de Lotes Construtora Ultra em até 144 meses", () => {
    const sim = servico.calcularSimulacaoCredito(
      350000,
      144,
      "SAC",
      42000,
      920,
      "pre-lote-01",
      "ENG. MARCOS AURELIO PRADO",
      "financiamento_lotes_ultra"
    );

    expect(sim).toBeDefined();
    expect(sim.taxaJurosMensal).toBe(0.95);
    expect(sim.aprovadoAutomaticamente).toBe(true);
    expect(sim.certificado).toBeDefined();
    expect(sim.certificado?.produtoNome).toContain("LOTES ULTRA");
    expect(sim.comprometimentoRendaPct).toBeLessThan(30);
  });

  it("deve simular Minha Casa Minha Vida com taxa bonificada de 0,58% a.m.", () => {
    const sim = servico.calcularSimulacaoCredito(
      250000,
      360,
      "PRICE",
      7400,
      780,
      "pre-mcmv-01",
      "Juliana Camargo Diniz",
      "mcmv_habitacional_popular"
    );

    expect(sim.taxaJurosMensal).toBe(0.58);
    expect(sim.aprovadoAutomaticamente).toBe(true);
    expect(sim.certificado).toBeDefined();
    expect(sim.comprometimentoRendaPct).toBeLessThan(30);
  });

  it("deve simular CPR Digital e Barter Agro com taxa de 0,75% a.m.", () => {
    const sim = servico.calcularSimulacaoCredito(
      1800000,
      120,
      "SAC",
      120000,
      950,
      "pre-cpr-01",
      "Ailton Cesar Zanatta",
      "cpr_digital_agro_barter"
    );

    expect(sim.taxaJurosMensal).toBe(0.75);
    expect(sim.aprovadoAutomaticamente).toBe(true);
    expect(sim.certificado?.limiteAprovado).toBe(1800000);
  });

  it("deve simular Home Equity com garantia imobiliária a 0,85% a.m.", () => {
    const sim = servico.calcularSimulacaoCredito(
      450000,
      120,
      "SAC",
      42000,
      940,
      "pre-he-01",
      "Patrícia Ferrari Paulino Gonçalves",
      "home_equity_garantia_imovel"
    );

    expect(sim.taxaJurosMensal).toBe(0.85);
    expect(sim.aprovadoAutomaticamente).toBe(true);
  });

  it("deve criar novo pré-cadastro com checklist dinâmico e parecer de mesa integrado", () => {
    const novo = servico.criar({
      nomeCompleto: "RODRIGO RIBEIRO GONCALVES",
      cpfOuCnpj: "30587162813",
      email: "rodrigo.goncalves@kytto.com.br",
      telefone: "(18) 99712-4411",
      rendaMensalDeclarada: 85000,
      cidade: "Mirante do Paranapanema",
      uf: "SP",
      produtoPretendido: "cpr_digital_agro_barter",
      valorPretendido: 600000,
      prazoMeses: 60,
      sistemaAmortizacao: "SAC",
      empresaParceira: "UISA Barter",
    });

    expect(novo).toBeDefined();
    expect(novo.codigoProtocolo).toContain("BFE-PRE");
    expect(novo.status).toBe("aprovado_autonomo");
    expect(novo.parecerMesaCredito).toBeDefined();
    expect(novo.pendencias.some((p) => p.descricao.includes("CAR"))).toBe(true);
  });
});
