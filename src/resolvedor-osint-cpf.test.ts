import { describe, expect, it } from "vitest";
import { ServicoConsulta360 } from "./servico.ts";

describe("Resolvedor Real OSINT & Validação Criptográfica RFB / BrasilAPI / DataJud", () => {
  const servico = new ServicoConsulta360();

  it("deve resolver o CPF 06988722661 como LUCAS DOS PASSOS SILVA (CIO na UISA - Usinas Itamarati S/A) sem dados fictícios", async () => {
    const dossie = await servico.consultar({
      cpf: "06988722661",
      forcarAtualizacao: true,
    });

    expect(dossie.identificacao.nomeCompleto).toBe("LUCAS DOS PASSOS SILVA");
    expect(dossie.identificacao.regiaoFiscalRfb?.regiao).toBe("6ª Região Fiscal");
    expect(dossie.identificacao.enderecos[0]?.cidade).toBe("Uberaba");
    expect(dossie.identificacao.enderecos[0]?.uf).toBe("MG");
    expect(dossie.identificacao.enderecos[0]?.cep).toBe("38080-140");

    // Vínculo executivo na UISA (Usinas Itamarati S/A)
    expect(dossie.empregoRenda.length).toBeGreaterThanOrEqual(1);
    expect(dossie.empregoRenda[0]?.razaoSocialEmpregador).toBe("USINAS ITAMARATI S/A");
    expect(dossie.empregoRenda[0]?.cnpjEmpregador).toBe("15.009.178/0001-70");
    expect(dossie.empregoRenda[0]?.cargo).toContain("CIO");

    // QSA Receita Federal (12.690.391/0001-00 e 15.009.178/0001-70)
    const cnpjs = dossie.societarioQsa.map((s) => s.cnpjEmpresa);
    expect(cnpjs).toContain("12.690.391/0001-00");
    expect(cnpjs).toContain("15.009.178/0001-70");

    // Não deve conter dados fictícios de fallback (Maria Aparecida, Hilux, Fazenda, etc.)
    expect(dossie.qualificacaoCivil?.filiacaoMaeCompleta).not.toBe("MARIA APARECIDA GONCALVES");
    expect(dossie.patrimonioVeiculosBens?.veiculos.length).toBe(0);

    // O grafo deve conectar Lucas dos Passos Silva -> Usinas Itamarati S/A -> Rodrigo Ribeiro Gonçalves
    const rotulosGrafo = dossie.grafo.nos.map((n) => n.rotulo);
    expect(rotulosGrafo).toContain("LUCAS DOS PASSOS SILVA");
    expect(rotulosGrafo).toContain("USINAS ITAMARATI S/A");
    expect(rotulosGrafo).toContain("RODRIGO RIBEIRO GONCALVES");
  }, 60000);

  it("deve resolver o CPF 30587162813 como RODRIGO RIBEIRO GONCALVES (Diretor Estatutário UISA & Sócio Estância Gonçalves) sem dados fictícios", async () => {
    const dossie = await servico.consultar({
      cpf: "30587162813",
      forcarAtualizacao: true,
    });

    expect(dossie.identificacao.nomeCompleto).toBe("RODRIGO RIBEIRO GONCALVES");
    expect(dossie.identificacao.regiaoFiscalRfb?.regiao).toBe("8ª Região Fiscal");
    expect(dossie.identificacao.enderecos[0]?.cidade).toBe("Mirante do Paranapanema");
    expect(dossie.identificacao.enderecos[0]?.uf).toBe("SP");

    const cnpjs = dossie.societarioQsa.map((s) => s.cnpjEmpresa);
    expect(cnpjs).toContain("64.336.577/0001-51");
    expect(cnpjs).toContain("15.009.178/0001-70");
    expect(cnpjs).toContain("53.338.003/0001-04");

    // Patrimônio rural real (Estância Gonçalves) e zero veículos/aviões fictícios
    expect(dossie.patrimonioVeiculosBens?.veiculos.length).toBe(0);
    expect(dossie.patrimonioVeiculosBens?.imoveisRurais.length).toBe(1);
    expect(dossie.patrimonioVeiculosBens?.imoveisRurais[0]?.denominacaoImovel).toContain("ESTÂNCIA GONÇALVES");

    const rotulosGrafo = dossie.grafo.nos.map((n) => n.rotulo);
    expect(rotulosGrafo).toContain("RODRIGO RIBEIRO GONCALVES");
    expect(rotulosGrafo).toContain("PATRICIA FERRARI PAULINO GONCALVES");
    expect(rotulosGrafo).toContain("USINAS ITAMARATI S/A");
  }, 60000);

  it("deve resolver o CNPJ 53338003000104 (Kytto - Patrícia Ferrari Paulino Gonçalves) sem sócios fictícios", async () => {
    const dossie = await servico.consultar({
      cnpj: "53338003000104",
      forcarAtualizacao: true,
    });

    expect(dossie.identificacao.nomeCompleto).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    expect(dossie.societarioQsa.length).toBeGreaterThanOrEqual(1);
    const cnpjsQsa = dossie.societarioQsa.map((s) => s.cnpjEmpresa);
    expect(cnpjsQsa).toContain("53.338.003/0001-04");
    const nomesOutrosSocios = dossie.societarioQsa[0]?.outrosSocios.map((s) => s.nome) || [];
    expect(nomesOutrosSocios).not.toContain("CARLOS EDUARDO SILVEIRA");
    expect(nomesOutrosSocios).not.toContain("FERNANDA LIMA GONCALVES");
  }, 60000);
});
