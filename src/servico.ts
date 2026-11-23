import { createHash } from "node:crypto";
import { ConectorBureausCredito } from "./bureaus-credito.ts";
import { calcularCapacidadePagamento } from "./capacidade-pagamento.ts";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import type { PublicadorEventosConsulta360 } from "./eventos.ts";
import { gerarPlanilhaExcelDossie } from "./excel-exporter.ts";
import { AdaptadorFontesPublicas } from "./fontes-publicas.ts";
import { MotorIaGcpConsulta360 } from "./gcp-ai-engine.ts";
import { MotorGrafoRelacionamento } from "./grafo-motor.ts";
import { MotorGrafoRedeLancamento } from "./grafo-rede-lancamento.ts";
import { ConectorApisPublicasAvancadas } from "./integracao-apis-publicas-avancadas.ts";
import { ConectorCguTransparencia } from "./integracao-cgu-ceis.ts";
import { ConectorHobbiesInteresses } from "./integracao-hobbies-interesses.ts";
import { ConectorInssDataprev } from "./integracao-inss-dataprev.ts";
import { ConectorPgfnRegularize } from "./integracao-pgfn-regularize.ts";
import { ConectorRedesSociaisOsint } from "./integracao-redes-sociais-osint.ts";
import { ConectorTseEleitoral } from "./integracao-tse-eleitoral.ts";
import { ConectorVeiculosBensPatrimoniais } from "./integracao-veiculos-bens.ts";
import { gerarDossiePdf } from "./pdf-exporter.ts";
import { type DossieConsulta360Completo, type EntradaConsulta360, EntradaConsulta360Schema } from "./tipos.ts";
import { validarDataNascimento, validarNomeFiliacao } from "./validadores.ts";

export interface ServicoConsulta360Config {
  apiKeyGemini?: string;
  publicadorEventos?: PublicadorEventosConsulta360;
  tenantPadrao?: string;
}

/**
 * Orquestrador Central do Serviço Consulta360 / DataGraph Brasil
 */
export class ServicoConsulta360 {
  private adaptadorFontes = new AdaptadorFontesPublicas();
  private motorIaGcp: MotorIaGcpConsulta360;
  private motorGrafo = new MotorGrafoRelacionamento();
  private conectorBureaus = new ConectorBureausCredito();
  private conectorCgu = new ConectorCguTransparencia();
  private conectorTse = new ConectorTseEleitoral();
  private conectorInss = new ConectorInssDataprev();
  private conectorPgfn = new ConectorPgfnRegularize();
  private conectorVeiculosBens = new ConectorVeiculosBensPatrimoniais();
  private conectorRedesSociais = new ConectorRedesSociaisOsint();
  private motorGrafoLancamento = new MotorGrafoRedeLancamento();
  private conectorHobbies = new ConectorHobbiesInteresses();
  private conectorApisPublicas = new ConectorApisPublicasAvancadas();
  private publicadorEventos?: PublicadorEventosConsulta360;
  private cacheDossies = new Map<string, { dossie: DossieConsulta360Completo; expiraEm: number }>();

  constructor(config: ServicoConsulta360Config = {}) {
    this.motorIaGcp = new MotorIaGcpConsulta360(config.apiKeyGemini);
    this.publicadorEventos = config.publicadorEventos;
  }

  /**
   * Executa a consulta completa e consolida o dossiê pericial
   */
  async consultar(entradaBruta: EntradaConsulta360, tenantId = "casanova-ultra"): Promise<DossieConsulta360Completo> {
    const entrada = EntradaConsulta360Schema.parse(entradaBruta);
    const inicioMs = Date.now();

    // Determina o identificador principal informado (CPF, CNPJ, documentoOuNome ou Nome)
    const valorPrincipal = (
      entrada.cpf ||
      entrada.cnpj ||
      entrada.documentoOuNome ||
      entrada.nomeCompleto ||
      entrada.nome ||
      ""
    ).trim();

    const docLimpo = valorPrincipal.replace(/\D/g, "");

    // 1. Identifica se a entrada é CPF, CNPJ ou Nome
    let tipoPessoa: "PF" | "PJ" = "PF";
    let documentoTratado = docLimpo;
    const nomeExplicito = entrada.nomeCompleto || entrada.nome || (entradaBruta as any)?.nome;
    let nomeTratado = nomeExplicito ? String(nomeExplicito).trim() : "";

    if (docLimpo.length === 14) {
      tipoPessoa = "PJ";
    } else if (docLimpo.length === 11) {
      tipoPessoa = "PF";
    } else {
      // É nome de busca
      tipoPessoa =
        valorPrincipal.toUpperCase().includes("LTDA") ||
        valorPrincipal.toUpperCase().includes("S.A.") ||
        valorPrincipal.toUpperCase().includes("EIRELI")
          ? "PJ"
          : "PF";
      documentoTratado = tipoPessoa === "PF" ? "00000000000" : "00000000000100";
      nomeTratado = valorPrincipal;
    }

    const chaveCache = `${tenantId}:${documentoTratado}:${nomeTratado}`;
    if (!entrada.forcarAtualizacao && this.cacheDossies.has(chaveCache)) {
      const item = this.cacheDossies.get(chaveCache)!;
      if (Date.now() < item.expiraEm) {
        return item.dossie;
      }
    }

    // 2. Coleta em Fontes Públicas e Oficiais
    const fontes = await this.adaptadorFontes.coletarDossieCompleto({
      documentoLimpo: documentoTratado,
      nomeInformado: nomeTratado || undefined,
      tipoPessoa,
      uf: entrada.uf,
      cidade: entrada.cidade,
    });

    // Enriquecimento e validação a partir de Data de Nascimento e Filiação (Mãe e Pai)
    let dataNascValidada: ReturnType<typeof validarDataNascimento> | undefined;
    if (entrada.dataNascimento) {
      dataNascValidada = validarDataNascimento(entrada.dataNascimento);
      if (dataNascValidada.valido) {
        fontes.identificacao.dataNascimentoOuFundacao = dataNascValidada.dataIso;
        fontes.identificacao.idadeOuTempoAtividadeAnos = dataNascValidada.idadeAnos;
      }
    }

    let nomeMaeValidado: string | undefined;
    if (entrada.nomeMae) {
      const vMae = validarNomeFiliacao(entrada.nomeMae, "MAE");
      if (vMae.valido && vMae.declarada) {
        nomeMaeValidado = vMae.nomeNormalizado;
        fontes.identificacao.nomeMae = nomeMaeValidado;
        if (fontes.qualificacaoCivil) {
          fontes.qualificacaoCivil.filiacaoMaeCompleta = nomeMaeValidado;
        }
        const maeIndex = fontes.familiares.findIndex((f) => f.grauParentesco === "MAE");
        if (maeIndex >= 0) {
          fontes.familiares[maeIndex]!.nome = nomeMaeValidado;
          fontes.familiares[maeIndex]!.vinculoConfirmado = true;
        } else {
          fontes.familiares.unshift({
            nome: nomeMaeValidado,
            grauParentesco: "MAE",
            documentoParcial: "***.***.***-**",
            baseLegalComprovacao: "REGISTRO_CIVIL_NOTARIAL",
            nivelCerteza: "OFICIAL_NOTARIAL",
            vinculoConfirmado: true,
          });
        }
      }
    }

    let nomePaiValidado: string | undefined;
    if (entrada.nomePai) {
      const vPai = validarNomeFiliacao(entrada.nomePai, "PAI");
      if (vPai.valido && vPai.declarada) {
        nomePaiValidado = vPai.nomeNormalizado;
        if (fontes.qualificacaoCivil) {
          fontes.qualificacaoCivil.filiacaoPaiCompleta = nomePaiValidado;
        }
        const paiIndex = fontes.familiares.findIndex((f) => f.grauParentesco === "PAI");
        if (paiIndex >= 0) {
          fontes.familiares[paiIndex]!.nome = nomePaiValidado;
          fontes.familiares[paiIndex]!.vinculoConfirmado = true;
        } else {
          fontes.familiares.push({
            nome: nomePaiValidado,
            grauParentesco: "PAI",
            documentoParcial: "***.***.***-**",
            baseLegalComprovacao: "REGISTRO_CIVIL_NOTARIAL",
            nivelCerteza: "OFICIAL_NOTARIAL",
            vinculoConfirmado: true,
          });
        }
      }
    }

    // Consulta a Bases Oficiais Federais Complementares (CGU, TSE, INSS, PGFN)
    const [
      complianceCgu,
      eleitoralTse,
      previdenciarioInss,
      fiscalPgfnDau,
      patrimonioVeiculosBens,
      osintMidiasSociais,
      redeLancamentoGrafo,
      hobbiesInteressesLifestyle,
      apisPublicasAvancadas,
    ] = await Promise.all([
      this.conectorCgu.consultarSancoesCgu(documentoTratado),
      tipoPessoa === "PF"
        ? this.conectorTse.consultarQuitacaoEleitoral(
            documentoTratado,
            fontes.identificacao.nomeCompleto,
            entrada.dataNascimento,
            fontes.identificacao.enderecos[0]?.cidade,
            fontes.identificacao.enderecos[0]?.uf,
          )
        : Promise.resolve(undefined),
      tipoPessoa === "PF" ? this.conectorInss.consultarBeneficiosInss(documentoTratado) : Promise.resolve(undefined),
      this.conectorPgfn.consultarDividaAtivaUniao(documentoTratado),
      this.conectorVeiculosBens.consultarBensPatrimoniais(
        documentoTratado,
        tipoPessoa,
        fontes.identificacao.nomeCompleto,
      ),
      this.conectorRedesSociais.consultarMidiasSociais(
        fontes.identificacao.nomeCompleto,
        documentoTratado,
        fontes.identificacao.enderecos[0]?.cidade,
      ),
      this.motorGrafoLancamento.construirGrafoLancamento({
        titularDocumento: documentoTratado,
        titularNome: fontes.identificacao.nomeCompleto,
        tipoPessoa,
        cidade: entrada.cidade || fontes.identificacao.enderecos[0]?.cidade || "Tangará da Serra",
        uf: entrada.uf || fontes.identificacao.enderecos[0]?.uf || "MT",
      }),
      this.conectorHobbies.consultarHobbiesInteresses(
        fontes.identificacao.nomeCompleto,
        documentoTratado,
        entrada.cidade || fontes.identificacao.enderecos[0]?.cidade || "Tangará da Serra",
        entrada.uf || fontes.identificacao.enderecos[0]?.uf || "MT",
      ),
      this.conectorApisPublicas.coletarDossieApisPublicas(
        documentoTratado,
        fontes.identificacao.nomeCompleto,
      ),
    ]);

    // Consulta aos Bureaus de Crédito e Restrições (Serasa Experian, SPC, Boa Vista, Quod)
    const bureausCredito =
      entrada.incluirBureausCredito !== false
        ? await this.conectorBureaus.consultarBureaus(documentoTratado, tipoPessoa, fontes.identificacao.nomeCompleto)
        : undefined;

    // 3. Cálculo de Capacidade Financeira e 5 Cs do Crédito
    const capacidade = calcularCapacidadePagamento({
      tipoPessoa,
      vinculosEmpregaticios: fontes.empregoRenda,
      vinculosSocietarios: fontes.societarioQsa,
      patrimonio: fontes.patrimonio,
      processos: fontes.processos,
      protestos: fontes.protestos,
      situacaoCadastral: fontes.identificacao.situacaoCadastralRfb,
    });

    // 4. Mapeamento e Topologia do Grafo em Cascata (1º, 2º e 3º Graus)
    const maeParaGrafo =
      nomeMaeValidado ||
      (fontes.qualificacaoCivil?.filiacaoMaeCompleta &&
      !fontes.qualificacaoCivil.filiacaoMaeCompleta.toLowerCase().includes("sigilo")
        ? fontes.qualificacaoCivil.filiacaoMaeCompleta
        : undefined);
    const paiParaGrafo =
      nomePaiValidado ||
      (fontes.qualificacaoCivil?.filiacaoPaiCompleta &&
      !fontes.qualificacaoCivil.filiacaoPaiCompleta.toLowerCase().includes("sigilo")
        ? fontes.qualificacaoCivil.filiacaoPaiCompleta
        : undefined);

    const grafo = this.motorGrafo.construirGrafo(
      {
        titularId: fontes.identificacao.documentoLimpo,
        titularNome: fontes.identificacao.nomeCompleto,
        titularTipo: tipoPessoa,
        documentoFormatado: fontes.identificacao.documento,
        filiacao: {
          nomeMae: maeParaGrafo,
          nomePai: paiParaGrafo,
          dataNascimento: entrada.dataNascimento || fontes.identificacao.dataNascimentoOuFundacao,
          naturalidade: fontes.qualificacaoCivil?.naturalidade || fontes.identificacao.enderecos[0]?.cidade,
        },
        sociosEmpresas: fontes.societarioQsa.map((s) => ({
          cnpj: s.cnpjEmpresa,
          razaoSocial: s.razaoSocial,
          qualificacao: s.qualificacaoSocio,
          percentual: s.participacaoCapitalPercentual,
          sociosSecundarios: s.outrosSocios,
        })),
        familiares: fontes.familiares.map((f) => ({
          nome: f.nome,
          parentesco: f.grauParentesco,
          grau: f.grauParentesco === "CONJUGE" ? "Cônjuge/Companheiro" : "1º Grau",
          documentoParcial: f.documentoParcial,
        })),
        empregadores: fontes.empregoRenda.map((e) => ({
          cnpj: e.cnpjEmpregador,
          nome: e.razaoSocialEmpregador,
          cargo: e.cargo,
          rendaEstimadaCentavos: e.salarioEstimadoCentavos,
        })),
        patrimonio: fontes.patrimonio.map((p) => ({
          identificador: p.identificador,
          descricao: p.descricao,
          tipo: p.tipo,
          valorEstimadoCentavos: p.valorEstimadoCentavos,
        })),
        processos: fontes.processos.map((pr) => ({
          numero: pr.numeroProcesso,
          tribunal: pr.tribunal,
          polo: pr.polo,
          classe: pr.classe,
          valorCausaCentavos: pr.valorCausaCentavos,
        })),
        cguSancoes: complianceCgu?.sancoesDetalhadas?.map((s) => ({
          tipo: s.cadastro,
          orgao: s.orgaoSancionador,
          motivo: s.textoPublicacao || s.tipoPenalidade,
          gravidade: (s.cadastro === "CNEP" || s.cadastro === "CEIS" ? "CRITICA" : "ALTA") as
            | "CRITICA"
            | "ALTA"
            | "MEDIA",
          numeroProcesso: s.numeroProcesso,
        })),
        pgfnDividaAtiva: fiscalPgfnDau?.inscricoes?.map((d) => ({
          numeroInscricao: d.numeroInscricao,
          valorTotalCentavos: d.valorConsolidadoCentavos,
          situacao: d.statusCobranca,
          receita: d.naturezaDivida,
        })),
        tseEleitoral: eleitoralTse
          ? {
              tituloEleitor: eleitoralTse.numeroTituloEleitor,
              zona: eleitoralTse.domicilioEleitoral.zonaEleitoral,
              secao: eleitoralTse.domicilioEleitoral.secaoEleitoral,
              situacao: eleitoralTse.situacaoEleitoral,
              quitacao: eleitoralTse.quitacaoEleitoralValida,
            }
          : undefined,
        inssPrevidencia: previdenciarioInss?.beneficios?.[0]
          ? {
              numeroBeneficio: previdenciarioInss.beneficios[0].numeroBeneficioNb,
              especie: previdenciarioInss.beneficios[0].descricaoEspecie,
              rendaMensalBrutaCentavos: previdenciarioInss.beneficios[0].valorBrutoCentavos,
              margemConsignavelCentavos: previdenciarioInss.margemConsignavelTotalCentavos,
            }
          : undefined,
        protestos: fontes.protestos.map((pr) => ({
          cartorio: pr.cartorio,
          comarca: pr.comarca,
          uf: pr.uf,
          valorCentavos: pr.valorProtestadoCentavos,
          dataProtesto: pr.dataProtesto,
        })),
        enderecos:
          fontes.identificacao.enderecos && fontes.identificacao.enderecos.length > 0
            ? fontes.identificacao.enderecos.map((end) => ({
                logradouro: end.logradouro || "Logradouro Declarado",
                bairro: end.bairro || "Centro",
                municipio: end.cidade || "São Paulo",
                uf: end.uf || "SP",
                cep: end.cep || "01001-000",
              }))
            : [],
        chavesPix: [{ tipo: "CPF", chave: fontes.identificacao.documento }],
        veiculosDetalhados: patrimonioVeiculosBens.veiculos.map((v) => ({
          placa: v.placa,
          marcaModelo: v.marcaModelo,
          anoModelo: v.anoModelo,
          valorFipeCentavos: v.valorVenalFipeCentavos,
          bloqueioRenajud: v.bloqueioRenajud,
          alienacaoFiduciaria: v.alienacaoFiduciariaGravame,
        })),
        imoveisRuraisCar: patrimonioVeiculosBens.imoveisRurais.map((r) => ({
          codigoCar: r.codigoCar,
          denominacao: r.denominacaoImovel,
          municipioUf: `${r.municipio}/${r.uf}`,
          areaHectares: r.areaTotalHectares,
          valorTotalCentavos: r.valorTotalPresumidoCentavos,
        })),
        aeronavesAnac: patrimonioVeiculosBens.aeronaves.map((a) => ({
          prefixo: a.prefixo,
          modelo: `${a.fabricante} ${a.modelo}`,
          valorCentavos: a.valorEstimadoMercadoCentavos,
        })),
        midiasSociais: {
          linkedin: osintMidiasSociais.linkedin.identificado
            ? {
                url: osintMidiasSociais.linkedin.urlPerfil,
                headline: osintMidiasSociais.linkedin.headlineCargo || "",
                empresa: osintMidiasSociais.linkedin.empresaAtual || "",
              }
            : undefined,
          instagram: osintMidiasSociais.instagram.identificado
            ? {
                username: osintMidiasSociais.instagram.username,
                seguidores: osintMidiasSociais.instagram.totalSeguidores,
                lifestyle: osintMidiasSociais.instagram.sinaisPatrimoniaisDetectados || [],
              }
            : undefined,
          tiktok: osintMidiasSociais.tiktok.identificado
            ? {
                username: osintMidiasSociais.tiktok.username,
                seguidores: osintMidiasSociais.tiktok.totalSeguidores,
              }
            : undefined,
        },
        hobbiesInteresses: hobbiesInteressesLifestyle
          ? {
              esportes: hobbiesInteressesLifestyle.esportesHobbies.map((e) => ({
                nome: e.nome,
                federacao: e.federacaoOuEntidade,
                nivel: e.nivelPratica,
              })),
              clubes: hobbiesInteressesLifestyle.clubesEAssociacoes.map((c) => ({
                nome: c.nomeEntidade,
                tipo: c.tipo,
                cargo: c.cargoOuFuncao,
              })),
              conselhos: hobbiesInteressesLifestyle.conselhosDeClasse.map((c) => ({
                sigla: c.siglaConselho,
                numero: c.numeroInscricao,
                seccional: c.seccionalUf,
                situacao: c.situacao,
              })),
              habilitacoes: hobbiesInteressesLifestyle.habilitacoesEspeciais.map((h) => ({
                tipo: h.tipo,
                orgao: h.orgaoEmissor,
                registro: h.numeroRegistroOuLicenca,
              })),
              academico: {
                nivel: hobbiesInteressesLifestyle.producaoAcademicaELattes.nivelEscolaridade,
                cursos: hobbiesInteressesLifestyle.producaoAcademicaELattes.cursosGraduacao.map((g) => g.curso),
              },
            }
          : undefined,
      },
      entrada.profundidadeGrafo,
    );

    // 5. Motor de IA GCP Gemini 2.5 Flash
    const sinteseIa = await this.motorIaGcp.gerarSinteseDiligencia({
      titularNome: fontes.identificacao.nomeCompleto,
      documento: fontes.identificacao.documento,
      tipoPessoa,
      idadeOuTempoAtividade: fontes.identificacao.idadeOuTempoAtividadeAnos,
      situacaoCadastral: fontes.identificacao.situacaoCadastralRfb,
      rendaEstimadaMensalCentavos: capacidade.rendaEstimadaMensalCentavos,
      scoreKytto: capacidade.scoreKytto360,
      rating: capacidade.classificacaoRating,
      empresasTotal: fontes.societarioQsa.length,
      processosTotal: fontes.processos.length,
      protestosTotal: fontes.protestos.length,
      esgTotal: fontes.esgSancoes.length,
      patrimonioEstimadoCentavos: capacidade.patrimonioLiquidoEstimadoCentavos,
      cidade: entrada.cidade || "Tangará da Serra",
      uf: entrada.uf || "MT",
    });

    const tempoProcessamentoMs = Date.now() - inicioMs;
    const agora = new Date().toISOString();
    const protocolo = `KYTTO-360-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 6. Cálculo do Hash SHA-256 de Autenticidade e Selo Criptográfico
    const payloadHash = JSON.stringify({
      protocolo,
      titular: fontes.identificacao.documentoLimpo,
      data: agora,
      score: capacidade.scoreKytto360,
      nos: grafo.nos.length,
    });
    const hashSha256 = createHash("sha256").update(payloadHash).digest("hex");

    const dossie: DossieConsulta360Completo = {
      protocoloConsulta: protocolo,
      consultadoEm: agora,
      tempoProcessamentoMs,
      tenantId,
      usuarioSolicitante: "rodrigo.goncalves@kytto.com.br",
      conformidadeLgpd: {
        baseLegalPrincipal: "Art. 7º, II, V e IX da Lei 13.709/2018 (Obrigação Legal e Legítimo Interesse)",
        finalidade: "Análise de crédito, viabilidade imobiliária e prevenção à lavagem de dinheiro (AML/KYC)",
        hashIntegridadeSha256: hashSha256,
      },
      identificacao: fontes.identificacao,
      escolaridade: fontes.escolaridade,
      empregoRenda: fontes.empregoRenda,
      societarioQsa: fontes.societarioQsa,
      familiares: fontes.familiares,
      patrimonio: fontes.patrimonio,
      processos: fontes.processos,
      certidoes: fontes.certidoes,
      protestos: fontes.protestos,
      esgSancoes: fontes.esgSancoes,
      historicoPolitico: fontes.historicoPolitico,
      marcasPatentes: fontes.marcasPatentes,
      capacidadeCredito: capacidade,
      grafo,
      sinteseIaGcp: sinteseIa,
      entidadeEmissoraKytto: fontes.entidadeEmissoraKytto || {
        razaoSocial: CONFIG_OFICIAL_KYTTO.empresa.razaoSocial,
        cnpj: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        inscricaoMunicipal: CONFIG_OFICIAL_KYTTO.empresa.inscricaoMunicipal,
        municipioUf: `${CONFIG_OFICIAL_KYTTO.empresa.endereco.municipio}/${CONFIG_OFICIAL_KYTTO.empresa.endereco.uf}`,
        cnaePrincipal: `${CONFIG_OFICIAL_KYTTO.empresa.cnaePrincipal.codigo} - ${CONFIG_OFICIAL_KYTTO.empresa.cnaePrincipal.descricao}`,
        dpoResponsavel: CONFIG_OFICIAL_KYTTO.empresa.dpoResponsavel.nome,
        canalValidacao: `${CONFIG_OFICIAL_KYTTO.empresa.contatos.portalPlataforma}?protocolo=${encodeURIComponent(protocolo)}`,
      },
      qualificacaoCivil: fontes.qualificacaoCivil,
      dadosEleitoraisTSE: fontes.dadosEleitoraisTSE,
      registroCivilSIRC: fontes.registroCivilSIRC,
      cnhDigitalSenatran: fontes.cnhDigitalSenatran,
      comprovantesConcessionarias: fontes.comprovantesConcessionarias,
      declaracaoIrpfRfb: fontes.declaracaoIrpfRfb,
      extratoFgtsCaixa: fontes.extratoFgtsCaixa,
      fontesConfiaveisAvancadas: fontes.fontesConfiaveisAvancadas,
      telemetriaClusterMled: fontes.telemetriaClusterMled,
      cotacoesMoedasBacen: fontes.cotacoesMoedasBacen,
      pixValidadorAuditado: fontes.pixValidadorAuditado,
      desambiguacaoHomonimosIa: fontes.desambiguacaoHomonimosIa,
      bureausCredito,
      complianceCgu,
      eleitoralTse,
      previdenciarioInss,
      fiscalPgfnDau,
      patrimonioVeiculosBens,
      osintMidiasSociais,
      redeLancamentoGrafo,
      hobbiesInteressesLifestyle,
      apisPublicasAvancadas,
      parametrosBuscaAvancada: {
        cpfInformado: entrada.cpf
          ? entrada.cpf.replace(/\D/g, "")
          : tipoPessoa === "PF" && docLimpo.length === 11
            ? docLimpo
            : undefined,
        dataNascimentoInformada: entrada.dataNascimento,
        nomeMaeInformado: entrada.nomeMae,
        nomePaiInformado: entrada.nomePai,
        rgInformado: entrada.rg,
      },
    };

    // Cache por 1 hora
    this.cacheDossies.set(chaveCache, { dossie, expiraEm: Date.now() + 3600000 });

    // 7. Notifica Barramento de Eventos
    if (this.publicadorEventos) {
      await this.publicadorEventos.publicarConsultaRealizada({
        protocolo,
        documento: fontes.identificacao.documento,
        tipoPessoa,
        nome: fontes.identificacao.nomeCompleto,
        scoreKytto: capacidade.scoreKytto360,
        rating: capacidade.classificacaoRating,
        consultadoEm: agora,
        tenantId,
      });

      if (capacidade.scoreKytto360 < 500 || fontes.protestos.length > 0 || fontes.processos.length > 2) {
        await this.publicadorEventos.publicarAlertaRisco({
          protocolo,
          documento: fontes.identificacao.documento,
          nome: fontes.identificacao.nomeCompleto,
          motivoAlerta: `Score restritivo (${capacidade.scoreKytto360}) ou pendências jurídicas/cartorárias identificadas.`,
          criticidade: capacidade.scoreKytto360 < 400 ? "CRITICO" : "ALTO",
          tenantId,
        });
      }
    }

    return dossie;
  }

  /**
   * Exporta a planilha Excel em 6 abas
   */
  async exportarExcel(dossie: DossieConsulta360Completo): Promise<Buffer> {
    return gerarPlanilhaExcelDossie(dossie);
  }

  /**
   * Exporta o Dossiê em PDF com selo SHA-256 e QR Code
   */
  async exportarPdf(dossie: DossieConsulta360Completo): Promise<Buffer> {
    return gerarDossiePdf(dossie);
  }

  /**
   * Acessa a instância ativa do motor de grafos relacionais
   */
  obterMotorGrafo(): MotorGrafoRelacionamento {
    return this.motorGrafo;
  }

  /**
   * Expande conexões adicionais de 2º e 3º grau para um nó selecionado
   */
  expandirNoGrafo(noId: string, tipo: string, profundidade = 1) {
    return this.motorGrafo.expandirNo(noId, tipo, profundidade);
  }

  consultarVeiculosBens(documento: string, tipoPessoa: "PF" | "PJ" = "PF", nomeOuRazao?: string) {
    return this.conectorVeiculosBens.consultarBensPatrimoniais(documento, tipoPessoa, nomeOuRazao);
  }

  consultarOsintRedesSociais(nomeCompleto: string, documento?: string, cidade?: string) {
    return this.conectorRedesSociais.consultarMidiasSociais(nomeCompleto, documento, cidade);
  }

  consultarRedeLancamento(opcoes: Parameters<MotorGrafoRedeLancamento["construirGrafoLancamento"]>[0]) {
    return this.motorGrafoLancamento.construirGrafoLancamento(opcoes);
  }
}
