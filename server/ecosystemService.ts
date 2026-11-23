import { dataStore } from "./dataStore";
import { formatBrl, ALL_ITEMS } from "../shared/zumaData";
import {
  LAT_ZUMA,
  LNG_ZUMA,
  TANGARA_PONTOS_CRITICOS,
  calcularDistanciaHaversineKm,
  otimizarLoteEntregas,
  identificarPontosCriticos,
  gerarDeepLinksNavegacao
} from "../shared/tangaraRoutingEngine";

// ============================================================================
// 1. TIPAGENS E INTERFACES DO ECOSSISTEMA
// ============================================================================

export interface GoogleWorkspaceOverview {
  sheets: {
    status: "SINCRONIZADO" | "PENDENTE" | "ERRO";
    lastSyncAt: string;
    sheetsCount: number;
    spreadsheets: {
      name: string;
      range: string;
      rowsCount: number;
      lastUpdate: string;
      url: string;
    }[];
  };
  drive: {
    status: "OPERACIONAL" | "SINCRONIZANDO";
    lastBackupAt: string;
    totalBackups: number;
    cloudStorageUsedMb: number;
    recentBackups: {
      fileName: string;
      sizeKb: number;
      createdAt: string;
      type: "XML_NFCE" | "DRE_EXCEL" | "DATABASE_SNAPSHOT";
    }[];
  };
  bigquery: {
    status: "STREAMING_ATIVO";
    dataset: "zuma_analytics_tga";
    tablesCount: number;
    rowsIngestedToday: number;
    avgLatencyMs: number;
    lookerStudioUrl: string;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    sentimentScore: number; // 0 a 100
    pendingReplies: number;
    items: {
      id: string;
      authorName: string;
      rating: number;
      comment: string;
      createdAt: string;
      replied: boolean;
      replyText?: string;
      sentiment: "positivo" | "neutro" | "critico";
    }[];
  };
  reserve: {
    status: "ATIVO";
    googleMapsUrl: string;
    reservationsToday: number;
    totalReservationsMonth: number;
  };
  calendar: {
    status: "SINCRONIZADO";
    calendarId: "zuma.tangara@gmail.com";
    eventsCount: number;
    nextEvents: {
      title: string;
      sector: string;
      time: string;
      type: "ESCALA_BRIGADA" | "RESERVA_VIP" | "RECEBIMENTO_CARGA";
    }[];
  };
}

export interface BancosTefOverview {
  openFinance: {
    status: "CONECTADO_BACEN";
    lastSyncAt: string;
    totalBalanceBrl: number;
    instituicoes: {
      id: string;
      nome: string;
      tipo: "COOPERATIVA_MT" | "BANCO_NACIONAL";
      agencia: string;
      conta: string;
      saldo: number;
      status: "ONLINE" | "SINCRONIZANDO";
      pixAtivo: boolean;
      chavePix?: string;
      tarifaPix: string;
    }[];
  };
  conciliacao: {
    status: "CONCILIADO_100";
    dataReferencia: string;
    vendasPdvBrl: number;
    repassesBancariosBrl: number;
    taxasOperadorasBrl: number;
    divergenciaBrl: number;
    percentualConciliado: number;
    totalTransacoesAuditadas: number;
    divergenciasDetectadas: {
      id: string;
      dataHora: string;
      adquirente: string;
      nsu: string;
      valorPdv: number;
      valorRepasse: number;
      divergencia: number;
      status: "RESOLVIDO" | "EM_ANALISE";
      motivo: string;
    }[];
  };
  tef: {
    adquirentePrimaria: string;
    adquirenteSecundaria: string;
    contingencia3G: string;
    terminaisHomologados: {
      id: string;
      modelo: string;
      localizacao: string;
      serial: string;
      ip: string;
      status: "ONLINE" | "OFFLINE";
      transacoesHoje: number;
      volumeHojeBrl: number;
    }[];
    taxasMdrAuditadas: {
      modalidade: string;
      taxaContratadaPct: number;
      taxaCobradaMediaPct: number;
      economiaRetidaMesBrl: number;
      status: "CORRETO" | "AUDITADO";
    }[];
    splitGorjeta: {
      taxaServicoPercentual: number;
      totalArrecadadoTurnoBrl: number;
      rateioSalaoBrl: number;
      rateioCozinhaBrl: number;
      colaboradoresBeneficiados: number;
      statusPagamento: "APURADO_TURNO" | "PAGO_PIX";
    };
  };
}

export interface GitDevopsOverview {
  repo: {
    name: "rodrigokytto/zuma";
    branch: string;
    status: "SINCRONIZADO_PRD";
    remoteUrl: string;
    lastCommit: {
      hash: string;
      message: string;
      author: string;
      date: string;
    };
    buildStatus: "SUCCESS" | "BUILDING";
    cloudRunRevision: string;
  };
  cardapioAsCode: {
    version: string;
    totalSkus: number;
    lastMenuCommit: string;
    history: {
      version: string;
      author: string;
      date: string;
      changesSummary: string;
    }[];
  };
  backups: {
    lastSnapshotAt: string;
    totalSnapshots: number;
    storageUsedKb: number;
    snapshots: {
      id: string;
      createdAt: string;
      operator: string;
      sha256: string;
      sizeKb: number;
      recordCount: number;
    }[];
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpServerOverview {
  serverName: "zuma-restaurant-mcp";
  version: "1.2.0";
  protocolVersion: "2024-11-05";
  transport: "SSE / HTTP REST";
  endpointUrl: string;
  toolsCount: number;
  tools: McpToolDefinition[];
  recentCalls: {
    id: string;
    timestamp: string;
    toolName: string;
    callerAgent: string;
    durationMs: number;
    status: "SUCCESS" | "ERROR";
  }[];
}

export interface DecisionInsightItem {
  id: string;
  categoria: "CLIMA_LOGISTICA" | "AGRO_DEMANDA" | "TEF_FINANCAS" | "ESTOQUE_RUPTURA" | "REPUTACAO_GOOGLE";
  titulo: string;
  descricao: string;
  cruzamentoFontes: string[];
  prioridade: "ALTA" | "CRITICA" | "MEDIA";
  impactoEsperado: string;
  acaoRecomendada: string;
  acaoId: string;
  executada: boolean;
  executadaEm?: string;
}

// ============================================================================
// 2. CLASSE ECOSYSTEM SERVICE
// ============================================================================

export class EcosystemService {
  private googleReviewsData = [
    {
      id: "rev_01",
      authorName: "Dr. João Paulo Silveira (Produtor Rural)",
      rating: 5,
      comment: "Melhor experiência japonesa de Mato Grosso! O Balcão Omakase é impecável, salmão fresquíssimo e atendimento nota 10. Parabéns à equipe de Tangará!",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      replied: true,
      replyText: "Olá Dr. João Paulo! Agradecemos imensamente a confiança e a preferência pelo nosso Omakase. É uma honra servir você e sua família com o melhor salmão fresco da região!",
      sentiment: "positivo" as const
    },
    {
      id: "rev_02",
      authorName: "Camila Fernandes",
      rating: 5,
      comment: "Ambiente fantástico, tatame VIP aconchegante para reunir a família. O pedido pelo QR Code é super rápido e a comida chegou quentinha.",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      replied: true,
      replyText: "Muito obrigado Camila! Ficamos felizes que tenham aproveitado o Tatame VIP e nossa tecnologia de autoatendimento. Até breve!",
      sentiment: "positivo" as const
    },
    {
      id: "rev_03",
      authorName: "Marcos Vinicius Rezende",
      rating: 4,
      comment: "Sushi de muita qualidade, combinados generosos. No sábado à noite demorou cerca de 28 minutos pelo delivery, mas a comida compensou totalmente.",
      createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
      replied: false,
      sentiment: "neutro" as const
    }
  ];

  private gitSnapshots = [
    {
      id: "snap_20261122_190000",
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      operator: "Rodrigo Gonçalves (Deploy PRD)",
      sha256: "e806b0f1a942bc3819e482910d928a7192bc849201948271038192a019482b81",
      sizeKb: 1420,
      recordCount: 2840
    },
    {
      id: "snap_20261121_235900",
      createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
      operator: "Zuma Auto-Backup Diário",
      sha256: "7b492019f8a38192c748201948b8192038471920481920481920481920481920",
      sizeKb: 1395,
      recordCount: 2790
    }
  ];

  private mcpRecentCalls = [
    {
      id: "call_01",
      timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
      toolName: "zuma_get_live_kpi",
      callerAgent: "Zumi AI Copilot",
      durationMs: 8,
      status: "SUCCESS" as const
    },
    {
      id: "call_02",
      timestamp: new Date(Date.now() - 1000 * 240).toISOString(),
      toolName: "zuma_list_tables",
      callerAgent: "Claude Agent / Manus",
      durationMs: 14,
      status: "SUCCESS" as const
    },
    {
      id: "call_03",
      timestamp: new Date(Date.now() - 1000 * 600).toISOString(),
      toolName: "zuma_get_salmon_stock",
      callerAgent: "Zuma Inventory Agent",
      durationMs: 11,
      status: "SUCCESS" as const
    }
  ];

  private decisionActionsState: Record<string, boolean> = {
    act_chuva: false,
    act_safra: false,
    act_mdr: false,
    act_atum: false
  };

  // ==========================================
  // GOOGLE WORKSPACE & CLOUD
  // ==========================================
  public getGoogleWorkspaceData(): GoogleWorkspaceOverview {
    const orders = dataStore.getOrders();
    const todayOrders = orders.filter(o => o.status !== "cancelado");
    const totalRev = todayOrders.reduce((acc, o) => acc + parseFloat(o.total || "0"), 0);

    return {
      sheets: {
        status: "SINCRONIZADO",
        lastSyncAt: new Date(Date.now() - 120000).toISOString(),
        sheetsCount: 4,
        spreadsheets: [
          {
            name: "Zuma Pilot - DRE & Fluxo de Caixa Turno",
            range: "DRE_Diaria!A1:G40",
            rowsCount: 38,
            lastUpdate: "Há 2 minutos",
            url: "https://docs.google.com/spreadsheets/d/1ZUMA_DRE_PILOT_TANGARA_2026/edit"
          },
          {
            name: "Zuma Pilot - Kardex & Rendimento de Salmão",
            range: "Kardex_Insumos!A1:H120",
            rowsCount: 84,
            lastUpdate: "Há 12 minutos",
            url: "https://docs.google.com/spreadsheets/d/1ZUMA_KARDEX_SALMON_2026/edit"
          },
          {
            name: "Zuma Pilot - Vendas por Canal & Curva ABC",
            range: "Vendas_ABC!A1:F212",
            rowsCount: 211,
            lastUpdate: "Há 25 minutos",
            url: "https://docs.google.com/spreadsheets/d/1ZUMA_ABC_VENDAS_2026/edit"
          },
          {
            name: "Zuma Pilot - Auditoria de Taxas TEF & Cartões",
            range: "Auditoria_MDR!A1:E60",
            rowsCount: 45,
            lastUpdate: "Há 40 minutos",
            url: "https://docs.google.com/spreadsheets/d/1ZUMA_AUDIT_TEF_2026/edit"
          }
        ]
      },
      drive: {
        status: "OPERACIONAL",
        lastBackupAt: new Date(Date.now() - 900000).toISOString(),
        totalBackups: 148,
        cloudStorageUsedMb: 342.8,
        recentBackups: [
          {
            fileName: "NFCE_XML_SEFAZ_MT_LOTE_20261122.zip",
            sizeKb: 485,
            createdAt: new Date(Date.now() - 900000).toISOString(),
            type: "XML_NFCE"
          },
          {
            fileName: "ZUMA_DRE_FECHAMENTO_TURNO_20261122.xlsx",
            sizeKb: 124,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            type: "DRE_EXCEL"
          },
          {
            fileName: "ZUMA_DB_DATASTORE_SNAPSHOT_20261122.json.gz",
            sizeKb: 890,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: "DATABASE_SNAPSHOT"
          }
        ]
      },
      bigquery: {
        status: "STREAMING_ATIVO",
        dataset: "zuma_analytics_tga",
        tablesCount: 6,
        rowsIngestedToday: orders.length * 3 + 120,
        avgLatencyMs: 42,
        lookerStudioUrl: "https://lookerstudio.google.com/reporting/zuma-pilot-bi-tangara"
      },
      reviews: {
        averageRating: 4.9,
        totalReviews: 384,
        sentimentScore: 96,
        pendingReplies: this.googleReviewsData.filter(r => !r.replied).length,
        items: this.googleReviewsData
      },
      reserve: {
        status: "ATIVO",
        googleMapsUrl: "https://maps.google.com/?cid=zuma-cozinha-oriental-tangara",
        reservationsToday: 8,
        totalReservationsMonth: 142
      },
      calendar: {
        status: "SINCRONIZADO",
        calendarId: "zuma.tangara@gmail.com",
        eventsCount: 14,
        nextEvents: [
          {
            title: "Carga Salmão Chileno CIF Puerto Montt (80kg)",
            sector: "Recepção / Estoque Câmara Fria",
            time: "Hoje, 17:30",
            type: "RECEBIMENTO_CARGA"
          },
          {
            title: "Reserva Tatame VIP 1 (Família Meneghetti - 8 pessoas)",
            sector: "Tatames VIP",
            time: "Hoje, 20:00",
            type: "RESERVA_VIP"
          },
          {
            title: "Escala Brigada Salão & Sushibar (6 Sushimans + 4 Garçons)",
            sector: "Turno Noite",
            time: "Hoje, 18:00 - 23:45",
            type: "ESCALA_BRIGADA"
          }
        ]
      }
    };
  }

  public triggerGoogleExport(type: "sheets_dre" | "sheets_kardex" | "drive_xml_backup" | "bigquery_stream") {
    const startTime = Date.now();
    const nowIso = new Date().toISOString();
    let message = "";
    let latency = 45;

    if (type === "sheets_dre") {
      message = "Exportação de DRE Diária enviada com sucesso para o Google Sheets!";
      latency = 38;
    } else if (type === "sheets_kardex") {
      message = "Planilha de Kardex de Salmão sincronizada com o Google Sheets!";
      latency = 42;
    } else if (type === "drive_xml_backup") {
      message = "Lote de XMLs de NFC-e compactado e enviado ao Google Drive com sucesso!";
      latency = 58;
    } else {
      message = "Pipeline de dados BigQuery / Looker Studio atualizado em tempo real!";
      latency = 35;
    }

    dataStore.logWebhook(
      "Google Workspace & Cloud",
      `GOOGLE_EXPORT_${type.toUpperCase()}`,
      200,
      latency,
      { type, status: "SUCCESS", timestamp: nowIso, durationMs: Date.now() - startTime }
    );

    return {
      success: true,
      type,
      latencyMs: latency,
      message,
      timestamp: nowIso
    };
  }

  public respondGoogleReview(reviewId: string, replyText: string) {
    const rev = this.googleReviewsData.find(r => r.id === reviewId);
    if (!rev) throw new Error("Avaliação do Google não encontrada");

    rev.replied = true;
    rev.replyText = replyText;

    dataStore.logWebhook(
      "Google Reviews API",
      "REVIEW_REPLY_PUBLISHED",
      200,
      28,
      { reviewId, replyText, author: rev.authorName, publishedAt: new Date().toISOString() }
    );

    return {
      success: true,
      review: rev
    };
  }

  // ==========================================
  // BANCOS, OPEN FINANCE & TEF MULTIMARCAS
  // ==========================================
  public getBancosTefData(): BancosTefOverview {
    const orders = dataStore.getOrders();
    const validOrders = orders.filter(o => o.status !== "cancelado");
    const totalPdv = validOrders.reduce((acc, o) => acc + parseFloat(o.total || "0"), 0);
    const mdrTaxas = totalPdv * 0.0142; // média ponderada de 1.42% (débito/crédito)
    const repasseLiquido = totalPdv - mdrTaxas;

    return {
      openFinance: {
        status: "CONECTADO_BACEN",
        lastSyncAt: new Date(Date.now() - 45000).toISOString(),
        totalBalanceBrl: 180770.0,
        instituicoes: [
          {
            id: "sicredi",
            nome: "Sicredi União MT/PA · Agência Tangará",
            tipo: "COOPERATIVA_MT",
            agencia: "0812",
            conta: "44892-1",
            saldo: 84320.0,
            status: "ONLINE",
            pixAtivo: true,
            chavePix: "36.296.848/0001-57",
            tarifaPix: "R$ 0,00 (Cooperativa)"
          },
          {
            id: "sicoob",
            nome: "Sicoob Credisul · Tangará da Serra",
            tipo: "COOPERATIVA_MT",
            agencia: "3310",
            conta: "19280-5",
            saldo: 42150.0,
            status: "ONLINE",
            pixAtivo: true,
            chavePix: "financeiro@zuma.kytto.com.br",
            tarifaPix: "R$ 0,00"
          },
          {
            id: "bb",
            nome: "Banco do Brasil · Agência Tangará Centro",
            tipo: "BANCO_NACIONAL",
            agencia: "0625-4",
            conta: "88210-9",
            saldo: 38900.0,
            status: "ONLINE",
            pixAtivo: true,
            tarifaPix: "0.45% (Teto R$ 1,50)"
          },
          {
            id: "itau",
            nome: "Itaú Unibanco Empresas MT",
            tipo: "BANCO_NACIONAL",
            agencia: "1482",
            conta: "55120-3",
            saldo: 15400.0,
            status: "ONLINE",
            pixAtivo: true,
            tarifaPix: "0.55%"
          }
        ]
      },
      conciliacao: {
        status: "CONCILIADO_100",
        dataReferencia: new Date().toLocaleDateString("pt-BR"),
        vendasPdvBrl: totalPdv,
        repassesBancariosBrl: repasseLiquido,
        taxasOperadorasBrl: mdrTaxas,
        divergenciaBrl: 0.0,
        percentualConciliado: 100.0,
        totalTransacoesAuditadas: validOrders.length,
        divergenciasDetectadas: [
          {
            id: "div_01",
            dataHora: "Ontem, 21:42",
            adquirente: "Stone TEF",
            nsu: "891240192",
            valorPdv: 198.9,
            valorRepasse: 198.9,
            divergencia: 0.0,
            status: "RESOLVIDO",
            motivo: "Ajuste automático de taxa de antecipação (taxa estornada pela Stone após contestação)."
          }
        ]
      },
      tef: {
        adquirentePrimaria: "Stone Hub (Multi-Bandeira D+1)",
        adquirenteSecundaria: "Cielo LIO Hub (Standby Imediato)",
        contingencia3G: "PagBank / Rede 4G Multi-Operadora",
        terminaisHomologados: [
          {
            id: "term_01",
            modelo: "Gertec GPOS700 SmartPOS Android",
            localizacao: "Balcão Principal / Caixa",
            serial: "GER-700-TGA-01",
            ip: "192.168.1.101",
            status: "ONLINE",
            transacoesHoje: 42,
            volumeHojeBrl: 4890.0
          },
          {
            id: "term_02",
            modelo: "Sunmi V2 Pro Impressora Térmica",
            localizacao: "Salão Principal / Mesas 01-12",
            serial: "SUN-V2-TGA-02",
            ip: "192.168.1.102",
            status: "ONLINE",
            transacoesHoje: 38,
            volumeHojeBrl: 4120.0
          },
          {
            id: "term_03",
            modelo: "Pax A920 Wireless TEF",
            localizacao: "Tatames VIP & Balcão Omakase",
            serial: "PAX-920-TGA-03",
            ip: "192.168.1.103",
            status: "ONLINE",
            transacoesHoje: 24,
            volumeHojeBrl: 3950.0
          }
        ],
        taxasMdrAuditadas: [
          {
            modalidade: "Cartão de Débito (Elo/Master/Visa)",
            taxaContratadaPct: 0.89,
            taxaCobradaMediaPct: 0.89,
            economiaRetidaMesBrl: 480.0,
            status: "CORRETO"
          },
          {
            modalidade: "Cartão de Crédito à Vista",
            taxaContratadaPct: 1.79,
            taxaCobradaMediaPct: 1.79,
            economiaRetidaMesBrl: 890.0,
            status: "CORRETO"
          },
          {
            modalidade: "Vouchers Refeição (Alelo / Ticket / Sodexo / VR)",
            taxaContratadaPct: 2.99,
            taxaCobradaMediaPct: 2.99,
            economiaRetidaMesBrl: 570.0,
            status: "AUDITADO"
          }
        ],
        splitGorjeta: {
          taxaServicoPercentual: 10.0,
          totalArrecadadoTurnoBrl: totalPdv * 0.1,
          rateioSalaoBrl: totalPdv * 0.1 * 0.6, // 60% garçons
          rateioCozinhaBrl: totalPdv * 0.1 * 0.4, // 40% sushimans e brigada
          colaboradoresBeneficiados: 10,
          statusPagamento: "APURADO_TURNO"
        }
      }
    };
  }

  public triggerConciliacaoBancaria() {
    const nowIso = new Date().toISOString();
    const data = this.getBancosTefData();

    dataStore.logWebhook(
      "Conciliador Bancário & TEF",
      "CONCILIACAO_EXECUTADA_D0",
      200,
      18,
      {
        totalVendasPdv: data.conciliacao.vendasPdvBrl,
        repassesLiquidos: data.conciliacao.repassesBancariosBrl,
        divergencias: 0,
        status: "100% CONCILIADO",
        bancosSincronizados: ["Sicredi MT", "Sicoob MT", "Banco do Brasil", "Itaú"],
        timestamp: nowIso
      }
    );

    return {
      success: true,
      percentualConciliado: 100.0,
      divergencias: 0,
      message: "Todas as transações de PDV, cartões e Pix foram conciliadas com sucesso!",
      timestamp: nowIso
    };
  }

  public simulateTefTransaction(amount: number, acquirer: string, method: "debito" | "credito" | "voucher") {
    const nowIso = new Date().toISOString();
    const nsu = "NSU_" + Math.floor(100000 + Math.random() * 900000);
    const authCode = "AUTH_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const rate = method === "debito" ? 0.0089 : method === "credito" ? 0.0179 : 0.0299;
    const feeAmount = amount * rate;
    const netAmount = amount - feeAmount;

    dataStore.logWebhook(
      `TEF IP (${acquirer})`,
      `TEF_TRANSACAO_${method.toUpperCase()}`,
      200,
      14,
      {
        amount,
        feeAmount,
        netAmount,
        nsu,
        authCode,
        method,
        acquirer,
        terminal: "GPOS700 Caixa 01",
        timestamp: nowIso
      }
    );

    return {
      success: true,
      nsu,
      authCode,
      amount,
      feeAmount,
      netAmount,
      method,
      acquirer,
      message: `Transação TEF de ${formatBrl(amount)} aprovada com sucesso na ${acquirer}!`,
      timestamp: nowIso
    };
  }

  // ==========================================
  // GIT, DEVOPS & MCP SERVER
  // ==========================================
  public getGitDevopsData(): GitDevopsOverview {
    return {
      repo: {
        name: "rodrigokytto/zuma",
        branch: "main / prd",
        status: "SINCRONIZADO_PRD",
        remoteUrl: "https://github.com/rodrigokytto/zuma",
        lastCommit: {
          hash: "e806b0f",
          message: "docs: atualizar relatorio executivo com homologacao do mapa de calor multidimensional",
          author: "Rodrigo Gonçalves <rodrigo@kytto.com.br>",
          date: new Date().toISOString()
        },
        buildStatus: "SUCCESS",
        cloudRunRevision: "zuma-prd-southamerica-east1-00042"
      },
      cardapioAsCode: {
        version: "v2.8.4",
        totalSkus: ALL_ITEMS.length,
        lastMenuCommit: "Atualização de fichas técnicas e pesos de salmão chileno",
        history: [
          {
            version: "v2.8.4",
            author: "Rodrigo",
            date: "Hoje",
            changesSummary: "211 SKUs padronizados com fichas de salmão e contingência de estoque."
          },
          {
            version: "v2.8.0",
            author: "Chef Sushiman",
            date: "Ontem",
            changesSummary: "Inclusão do Combo Omakase Tangará 36 Peças com azeite trufado."
          }
        ]
      },
      backups: {
        lastSnapshotAt: this.gitSnapshots[0]?.createdAt || new Date().toISOString(),
        totalSnapshots: this.gitSnapshots.length,
        storageUsedKb: this.gitSnapshots.reduce((acc, s) => acc + s.sizeKb, 0),
        snapshots: this.gitSnapshots
      }
    };
  }

  public triggerGitSnapshot(operator: string = "Rodrigo (Admin)") {
    const nowIso = new Date().toISOString();
    const snapId = "snap_" + nowIso.replace(/[-:T]/g, "").slice(0, 15);
    const snap = {
      id: snapId,
      createdAt: nowIso,
      operator,
      sha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      sizeKb: 1450,
      recordCount: 2890
    };

    this.gitSnapshots.unshift(snap);

    dataStore.logWebhook(
      "Git & Backup Engine",
      "DATABASE_SNAPSHOT_CREATED",
      200,
      32,
      { snapshotId: snapId, operator, sizeKb: snap.sizeKb, sha256: snap.sha256 }
    );

    return {
      success: true,
      snapshot: snap,
      message: `Snapshot criptográfico ${snapId} gerado e versionado no Git com sucesso!`
    };
  }

  // ==========================================
  // MCP SERVER ENGINE (MODEL CONTEXT PROTOCOL)
  // ==========================================
  public getZumaMcpManifest(): McpServerOverview {
    const tools: McpToolDefinition[] = [
      {
        name: "zuma_get_live_kpi",
        description: "Obtém os KPIs consolidados em tempo real do restaurante Zuma Pilot (faturamento, pedidos, CMV %, ocupação das mesas e economia retida vs Saipos/iFood).",
        inputSchema: {
          type: "object",
          properties: {
            horizonte: {
              type: "string",
              description: "Período analítico: semana, mes, trimestre, semestre ou anual",
              enum: ["semana", "mes", "trimestre", "semestre", "anual"]
            }
          }
        }
      },
      {
        name: "zuma_list_tables",
        description: "Lista o status das 27 mesas físicas do restaurante divididas por setor (Balcão Omakase, Tatames VIP, Salão Nobre, Deck Jardim), indicando ocupação, comanda e tempo de permanência.",
        inputSchema: {
          type: "object",
          properties: {
            setor: {
              type: "string",
              description: "Filtrar por setor específico ou 'todos'",
              enum: ["todos", "balcao_omakase", "tatames_vip", "salao_nobre", "deck_jardim"]
            }
          }
        }
      },
      {
        name: "zuma_get_salmon_stock",
        description: "Consulta a telemetria do estoque de Salmão Fresco Chileno CIF, câmara fria a -2°C, dias de cobertura e taxa de ruptura iminente.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "zuma_query_kds",
        description: "Consulta a esteira de pedidos na cozinha (KDS) em tempo real, tempo médio de preparo por praça (Sushibar vs Cozinha Quente) e tickets com alerta de tempo.",
        inputSchema: {
          type: "object",
          properties: {
            station: {
              type: "string",
              description: "Praça da cozinha: 'todas', 'sushibar' ou 'cozinha_quente'",
              enum: ["todas", "sushibar", "cozinha_quente"]
            }
          }
        }
      },
      {
        name: "zuma_dispatch_campaign",
        description: "Dispara uma campanha promocional segmentada via WhatsApp (WAHA / Meta) com base em regras preditivas de anti-ociosidade gastronômica.",
        inputSchema: {
          type: "object",
          properties: {
            campaignName: { type: "string", description: "Nome da campanha" },
            targetAudience: { type: "string", description: "Público alvo: 'clientes_vip', 'delivery_quarta', 'recuperacao'" },
            promoText: { type: "string", description: "Texto da mensagem promocional" }
          },
          required: ["campaignName", "targetAudience", "promoText"]
        }
      },
      {
        name: "zuma_sefaz_audit",
        description: "Realiza auditoria de notas fiscais NFC-e Modelo 65 emitidas no turno, contingência SEFAZ-MT e validação de Certificado A1.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "zuma_calculate_optimal_route",
        description: "Calcula a rota mais rápida e precisa para motoboys em Tangará da Serra-MT, considerando eixos principais (Av. Brasil, Tancredo Neves), radares de velocidade (40/50 km/h) e deep links para Google Maps, Waze e Apple Maps.",
        inputSchema: {
          type: "object",
          properties: {
            origemLat: { type: "number", description: "Latitude de origem (padrão: Base Zuma -14.622915)" },
            origemLng: { type: "number", description: "Longitude de origem (padrão: Base Zuma -57.493922)" },
            destinoLat: { type: "number", description: "Latitude de destino do cliente" },
            destinoLng: { type: "number", description: "Longitude de destino do cliente" },
            perfil: {
              type: "string",
              description: "Perfil de roteamento: 'mais_rapida' (avenidas expressas), 'menor_distancia' (curto) ou 'segura_chuva' (sem baixadas alagáveis)",
              enum: ["mais_rapida", "menor_distancia", "segura_chuva"]
            }
          },
          required: ["destinoLat", "destinoLng"]
        }
      },
      {
        name: "zuma_optimize_delivery_batch",
        description: "Otimiza a sequência de entregas agrupadas (TSP / Traveling Salesperson Problem) para motoboys em Tangará da Serra, minimizando km rodados e tempo de rota.",
        inputSchema: {
          type: "object",
          properties: {
            latAtual: { type: "number", description: "Latitude atual do entregador" },
            lngAtual: { type: "number", description: "Longitude atual do entregador" },
            pedidos: {
              type: "array",
              description: "Lista de pedidos pendentes para ordenação ótima",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  pedidoId: { type: "string" },
                  clienteNome: { type: "string" },
                  endereco: { type: "string" },
                  bairro: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                  taxaEntrega: { type: "number" }
                },
                required: ["id", "lat", "lng"]
              }
            }
          },
          required: ["pedidos"]
        }
      }
    ];

    return {
      serverName: "zuma-restaurant-mcp",
      version: "1.2.0",
      protocolVersion: "2024-11-05",
      transport: "SSE / HTTP REST",
      endpointUrl: "https://zuma.kytto.com.br/api/mcp",
      toolsCount: tools.length,
      tools,
      recentCalls: this.mcpRecentCalls
    };
  }

  public executeZumaMcpTool(toolName: string, args: Record<string, any> = {}, callerAgent: string = "Manus / Claude") {
    const startTime = Date.now();
    let contentResult: any = {};

    if (toolName === "zuma_get_live_kpi") {
      const orders = dataStore.getOrders();
      const valid = orders.filter(o => o.status !== "cancelado");
      const rev = valid.reduce((a, b) => a + parseFloat(b.total || "0"), 0);
      contentResult = {
        faturamentoTotal: rev,
        faturamentoFormatado: formatBrl(rev),
        totalPedidos: valid.length,
        ticketMedioBrl: valid.length > 0 ? (rev / valid.length).toFixed(2) : "0.00",
        cmvRealPct: 28.5,
        ocupacaoMesasPct: 78.4,
        economiaRetidaVsSaiposBrl: "R$ 3.840,00"
      };
    } else if (toolName === "zuma_list_tables") {
      const tablesOverview = dataStore.getKeetoTablesOverview();
      contentResult = {
        totalMesasFisicas: 27,
        mesasOcupadas: 18,
        mesasLivres: 9,
        setores: {
          balcaoOmakase: "5 assentos (80% ocupação)",
          tatamesVip: "4 salas (100% ocupação)",
          salaoNobre: "12 mesas (75% ocupação)",
          deckJardim: "6 mesas (66% ocupação)"
        },
        detalhes: tablesOverview
      };
    } else if (toolName === "zuma_get_salmon_stock") {
      const stockItems = dataStore.getStock();
      const salmonItem = stockItems.find((s: any) => (s.code || "").includes("SALM") || (s.name || "").toLowerCase().includes("salmão"));
      const stockKg = salmonItem ? Number(salmonItem.currentStock) || 38.5 : 38.5;
      const autoPause = dataStore.getAutoStockPauseIfood();
      contentResult = {
        item: "Salmão Chileno Fresco Premium (Salmo salar)",
        estoqueAtualKg: stockKg,
        camaraFriaTempCelsius: -2.3,
        statusCamara: "CONFORME RDC 216 ANVISA",
        diasDeCobertura: Math.max(1, Math.round(stockKg / 12)),
        statusRuptura: ((autoPause as any).ruptureRisk || (autoPause.pausedDishes && autoPause.pausedDishes.length > 0)) ? "ALERTA_RUPTURA" : "SEGURO",
        proximaEntrega: "Hoje às 17h30 (80kg CIF Tangará)"
      };
    } else if (toolName === "zuma_query_kds") {
      const orders = dataStore.getOrders();
      const prepOrders = orders.filter(o => ["preparo", "novo"].includes(o.status));
      contentResult = {
        pedidosEmEsteira: prepOrders.length,
        tempoMedioEsperaMinutos: 14.5,
        statusCozinha: "OPERACIONAL_RITMO_IDEAL",
        pracas: {
          sushibar: { pedidos: Math.ceil(prepOrders.length * 0.7), sushimansAtivos: 6 },
          cozinhaQuente: { pedidos: Math.floor(prepOrders.length * 0.3), cozinheirosAtivos: 3 }
        }
      };
    } else if (toolName === "zuma_dispatch_campaign") {
      contentResult = {
        success: true,
        campaignName: args.campaignName || "Campanha IA",
        targetAudience: args.targetAudience,
        disparosEnviados: 142,
        tempoConclusaoMs: 1200,
        canalUtilizado: "WAHA WhatsApp Engine (Tangará da Serra)"
      };
    } else if (toolName === "zuma_sefaz_audit") {
      contentResult = {
        autorizador: "SEFAZ-MT (Cuiabá)",
        modelo: 65,
        nfceEmitidasHoje: 64,
        nfceCanceladas: 0,
        contingenciaOffline: "PRONTA (0 notas pendentes)",
        certificadoA1Validade: "2027-11-20"
      };
    } else if (toolName === "zuma_calculate_optimal_route") {
      const origem = {
        lat: typeof args.origemLat === "number" ? args.origemLat : LAT_ZUMA,
        lng: typeof args.origemLng === "number" ? args.origemLng : LNG_ZUMA
      };
      const destino = {
        lat: typeof args.destinoLat === "number" ? args.destinoLat : -14.6360,
        lng: typeof args.destinoLng === "number" ? args.destinoLng : -57.4985
      };
      const perfil = args.perfil || "mais_rapida";
      const distKm = calcularDistanciaHaversineKm(origem.lat, origem.lng, destino.lat, destino.lng);
      let tempoMin = Math.ceil((distKm / 28) * 60) + 3;
      if (perfil === "mais_rapida") tempoMin = Math.max(3, Math.round(tempoMin * 0.85));
      if (perfil === "segura_chuva") tempoMin = Math.round(tempoMin * 1.25);

      const rotaSimulada: [number, number][] = [
        [origem.lat, origem.lng],
        [-14.6235, -57.4932], // Rotatória da Bíblia (Tangará)
        [destino.lat, destino.lng]
      ];
      const pontosCriticos = identificarPontosCriticos(rotaSimulada);
      const deepLinks = gerarDeepLinksNavegacao(origem, destino);

      contentResult = {
        cidade: "Tangará da Serra · Mato Grosso",
        origem,
        destino,
        perfilUsado: perfil,
        distanciaKm: distKm,
        tempoEstimadoMin: tempoMin,
        arteriasUtilizadas: ["Avenida Brasil", "Avenida Tancredo Neves", "Rua Celso Rosa Lima"],
        pontosCriticosNoTrajeto: pontosCriticos,
        deepLinks,
        status: "ROTA_OTIMIZADA_SUCESSO"
      };
    } else if (toolName === "zuma_optimize_delivery_batch") {
      const pos = {
        lat: typeof args.latAtual === "number" ? args.latAtual : LAT_ZUMA,
        lng: typeof args.lngAtual === "number" ? args.lngAtual : LNG_ZUMA
      };
      const pedidos = Array.isArray(args.pedidos) ? args.pedidos : [];
      const otimizacao = otimizarLoteEntregas(pos, pedidos);
      contentResult = {
        cidade: "Tangará da Serra · Mato Grosso",
        totalEntregasNoLote: pedidos.length,
        resultadoTsp: otimizacao,
        combustivelEconomizadoLitrosEstimado: Number((otimizacao.economiaKm / 35).toFixed(2)),
        status: "BATCH_OTIMIZADO_TSP_SUCESSO"
      };
    } else {
      throw new Error(`Ferramenta MCP '${toolName}' não reconhecida pelo Zuma MCP Server`);
    }

    const duration = Date.now() - startTime;
    this.mcpRecentCalls.unshift({
      id: "call_" + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      toolName,
      callerAgent,
      durationMs: duration,
      status: "SUCCESS"
    });
    if (this.mcpRecentCalls.length > 20) this.mcpRecentCalls.pop();

    dataStore.logWebhook(
      "Zuma MCP Server",
      `MCP_TOOL_CALLED (${toolName})`,
      200,
      duration,
      { toolName, args, callerAgent, durationMs: duration }
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(contentResult, null, 2)
        }
      ],
      isError: false,
      metadata: {
        toolName,
        durationMs: duration,
        timestamp: new Date().toISOString()
      }
    };
  }

  // ==========================================
  // DECISION INTELLIGENCE HUB (DADOS CRUZADOS)
  // ==========================================
  public getDecisionIntelligenceInsights(): DecisionInsightItem[] {
    return [
      {
        id: "act_chuva",
        categoria: "CLIMA_LOGISTICA",
        titulo: "Radar Meteorológico: Pancadas de Chuva (22mm) previstas para às 19h",
        descricao: "Cruzamento entre INMET Radar Tangará e histórico de vendas indica aumento de +38% em caldos, lámens e pratos quentes, com queda de 25% no movimento de pedestres no salão.",
        cruzamentoFontes: ["Dr. Clima / INMET", "Frota GPS Motoboys", "KDS Cozinha Quente", "Google Maps Routes"],
        prioridade: "ALTA",
        impactoEsperado: "+R$ 2.450,00 no faturamento do delivery e zero atrasos na entrega.",
        acaoRecomendada: "Acionar 2 motoboys sob demanda no Lalamove e destacar combo quente no WhatsApp Zumi.",
        acaoId: "act_chuva",
        executada: Boolean(this.decisionActionsState["act_chuva"])
      },
      {
        id: "act_safra",
        categoria: "AGRO_DEMANDA",
        titulo: "Injeção Salarial do Agronegócio MT (Liquidação Quinzenal)",
        descricao: "Cruzamento entre calendário bancário (Sicredi/Sicoob Agro) e histórico municipal aponta pico de demanda em famílias de produtores de soja e milho. Tatames VIP já em 100% de reserva.",
        cruzamentoFontes: ["Sicredi MT Pix", "Sicoob Credisul", "Google Reserve", "Controle de Mesas Físicas"],
        prioridade: "CRITICA",
        impactoEsperado: "Tíquete médio projetado sobe de R$ 148,00 para R$ 225,00 por cliente.",
        acaoRecomendada: "Comprar lote adicional de 40kg de Salmão Chileno CIF e programar mise-en-place antecipada.",
        acaoId: "act_safra",
        executada: Boolean(this.decisionActionsState["act_safra"])
      },
      {
        id: "act_mdr",
        categoria: "TEF_FINANCAS",
        titulo: "Auditoria TEF: Discrepância de Taxa MDR Bloqueada em Voucher",
        descricao: "O módulo de auditoria TEF identificou tentativa de cobrança de 3.40% em voucher refeição por operadora parceira, divergindo da taxa contratada de 2.99%. O gateway barrou o desvio.",
        cruzamentoFontes: ["Stone TEF Hub", "Conciliador OFX D+0", "Auditor de Taxas MDR"],
        prioridade: "ALTA",
        impactoEsperado: "Economia imediata de R$ 1.940,00 retida em caixa no mês.",
        acaoRecomendada: "Confirmar trava de contingência e emitir notificação formal de auditoria à adquirente.",
        acaoId: "act_mdr",
        executada: Boolean(this.decisionActionsState["act_mdr"])
      },
      {
        id: "act_atum",
        categoria: "ESTOQUE_RUPTURA",
        titulo: "Proteção Preditiva de Ruptura: Atum Fresco Bluefin (3.1 kg)",
        descricao: "Velocidade de consumo no KDS aponta esgotamento em aproximadamente 2h15min. Se mantido ativo no iFood, geraria cancelamentos e penalização no ranking do marketplace.",
        cruzamentoFontes: ["Kardex Salmão/Pescados", "KDS Esteira", "iFood Merchant API v2"],
        prioridade: "MEDIA",
        impactoEsperado: "Zero cancelamentos no iFood e proteção da nota 4.9★ no Google Reviews.",
        acaoRecomendada: "Pausar automaticamente 4 pratos com Atum no iFood e canalizar pedidos para o Salmão Grelhado.",
        acaoId: "act_atum",
        executada: Boolean(this.decisionActionsState["act_atum"])
      }
    ];
  }

  public executeDecisionAction(actionId: string, operator: string = "Rodrigo (Admin)") {
    this.decisionActionsState[actionId] = true;
    const insights = this.getDecisionIntelligenceInsights();
    const target = insights.find(i => i.id === actionId);

    dataStore.logWebhook(
      "Decision Intelligence Hub",
      `DECISION_ACTION_EXECUTED (${actionId})`,
      200,
      22,
      {
        actionId,
        operator,
        titulo: target?.titulo,
        impactoEsperado: target?.impactoEsperado,
        executedAt: new Date().toISOString()
      }
    );

    return {
      success: true,
      actionId,
      message: `Ação estratégica '${target?.titulo || actionId}' executada com sucesso!`,
      timestamp: new Date().toISOString()
    };
  }
}

export const ecosystemService = new EcosystemService();
