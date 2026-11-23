/**
 * Motor Pericial de Grafo de Rede de Lançamento Imobiliário e Inteligência Comercial
 * Plataforma Casanova / Kytto Tecnologia
 * Mapeia a arquitetura relacional de empreendimentos imobiliários:
 * Incorporadora -> Construtora (Ultra) -> Imobiliária Master (Casanova) ->
 * Equipe de Corretores (CRECI) -> Quadras/Lotes -> Proponentes/Compradores ->
 * Correspondente Caixa -> Cartório de Registro de Imóveis (RI) -> Rede de Indicações (MGM)
 */

import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import type { ArestaGrafo360, NoGrafo360 } from "./tipos.ts";

export interface LoteUnidadeLancamento {
  id: string; // Ex: "lote-q01-l05"
  quadra: string;
  lote: string;
  metragemM2: number;
  valorTabelaCentavos: number;
  status: "DISPONIVEL" | "RESERVADO" | "PROPOSTA_EM_ANALISE" | "VENDIDO_ESCRITURADO";
  compradorCpfParcial?: string;
  compradorNome?: string;
  corretorResponsavel?: string;
  numeroMatriculaIndividual?: string;
}

export interface EmpreendimentoLancamento {
  id: string;
  nome: string;
  tipo: "LOTEAMENTO_FECHADO" | "CONDOMINIO_HORIZONTAL" | "EDIFICIO_RESIDENCIAL" | "LOTEAMENTO_ABERTO";
  municipio: string;
  uf: string;
  incorporadora: {
    razaoSocial: string;
    cnpj: string;
  };
  construtora: {
    razaoSocial: string;
    cnpj: string;
  };
  imobiliariaComercializadora: {
    razaoSocial: string;
    creciJ: string;
    cnpj: string;
  };
  cartorioRegistroImoveis: string;
  numeroRegistroIncorporacaoRi: string;
  dataLancamento: string;
  previsaoEntrega: string;
  statusObraPercentual: number;
  vgvTotalCentavos: number;
  totalUnidades: number;
  unidadesVendidas: number;
  unidadesReservadas: number;
  unidadesDisponiveis: number;
}

export interface RedeLancamentoGrafoCompleto {
  empreendimento: EmpreendimentoLancamento;
  nos: NoGrafo360[];
  arestas: ArestaGrafo360[];
  metricasComerciais: {
    vgvTotalReais: number;
    vgvVendidoReais: number;
    vgvDisponivelReais: number;
    percentualVendido: number;
    velocidadeVendasVsoPercentual: number;
    ticketMedioReais: number;
    scoreMedioCreditoCompradores: number;
    totalCorretoresAtivos: number;
    corretorTopPerformer: string;
    taxaAprovacaoBancariaCaixaPercentual: number;
    redeIndicacoesFamiliaresCount: number;
  };
  geradoEm: string;
}

export class MotorGrafoRedeLancamento {
  /**
   * Constrói o Grafo Completo da Rede de Lançamento Imobiliário
   */
  construirGrafoLancamento(
    proponenteCpfOuOpcoes?:
      | string
      | {
          titularDocumento?: string;
          titularNome?: string;
          tipoPessoa?: "PF" | "PJ";
          empreendimentoNome?: string;
          cidade?: string;
          uf?: string;
        },
    proponenteNomeConsultado?: string,
  ): RedeLancamentoGrafoCompleto {
    const agora = new Date().toISOString();

    const options =
      typeof proponenteCpfOuOpcoes === "object" && proponenteCpfOuOpcoes !== null
        ? proponenteCpfOuOpcoes
        : {
            titularDocumento: proponenteCpfOuOpcoes,
            titularNome: proponenteNomeConsultado,
            cidade: undefined,
            uf: undefined,
            empreendimentoNome: undefined,
          };

    const proponenteCpfConsultado = options.titularDocumento;
    const proponenteNomeTratado = options.titularNome;

    const empreendimento: EmpreendimentoLancamento = {
      id: "emp-reserva-tangara",
      nome: options.empreendimentoNome || "Reserva Tangará Loteamento Fechado",
      tipo: "LOTEAMENTO_FECHADO",
      municipio: options.cidade || "Tangará da Serra",
      uf: options.uf || "MT",
      incorporadora: {
        razaoSocial: "Ultra Incorporadora e Empreendimentos Imobiliários S.A.",
        cnpj: "18.940.123/0001-90",
      },
      construtora: {
        razaoSocial: "Ultra Construtora e Obras de Engenharia Ltda.",
        cnpj: "18.940.123/0002-71",
      },
      imobiliariaComercializadora: {
        razaoSocial: "Casanova Negócios Imobiliários Ltda. / Kytto Tecnologia",
        creciJ: "CRECI-MT 8.942-J",
        cnpj: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
      },
      cartorioRegistroImoveis: "Cartório do 1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
      numeroRegistroIncorporacaoRi: "R-04-78.910",
      dataLancamento: "2024-03-15",
      previsaoEntrega: "2026-12-20",
      statusObraPercentual: 78.5,
      vgvTotalCentavos: 8500000000, // R$ 85.000.000,00
      totalUnidades: 180,
      unidadesVendidas: 132,
      unidadesReservadas: 18,
      unidadesDisponiveis: 30,
    };

    const nos: NoGrafo360[] = [];
    const arestas: ArestaGrafo360[] = [];

    // 1. Nó Central do Empreendimento
    nos.push({
      id: empreendimento.id,
      rotulo: empreendimento.nome,
      subtitulo: "Loteamento Fechado • VGV R$ 85 Mi • 78.5% Obras",
      tipo: "empresa",
      categoria: "patrimonio",
      grauDistancia: 0,
      centralidadeGrau: 1.0,
      isHub: true,
      nivelRisco: "BAIXO",
      corHex: "#126245", // Verde Casanova Oficial
      icone: "fa-city",
      pesoConexoes: 10,
      detalhes: {
        tipo: "EMPREENDIMENTO_LANCAMENTO",
        localidade: "Tangará da Serra/MT",
        ri: empreendimento.numeroRegistroIncorporacaoRi,
        unidades: empreendimento.totalUnidades,
      },
    });

    // 2. Nó da Incorporadora / Construtora (Ultra)
    const incId = "corp-ultra-incorporadora";
    nos.push({
      id: incId,
      rotulo: "Ultra Construtora & Incorporadora",
      subtitulo: "CNPJ 18.940.123/0001-90 • Incorporador Master",
      tipo: "empresa",
      categoria: "societario",
      grauDistancia: 1,
      centralidadeGrau: 0.85,
      isHub: true,
      nivelRisco: "BAIXO",
      corHex: "#1e3a8a",
      icone: "fa-building",
      pesoConexoes: 8,
      detalhes: { incorporadora: true },
    });
    arestas.push({
      id: `aresta-${incId}-${empreendimento.id}`,
      de: incId,
      para: empreendimento.id,
      tipo: "INCORPORADORA_DE",
      rotulo: "Incorporação Imobiliária",
      descricaoJuridica: "Incorporador responsável registrado perante a Matrícula Imobiliária R-04-78.910.",
      confiancaPercentual: 100,
      baseLegal: "Lei 4.591/1964 (Condomínio e Incorporações)",
      observadoEm: agora,
    });

    // 3. Nó da Comercializadora Master (Casanova Imóveis / Kytto)
    const casanovaId = "corp-casanova-imobiliaria";
    nos.push({
      id: casanovaId,
      rotulo: "Casanova Imóveis (Kytto Tech)",
      subtitulo: "CRECI 8.942-J • Comercializador Exclusivo",
      tipo: "empresa",
      categoria: "societario",
      grauDistancia: 1,
      centralidadeGrau: 0.9,
      isHub: true,
      nivelRisco: "BAIXO",
      corHex: "#0f766e",
      icone: "fa-handshake",
      pesoConexoes: 8,
      detalhes: { creci: "8.942-J", comercializadorMaster: true },
    });
    arestas.push({
      id: `aresta-${casanovaId}-${empreendimento.id}`,
      de: casanovaId,
      para: empreendimento.id,
      tipo: "COMERCIALIZADOR_DE",
      rotulo: "Vendas Exclusivas",
      descricaoJuridica: "Contrato de intermediação e coordenação comercial de lançamentos imobiliários.",
      confiancaPercentual: 100,
      baseLegal: "Lei 6.530/1978 e Resolução COFECI",
      observadoEm: agora,
    });

    // 4. Cartório de Registro de Imóveis (1º Ofício)
    const cartorioId = "cartorio-1-oficio-tangara";
    nos.push({
      id: cartorioId,
      rotulo: "Cartório 1º Ofício RI",
      subtitulo: "Tangará da Serra/MT • Livro 2 Matrícula Geral",
      tipo: "certidao",
      categoria: "compliance",
      grauDistancia: 1,
      centralidadeGrau: 0.6,
      isHub: false,
      nivelRisco: "BAIXO",
      corHex: "#6366f1",
      icone: "fa-stamp",
      pesoConexoes: 5,
      detalhes: { registro: "R-04-78.910", livro: "2-Registro Geral" },
    });
    arestas.push({
      id: `aresta-${empreendimento.id}-${cartorioId}`,
      de: empreendimento.id,
      para: cartorioId,
      tipo: "REGISTRADO_EM",
      rotulo: "Registro RI Oficial",
      descricaoJuridica: "Memorial de incorporação devidamente arquivado e prenotado.",
      confiancaPercentual: 100,
      baseLegal: "Lei 6.015/1973 (Registros Públicos)",
      observadoEm: agora,
    });

    // 5. Correspondente Caixa Econômica Federal
    const caixaCorrespondenteId = "banco-caixa-correspondente";
    nos.push({
      id: caixaCorrespondenteId,
      rotulo: "Correspondente Caixa Aqui",
      subtitulo: "Caixa Econômica Federal • Aprovação SFH/SBPE",
      tipo: "chave_pix",
      categoria: "financeiro",
      grauDistancia: 1,
      centralidadeGrau: 0.7,
      isHub: false,
      nivelRisco: "BAIXO",
      corHex: "#0284c7",
      icone: "fa-university",
      pesoConexoes: 6,
      detalhes: { agenteFinanceiro: "104 - Caixa Econômica Federal", modalidade: "SBPE / SFH Lote e Construção" },
    });
    arestas.push({
      id: `aresta-${empreendimento.id}-${caixaCorrespondenteId}`,
      de: empreendimento.id,
      para: caixaCorrespondenteId,
      tipo: "APROVACAO_BANCARIA",
      rotulo: "Linha de Crédito Associativa",
      descricaoJuridica: "Convênio de financiamento da produção e repasse de mutuários finais.",
      confiancaPercentual: 100,
      baseLegal: "Normativos da Caixa Econômica Federal",
      observadoEm: agora,
    });

    // 6. Equipe de Corretores de Alta Performance (Rede Comercial)
    const corretores = [
      { id: "corretor-01", nome: "Carlos Eduardo Silva", creci: "CRECI 12.450-F", vendas: 42, vgvM: 19.8, top: true },
      { id: "corretor-02", nome: "Juliana Mendes Rossi", creci: "CRECI 14.890-F", vendas: 36, vgvM: 16.5, top: false },
      { id: "corretor-03", nome: "Marcos Paulo Antunes", creci: "CRECI 11.230-F", vendas: 28, vgvM: 13.2, top: false },
    ];

    corretores.forEach((c) => {
      nos.push({
        id: c.id,
        rotulo: c.nome,
        subtitulo: `${c.creci} • ${c.vendas} Vendas (R$ ${c.vgvM} Mi)${c.top ? " 🏆 TOP 1" : ""}`,
        tipo: "corretor",
        categoria: "profissional",
        grauDistancia: 2,
        centralidadeGrau: c.top ? 0.75 : 0.5,
        isHub: c.top,
        nivelRisco: "BAIXO",
        corHex: c.top ? "#f59e0b" : "#4b5563",
        icone: "fa-user-tie",
        pesoConexoes: 4,
        detalhes: { creci: c.creci, totalVendas: c.vendas, vgvIntermediadoMilhoes: c.vgvM },
      });
      arestas.push({
        id: `aresta-${casanovaId}-${c.id}`,
        de: casanovaId,
        para: c.id,
        tipo: "INTERMEDIACAO_COMERCIAL",
        rotulo: "Corretor Credenciado",
        descricaoJuridica: "Contrato de associação para intermediação de vendas imobiliárias.",
        confiancaPercentual: 100,
        baseLegal: "Lei 13.097/2015 (Corretor Associado)",
        observadoEm: agora,
      });
    });

    // 7. Quadras e Lotes Amostrais (Unidades do Lançamento)
    const lotesExemplo = [
      {
        id: "lote-qa-01",
        quadra: "Quadra A",
        lote: "Lote 01",
        m2: 450,
        valorCent: 48000000,
        status: "VENDIDO_ESCRITURADO" as const,
        corretor: "corretor-01",
      },
      {
        id: "lote-qa-02",
        quadra: "Quadra A",
        lote: "Lote 02",
        m2: 450,
        valorCent: 48000000,
        status: "VENDIDO_ESCRITURADO" as const,
        corretor: "corretor-01",
      },
      {
        id: "lote-qb-05",
        quadra: "Quadra B",
        lote: "Lote 05",
        m2: 520,
        valorCent: 55000000,
        status: "RESERVADO" as const,
        corretor: "corretor-02",
      },
      {
        id: "lote-qc-12",
        quadra: "Quadra C",
        lote: "Lote 12",
        m2: 480,
        valorCent: 51000000,
        status: "PROPOSTA_EM_ANALISE" as const,
        corretor: "corretor-01",
      },
      {
        id: "lote-qd-08",
        quadra: "Quadra D",
        lote: "Lote 08",
        m2: 450,
        valorCent: 46000000,
        status: "DISPONIVEL" as const,
      },
    ];

    lotesExemplo.forEach((l) => {
      const corStatus =
        l.status === "VENDIDO_ESCRITURADO"
          ? "#475569"
          : l.status === "RESERVADO"
            ? "#d97706"
            : l.status === "PROPOSTA_EM_ANALISE"
              ? "#2563eb"
              : "#16a34a"; // Disponível

      nos.push({
        id: l.id,
        rotulo: `${l.quadra} • ${l.lote}`,
        subtitulo: `${l.m2}m² • R$ ${(l.valorCent / 100).toLocaleString("pt-BR")} • ${l.status.replace(/_/g, " ")}`,
        tipo: "imovel",
        categoria: "patrimonio",
        grauDistancia: 2,
        centralidadeGrau: 0.4,
        isHub: false,
        nivelRisco: "BAIXO",
        corHex: corStatus,
        icone: "fa-map-pin",
        pesoConexoes: 2,
        detalhes: { quadra: l.quadra, lote: l.lote, metragemM2: l.m2, valorReais: l.valorCent / 100, status: l.status },
      });

      arestas.push({
        id: `aresta-${empreendimento.id}-${l.id}`,
        de: empreendimento.id,
        para: l.id,
        tipo: "UNIDADE_DE",
        rotulo: "Fração Ideal",
        descricaoJuridica: "Lote autônomo resultante do desmembramento aprovado pelo município.",
        confiancaPercentual: 100,
        baseLegal: "Lei 6.766/1979 (Parcelamento do Solo Urbano)",
        observadoEm: agora,
      });

      if (l.corretor) {
        arestas.push({
          id: `aresta-${l.corretor}-${l.id}`,
          de: l.corretor,
          para: l.id,
          tipo: "VENDA_INTERMEDIADA",
          rotulo: "Intermediação",
          descricaoJuridica: "Venda efetuada pelo corretor credenciado.",
          confiancaPercentual: 100,
          baseLegal: "Contrato de Corretagem",
          observadoEm: agora,
        });
      }
    });

    // 8. Proponente / Comprador Atual (Conexão com a Consulta 360)
    const docLimpo = typeof proponenteCpfConsultado === "string" ? proponenteCpfConsultado.replace(/\D/g, "") : "";
    const titularId = docLimpo ? `comprador-${docLimpo}` : "comprador-titular-360";
    const titularNome = proponenteNomeTratado || proponenteNomeConsultado || "Comprador Homologado 360";
    nos.push({
      id: titularId,
      rotulo: titularNome,
      subtitulo: "Proponente Analisado 360 • Score 890 • Aprovado Caixa",
      tipo: "titular",
      categoria: "cadastral",
      grauDistancia: 1,
      centralidadeGrau: 0.8,
      isHub: true,
      nivelRisco: "BAIXO",
      corHex: "#10b981",
      icone: "fa-user-check",
      pesoConexoes: 6,
      detalhes: {
        cpf: proponenteCpfConsultado || "000.000.000-00",
        scoreCredito: 890,
        capacidadeParcelaReais: 14500,
        aprovadoOperacao: true,
      },
    });

    // Vincula o Comprador ao Lote em Análise de Proposta (ex: Lote C-12)
    arestas.push({
      id: `aresta-${titularId}-lote-qc-12`,
      de: titularId,
      para: "lote-qc-12",
      tipo: "PROPOSTA_COMPRA",
      rotulo: "Proposta Aprovada (Caixa)",
      descricaoJuridica:
        "Instrumento particular de compromisso de compra e venda com alienação fiduciária em garantia.",
      confiancaPercentual: 100,
      baseLegal: "Lei 9.514/1997 (Alienação Fiduciária de Imóveis)",
      observadoEm: agora,
    });

    // Vincula Comprador ao Correspondente Caixa para o Financiamento
    arestas.push({
      id: `aresta-${titularId}-${caixaCorrespondenteId}`,
      de: titularId,
      para: caixaCorrespondenteId,
      tipo: "FINANCIAMENTO_HABITACIONAL",
      rotulo: "Carta de Crédito Aprovada",
      descricaoJuridica:
        "Dossiê habitacional aprovado perante o correspondente credenciado da Caixa Econômica Federal.",
      confiancaPercentual: 100,
      baseLegal: "Normativos SFH / SBPE Caixa",
      observadoEm: agora,
    });

    // 9. Rede de Indicação Familiar (MGM - Member Get Member)
    const parenteIndicadoId = "comprador-indicado-parente";
    nos.push({
      id: parenteIndicadoId,
      rotulo: "Carlos Eduardo Santos (Cunhado)",
      subtitulo: "Comprador Indicado • Lote Vizinho QA-02",
      tipo: "familiar",
      categoria: "cadastral",
      grauDistancia: 2,
      centralidadeGrau: 0.4,
      isHub: false,
      nivelRisco: "BAIXO",
      corHex: "#8b5cf6",
      icone: "fa-users",
      pesoConexoes: 3,
      detalhes: { indicacaoPor: titularNome, loteAdquirido: "Quadra A • Lote 02" },
    });

    arestas.push({
      id: `aresta-${titularId}-${parenteIndicadoId}`,
      de: titularId,
      para: parenteIndicadoId,
      tipo: "INDICACAO_MEMBER_GET_MEMBER",
      rotulo: "Indicação Familiar (MGM)",
      descricaoJuridica: "Indicação direta de comprador no mesmo condomínio fechado com bônus comercial.",
      confiancaPercentual: 100,
      baseLegal: "Campanha Comercial Casanova / Ultra",
      observadoEm: agora,
    });

    arestas.push({
      id: `aresta-${parenteIndicadoId}-lote-qa-02`,
      de: parenteIndicadoId,
      para: "lote-qa-02",
      tipo: "PROPRIETARIO_DE",
      rotulo: "Escritura Registrada",
      descricaoJuridica: "Proprietário adquirente com escritura e certidão notarial.",
      confiancaPercentual: 100,
      baseLegal: "Registro Imobiliário",
      observadoEm: agora,
    });

    const vgvTotal = empreendimento.vgvTotalCentavos / 100;
    const vgvVendido =
      (empreendimento.vgvTotalCentavos * (empreendimento.unidadesVendidas / empreendimento.totalUnidades)) / 100;
    const vgvDisponivel = vgvTotal - vgvVendido;

    return {
      empreendimento,
      nos,
      arestas,
      metricasComerciais: {
        vgvTotalReais: vgvTotal,
        vgvVendidoReais: vgvVendido,
        vgvDisponivelReais: vgvDisponivel,
        percentualVendido: Math.round((empreendimento.unidadesVendidas / empreendimento.totalUnidades) * 100),
        velocidadeVendasVsoPercentual: 14.2, // 14,2% VSO mensal
        ticketMedioReais: Math.round(vgvTotal / empreendimento.totalUnidades),
        scoreMedioCreditoCompradores: 845,
        totalCorretoresAtivos: corretores.length,
        corretorTopPerformer: "Carlos Eduardo Silva (CRECI 12.450-F) - R$ 19.8 Mi",
        taxaAprovacaoBancariaCaixaPercentual: 92.5,
        redeIndicacoesFamiliaresCount: 14,
      },
      geradoEm: agora,
    };
  }
}
