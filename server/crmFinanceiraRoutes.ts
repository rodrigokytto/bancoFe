import { type Express, type Request, type Response } from "express";
import { crmFinanceiraStore } from "./crmFinanceiraStore";

export function registerCrmFinanceiraRoutes(app: Express) {
  // 1. Visão Geral da Gestão da Mesa e Métricas
  app.get("/api/admin/operacoes-financeiras/crm/gestao", (_req: Request, res: Response) => {
    try {
      const metricas = crmFinanceiraStore.obterMetricasGestao();
      res.json(metricas);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter métricas de gestão" });
    }
  });

  // 2. Listagem de Oportunidades do Funil (com filtros)
  app.get("/api/admin/operacoes-financeiras/crm/oportunidades", (req: Request, res: Response) => {
    try {
      const { estagio, empresaOrigemId, termo } = req.query as Record<string, string>;
      const oportunidades = crmFinanceiraStore.listarOportunidades({
        estagio,
        empresaOrigemId,
        termo,
      });
      res.json({
        total: oportunidades.length,
        oportunidades,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao listar oportunidades" });
    }
  });

  // 3. Obter Oportunidade Específica
  app.get("/api/admin/operacoes-financeiras/crm/oportunidades/:id", (req: Request, res: Response) => {
    try {
      const op = crmFinanceiraStore.obterPorId(req.params.id);
      if (!op) {
        return res.status(404).json({ erro: "Oportunidade não encontrada" });
      }
      res.json(op);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter oportunidade" });
    }
  });

  // 4. Criar Nova Oportunidade no Funil
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades", (req: Request, res: Response) => {
    try {
      const nova = crmFinanceiraStore.criarOportunidade(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: "Oportunidade criada com sucesso no pipeline",
        oportunidade: nova,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao criar oportunidade" });
    }
  });

  // 5. Atualizar Oportunidade (Estágio, Valor, Taxas, Observações)
  app.patch("/api/admin/operacoes-financeiras/crm/oportunidades/:id", (req: Request, res: Response) => {
    try {
      const autor = req.body?.autor || "Mesa de Crédito BancoFe";
      const atualizada = crmFinanceiraStore.atualizarOportunidade(req.params.id, req.body, autor);
      if (!atualizada) {
        return res.status(404).json({ erro: "Oportunidade não encontrada para atualização" });
      }
      res.json({
        sucesso: true,
        mensagem: "Oportunidade atualizada com sucesso",
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao atualizar oportunidade" });
    }
  });

  // 6. Excluir Oportunidade
  app.delete("/api/admin/operacoes-financeiras/crm/oportunidades/:id", (req: Request, res: Response) => {
    try {
      const sucesso = crmFinanceiraStore.excluirOportunidade(req.params.id);
      if (!sucesso) {
        return res.status(404).json({ erro: "Oportunidade não encontrada" });
      }
      res.json({ sucesso: true, mensagem: "Oportunidade excluída com sucesso" });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao excluir oportunidade" });
    }
  });

  // 7. Simulador de Taxas, IOF e Amortização (SAC / PRICE)
  app.post("/api/admin/operacoes-financeiras/crm/simular", (req: Request, res: Response) => {
    try {
      const resultado = crmFinanceiraStore.simularOperacao(req.body);
      res.json(resultado);
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao simular operação financeira" });
    }
  });

  // 8. Central de Notificações em Tempo Real do /admin
  app.get("/api/admin/notificacoes", (_req: Request, res: Response) => {
    const metricas = crmFinanceiraStore.obterMetricasGestao();
    res.json({
      totalNaoLidas: 3,
      notificacoes: [
        {
          id: "notif-001",
          tipo: "aprovacao_pendente",
          titulo: "Comitê de Crédito: Parecer Pendente",
          mensagem: "Operação OP-2026-004 (R$ 1.750.000) aguarda aprovação de alçada com parecer favorável.",
          tempoAtras: "Há 12 min",
          severidade: "alta",
          link: "/admin/crm-financeira?estagio=comite_aprovacao",
        },
        {
          id: "notif-002",
          tipo: "formalizacao",
          titulo: "CCB Pronta para Assinatura ICP-Brasil",
          mensagem: "Operação OP-2026-001 (R$ 4.500.000) - Minuta de CCB gerada e enviada para assinatura digital.",
          tempoAtras: "Há 34 min",
          severidade: "info",
          link: "/admin/crm-financeira?estagio=formalizacao_ccb",
        },
        {
          id: "notif-003",
          tipo: "compliance",
          titulo: "Checkup SICAR & SEMA-MT Concluído",
          mensagem: "Consulta de compliance ambiental da OP-2026-002 (Agro MT) retornou 100% regular.",
          tempoAtras: "Há 1 hora",
          severidade: "sucesso",
          link: "/admin/crm-financeira?estagio=mesa_credito",
        },
      ],
      metricasGerais: {
        totalPipeline: metricas.volumeTotalPipeline,
        totalOportunidades: metricas.totalOportunidadesAtivas,
      },
    });
  });
}
