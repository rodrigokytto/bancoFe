import { describe, expect, it } from "vitest";
import { MotorGrafoRelacionamento } from "./grafo-motor.ts";
import { ConectorHobbiesInteresses } from "./integracao-hobbies-interesses.ts";
import { ServicoConsulta360 } from "./servico.ts";

describe("Módulo de Hobbies, Interesses, Esportes, Lattes e Conselhos", () => {
  const conector = new ConectorHobbiesInteresses();

  it("deve consultar hobbies, esportes federados CBT e náutica com sucesso", async () => {
    const res = await conector.consultarHobbiesInteresses("RODRIGO GONCALVES", "00000000191", "Tangará da Serra", "MT");

    expect(res).toBeDefined();
    expect(res.nomeConsultado).toBe("RODRIGO GONCALVES");
    expect(res.documentoConsultado).toBe("00000000191");
    expect(res.esportesHobbies.length).toBeGreaterThan(0);

    const beachTennis = res.esportesHobbies.find((e) => e.nome.includes("Beach Tennis") || e.nome.includes("Tênis"));
    expect(beachTennis).toBeDefined();
    expect(beachTennis?.federacaoOuEntidade).toContain("CBT");

    // Habilitações
    expect(res.habilitacoesEspeciais.length).toBeGreaterThan(0);
    const arrais = res.habilitacoesEspeciais.find((h) => h.tipo.includes("ARRAIS") || h.tipo.includes("MOTONAUTA"));
    expect(arrais).toBeDefined();

    // Clubes de serviço
    expect(res.clubesEAssociacoes.length).toBeGreaterThan(0);
    const rotary = res.clubesEAssociacoes.find(
      (c) => c.nomeEntidade.includes("Rotary") || c.nomeEntidade.includes("Comercial"),
    );
    expect(rotary).toBeDefined();

    // Lattes CNPq
    expect(res.producaoAcademicaELattes).toBeDefined();
    expect(res.producaoAcademicaELattes.nivelEscolaridade).toBe("POS_GRADUACAO_LATO_SENSU");
    expect(res.producaoAcademicaELattes.cursosGraduacao.length).toBeGreaterThan(0);

    // Conselhos de classe
    expect(res.conselhosDeClasse.length).toBeGreaterThan(0);
    const creci = res.conselhosDeClasse.find((c) => c.siglaConselho === "CRECI");
    expect(creci).toBeDefined();
    expect(creci?.situacao).toBe("ATIVO_REGULAR");

    // Estilo de vida
    expect(res.afinidadeMarcasEConsumo).toBeDefined();
    expect(res.afinidadeMarcasEConsumo.scoreAfinidadeMercadoAltoPadrao).toBeGreaterThanOrEqual(70);
  });

  it("deve injetar nós e arestas de hobbies e conselhos no grafo de relacionamentos", async () => {
    const motor = new MotorGrafoRelacionamento();
    const dadosHobbies = await conector.consultarHobbiesInteresses(
      "RODRIGO GONCALVES DOS SANTOS",
      "00000000191",
      "Tangará da Serra",
      "MT",
    );

    const grafo = motor.construirGrafo({
      titularId: "00000000191",
      titularNome: "RODRIGO GONCALVES DOS SANTOS",
      titularTipo: "PF",
      idadeOuTempoAtividade: 41,
      sociosEmpresas: [],
      processos: [],
      bensPatrimoniais: [],
      hobbiesInteresses: {
        esportes: dadosHobbies.esportesHobbies.map((e) => ({
          nome: e.nome,
          federacao: e.federacaoOuEntidade,
          nivel: e.nivelPratica,
        })),
        clubes: dadosHobbies.clubesEAssociacoes.map((c) => ({
          nome: c.nomeEntidade,
          tipo: c.tipo,
          cargo: c.cargoOuFuncao,
        })),
        conselhos: dadosHobbies.conselhosDeClasse.map((c) => ({
          sigla: c.siglaConselho,
          numero: c.numeroInscricao,
          seccional: c.seccionalUf,
          situacao: c.situacao,
        })),
        habilitacoes: dadosHobbies.habilitacoesEspeciais.map((h) => ({
          tipo: h.tipo,
          orgao: h.orgaoEmissor,
          registro: h.numeroRegistroOuLicenca,
        })),
        academico: {
          nivel: dadosHobbies.producaoAcademicaELattes.nivelEscolaridade,
          cursos: dadosHobbies.producaoAcademicaELattes.cursosGraduacao.map((g) => g.curso),
        },
      },
    });

    expect(grafo.nos.length).toBeGreaterThan(3);
    const noHobby = grafo.nos.find((n) => n.categoria === "hobbies_estilo_vida");
    expect(noHobby).toBeDefined();

    const noConselho = grafo.nos.find((n) => n.categoria === "conselho_profissional");
    expect(noConselho).toBeDefined();

    const noAcademico = grafo.nos.find((n) => n.categoria === "formacao_academica");
    expect(noAcademico).toBeDefined();
  });

  it("deve enriquecer o Dossiê 360 com o perfil de Hobbies, Interesses & Lifestyle no ServicoConsulta360", async () => {
    const servico = new ServicoConsulta360();
    const dossie = await servico.consultar({
      cpf: "00000000191",
      nomeCompleto: "RODRIGO GONCALVES DOS SANTOS",
      cidade: "Tangará da Serra",
      uf: "MT",
    });

    expect(dossie.hobbiesInteressesLifestyle).toBeDefined();
    expect(dossie.hobbiesInteressesLifestyle?.esportesHobbies.length).toBeGreaterThan(0);
    expect(dossie.hobbiesInteressesLifestyle?.conselhosDeClasse.length).toBeGreaterThan(0);
    expect(dossie.grafo.nos.some((n) => n.categoria === "hobbies_estilo_vida")).toBe(true);
  }, 45000);
});
