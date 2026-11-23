import { describe, expect, it } from "vitest";
import { calcularCapacidadePagamento } from "./capacidade-pagamento.ts";

describe("Cálculo de Capacidade de Pagamento e 5 Cs do Crédito", () => {
  it("deve calcular capacidade de pagamento para proponente sem restrições com alta solvência", () => {
    const res = calcularCapacidadePagamento({
      tipoPessoa: "PF",
      vinculosEmpregaticios: [
        {
          razaoSocialEmpregador: "ULTRA ENGENHARIA LTDA",
          cnpjEmpregador: "30.680.829/0001-43",
          cargo: "Diretor de Operações",
          cbo: "1210-10",
          dataAdmissao: "2018-01-01",
          vinculoAtivo: true,
          tipoVinculo: "CLT",
          salarioEstimadoCentavos: 1800000, // R$ 18.000,00
          estabilidadeAnos: 8,
          fonte: "eSocial",
        },
      ],
      vinculosSocietarios: [
        {
          cnpjEmpresa: "18.940.122/0001-90",
          razaoSocial: "KYTTO PARTICIPACOES LTDA",
          qualificacaoSocio: "Sócio-Administrador",
          participacaoCapitalPercentual: 50,
          capitalSocialCentavos: 100000000, // R$ 1.000.000,00
          dataEntradaSociedade: "2016-01-01",
          situacaoCadastralEmpresa: "ATIVA",
          naturezaJuridica: "Ltda",
          cnaePrincipalCodigo: "6810-8/00",
          cnaePrincipalDescricao: "Imobiliária",
          faturamentoPresumidoAnualCentavos: 500000000, // R$ 5.000.000,00
          quantidadeSocios: 2,
          outrosSocios: [],
        },
      ],
      patrimonio: [
        {
          tipo: "IMOVEL_URBANO",
          descricao: "Casa em Condomínio Manacás",
          identificador: "Matrícula 48912",
          cidade: "Tangará da Serra",
          uf: "MT",
          valorEstimadoCentavos: 150000000, // R$ 1.500.000,00
          alienacaoFiduciariaOuOnus: false,
        },
      ],
      processos: [],
      protestos: [],
      situacaoCadastral: "REGULAR",
    });

    expect(res.scoreKytto360).toBeGreaterThanOrEqual(750);
    expect(["AAA", "AA", "A"]).toContain(res.classificacaoRating);
    expect(res.rendaEstimadaMensalCentavos).toBeGreaterThan(1800000);
    expect(res.limiteMensalLocacaoRecomendadoCentavos).toBe(Math.round(res.rendaEstimadaMensalCentavos * 0.3));
    expect(res.limiteFinanciamentoImobiliarioSugeridoCentavos).toBeGreaterThan(80000000); // Acima de R$ 800.000,00
    expect(res.cincoCsDoCredito.carater.score).toBe(100);
    expect(res.parecerMesaCredito).toContain("APROVADO PREFERENCIAL");
  });

  it("deve penalizar score e rating quando houver protestos e processos judiciais passivos", () => {
    const res = calcularCapacidadePagamento({
      tipoPessoa: "PF",
      vinculosEmpregaticios: [],
      vinculosSocietarios: [],
      patrimonio: [],
      processos: [
        {
          numeroProcesso: "0001234-56.2023.8.11.0055",
          tribunal: "TJMT",
          classe: "Execução de Título Extrajudicial",
          assunto: "Cobrança de Dívida",
          polo: "REU",
          dataDistribuicao: "2023-01-10",
          valorCausaCentavos: 8000000, // R$ 80.000,00
          situacao: "EM_ANDAMENTO",
          comarcaVara: "Vara Cível",
          riscoImpactoCredito: "ALTO",
        },
      ],
      protestos: [
        {
          cartorio: "1º Cartório de Protesto",
          comarca: "Tangará da Serra",
          uf: "MT",
          dataProtesto: "2024-02-15",
          valorProtestadoCentavos: 1200000, // R$ 12.000,00
          cedenteOuCredor: "Banco do Brasil S.A.",
          situacao: "PROTESTADO",
        },
      ],
      situacaoCadastral: "REGULAR",
    });

    expect(res.scoreKytto360).toBeLessThanOrEqual(620);
    expect(res.cincoCsDoCredito.carater.score).toBeLessThan(80);
    expect(res.parecerMesaCredito).toMatch(/RESTRITIVO|CONDICIONANTES/);
  });
});
