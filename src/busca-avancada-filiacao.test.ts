import { describe, expect, it } from "vitest";
import { ServicoConsulta360 } from "./servico.ts";

describe("Busca Avançada por CPF, Data de Nascimento e Filiação dos Pais", () => {
  const servico = new ServicoConsulta360();

  it("deve realizar consulta combinada a partir de CPF, Data de Nascimento, Nome da Mãe e Nome do Pai", async () => {
    const dossie = await servico.consultar({
      cpf: "000.000.001-91",
      dataNascimento: "12/04/1988",
      nomeMae: "MARIA APARECIDA DA SILVA",
      nomePai: "JOSE PEREIRA DA SILVA",
      nomeCompleto: "RODRIGO RIBEIRO GONCALVES",
      uf: "SP",
      cidade: "Mirante do Paranapanema",
      profundidadeGrafo: 2,
    });

    // Identificação e parâmetros informados
    expect(dossie.parametrosBuscaAvancada?.cpfInformado).toBe("00000000191");
    expect(dossie.parametrosBuscaAvancada?.dataNascimentoInformada).toBe("12/04/1988");
    expect(dossie.parametrosBuscaAvancada?.nomeMaeInformado).toBe("MARIA APARECIDA DA SILVA");
    expect(dossie.parametrosBuscaAvancada?.nomePaiInformado).toBe("JOSE PEREIRA DA SILVA");

    // Identificação enriquecida
    expect(dossie.identificacao.dataNascimentoOuFundacao).toBe("1988-04-12");
    expect(dossie.identificacao.idadeOuTempoAtividadeAnos).toBeGreaterThanOrEqual(35);
    expect(dossie.identificacao.nomeMae).toBe("MARIA APARECIDA DA SILVA");

    // Qualificação Civil Notarial
    expect(dossie.qualificacaoCivil?.filiacaoMaeCompleta).toBe("MARIA APARECIDA DA SILVA");
    expect(dossie.qualificacaoCivil?.filiacaoPaiCompleta).toBe("JOSE PEREIRA DA SILVA");

    // Vínculos Familiares de 1º Grau
    const temMae = dossie.familiares.some((f) => f.grauParentesco === "MAE" && f.nome === "MARIA APARECIDA DA SILVA");
    const temPai = dossie.familiares.some((f) => f.grauParentesco === "PAI" && f.nome === "JOSE PEREIRA DA SILVA");
    expect(temMae).toBe(true);
    expect(temPai).toBe(true);

    // Mapeamento no Grafo Relacional
    const nosRotulos = dossie.grafo.nos.map((n) => n.rotulo);
    expect(nosRotulos).toContain("MARIA APARECIDA DA SILVA");
    expect(nosRotulos).toContain("JOSE PEREIRA DA SILVA");

    const arestasTipos = dossie.grafo.arestas.map((a) => a.tipo);
    expect(arestasTipos).toContain("PAI_DE");

    // Bureaus de Crédito Oficiais (Serasa Experian, SPC, Boa Vista, Quod)
    expect(dossie.bureausCredito).toBeDefined();
    expect(dossie.bureausCredito?.serasaExperian.scoreSerasa).toBeGreaterThanOrEqual(800);
    expect(dossie.bureausCredito?.spcBrasil.scoreSpc).toBeGreaterThanOrEqual(800);
    expect(dossie.bureausCredito?.boaVistaScpc.scoreBoaVista).toBeGreaterThanOrEqual(800);
    expect(dossie.bureausCredito?.quod.scoreQuod).toBeGreaterThanOrEqual(800);
    expect(dossie.bureausCredito?.resumoConsolidado.classificacaoRiscoGeral).toBe("ADIMPLENTE_TOTAL");
  }, 40000);

  it("deve permitir busca por CPF e Data de Nascimento em formato ISO (AAAA-MM-DD)", async () => {
    const dossie = await servico.consultar({
      cpf: "00000000191",
      dataNascimento: "1995-09-20",
      nomeMae: "PATRICIA FERRARI PAULINO",
    });

    expect(dossie.identificacao.dataNascimentoOuFundacao).toBe("1995-09-20");
    expect(dossie.identificacao.nomeMae).toBe("PATRICIA FERRARI PAULINO");
    expect(dossie.bureausCredito?.serasaExperian.cadastroPositivoSerasa.status).toBe("ATIVO");
  }, 40000);
});
