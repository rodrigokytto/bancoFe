import { describe, it, expect } from "vitest";
import { ecosystemService } from "./ecosystemService";

describe("Ecossistema de Integrações Expandido do Zuma Pilot", () => {
  describe("Pilar 1: Google Workspace & Cloud Intelligence", () => {
    it("deve carregar os dados de planilhas Sheets, Drive, BigQuery e avaliações", () => {
      const data = ecosystemService.getGoogleWorkspaceData();
      expect(data).toBeDefined();
      expect(data.sheets.status).toBe("SINCRONIZADO");
      expect(data.sheets.spreadsheets.length).toBeGreaterThanOrEqual(3);
      expect(data.drive.status).toBe("OPERACIONAL");
      expect(data.drive.recentBackups.length).toBeGreaterThanOrEqual(1);
      expect(data.bigquery.status).toBe("STREAMING_ATIVO");
      expect(data.reviews.averageRating).toBeGreaterThanOrEqual(4.8);
      expect(data.reviews.items.length).toBeGreaterThan(0);
      expect(data.calendar.nextEvents.length).toBeGreaterThanOrEqual(2);
    });

    it("deve disparar exportação para Google Sheets e registrar webhook", () => {
      const res = ecosystemService.triggerGoogleExport("sheets_dre");
      expect(res.success).toBe(true);
      expect(res.type).toBe("sheets_dre");
      expect(res.message).toContain("Google Sheets");
    });

    it("deve responder a uma avaliação do Google Reviews com sucesso", () => {
      const reply = "Obrigado pela sua avaliação! Nossa equipe preza pela máxima qualidade no sashimi de salmão.";
      const res = ecosystemService.respondGoogleReview("rev_03", reply);
      expect(res.success).toBe(true);
      expect(res.review.replied).toBe(true);
      expect(res.review.replyText).toBe(reply);
    });
  });

  describe("Pilar 2: Bancos, Open Finance & TEF Multimarcas", () => {
    it("deve listar contas bancárias e cooperativas MT integradas ao Open Finance", () => {
      const data = ecosystemService.getBancosTefData();
      expect(data.openFinance.instituicoes.length).toBeGreaterThanOrEqual(3);
      const sicredi = data.openFinance.instituicoes.find(i => i.id === "sicredi");
      expect(sicredi).toBeDefined();
      expect(sicredi?.tipo).toBe("COOPERATIVA_MT");
      expect(sicredi?.tarifaPix).toContain("Cooperativa");
    });

    it("deve auditar conciliação D+0 e confirmar 100% de precisão contábil", () => {
      const data = ecosystemService.getBancosTefData();
      expect(data.conciliacao.percentualConciliado).toBe(100);
      expect(data.conciliacao.divergenciaBrl).toBe(0);
      expect(data.conciliacao.vendasPdvBrl).toBeGreaterThan(0);
    });

    it("deve acionar rotina de conciliação bancária sem divergências", () => {
      const res = ecosystemService.triggerConciliacaoBancaria();
      expect(res.success).toBe(true);
      expect(res.percentualConciliado).toBe(100);
      expect(res.divergencias).toBe(0);
    });

    it("deve simular transação TEF com cálculo exato de MDR e código NSU", () => {
      const amount = 189.9;
      const res = ecosystemService.simulateTefTransaction(amount, "Stone Hub", "credito");
      expect(res.success).toBe(true);
      expect(res.nsu).toBeDefined();
      expect(res.authCode).toBeDefined();
      expect(res.feeAmount).toBeCloseTo(amount * 0.0179, 2);
      expect(res.netAmount).toBeCloseTo(amount - res.feeAmount, 2);
    });

    it("deve apurar split de 10% de gorjeta para salão e cozinha", () => {
      const data = ecosystemService.getBancosTefData();
      const split = data.tef.splitGorjeta;
      expect(split.taxaServicoPercentual).toBe(10);
      expect(split.totalArrecadadoTurnoBrl).toBeGreaterThan(0);
      expect(split.rateioSalaoBrl).toBeCloseTo(split.totalArrecadadoTurnoBrl * 0.6, 1);
      expect(split.rateioCozinhaBrl).toBeCloseTo(split.totalArrecadadoTurnoBrl * 0.4, 1);
    });
  });

  describe("Pilar 3: Git DevOps & Zuma MCP Server Oficial", () => {
    it("deve retornar informações do repositório Git e histórico de Cardápio-as-Code", () => {
      const gitData = ecosystemService.getGitDevopsData();
      expect(gitData.repo.name).toBe("rodrigokytto/zuma");
      expect(gitData.repo.status).toBe("SINCRONIZADO_PRD");
      expect(gitData.cardapioAsCode.totalSkus).toBeGreaterThanOrEqual(100);
      expect(gitData.backups.snapshots.length).toBeGreaterThanOrEqual(1);
    });

    it("deve gerar novo snapshot versionado de banco de dados no Git", () => {
      const res = ecosystemService.triggerGitSnapshot("Vitest Test Operator");
      expect(res.success).toBe(true);
      expect(res.snapshot.id).toContain("snap_");
      expect(res.snapshot.sha256).toBeDefined();
      expect(res.snapshot.sizeKb).toBeGreaterThan(1000);
    });

    it("deve expor manifesto de ferramentas padronizadas do protocolo MCP", () => {
      const manifest = ecosystemService.getZumaMcpManifest();
      expect(manifest.serverName).toBe("zuma-restaurant-mcp");
      expect(manifest.toolsCount).toBe(8);
      const toolNames = manifest.tools.map(t => t.name);
      expect(toolNames).toContain("zuma_get_live_kpi");
      expect(toolNames).toContain("zuma_list_tables");
      expect(toolNames).toContain("zuma_get_salmon_stock");
      expect(toolNames).toContain("zuma_query_kds");
      expect(toolNames).toContain("zuma_dispatch_campaign");
      expect(toolNames).toContain("zuma_sefaz_audit");
      expect(toolNames).toContain("zuma_calculate_optimal_route");
      expect(toolNames).toContain("zuma_optimize_delivery_batch");
    });

    it("deve executar tool MCP 'zuma_get_live_kpi' e retornar formato padrão MCP", () => {
      const res = ecosystemService.executeZumaMcpTool("zuma_get_live_kpi", {}, "Manus Test Agent");
      expect(res.isError).toBe(false);
      expect(res.content).toBeDefined();
      expect(res.content[0].type).toBe("text");
      const parsed = JSON.parse(res.content[0].text);
      expect(parsed.faturamentoTotal).toBeGreaterThan(0);
      expect(parsed.cmvRealPct).toBe(28.5);
    });

    it("deve executar tool MCP 'zuma_list_tables' e listar as 27 mesas físicas", () => {
      const res = ecosystemService.executeZumaMcpTool("zuma_list_tables", { setor: "todos" });
      expect(res.isError).toBe(false);
      const parsed = JSON.parse(res.content[0].text);
      expect(parsed.totalMesasFisicas).toBe(27);
      expect(parsed.setores.balcaoOmakase).toBeDefined();
      expect(parsed.setores.tatamesVip).toBeDefined();
    });

    it("deve executar tool MCP 'zuma_get_salmon_stock' com status da câmara fria", () => {
      const res = ecosystemService.executeZumaMcpTool("zuma_get_salmon_stock");
      expect(res.isError).toBe(false);
      const parsed = JSON.parse(res.content[0].text);
      expect(parsed.camaraFriaTempCelsius).toBe(-2.3);
      expect(parsed.statusCamara).toContain("ANVISA");
    });

    it("deve executar tool MCP 'zuma_calculate_optimal_route' para Tangará da Serra com radares e deep links", () => {
      const res = ecosystemService.executeZumaMcpTool("zuma_calculate_optimal_route", {
        origemLat: -14.622915,
        origemLng: -57.493922,
        destinoLat: -14.6360,
        destinoLng: -57.4985,
        perfil: "mais_rapida"
      });
      expect(res.isError).toBe(false);
      const parsed = JSON.parse(res.content[0].text);
      expect(parsed.cidade).toContain("Tangará da Serra");
      expect(parsed.distanciaKm).toBeGreaterThan(0);
      expect(parsed.tempoEstimadoMin).toBeGreaterThan(0);
      expect(parsed.deepLinks.waze).toContain("waze.com");
      expect(parsed.deepLinks.googleMaps).toContain("google.com/maps");
    });

    it("deve executar tool MCP 'zuma_optimize_delivery_batch' e calcular sequência ótima TSP", () => {
      const res = ecosystemService.executeZumaMcpTool("zuma_optimize_delivery_batch", {
        latAtual: -14.622915,
        lngAtual: -57.493922,
        pedidos: [
          { id: "1", pedidoId: "P1", clienteNome: "Cli 1", endereco: "Taruma", bairro: "Tarumã", lat: -14.6415, lng: -57.5020, taxaEntrega: 8 },
          { id: "2", pedidoId: "P2", clienteNome: "Cli 2", endereco: "Centro", bairro: "Centro", lat: -14.6235, lng: -57.4930, taxaEntrega: 6 }
        ]
      });
      expect(res.isError).toBe(false);
      const parsed = JSON.parse(res.content[0].text);
      expect(parsed.resultadoTsp.ordemOtimizada.length).toBe(2);
      expect(parsed.resultadoTsp.distanciaTotalKm).toBeGreaterThan(0);
    });
  });

  describe("Pilar 4: Central de Tomada de Decisão (Decision Intelligence Hub)", () => {
    it("deve fornecer insights cruzados de clima, safra agro MT, TEF e KDS", () => {
      const insights = ecosystemService.getDecisionIntelligenceInsights();
      expect(insights.length).toBeGreaterThanOrEqual(4);
      const chuva = insights.find(i => i.id === "act_chuva");
      expect(chuva).toBeDefined();
      expect(chuva?.cruzamentoFontes).toContain("Dr. Clima / INMET");
      expect(chuva?.prioridade).toBe("ALTA");

      const safra = insights.find(i => i.id === "act_safra");
      expect(safra).toBeDefined();
      expect(safra?.cruzamentoFontes).toContain("Sicredi MT Pix");
      expect(safra?.prioridade).toBe("CRITICA");
    });

    it("deve executar uma ação estratégica recomendada pela inteligência", () => {
      const res = ecosystemService.executeDecisionAction("act_chuva", "Rodrigo (Admin)");
      expect(res.success).toBe(true);
      expect(res.actionId).toBe("act_chuva");
      const updated = ecosystemService.getDecisionIntelligenceInsights();
      const chuva = updated.find(i => i.id === "act_chuva");
      expect(chuva?.executada).toBe(true);
    });
  });
});
