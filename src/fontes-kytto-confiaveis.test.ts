import { describe, expect, it } from "vitest";
import { ConectorFontesConfiaveisKytto } from "./fontes-kytto-confiaveis.ts";

describe("Fontes Confiáveis e Certidões Oficiais do CNPJ Kytto (Patricia)", () => {
  it("deve coletar e certificar todas as 10 fontes governamentais e cartorárias com 100% de regularidade", async () => {
    const conector = new ConectorFontesConfiaveisKytto();
    const dossie = await conector.coletarDossieFontesConfiaveis("TESTE-KYTTO-001");

    // 1. Entidade
    expect(dossie.entidade.cnpj).toBe("53.338.003/0001-04");
    expect(dossie.entidade.razaoSocial).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    expect(dossie.entidade.inscricaoMunicipal).toBe("11738");
    expect(dossie.entidade.ibge).toBe("3530201");
    expect(dossie.scoreConfiabilidadeCorporativa).toBe(990);
    expect(dossie.classificacaoIdoneidade).toBe("EXCELENTE_IDONEIDADE_TOTAL");

    // 2. SEFAZ-SP / CADESP
    const sefaz = dossie.certidoesEConexoesOficiais.sefazSpCadesp;
    expect(sefaz.situacao).toBe("REGULAR_NADA_CONSTA");
    expect(sefaz.hashIntegridadeSha256.length).toBe(64);
    expect(sefaz.detalhes.delegaciaRegionalTributaria).toContain("DRT-10");

    // 3. Receita Federal e PGFN
    const rfb = dossie.certidoesEConexoesOficiais.receitaFederalPgfn;
    expect(rfb.situacao).toBe("CERTIDAO_NEGATIVA_EMITIDA");
    expect(rfb.detalhes.situacaoCadastral).toBe("ATIVA");

    // 4. Simples Nacional
    const simples = dossie.certidoesEConexoesOficiais.simplesNacionalSimei;
    expect(simples.situacao).toBe("OPTANTE_ATIVO");
    expect(simples.detalhes.dataInicioOpcao).toBe("02/01/2024");

    // 5. TST / BNDT Trabalhista
    const tst = dossie.certidoesEConexoesOficiais.tstTrt15TrabalhistaBndt;
    expect(tst.situacao).toBe("CERTIDAO_NEGATIVA_EMITIDA");
    expect(tst.detalhes.jurisdicaoTrt).toContain("TRT 15ª Região");

    // 6. Caixa FGTS CRF
    const caixa = dossie.certidoesEConexoesOficiais.caixaFgtsCrf;
    expect(caixa.situacao).toBe("REGULAR");
    expect(caixa.detalhes.situacaoEmpregador).toBe("REGULAR");

    // 7. CGU Transparência (CEIS / CNEP / CEPIM)
    const cgu = dossie.certidoesEConexoesOficiais.cguTransparenciaCeisCnep;
    expect(cgu.situacao).toBe("REGULAR_NADA_CONSTA");
    expect(cgu.detalhes.cadastroInidoneosSuspensosCeis).toBe(0);

    // 8. JUCESP / REDESIM
    const jucesp = dossie.certidoesEConexoesOficiais.jucespRedesim;
    expect(jucesp.situacao).toBe("REGULAR");
    expect(jucesp.detalhes.titularEmpresarial).toBe("PATRICIA FERRARI PAULINO GONCALVES");

    // 9. Prefeitura de Mirante do Paranapanema
    const pref = dossie.certidoesEConexoesOficiais.prefeituraMiranteParanapanema;
    expect(pref.situacao).toBe("CERTIDAO_NEGATIVA_EMITIDA");
    expect(pref.detalhes.inscricaoMunicipal).toBe("11738");

    // 10. Registro.br e Infraestrutura
    const reg = dossie.certidoesEConexoesOficiais.registroBrInfraestrutura;
    expect(reg.situacao).toBe("REGULAR");
    expect(reg.detalhes.dominioPrincipal).toBe("kytto.com.br");

    // 11. CENPROT-SP Cartórios de Protestos
    const cenprot = dossie.certidoesEConexoesOficiais.cenprotCartoriosProtestosSp;
    expect(cenprot.situacao).toBe("REGULAR_NADA_CONSTA");
    expect(cenprot.detalhes.totalOcorrenciasBrasil).toBe(0);

    // 12. Chaves Pix
    expect(dossie.chavesPixAuditadas.length).toBe(3);
    const pixCnpj = dossie.chavesPixAuditadas.find((p) => p.tipo === "CNPJ");
    expect(pixCnpj?.statusDictBacen).toBe("ATIVA_E_VALIDADA");
  });
});
