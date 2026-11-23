import { describe, expect, it } from "vitest";
import { MotorGrafoRelacionamento } from "./grafo-motor.ts";

describe("Motor de Grafos de Relacionamento Multinível (1º, 2º e 3º Graus)", () => {
  it("deve construir o grafo relacional com nós e arestas multinível", () => {
    const motor = new MotorGrafoRelacionamento();
    const grafo = motor.construirGrafo(
      {
        titularId: "00000000191",
        titularNome: "RODRIGO GONCALVES DOS SANTOS",
        titularTipo: "PF",
        sociosEmpresas: [
          {
            cnpj: "30.680.829/0001-43",
            razaoSocial: "ULTRA ENGENHARIA LTDA",
            qualificacao: "Sócio-Administrador",
            percentual: 50,
            sociosSecundarios: [
              { nome: "CARLOS EDUARDO SILVEIRA", documentoParcial: "***.481.928-**", qualificacao: "Sócio" },
              { nome: "FERNANDA LIMA GONCALVES", documentoParcial: "***.219.841-**", qualificacao: "Sócia" },
            ],
          },
          {
            cnpj: "18.940.122/0001-90",
            razaoSocial: "KYTTO PARTICIPACOES E HOLDING LTDA",
            qualificacao: "Sócio-Administrador",
            percentual: 60,
            sociosSecundarios: [],
          },
        ],
        familiares: [
          { nome: "FERNANDA LIMA GONCALVES", parentesco: "Cônjuge", grau: "Cônjuge" },
          { nome: "MARIA APARECIDA GONCALVES", parentesco: "Mãe", grau: "1º Grau" },
        ],
        empregadores: [{ cnpj: "30.680.829/0001-43", nome: "ULTRA ENGENHARIA LTDA", cargo: "Diretor" }],
        patrimonio: [{ identificador: "Matrícula 48912", descricao: "Casa Manacás", tipo: "IMOVEL_URBANO" }],
        processos: [{ numero: "1002491-88.2023.8.11.0055", tribunal: "TJMT", polo: "AUTOR", classe: "Cível" }],
      },
      2, // Profundidade 2
    );

    expect(grafo.nos.length).toBeGreaterThanOrEqual(7);
    expect(grafo.arestas.length).toBeGreaterThanOrEqual(6);

    // Titular deve ser o nó raiz e hub
    const titularNo = grafo.nos.find((n) => n.id === "00000000191");
    expect(titularNo).toBeDefined();
    expect(titularNo?.isHub).toBe(true);
    expect(titularNo?.grauDistancia).toBe(0);

    // Nós de 1º grau
    const empresasGrau1 = grafo.nos.filter((n) => n.grauDistancia === 1 && n.tipo === "empresa");
    expect(empresasGrau1.length).toBe(2);

    // Nós de 2º grau (co-sócios da empresa)
    const sociosGrau2 = grafo.nos.filter((n) => n.grauDistancia === 2 && n.tipo === "socio");
    expect(sociosGrau2.length).toBeGreaterThanOrEqual(1);

    // Métricas analíticas
    expect(grafo.metricas.totalNos).toBe(grafo.nos.length);
    expect(grafo.metricas.totalArestas).toBe(grafo.arestas.length);
    expect(grafo.metricas.densidadeRede).toBeGreaterThan(0);
    expect(grafo.metricas.noHubPrincipalId).toBe("00000000191");
    expect(grafo.metricas.holdingsSocietariasDetectadas.length).toBeGreaterThanOrEqual(1);
  });

  it("deve mapear filiação, sanções CGU, dívida ativa PGFN, TSE e INSS com métricas de risco", () => {
    const motor = new MotorGrafoRelacionamento();
    const grafo = motor.construirGrafo(
      {
        titularId: "53338003000104",
        titularNome: "PATRICIA FERRARI PAULINO GONCALVES",
        titularTipo: "PJ",
        filiacao: {
          nomeMae: "MARIA DE LOURDES FERRARI",
          nomePai: "ANTONIO PAULINO",
          dataNascimento: "1988-02-14",
        },
        sociosEmpresas: [
          {
            cnpj: "53.338.003/0001-04",
            razaoSocial: "KYTTO TECNOLOGIA LTDA",
            qualificacao: "Sócio-Administrador",
            percentual: 100,
            sociosSecundarios: [
              { nome: "RODRIGO RIBEIRO GONCALVES", documentoParcial: "***.000.001-**", qualificacao: "Sócio Diretor" },
            ],
          },
        ],
        familiares: [],
        empregadores: [],
        patrimonio: [{ identificador: "CAR-SP-2023", descricao: "Sede Operacional Kytto", tipo: "IMOVEL_COMERCIAL" }],
        processos: [],
        cguSancoes: [{ tipo: "CEIS", orgao: "CGU Federal", motivo: "Suspensão temporária", gravidade: "CRITICA" }],
        pgfnDividaAtiva: [
          {
            numeroInscricao: "80.1.24.000123-90",
            valorTotalCentavos: 1500000,
            situacao: "ATIVA",
            receita: "Tributária",
          },
        ],
        tseEleitoral: {
          tituloEleitor: "098765432100",
          zona: "015",
          secao: "0088",
          situacao: "REGULAR",
          quitacao: true,
        },
        inssPrevidencia: {
          numeroBeneficio: "198.765.432-1",
          especie: "Aposentadoria",
          rendaMensalBrutaCentavos: 650000,
          margemConsignavelCentavos: 227500,
        },
        protestos: [
          {
            cartorio: "1º Tabelionato de Protestos",
            comarca: "Mirante do Paranapanema",
            uf: "SP",
            valorCentavos: 45000,
          },
        ],
        enderecos: [
          {
            logradouro: "Rua das Acácias",
            bairro: "Centro",
            municipio: "Mirante do Paranapanema",
            uf: "SP",
            cep: "19260-000",
          },
        ],
        chavesPix: [{ tipo: "CNPJ", chave: "53.338.003/0001-04" }],
      },
      3, // Profundidade 3
    );

    // Verifica presença de nós especiais
    const noMae = grafo.nos.find((n) => n.rotulo === "MARIA DE LOURDES FERRARI");
    expect(noMae).toBeDefined();
    expect(noMae?.tipo).toBe("familiar");

    const noPai = grafo.nos.find((n) => n.rotulo === "ANTONIO PAULINO");
    expect(noPai).toBeDefined();

    const noCgu = grafo.nos.find((n) => n.tipo === "sancao_cgu");
    expect(noCgu).toBeDefined();
    expect(noCgu?.nivelRisco).toBe("CRITICO");

    const noPgfn = grafo.nos.find((n) => n.tipo === "divida_ativa_pgfn");
    expect(noPgfn).toBeDefined();

    const noTse = grafo.nos.find((n) => n.tipo === "quitacao_tse");
    expect(noTse).toBeDefined();

    const noInss = grafo.nos.find((n) => n.tipo === "beneficio_inss");
    expect(noInss).toBeDefined();

    const noProtesto = grafo.nos.find((n) => n.tipo === "protesto");
    expect(noProtesto).toBeDefined();

    const noEndereco = grafo.nos.find((n) => n.tipo === "endereco");
    expect(noEndereco).toBeDefined();

    const noPix = grafo.nos.find((n) => n.tipo === "chave_pix");
    expect(noPix).toBeDefined();

    // Verificação de nós de 3º grau
    const nosGrau3 = grafo.nos.filter((n) => n.grauDistancia === 3);
    expect(nosGrau3.length).toBeGreaterThanOrEqual(1);

    // Métricas SNA
    expect(grafo.metricas.riscoSistemicoRede).toBe("CRITICO");
    expect(grafo.metricas.comunidades?.length).toBeGreaterThanOrEqual(3);
    expect(grafo.metricas.nosRiscoCriticoCount).toBeGreaterThanOrEqual(1);
  });

  it("deve expandir nós sob demanda (expandirNo)", () => {
    const motor = new MotorGrafoRelacionamento();
    const expansao = motor.expandirNo("cnpj-53338003000104", "empresa", 1);
    expect(expansao.novosNos.length).toBeGreaterThanOrEqual(1);
    expect(expansao.novasArestas.length).toBeGreaterThanOrEqual(1);
    expect(expansao.novosNos[0]?.tipo).toBe("empresa");
  });
});
