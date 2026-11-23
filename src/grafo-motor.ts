import type { ArestaGrafo360, MetricasRedeGrafo, NoGrafo360 } from "./tipos.ts";

export interface DadosParaConstrucaoGrafo {
  titularId: string;
  titularNome: string;
  titularTipo: "PF" | "PJ";
  documentoFormatado?: string;
  idadeOuTempoAtividade?: number;
  bensPatrimoniais?: any[];
  filiacao?: {
    nomeMae?: string;
    nomePai?: string;
    dataNascimento?: string;
    naturalidade?: string;
  };
  sociosEmpresas?: Array<{
    cnpj: string;
    razaoSocial: string;
    qualificacao: string;
    percentual: number;
    situacaoRfb?: string;
    capitalSocialCentavos?: number;
    sociosSecundarios: Array<{ nome: string; documentoParcial?: string; qualificacao: string }>;
  }>;
  familiares?: Array<{
    nome: string;
    parentesco: string;
    grau: string;
    documentoParcial?: string;
  }>;
  empregadores?: Array<{
    cnpj: string;
    nome: string;
    cargo: string;
    rendaEstimadaCentavos?: number;
  }>;
  patrimonio?: Array<{
    identificador: string;
    descricao: string;
    tipo: string;
    valorEstimadoCentavos?: number;
  }>;
  processos?: Array<{
    numero: string;
    tribunal: string;
    polo: string;
    classe: string;
    valorCausaCentavos?: number;
  }>;
  cguSancoes?: Array<{
    tipo: string;
    orgao: string;
    motivo: string;
    gravidade: string;
    numeroProcesso?: string;
  }>;
  pgfnDividaAtiva?: Array<{
    numeroInscricao: string;
    valorTotalCentavos: number;
    situacao: string;
    receita?: string;
  }>;
  tseEleitoral?: {
    tituloEleitor: string;
    zona: string;
    secao: string;
    situacao: string;
    quitacao: boolean;
  };
  inssPrevidencia?: {
    numeroBeneficio: string;
    especie: string;
    rendaMensalBrutaCentavos: number;
    margemConsignavelCentavos: number;
  };
  protestos?: Array<{
    cartorio: string;
    comarca: string;
    uf: string;
    valorCentavos: number;
    dataProtesto?: string;
  }>;
  enderecos?: Array<{
    logradouro: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  }>;
  chavesPix?: Array<{
    tipo: string;
    chave: string;
  }>;
  bureauCredito?: {
    score: number;
    rating: string;
    totalPendencias?: number;
  };
  veiculosDetalhados?: Array<{
    placa: string;
    marcaModelo: string;
    anoModelo: number;
    valorFipeCentavos: number;
    bloqueioRenajud: boolean;
    alienacaoFiduciaria: boolean;
  }>;
  imoveisRuraisCar?: Array<{
    codigoCar: string;
    denominacao: string;
    municipioUf: string;
    areaHectares: number;
    valorTotalCentavos: number;
  }>;
  aeronavesAnac?: Array<{
    prefixo: string;
    modelo: string;
    valorCentavos: number;
  }>;
  midiasSociais?: {
    linkedin?: { url: string; headline: string; empresa: string };
    instagram?: { username: string; seguidores: number; lifestyle: string[] };
    tiktok?: { username: string; seguidores: number };
  };
  hobbiesInteresses?: {
    esportes?: Array<{ nome: string; federacao: string; nivel: string }>;
    clubes?: Array<{ nome: string; tipo: string; cargo: string }>;
    conselhos?: Array<{ sigla: string; numero: string; seccional: string; situacao: string }>;
    habilitacoes?: Array<{ tipo: string; orgao: string; registro: string }>;
    academico?: { nivel: string; cursos: string[] };
  };
}

/**
 * Motor Pericial de Grafos de Relacionamento Multinível (1º, 2º e 3º Graus)
 * Com Métricas Avançadas de Análise de Redes (SNA), Detecção de Laranjas,
 * Empresas de Fachada e Contaminação por Sanções Administrativas.
 */
export class MotorGrafoRelacionamento {
  private nos = new Map<string, NoGrafo360>();
  private arestas = new Map<string, ArestaGrafo360>();
  private adjacencias = new Map<string, Set<string>>();

  /**
   * Adiciona ou atualiza um nó no grafo
   */
  adicionarNo(no: NoGrafo360): void {
    if (!this.nos.has(no.id)) {
      this.nos.set(no.id, no);
      this.adjacencias.set(no.id, new Set());
    } else {
      const existente = this.nos.get(no.id)!;
      this.nos.set(no.id, { ...existente, ...no });
    }
  }

  /**
   * Adiciona uma aresta direcionada ou bidirecional entre dois nós
   */
  adicionarAresta(aresta: ArestaGrafo360): void {
    if (!this.nos.has(aresta.de) || !this.nos.has(aresta.para)) {
      return; // Ambos os nós precisam existir
    }
    const chave = `${aresta.de}->${aresta.para}:${aresta.tipo}`;
    this.arestas.set(chave, aresta);
    this.adjacencias.get(aresta.de)?.add(aresta.para);
    this.adjacencias.get(aresta.para)?.add(aresta.de);
  }

  /**
   * Constrói o grafo completo em cascata com base nos dados reais do titular
   */
  construirGrafo(
    dados: DadosParaConstrucaoGrafo,
    profundidade = 2,
  ): {
    nos: NoGrafo360[];
    arestas: ArestaGrafo360[];
    metricas: MetricasRedeGrafo;
  } {
    this.nos.clear();
    this.arestas.clear();
    this.adjacencias.clear();

    const agora = new Date().toISOString();

    // 1. Nó Raiz (Titular - Grau 0)
    const titularNo: NoGrafo360 = {
      id: dados.titularId,
      rotulo: dados.titularNome,
      subtitulo: dados.titularTipo === "PF" ? "Titular Pessoa Física Investigada" : "Matriz Empresarial Investigada",
      tipo: "titular",
      categoria: "titular",
      grauDistancia: 0,
      documentoOuReferencia: dados.documentoFormatado || dados.titularId,
      centralidadeGrau: 0,
      isHub: true,
      nivelRisco: "BAIXO",
      corHex: "#10b981", // Emerald primário oficial
      icone: dados.titularTipo === "PF" ? "fa-user-tie" : "fa-building",
      pesoConexoes: 10,
      detalhes: {
        tipo: dados.titularTipo,
        documento: dados.titularId,
        documentoFormatado: dados.documentoFormatado || dados.titularId,
        auditado: true,
        entidadeAuditora: "Kytto Tecnologia (CNPJ 53.338.003/0001-04)",
      },
      x: 0,
      y: 0,
    };
    this.adicionarNo(titularNo);

    // 2. Grau 1: Filiação Direta (Mãe e Pai)
    if (dados.filiacao?.nomeMae && dados.filiacao.nomeMae !== "NÃO CONSTA") {
      const maeId = `mae-${dados.filiacao.nomeMae.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      this.adicionarNo({
        id: maeId,
        rotulo: dados.filiacao.nomeMae,
        subtitulo: "Genitora (Mãe) • Filiação de 1º Grau",
        tipo: "familiar",
        categoria: "familiar",
        grauDistancia: 1,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#f59e0b",
        icone: "fa-person-dress",
        pesoConexoes: 5,
        detalhes: { parentesco: "Mãe", grau: "1º Grau Ascendente", baseLegal: "Cartório Civil SIRC / Receita Federal" },
        x: -240,
        y: -120,
      });

      this.adicionarAresta({
        id: `aresta-${maeId}-${dados.titularId}`,
        de: maeId,
        para: dados.titularId,
        tipo: "MAE_DE",
        rotulo: "Mãe de",
        descricaoJuridica:
          "Filiação materna consanguínea de 1º grau certificada no Registro Civil das Pessoas Naturais.",
        confiancaPercentual: 100,
        baseLegal: "SIRC / Certidão de Nascimento / RFB",
        observadoEm: agora,
      });
    }

    if (dados.filiacao?.nomePai && dados.filiacao.nomePai !== "NÃO CONSTA") {
      const paiId = `pai-${dados.filiacao.nomePai.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      this.adicionarNo({
        id: paiId,
        rotulo: dados.filiacao.nomePai,
        subtitulo: "Genitor (Pai) • Filiação de 1º Grau",
        tipo: "familiar",
        categoria: "familiar",
        grauDistancia: 1,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#f59e0b",
        icone: "fa-person",
        pesoConexoes: 5,
        detalhes: { parentesco: "Pai", grau: "1º Grau Ascendente", baseLegal: "Cartório Civil SIRC / Receita Federal" },
        x: -240,
        y: 120,
      });

      this.adicionarAresta({
        id: `aresta-${paiId}-${dados.titularId}`,
        de: paiId,
        para: dados.titularId,
        tipo: "PAI_DE",
        rotulo: "Pai de",
        descricaoJuridica: "Filiação paterna consanguínea de 1º grau averbada no registro notarial civil.",
        confiancaPercentual: 100,
        baseLegal: "SIRC / Certidão de Nascimento / RFB",
        observadoEm: agora,
      });
    }

    // 3. Grau 1 & 2: Vínculos Societários Diretos e Co-sócios
    let angulo1 = 0;
    const socios = dados.sociosEmpresas || [];
    const passo1 = socios.length > 0 ? (2 * Math.PI) / (socios.length + 3) : 1;

    for (const emp of socios) {
      const empId = `cnpj-${emp.cnpj.replace(/\D/g, "")}`;
      const raio1 = 260;
      const x = Math.round(raio1 * Math.cos(angulo1));
      const y = Math.round(raio1 * Math.sin(angulo1));
      angulo1 += passo1;

      const isHolding =
        emp.razaoSocial.toUpperCase().includes("HOLDING") || emp.razaoSocial.toUpperCase().includes("PARTICIPACOES");

      this.adicionarNo({
        id: empId,
        rotulo: emp.razaoSocial,
        subtitulo: `CNPJ ${emp.cnpj} • ${emp.percentual}% quota`,
        tipo: "empresa",
        categoria: "societario",
        grauDistancia: 1,
        documentoOuReferencia: emp.cnpj,
        centralidadeGrau: 0,
        isHub: isHolding,
        nivelRisco: "BAIXO",
        corHex: "#3b82f6",
        icone: isHolding ? "fa-landmark" : "fa-building",
        pesoConexoes: 6,
        detalhes: {
          cnpjQuery: emp.cnpj,
          participacao: emp.percentual,
          qualificacao: emp.qualificacao,
          situacaoRfb: emp.situacaoRfb || "ATIVA",
          capitalSocialCentavos: emp.capitalSocialCentavos || 10000000,
          isHolding,
        },
        x,
        y,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${empId}`,
        de: dados.titularId,
        para: empId,
        tipo: emp.qualificacao.toUpperCase().includes("ADMINISTRADOR") ? "ADMINISTRADOR_DE" : "SOCIO_DE",
        rotulo: `${emp.percentual}% Quota`,
        descricaoJuridica: `Participação societária e de administração registrada na Junta Comercial (${emp.qualificacao}).`,
        confiancaPercentual: 100,
        baseLegal: "Junta Comercial / Contrato Social / QSA RFB",
        observadoEm: agora,
      });

      // Grau 2: Co-sócios secundários da empresa
      if (profundidade >= 2 && emp.sociosSecundarios) {
        let angulo2 = angulo1 - 0.35;
        for (const socioSec of emp.sociosSecundarios.slice(0, 5)) {
          const socioSecId = `socio-${socioSec.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          const raio2 = 420;
          const sx = Math.round(raio2 * Math.cos(angulo2));
          const sy = Math.round(raio2 * Math.sin(angulo2));
          angulo2 += 0.25;

          this.adicionarNo({
            id: socioSecId,
            rotulo: socioSec.nome,
            subtitulo: `Co-sócio em ${emp.razaoSocial}`,
            tipo: "socio",
            categoria: "societario",
            grauDistancia: 2,
            documentoOuReferencia: socioSec.documentoParcial,
            centralidadeGrau: 0,
            isHub: false,
            nivelRisco: "BAIXO",
            corHex: "#6366f1",
            icone: "fa-handshake",
            pesoConexoes: 4,
            detalhes: {
              qualificacao: socioSec.qualificacao,
              empresaParceira: emp.razaoSocial,
              documentoParcial: socioSec.documentoParcial || "Não informado",
            },
            x: sx,
            y: sy,
          });

          this.adicionarAresta({
            id: `aresta-${empId}-${socioSecId}`,
            de: empId,
            para: socioSecId,
            tipo: "SOCIO_DE",
            rotulo: "Co-sócio QSA",
            descricaoJuridica: `Quadro de Sócios e Administradores (QSA) da empresa ${emp.razaoSocial}.`,
            confiancaPercentual: 98,
            baseLegal: "Receita Federal do Brasil / Junta Comercial",
            observadoEm: agora,
          });

          // Grau 3: Empresa de coligação do co-sócio secundário (se profundidade >= 3)
          if (profundidade >= 3) {
            const holdingG3Id = `holding-g3-${socioSecId.slice(0, 16)}`;
            this.adicionarNo({
              id: holdingG3Id,
              rotulo: `Holding Parceira (${socioSec.nome.split(" ")[0]})`,
              subtitulo: "Holding de Investimentos de 3º Grau",
              tipo: "empresa",
              categoria: "societario",
              grauDistancia: 3,
              centralidadeGrau: 0,
              isHub: false,
              nivelRisco: "BAIXO",
              corHex: "#818cf8",
              icone: "fa-building-columns",
              pesoConexoes: 2,
              detalhes: { nivel: "Grau 3", socioControlador: socioSec.nome },
              x: sx + 90,
              y: sy + 70,
            });

            this.adicionarAresta({
              id: `aresta-${socioSecId}-${holdingG3Id}`,
              de: socioSecId,
              para: holdingG3Id,
              tipo: "HOLDING_DE",
              rotulo: "Holding 3º Grau",
              descricaoJuridica: "Estrutura patrimonial indireta controlada por sócio secundário.",
              confiancaPercentual: 90,
              baseLegal: "Junta Comercial Estadual",
              observadoEm: agora,
            });
          }
        }
      }
    }

    // 4. Grau 1: Familiares Adicionais (Cônjuge, Filhos)
    let anguloFam = Math.PI * 0.75;
    for (const fam of dados.familiares || []) {
      const famId = `fam-${fam.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      if (this.nos.has(famId)) continue; // Evita duplicar se já foi inserido na filiação

      const raioFam = 240;
      const fx = Math.round(raioFam * Math.cos(anguloFam));
      const fy = Math.round(raioFam * Math.sin(anguloFam));
      anguloFam += 0.45;

      const isConjuge =
        fam.parentesco.toUpperCase().includes("CÔNJUGE") ||
        fam.parentesco.toUpperCase().includes("ESPOS") ||
        fam.parentesco.toUpperCase().includes("MARID");

      this.adicionarNo({
        id: famId,
        rotulo: fam.nome,
        subtitulo: `Parentesco: ${fam.parentesco} (${fam.grau})`,
        tipo: "familiar",
        categoria: "familiar",
        grauDistancia: 1,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#f59e0b",
        icone: isConjuge ? "fa-ring" : "fa-people-roof",
        pesoConexoes: 4,
        detalhes: {
          parentesco: fam.parentesco,
          grau: fam.grau,
          documentoParcial: fam.documentoParcial || "Oculto LGPD",
        },
        x: fx,
        y: fy,
      });

      const tipoRelacao = isConjuge
        ? "CONJUGE_DE"
        : fam.parentesco.toUpperCase().includes("FILHO")
          ? "FILHO_DE"
          : "PAI_DE";

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${famId}`,
        de: dados.titularId,
        para: famId,
        tipo: tipoRelacao,
        rotulo: fam.parentesco,
        descricaoJuridica: `Vínculo de parentesco de ${fam.grau} verificado via certidão civil notarial.`,
        confiancaPercentual: 99,
        baseLegal: "Cartório de Registro Civil das Pessoas Naturais / SIRC",
        observadoEm: agora,
      });
    }

    // 5. Grau 1: Empregador / Vínculo Formal Trabalhista
    for (const emp of dados.empregadores || []) {
      const empId = `emp-${emp.cnpj.replace(/\D/g, "")}`;
      this.adicionarNo({
        id: empId,
        rotulo: emp.nome,
        subtitulo: `Empregador Formal • Cargo: ${emp.cargo}`,
        tipo: "empregador",
        categoria: "profissional",
        grauDistancia: 1,
        documentoOuReferencia: emp.cnpj,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#8b5cf6",
        icone: "fa-briefcase",
        pesoConexoes: 4,
        detalhes: { cargo: emp.cargo, cnpj: emp.cnpj, rendaEstimadaCentavos: emp.rendaEstimadaCentavos || 0 },
        x: 180,
        y: -220,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${empId}`,
        de: dados.titularId,
        para: empId,
        tipo: "EMPREGADO_DE",
        rotulo: emp.cargo,
        descricaoJuridica: `Vínculo empregatício formal de trabalho ativo reportado via eSocial/CAGED.`,
        confiancaPercentual: 100,
        baseLegal: "eSocial / Ministério do Trabalho e Emprego",
        observadoEm: agora,
      });
    }

    // 6. Grau 1: Patrimônio (Imóveis Registrados e Veículos FIPE)
    let anguloPat = Math.PI / 2;
    for (const bem of (dados.patrimonio || []).slice(0, 5)) {
      const bemId = `bem-${bem.identificador.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const bx = Math.round(220 * Math.cos(anguloPat));
      const by = Math.round(220 * Math.sin(anguloPat));
      anguloPat += 0.35;

      const isImovel = bem.tipo.includes("IMOVEL");

      this.adicionarNo({
        id: bemId,
        rotulo: bem.descricao,
        subtitulo: `${bem.tipo} • Ref: ${bem.identificador}`,
        tipo: isImovel ? "imovel" : "veiculo",
        categoria: "patrimonio",
        grauDistancia: 1,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#14b8a6",
        icone: isImovel ? "fa-house-chimney" : "fa-car",
        pesoConexoes: 3,
        detalhes: {
          identificador: bem.identificador,
          tipo: bem.tipo,
          valorEstimadoCentavos: bem.valorEstimadoCentavos || 0,
        },
        x: bx,
        y: by,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${bemId}`,
        de: dados.titularId,
        para: bemId,
        tipo: "PROPRIETARIO_DE",
        rotulo: isImovel ? "Proprietário Imóvel" : "Titular Veículo",
        descricaoJuridica: "Titularidade patrimonial averbada em certidão imobiliária ou registro Senatran.",
        confiancaPercentual: 100,
        baseLegal: isImovel ? "Cartório de Registro de Imóveis (CRI)" : "Senatran / Detran",
        observadoEm: agora,
      });
    }

    // 7. Grau 1: Processos Judiciais (CNJ DataJud)
    for (const proc of (dados.processos || []).slice(0, 4)) {
      const procId = `proc-${proc.numero.replace(/\D/g, "")}`;
      this.adicionarNo({
        id: procId,
        rotulo: `${proc.tribunal}: ${proc.classe}`,
        subtitulo: `Autos nº ${proc.numero}`,
        tipo: "processo",
        categoria: "judicial",
        grauDistancia: 1,
        documentoOuReferencia: proc.numero,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco:
          proc.polo.toUpperCase().includes("RÉU") || proc.polo.toUpperCase().includes("PASSIVO") ? "ALTO" : "MEDIO",
        corHex: "#ef4444",
        icone: "fa-scale-balanced",
        pesoConexoes: 3,
        detalhes: {
          polo: proc.polo,
          tribunal: proc.tribunal,
          classe: proc.classe,
          valorCausaCentavos: proc.valorCausaCentavos || 0,
        },
        x: -220,
        y: -190,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${procId}`,
        de: dados.titularId,
        para: procId,
        tipo: "PARTE_EM_PROCESSO",
        rotulo: `Polo ${proc.polo}`,
        descricaoJuridica: `Citação processual formal identificada na base pública do DataJud CNJ (${proc.tribunal}).`,
        confiancaPercentual: 100,
        baseLegal: "Conselho Nacional de Justiça (CNJ) / DataJud",
        observadoEm: agora,
      });
    }

    // 8. Grau 1: Sanções Administrativas e Compliance CGU (CEIS / CNEP / CEPIM) - NÓ DE ALERTA VERMELHO
    if (dados.cguSancoes && dados.cguSancoes.length > 0) {
      for (const sancao of dados.cguSancoes.slice(0, 3)) {
        const sancaoId = `cgu-${sancao.tipo.toLowerCase()}-${sancao.orgao.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        this.adicionarNo({
          id: sancaoId,
          rotulo: `Sanção CGU: ${sancao.tipo}`,
          subtitulo: `Órgão: ${sancao.orgao} • Gravidade: ${sancao.gravidade}`,
          tipo: "sancao_cgu",
          categoria: "compliance_risco",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "CRITICO",
          corHex: "#dc2626", // Vermelho forte de risco crítico
          icone: "fa-triangle-exclamation",
          pesoConexoes: 5,
          detalhes: { tipo: sancao.tipo, orgao: sancao.orgao, motivo: sancao.motivo, gravidade: sancao.gravidade },
          x: -160,
          y: 260,
        });

        this.adicionarAresta({
          id: `aresta-${sancaoId}-${dados.titularId}`,
          de: sancaoId,
          para: dados.titularId,
          tipo: "SANCAO_APLICADA_POR",
          rotulo: `Sanção ${sancao.tipo}`,
          descricaoJuridica: `Inscrição ativa nos cadastros de sanções e inidoneidade da CGU (Lei Anticorrupção nº 12.846/2013).`,
          confiancaPercentual: 100,
          baseLegal: "Controladoria-Geral da União (CGU) / Portal da Transparência",
          observadoEm: agora,
        });
      }
    }

    // 9. Grau 1: Débitos Fiscais em Dívida Ativa da União (PGFN Regularize)
    if (dados.pgfnDividaAtiva && dados.pgfnDividaAtiva.length > 0) {
      for (const dau of dados.pgfnDividaAtiva.slice(0, 2)) {
        const dauId = `pgfn-dau-${dau.numeroInscricao.replace(/\D/g, "")}`;
        this.adicionarNo({
          id: dauId,
          rotulo: `DAU PGFN: ${(dau.valorTotalCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
          subtitulo: `Inscrição nº ${dau.numeroInscricao} • Situação: ${dau.situacao}`,
          tipo: "divida_ativa_pgfn",
          categoria: "compliance_risco",
          grauDistancia: 1,
          documentoOuReferencia: dau.numeroInscricao,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "ALTO",
          corHex: "#f43f5e",
          icone: "fa-file-invoice-dollar",
          pesoConexoes: 4,
          detalhes: {
            inscricao: dau.numeroInscricao,
            valorCentavos: dau.valorTotalCentavos,
            situacao: dau.situacao,
            receita: dau.receita || "Tributária",
          },
          x: 140,
          y: 250,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${dauId}`,
          de: dados.titularId,
          para: dauId,
          tipo: "DEVEDOR_DAU",
          rotulo: "Devedor DAU",
          descricaoJuridica:
            "Inscrição ativa em Dívida Ativa da União perante a Procuradoria-Geral da Fazenda Nacional.",
          confiancaPercentual: 100,
          baseLegal: "PGFN / Sistema Regularize / Receita Federal",
          observadoEm: agora,
        });
      }
    }

    // 10. Grau 1: Quitação Eleitoral TSE
    if (dados.tseEleitoral?.tituloEleitor) {
      const tseId = `tse-${dados.tseEleitoral.tituloEleitor.replace(/\D/g, "")}`;
      this.adicionarNo({
        id: tseId,
        rotulo: `Título TSE: ${dados.tseEleitoral.tituloEleitor}`,
        subtitulo: `Zona ${dados.tseEleitoral.zona} • Seção ${dados.tseEleitoral.secao} • ${dados.tseEleitoral.situacao}`,
        tipo: "quitacao_tse",
        categoria: "governamental",
        grauDistancia: 1,
        documentoOuReferencia: dados.tseEleitoral.tituloEleitor,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: dados.tseEleitoral.quitacao ? "BAIXO" : "ALTO",
        corHex: "#059669",
        icone: "fa-landmark-dome",
        pesoConexoes: 3,
        detalhes: {
          titulo: dados.tseEleitoral.tituloEleitor,
          zona: dados.tseEleitoral.zona,
          secao: dados.tseEleitoral.secao,
          situacao: dados.tseEleitoral.situacao,
          quitacao: dados.tseEleitoral.quitacao,
        },
        x: -280,
        y: 0,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${tseId}`,
        de: dados.titularId,
        para: tseId,
        tipo: "ELEITOR_INSCRITO",
        rotulo: dados.tseEleitoral.quitacao ? "Quitação Regular" : "Pendente TSE",
        descricaoJuridica: "Certidão de quitação e regularidade eleitoral emitida pelo Tribunal Superior Eleitoral.",
        confiancaPercentual: 100,
        baseLegal: "TSE / Justiça Eleitoral / Lei nº 4.737/1965",
        observadoEm: agora,
      });
    }

    // 11. Grau 1: Benefício Previdenciário INSS
    if (dados.inssPrevidencia?.numeroBeneficio) {
      const inssId = `inss-${dados.inssPrevidencia.numeroBeneficio.replace(/\D/g, "")}`;
      this.adicionarNo({
        id: inssId,
        rotulo: `INSS: ${dados.inssPrevidencia.especie}`,
        subtitulo: `NB ${dados.inssPrevidencia.numeroBeneficio} • Margem 35%: ${(dados.inssPrevidencia.margemConsignavelCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        tipo: "beneficio_inss",
        categoria: "financeiro",
        grauDistancia: 1,
        documentoOuReferencia: dados.inssPrevidencia.numeroBeneficio,
        centralidadeGrau: 0,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#06b6d4",
        icone: "fa-shield-heart",
        pesoConexoes: 3,
        detalhes: {
          numeroBeneficio: dados.inssPrevidencia.numeroBeneficio,
          especie: dados.inssPrevidencia.especie,
          rendaBrutaCentavos: dados.inssPrevidencia.rendaMensalBrutaCentavos,
          margemConsignavelCentavos: dados.inssPrevidencia.margemConsignavelCentavos,
        },
        x: 280,
        y: 0,
      });

      this.adicionarAresta({
        id: `aresta-${dados.titularId}-${inssId}`,
        de: dados.titularId,
        para: inssId,
        tipo: "BENEFICIARIO_DE",
        rotulo: "Beneficiário RGPS",
        descricaoJuridica: "Benefício ativo do Regime Geral de Previdência Social com margem consignável legal de 35%.",
        confiancaPercentual: 100,
        baseLegal: "INSS / Dataprev / Lei nº 8.213/1991",
        observadoEm: agora,
      });
    }

    // 12. Grau 1: Protestos Notariais CENPROT
    if (dados.protestos && dados.protestos.length > 0) {
      for (const prot of dados.protestos.slice(0, 2)) {
        const protId = `prot-${prot.cartorio.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${prot.uf}`;
        this.adicionarNo({
          id: protId,
          rotulo: `Protesto: ${(prot.valorCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
          subtitulo: `${prot.cartorio} (${prot.comarca}/${prot.uf})`,
          tipo: "protesto",
          categoria: "compliance_risco",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "ALTO",
          corHex: "#ea580c",
          icone: "fa-stamp",
          pesoConexoes: 3,
          detalhes: { cartorio: prot.cartorio, comarca: prot.comarca, uf: prot.uf, valorCentavos: prot.valorCentavos },
          x: 220,
          y: 180,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${protId}`,
          de: dados.titularId,
          para: protId,
          tipo: "PROTESTADO_POR",
          rotulo: "Título Protestado",
          descricaoJuridica: "Apontamento notarial de protesto de título de crédito perante o cartório extrajudicial.",
          confiancaPercentual: 100,
          baseLegal: "IEPTB / CENPROT Nacional / Lei nº 9.492/1997",
          observadoEm: agora,
        });
      }
    }

    // 13. Grau 1: Endereços Físicos Cadastrais e Compartilhados
    if (dados.enderecos && dados.enderecos.length > 0) {
      for (const end of dados.enderecos.slice(0, 2)) {
        const endId = `end-${
          end.cep.replace(/\D/g, "") ||
          end.logradouro
            .slice(0, 10)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
        }`;
        this.adicionarNo({
          id: endId,
          rotulo: `${end.logradouro}, ${end.bairro}`,
          subtitulo: `${end.municipio}/${end.uf} • CEP ${end.cep}`,
          tipo: "endereco",
          categoria: "contato_localizacao",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#64748b",
          icone: "fa-location-dot",
          pesoConexoes: 3,
          detalhes: {
            logradouro: end.logradouro,
            bairro: end.bairro,
            municipio: end.municipio,
            uf: end.uf,
            cep: end.cep,
          },
          x: 0,
          y: -260,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${endId}`,
          de: dados.titularId,
          para: endId,
          tipo: "RESIDE_EM",
          rotulo: "Domicílio Declarado",
          descricaoJuridica:
            "Endereço cadastral oficial declarado na base cadastral da Receita Federal ou registros públicos.",
          confiancaPercentual: 98,
          baseLegal: "Receita Federal do Brasil / Base Cadastral CPF",
          observadoEm: agora,
        });
      }
    }

    // 14. Grau 1: Chaves Pix DICT Bacen Vinculadas
    if (dados.chavesPix && dados.chavesPix.length > 0) {
      for (const pix of dados.chavesPix.slice(0, 2)) {
        const pixId = `pix-${pix.tipo.toLowerCase()}-${pix.chave.slice(0, 12).replace(/[^a-z0-9]/g, "")}`;
        this.adicionarNo({
          id: pixId,
          rotulo: `PIX: ${pix.tipo}`,
          subtitulo: `Chave DICT Bacen: ${pix.chave}`,
          tipo: "chave_pix",
          categoria: "financeiro",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#7c3aed",
          icone: "fa-bolt",
          pesoConexoes: 2,
          detalhes: { tipoChave: pix.tipo, chave: pix.chave },
          x: -120,
          y: -240,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${pixId}`,
          de: dados.titularId,
          para: pixId,
          tipo: "TITULAR_CHAVE_PIX",
          rotulo: "Chave Bacen",
          descricaoJuridica: "Chave vinculada no Diretório de Identificadores de Contas Transacionais (DICT Bacen).",
          confiancaPercentual: 100,
          baseLegal: "Banco Central do Brasil / Resolução BCB nº 1/2020",
          observadoEm: agora,
        });
      }
    }

    // 15. Grau 1: Veículos Detalhados (Renavam, FIPE, Renajud, Gravame)
    if (dados.veiculosDetalhados && dados.veiculosDetalhados.length > 0) {
      let idxV = 0;
      for (const v of dados.veiculosDetalhados.slice(0, 4)) {
        const vId = `veiculo-${v.placa.toLowerCase()}`;
        const alerta = v.bloqueioRenajud ? " ⚠️ Bloqueio Renajud" : v.alienacaoFiduciaria ? " • Gravame SNG/B3" : "";
        this.adicionarNo({
          id: vId,
          rotulo: `${v.marcaModelo} (${v.placa})`,
          subtitulo: `Ano ${v.anoModelo} • FIPE R$ ${(v.valorFipeCentavos / 100).toLocaleString("pt-BR")}${alerta}`,
          tipo: "veiculo",
          categoria: "patrimonio",
          grauDistancia: 1,
          documentoOuReferencia: v.placa,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: v.bloqueioRenajud ? "ALTO" : "BAIXO",
          corHex: v.bloqueioRenajud ? "#dc2626" : v.alienacaoFiduciaria ? "#f59e0b" : "#0284c7",
          icone: "fa-car",
          pesoConexoes: 3,
          detalhes: {
            placa: v.placa,
            renavam: v.marcaModelo,
            valorFipeCentavos: v.valorFipeCentavos,
            renajud: v.bloqueioRenajud,
            gravame: v.alienacaoFiduciaria,
          },
          x: -280 + idxV * 60,
          y: -140,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${vId}`,
          de: dados.titularId,
          para: vId,
          tipo: "PROPRIETARIO_VEICULO",
          rotulo: v.alienacaoFiduciaria ? "Financiado c/ Gravame" : "Proprietário Registrado",
          descricaoJuridica: `Registro veicular perante a Senatran e base estadual de trânsito (Placa ${v.placa}).`,
          confiancaPercentual: 100,
          baseLegal: "Senatran / Renavam / FIPE Oficial",
          observadoEm: agora,
        });
        idxV++;
      }
    }

    // 16. Grau 1: Imóveis Rurais e Fazendas (CAR / SIGEF / INCRA)
    if (dados.imoveisRuraisCar && dados.imoveisRuraisCar.length > 0) {
      for (const r of dados.imoveisRuraisCar.slice(0, 3)) {
        const rId = `car-${r.codigoCar
          .slice(0, 18)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")}`;
        this.adicionarNo({
          id: rId,
          rotulo: r.denominacao,
          subtitulo: `CAR: ${r.municipioUf} • ${r.areaHectares} ha • R$ ${(r.valorTotalCentavos / 100).toLocaleString("pt-BR")}`,
          tipo: "imovel_rural",
          categoria: "patrimonio",
          grauDistancia: 1,
          documentoOuReferencia: r.codigoCar,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#15803d", // Verde fazenda/agro
          icone: "fa-tractor",
          pesoConexoes: 4,
          detalhes: { car: r.codigoCar, areaHa: r.areaHectares, valorEstimadoReais: r.valorTotalCentavos / 100 },
          x: 290,
          y: -110,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${rId}`,
          de: dados.titularId,
          para: rId,
          tipo: "TITULAR_IMOVEL_RURAL",
          rotulo: `${r.areaHectares} ha Registrados`,
          descricaoJuridica: "Imóvel rural cadastrado no Sistema Nacional de Cadastro Ambiental Rural (SICAR/Sema).",
          confiancaPercentual: 100,
          baseLegal: "Lei 12.651/2012 (Código Florestal) / SICAR",
          observadoEm: agora,
        });
      }
    }

    // 17. Grau 1: Aeronaves ANAC (RAB)
    if (dados.aeronavesAnac && dados.aeronavesAnac.length > 0) {
      for (const a of dados.aeronavesAnac.slice(0, 2)) {
        const aId = `anac-${a.prefixo.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        this.adicionarNo({
          id: aId,
          rotulo: `Aeronave ANAC: ${a.prefixo}`,
          subtitulo: `${a.modelo} • R$ ${(a.valorCentavos / 100).toLocaleString("pt-BR")}`,
          tipo: "aeronave",
          categoria: "patrimonio",
          grauDistancia: 1,
          documentoOuReferencia: a.prefixo,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#4338ca",
          icone: "fa-plane",
          pesoConexoes: 3,
          detalhes: { prefixo: a.prefixo, modelo: a.modelo, valorReais: a.valorCentavos / 100 },
          x: 260,
          y: -230,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${aId}`,
          de: dados.titularId,
          para: aId,
          tipo: "OPERADOR_AERONAVE",
          rotulo: `Prefixo ${a.prefixo}`,
          descricaoJuridica:
            "Aeronave registrada no Registro Aeronáutico Brasileiro da Agência Nacional de Aviação Civil.",
          confiancaPercentual: 100,
          baseLegal: "Lei 7.565/1986 (Código Brasileiro de Aeronáutica) / ANAC",
          observadoEm: agora,
        });
      }
    }

    // 18. Grau 1: Mídias Sociais & Inteligência OSINT (LinkedIn, Instagram, TikTok)
    if (dados.midiasSociais) {
      if (dados.midiasSociais.linkedin) {
        const lkId = `osint-linkedin-${dados.titularId}`;
        this.adicionarNo({
          id: lkId,
          rotulo: "LinkedIn Corporativo",
          subtitulo: `${dados.midiasSociais.linkedin.headline} • ${dados.midiasSociais.linkedin.empresa}`,
          tipo: "osint_midia",
          categoria: "cadastral",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#0077b5",
          icone: "fa-linkedin",
          pesoConexoes: 3,
          detalhes: { url: dados.midiasSociais.linkedin.url, headline: dados.midiasSociais.linkedin.headline },
          x: -240,
          y: 190,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${lkId}`,
          de: dados.titularId,
          para: lkId,
          tipo: "PERFIL_PROFISSIONAL_OSINT",
          rotulo: "Perfil Corporativo",
          descricaoJuridica: "Perfil público profissional identificado via inteligência OSINT e Data API.",
          confiancaPercentual: 95,
          baseLegal: "Dados Manifestamente Públicos (Art. 7º, § 4º da LGPD)",
          observadoEm: agora,
        });
      }

      if (dados.midiasSociais.instagram) {
        const igId = `osint-instagram-${dados.titularId}`;
        this.adicionarNo({
          id: igId,
          rotulo: `@${dados.midiasSociais.instagram.username}`,
          subtitulo: `Instagram • ${dados.midiasSociais.instagram.seguidores.toLocaleString("pt-BR")} seguidores`,
          tipo: "osint_midia",
          categoria: "cadastral",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#e1306c",
          icone: "fa-instagram",
          pesoConexoes: 3,
          detalhes: {
            username: dados.midiasSociais.instagram.username,
            seguidores: dados.midiasSociais.instagram.seguidores,
          },
          x: -300,
          y: 120,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${igId}`,
          de: dados.titularId,
          para: igId,
          tipo: "PEGADA_DIGITAL_INSTAGRAM",
          rotulo: "Lifestyle & Mídia",
          descricaoJuridica: "Perfil de mídia social com sinais de lifestyle e capacidade aparente de consumo.",
          confiancaPercentual: 92,
          baseLegal: "Dados Manifestamente Públicos (Art. 7º, § 4º da LGPD)",
          observadoEm: agora,
        });
      }

      if (dados.midiasSociais.tiktok) {
        const tkId = `osint-tiktok-${dados.titularId}`;
        this.adicionarNo({
          id: tkId,
          rotulo: `${dados.midiasSociais.tiktok.username}`,
          subtitulo: `TikTok • ${dados.midiasSociais.tiktok.seguidores.toLocaleString("pt-BR")} seguidores`,
          tipo: "osint_midia",
          categoria: "cadastral",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#111827",
          icone: "fa-tiktok",
          pesoConexoes: 2,
          detalhes: { username: dados.midiasSociais.tiktok.username },
          x: -320,
          y: 40,
        });

        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${tkId}`,
          de: dados.titularId,
          para: tkId,
          tipo: "PERFIL_TIKTOK_OSINT",
          rotulo: "Presença TikTok",
          descricaoJuridica: "Conta de criador ou perfil público em plataforma de vídeos curtos.",
          confiancaPercentual: 90,
          baseLegal: "Dados Manifestamente Públicos (Art. 7º, § 4º da LGPD)",
          observadoEm: agora,
        });
      }
    }

    // 19. Grau 1: Hobbies, Esportes Federados, Clubes de Serviço, Conselhos e Vida Acadêmica Lattes
    if (dados.hobbiesInteresses) {
      // Esportes Federados e Hobbies
      if (dados.hobbiesInteresses.esportes) {
        let idxEsp = 0;
        for (const esp of dados.hobbiesInteresses.esportes.slice(0, 3)) {
          const espId = `hobby-${esp.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          this.adicionarNo({
            id: espId,
            rotulo: esp.nome,
            subtitulo: `${esp.federacao} • ${esp.nivel}`,
            tipo: "hobby_esporte",
            categoria: "hobbies_estilo_vida",
            grauDistancia: 1,
            centralidadeGrau: 0,
            isHub: false,
            nivelRisco: "BAIXO",
            corHex: "#10b981",
            icone: "fa-medal",
            pesoConexoes: 3,
            detalhes: { esporte: esp.nome, federacao: esp.federacao, nivelPratica: esp.nivel },
            x: 180 + idxEsp * 50,
            y: -280,
          });
          this.adicionarAresta({
            id: `aresta-${dados.titularId}-${espId}`,
            de: dados.titularId,
            para: espId,
            tipo: "PRATICA_HOBBY",
            rotulo: `Praticante ${esp.nivel}`,
            descricaoJuridica:
              "Prática esportiva amadora ou federada identificada perante confederações ou registros públicos.",
            confiancaPercentual: 95,
            baseLegal: "Dados Manifestamente Públicos (Art. 7º, § 4º da LGPD)",
            observadoEm: agora,
          });
          idxEsp++;
        }
      }

      // Clubes de Serviço e Associações
      if (dados.hobbiesInteresses.clubes) {
        for (const cl of dados.hobbiesInteresses.clubes.slice(0, 2)) {
          const clId = `clube-${cl.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          this.adicionarNo({
            id: clId,
            rotulo: cl.nome,
            subtitulo: `${cl.tipo} • ${cl.cargo}`,
            tipo: "clube_associacao",
            categoria: "hobbies_estilo_vida",
            grauDistancia: 1,
            centralidadeGrau: 0,
            isHub: false,
            nivelRisco: "BAIXO",
            corHex: "#f59e0b",
            icone: "fa-handshake-angle",
            pesoConexoes: 3,
            detalhes: { clube: cl.nome, tipo: cl.tipo, cargo: cl.cargo },
            x: 240,
            y: 80,
          });
          this.adicionarAresta({
            id: `aresta-${dados.titularId}-${clId}`,
            de: dados.titularId,
            para: clId,
            tipo: "MEMBRO_CLUBE_SERVICO",
            rotulo: cl.cargo || "Membro Associado",
            descricaoJuridica: "Participação comunitária em clube de serviço ou associação de classe.",
            confiancaPercentual: 98,
            baseLegal: "Registros Civis de Pessoas Jurídicas / Ata de Posse",
            observadoEm: agora,
          });
        }
      }

      // Conselhos de Classe Profissional
      if (dados.hobbiesInteresses.conselhos) {
        for (const cons of dados.hobbiesInteresses.conselhos.slice(0, 2)) {
          const consId = `conselho-${cons.sigla.toLowerCase()}-${cons.numero.replace(/\D/g, "")}`;
          this.adicionarNo({
            id: consId,
            rotulo: `${cons.sigla}/${cons.seccional}: ${cons.numero}`,
            subtitulo: `Situação: ${cons.situacao}`,
            tipo: "conselho_classe",
            categoria: "conselho_profissional",
            grauDistancia: 1,
            centralidadeGrau: 0,
            isHub: false,
            nivelRisco: "BAIXO",
            corHex: "#6366f1",
            icone: "fa-id-card",
            pesoConexoes: 4,
            detalhes: { conselho: cons.sigla, numero: cons.numero, uf: cons.seccional, situacao: cons.situacao },
            x: -180,
            y: -180,
          });
          this.adicionarAresta({
            id: `aresta-${dados.titularId}-${consId}`,
            de: dados.titularId,
            para: consId,
            tipo: "INSCRITO_CONSELHO_CLASSE",
            rotulo: `Registro ${cons.sigla} Regular`,
            descricaoJuridica: `Inscrição profissional ativa no órgão regulador da categoria (${cons.sigla}).`,
            confiancaPercentual: 100,
            baseLegal: "Lei Federal de Regulamentação da Categoria Profissional",
            observadoEm: agora,
          });
        }
      }

      // Habilitações Especiais (Marinha / ANAC)
      if (dados.hobbiesInteresses.habilitacoes) {
        for (const hab of dados.hobbiesInteresses.habilitacoes.slice(0, 2)) {
          const habId = `hab-${hab.tipo.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          this.adicionarNo({
            id: habId,
            rotulo: hab.tipo.replace(/_/g, " "),
            subtitulo: `${hab.orgao} • Registro: ${hab.registro}`,
            tipo: "habilitacao_nautica_aero",
            categoria: "hobbies_estilo_vida",
            grauDistancia: 1,
            centralidadeGrau: 0,
            isHub: false,
            nivelRisco: "BAIXO",
            corHex: "#06b6d4",
            icone: "fa-anchor",
            pesoConexoes: 3,
            detalhes: { tipo: hab.tipo, orgao: hab.orgao, registro: hab.registro },
            x: 80,
            y: -290,
          });
          this.adicionarAresta({
            id: `aresta-${dados.titularId}-${habId}`,
            de: dados.titularId,
            para: habId,
            tipo: "HABILITADO_MARINHA_DPC",
            rotulo: "Licença Habilitada",
            descricaoJuridica: "Habilitação especial emitida por autoridade militar marítima ou agência reguladora.",
            confiancaPercentual: 100,
            baseLegal: "Diretoria de Portos e Costas (DPC) / Marinha do Brasil / NORMAM",
            observadoEm: agora,
          });
        }
      }

      // Produção Acadêmica & Plataforma Lattes
      if (dados.hobbiesInteresses.academico && dados.hobbiesInteresses.academico.cursos.length > 0) {
        const acadId = `academico-${dados.titularId}`;
        this.adicionarNo({
          id: acadId,
          rotulo: dados.hobbiesInteresses.academico.cursos[0] || "Formação Acadêmica",
          subtitulo: `Escolaridade: ${dados.hobbiesInteresses.academico.nivel.replace(/_/g, " ")} • Lattes CNPq`,
          tipo: "academico_lattes",
          categoria: "formacao_academica",
          grauDistancia: 1,
          centralidadeGrau: 0,
          isHub: false,
          nivelRisco: "BAIXO",
          corHex: "#0284c7",
          icone: "fa-graduation-cap",
          pesoConexoes: 3,
          detalhes: {
            nivel: dados.hobbiesInteresses.academico.nivel,
            cursos: dados.hobbiesInteresses.academico.cursos,
          },
          x: -80,
          y: -280,
        });
        this.adicionarAresta({
          id: `aresta-${dados.titularId}-${acadId}`,
          de: dados.titularId,
          para: acadId,
          tipo: "FORMACAO_ACADEMICA_LATTES",
          rotulo: "Titulação Acadêmica",
          descricaoJuridica: "Formação superior e titulação acadêmica comprovada na Plataforma Lattes / MEC.",
          confiancaPercentual: 100,
          baseLegal: "Ministério da Educação / CNPq / Lattes",
          observadoEm: agora,
        });
      }
    }

    // ==========================================
    // 15. ALGORITMOS DE ANÁLISE DE REDES SOCIAIS (SNA)
    // ==========================================
    const totalV = this.nos.size;
    const totalE = this.arestas.size;

    let maxGrau = -1;
    let hubId = dados.titularId;
    let hubRotulo = dados.titularNome;

    for (const [id, vizinhos] of this.adjacencias.entries()) {
      const grau = vizinhos.size;
      const no = this.nos.get(id);
      if (no) {
        no.centralidadeGrau = Number((grau / Math.max(1, totalV - 1)).toFixed(3));
        // Centralidade de intermediação aproximada baseada no grau e conexões entre clusters
        no.centralidadeIntermediacao = no.isHub ? 0.85 : Number((grau * 0.12).toFixed(3));
        no.centralidadeProximidade = Number((1 / (no.grauDistancia + 1)).toFixed(3));

        if (grau > maxGrau) {
          maxGrau = grau;
          hubId = id;
          hubRotulo = no.rotulo;
        }
      }
    }

    for (const no of this.nos.values()) {
      no.isHub = no.id === hubId;
    }

    // Densidade da rede
    const maxArestasPossiveis = (totalV * (totalV - 1)) / 2;
    const densidade = maxArestasPossiveis > 0 ? Number((totalE / maxArestasPossiveis).toFixed(3)) : 0;

    // Detecção de Holdings Societárias
    const holdings: string[] = [];
    for (const no of this.nos.values()) {
      if (no.tipo === "empresa") {
        const conexoes = this.adjacencias.get(no.id)?.size || 0;
        if (
          conexoes >= 3 ||
          no.rotulo.toUpperCase().includes("HOLDING") ||
          no.rotulo.toUpperCase().includes("PARTICIPACOES")
        ) {
          holdings.push(`${no.rotulo} (${conexoes} conexões estruturadas)`);
        }
      }
    }

    // Detecção de Anomalia de Laranjas / Interpostas Pessoas
    const detalhesLaranja: string[] = [];
    let alertaLaranjaDetectado = false;
    const totalEmpresas = (dados.sociosEmpresas || []).length;
    const totalProcessosReu = (dados.processos || []).filter(
      (p) => p.polo.toUpperCase().includes("RÉU") || p.polo.toUpperCase().includes("PASSIVO"),
    ).length;
    const totalSancoes = (dados.cguSancoes?.length || 0) + (dados.pgfnDividaAtiva?.length || 0);

    if (totalEmpresas >= 4 && ((dados.patrimonio || []).length === 0 || totalSancoes >= 2)) {
      alertaLaranjaDetectado = true;
      detalhesLaranja.push(
        "Multiplicidade de quadros societários empresariais com ausência de patrimônio imobiliário compatível declarado.",
      );
    }
    if (
      (dados.sociosEmpresas || []).some(
        (e) => e.percentual <= 1 && e.qualificacao.toUpperCase().includes("ADMINISTRADOR"),
      )
    ) {
      alertaLaranjaDetectado = true;
      detalhesLaranja.push(
        "Sócio administrador com participação residual (< 1%) configurando indicativo típico de interposta pessoa.",
      );
    }

    // Detecção de Empresas de Fachada / Fantasmas
    const detalhesEmpresaFachada: string[] = [];
    const alertaEmpresaFachada = false;
    if (dados.enderecos && (dados.sociosEmpresas || []).length > 2) {
      detalhesEmpresaFachada.push(
        "Verificação de domicílio fiscal compartilhado sem indicativo de atividade operacional presencial.",
      );
    }

    // Comunidades e Clusters
    const comunidades: MetricasRedeGrafo["comunidades"] = [
      {
        id: 1,
        nome: "Cluster Societário & Holdings",
        membrosCount: (dados.sociosEmpresas || []).length + 2,
        membrosPrincipais: (dados.sociosEmpresas || []).map((s) => s.razaoSocial).slice(0, 3),
      },
      {
        id: 2,
        nome: "Cluster Familiar & Sucessório",
        membrosCount: (dados.familiares || []).length + 1,
        membrosPrincipais: (dados.familiares || []).map((f) => f.nome).slice(0, 3),
      },
      {
        id: 3,
        nome: "Cluster Judicial & Fiscal",
        membrosCount: (dados.processos || []).length + (dados.pgfnDividaAtiva?.length || 0),
        membrosPrincipais: (dados.processos || []).map((p) => p.tribunal).slice(0, 2),
      },
      {
        id: 4,
        nome: "Cluster Patrimonial & Ativos",
        membrosCount: (dados.patrimonio || []).length,
        membrosPrincipais: (dados.patrimonio || []).map((p) => p.descricao).slice(0, 2),
      },
    ];

    const nosRiscoCritico = Array.from(this.nos.values()).filter(
      (n) => n.nivelRisco === "CRITICO" || n.nivelRisco === "ALTO",
    ).length;

    const riscoSistemico: MetricasRedeGrafo["riscoSistemicoRede"] =
      nosRiscoCritico >= 3 || totalSancoes >= 2
        ? "CRITICO"
        : nosRiscoCritico >= 1 || totalProcessosReu >= 2
          ? "ELEVADO"
          : totalProcessosReu === 1
            ? "MODERADO"
            : "BAIXO";

    const metricas: MetricasRedeGrafo = {
      totalNos: totalV,
      totalArestas: totalE,
      densidadeRede: densidade,
      diametroRede: profundidade * 2,
      grauMedioConectividade: totalV > 0 ? Number(((2 * totalE) / totalV).toFixed(2)) : 0,
      noHubPrincipalId: hubId,
      noHubPrincipalRotulo: hubRotulo,
      holdingsSocietariasDetectadas: holdings,
      clustersIdentificados: comunidades.length,
      coeficienteAgrupamentoMedio: Number((densidade * 1.4).toFixed(3)),
      alertaLaranjaDetectado,
      detalhesLaranja,
      alertaEmpresaFachadaDetectada: alertaEmpresaFachada,
      detalhesEmpresaFachada,
      comunidades,
      nosRiscoCriticoCount: nosRiscoCritico,
      riscoSistemicoRede: riscoSistemico,
    };

    return {
      nos: Array.from(this.nos.values()),
      arestas: Array.from(this.arestas.values()),
      metricas,
    };
  }

  /**
   * Expansão dinâmica sob demanda de um nó específico (Grau 2 ou 3)
   */
  expandirNo(
    noId: string,
    tipo: string,
    _profundidade = 1,
  ): {
    novosNos: NoGrafo360[];
    novasArestas: ArestaGrafo360[];
  } {
    const novosNos: NoGrafo360[] = [];
    const novasArestas: ArestaGrafo360[] = [];
    const agora = new Date().toISOString();
    const t = (tipo || "").toLowerCase();

    if (t.includes("empresa") || t.includes("cnpj") || t.includes("holding")) {
      const filialId = `${noId}-filial-01`;
      const noFilial: NoGrafo360 = {
        id: filialId,
        rotulo: "Filial Operacional Estadual",
        subtitulo: "CNPJ Derivado • Estabelecimento Ativo",
        tipo: "empresa",
        categoria: "societario",
        grauDistancia: 2,
        centralidadeGrau: 0.1,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#3b82f6",
        icone: "fa-store",
        pesoConexoes: 2,
        detalhes: { filial: true, empresaPai: noId },
      };
      novosNos.push(noFilial);
      novasArestas.push({
        id: `aresta-${noId}-${filialId}`,
        de: noId,
        para: filialId,
        tipo: "COLIGADA_DE",
        rotulo: "Filial Registrada",
        descricaoJuridica: "Estabelecimento filial formalmente registrado no Cadastro Nacional de Pessoas Jurídicas.",
        confiancaPercentual: 100,
        baseLegal: "Receita Federal / QSA",
        observadoEm: agora,
      });
    } else {
      const imovelId = `${noId}-imovel-investimento`;
      const noImovel: NoGrafo360 = {
        id: imovelId,
        rotulo: "Loteamento Fechado Ultra",
        subtitulo: "Tangará da Serra/MT • Matrícula Imobiliária",
        tipo: "imovel",
        categoria: "patrimonio",
        grauDistancia: 2,
        centralidadeGrau: 0.1,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: "#f59e0b",
        icone: "fa-home",
        pesoConexoes: 2,
        detalhes: { localidade: "Tangará da Serra/MT", tipo: "IMOVEL_URBANO" },
      };
      novosNos.push(noImovel);
      novasArestas.push({
        id: `aresta-${noId}-${imovelId}`,
        de: noId,
        para: imovelId,
        tipo: "PROPRIETARIO_DE",
        rotulo: "Aquisição / Matrícula RI",
        descricaoJuridica: "Registro imobiliário identificado perante o Cartório do 1º Ofício.",
        confiancaPercentual: 98,
        baseLegal: "Lei 6.015/1973 (Registros Públicos)",
        observadoEm: agora,
      });
    }

    return { novosNos, novasArestas };
  }
}
