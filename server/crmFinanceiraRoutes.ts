import { type Express, type Request, type Response } from "express";
import { crmFinanceiraStore } from "./crmFinanceiraStore";
import { empresaAtivaDaRequisicao, filtrarPorEscopo, precadastroNoEscopo, ehVisaoConsolidada } from "./escopoEmpresa";

/** Oportunidades visíveis para a empresa ativa (header x-empresa-id). */
function oportunidadesDoEscopo(req: Request) {
  const empresa = empresaAtivaDaRequisicao(req);
  return filtrarPorEscopo(empresa, crmFinanceiraStore.listarOportunidades(), (o: any) => o.empresaOrigemId);
}

export function registerCrmFinanceiraRoutes(app: Express) {
  // 1. Visão Geral da Gestão da Mesa e Métricas Consolidadas (Painel)
  app.get("/api/admin/operacoes-financeiras/crm/gestao", (req: Request, res: Response) => {
    try {
      const empresa = empresaAtivaDaRequisicao(req);
      const metricas = ehVisaoConsolidada(empresa)
        ? crmFinanceiraStore.obterMetricasGestao()
        : crmFinanceiraStore.obterMetricasGestao(oportunidadesDoEscopo(req));
      res.json({ ...metricas, escopoEmpresa: empresa || "holding_kytto", visaoConsolidada: ehVisaoConsolidada(empresa) });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter métricas de gestão" });
    }
  });

  // 2. Catálogo Oficial de Produtos Financeiros BancoFé
  app.get("/api/admin/operacoes-financeiras/crm/produtos", (_req: Request, res: Response) => {
    try {
      const produtos = crmFinanceiraStore.obterProdutos();
      res.json(produtos);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter catálogo de produtos" });
    }
  });

  // 3. Listagem de Oportunidades do Funil (Suporte dual: array direto se todas=1 ou objeto {total, oportunidades})
  app.get("/api/admin/operacoes-financeiras/crm/oportunidades", (req: Request, res: Response) => {
    try {
      const { estagio, etapa, empresaOrigemId, termo, responsavel, produto, todas } = req.query as Record<string, string>;
      const empresaAtiva = empresaAtivaDaRequisicao(req);
      const oportunidades = filtrarPorEscopo(
        empresaAtiva,
        crmFinanceiraStore.listarOportunidades({
          estagio,
          etapa,
          empresaOrigemId,
          termo,
          responsavel,
          produto,
        }),
        (o: any) => o.empresaOrigemId,
      );

      // Se solicitado pelo React bundle com ?todas=1, retorna array direto
      if (todas === "1") {
        return res.json(oportunidades);
      }

      // Resposta padrão compatível com frontend clássico e testes
      res.json({
        total: oportunidades.length,
        oportunidades,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao listar oportunidades" });
    }
  });

  // 4. Obter Oportunidade Específica
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

  // 5. Criar Nova Oportunidade no Funil
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades", (req: Request, res: Response) => {
    try {
      const nova = crmFinanceiraStore.criarOportunidade(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: "Oportunidade protocolada com sucesso",
        oportunidade: nova,
        ...nova,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao criar oportunidade" });
    }
  });

  // 6. Atualizar Parâmetros da Oportunidade (PATCH)
  app.patch("/api/admin/operacoes-financeiras/crm/oportunidades/:id", (req: Request, res: Response) => {
    try {
      const autor = req.body?.autor || "Mesa de Operações BancoFe";
      const atualizada = crmFinanceiraStore.atualizarOportunidade(req.params.id, req.body, autor);
      if (!atualizada) {
        return res.status(404).json({ erro: "Oportunidade não encontrada para atualização" });
      }
      res.json({
        sucesso: true,
        mensagem: "Oportunidade atualizada com sucesso",
        oportunidade: atualizada,
        ...atualizada,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao atualizar oportunidade" });
    }
  });

  // 7. Avançar / Alterar Etapa do Funil (POST /etapa)
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades/:id/etapa", (req: Request, res: Response) => {
    try {
      const { para, motivoPerda } = req.body || {};
      if (!para) {
        return res.status(400).json({ erro: "Parâmetro para (nova etapa) é obrigatório" });
      }
      const atualizada = crmFinanceiraStore.atualizarOportunidade(
        req.params.id,
        {
          etapa: para,
          observacoes: motivoPerda ? `Perda registrada: ${motivoPerda}` : undefined,
        },
        "Avanço de Funil CRM"
      );
      if (!atualizada) {
        return res.status(404).json({ erro: "Oportunidade não encontrada" });
      }
      res.json({
        sucesso: true,
        mensagem: `Etapa atualizada para ${para}`,
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao alterar etapa" });
    }
  });

  // 8. Aprovação no Comitê de Crédito (POST /comite)
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades/:id/comite", (req: Request, res: Response) => {
    try {
      const atualizada = crmFinanceiraStore.atualizarOportunidade(
        req.params.id,
        {
          etapa: "comite",
          estagio: "comite_aprovacao",
          probabilidadeConversao: 95,
          observacoes: "Aprovada por unanimidade pelo Comitê de Crédito e Riscos BancoFé.",
        },
        "Comitê de Crédito BancoFe"
      );
      res.json({
        sucesso: true,
        mensagem: "Aprovada no comitê de crédito com sucesso.",
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao aprovar no comitê" });
    }
  });

  // 9. Registrar Interações e Próximos Passos (POST /interacoes)
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades/:id/interacoes", (req: Request, res: Response) => {
    try {
      const { tipo, nota, proximoPasso, proximoEm, autor } = req.body || {};
      const op = crmFinanceiraStore.obterPorId(req.params.id);
      if (!op) return res.status(404).json({ erro: "Oportunidade não encontrada" });

      if (!op.interacoes) op.interacoes = [];
      op.interacoes.push({
        data: new Date().toISOString(),
        tipo: tipo || "reuniao",
        autor: autor || "Mesa de Relacionamento",
        nota: nota || "Interação realizada com a contraparte.",
        proximoPasso,
        proximoEm,
      });

      const atualizada = crmFinanceiraStore.atualizarOportunidade(req.params.id, {
        proximoPasso: proximoPasso || op.proximoPasso,
        proximoEm: proximoEm || op.proximoEm,
      });

      res.json({
        sucesso: true,
        mensagem: "Interação e próximo passo registrados com sucesso.",
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao registrar interação" });
    }
  });

  // 10. Converter Oportunidade em Contrato / Investimento (POST /converter)
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades/:id/converter", (req: Request, res: Response) => {
    try {
      const { tipo } = req.body || {};
      const atualizada = crmFinanceiraStore.atualizarOportunidade(
        req.params.id,
        {
          etapa: "contratado",
          estagio: "liquidado",
          probabilidadeConversao: 100,
          observacoes: tipo === "participacao"
            ? "Convertida em investimento e participação de capital."
            : "Convertida em contrato e cédula formalizada.",
        },
        "Formalização & Contratação"
      );
      res.json({
        sucesso: true,
        mensagem: "Contrato gerado com sucesso.",
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao converter oportunidade" });
    }
  });

  // 11. Reabrir Oportunidade Perdida (POST /reabrir)
  app.post("/api/admin/operacoes-financeiras/crm/oportunidades/:id/reabrir", (req: Request, res: Response) => {
    try {
      const atualizada = crmFinanceiraStore.atualizarOportunidade(
        req.params.id,
        {
          etapa: "qualificacao",
          estagio: "qualificacao",
          observacoes: "Oportunidade reaberta para renegociação de prazos e taxas.",
        },
        "Mesa BancoFe"
      );
      res.json({
        sucesso: true,
        mensagem: "Oportunidade reaberta com sucesso.",
        oportunidade: atualizada,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao reabrir oportunidade" });
    }
  });

  // 12. Excluir Oportunidade do Funil
  app.delete("/api/admin/operacoes-financeiras/crm/oportunidades/:id", (req: Request, res: Response) => {
    try {
      const removida = crmFinanceiraStore.excluirOportunidade(req.params.id);
      if (!removida) {
        return res.status(404).json({ erro: "Oportunidade não encontrada para exclusão" });
      }
      res.json({ sucesso: true, mensagem: "Oportunidade excluída com sucesso" });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao excluir oportunidade" });
    }
  });

  // ============================================================================
  // ESTEIRA DE PRÉ-CADASTROS (CASA NOVA IMÓVEIS & BANCOFÉ)
  // ============================================================================

  // 13. Listagem Filtrada e Paginada de Pré-Cadastros
  app.get("/api/admin/operacoes-financeiras/crm/precadastros", (req: Request, res: Response) => {
    try {
      const { busca, situacao, consentimento, origem, pagina, tamanhoPagina } = req.query as Record<string, string>;
      const resultado = crmFinanceiraStore.listarPreCadastros({
        busca,
        situacao,
        consentimento,
        origem,
        filtroEscopo: (o: string) => precadastroNoEscopo(empresaAtivaDaRequisicao(req), o),
        pagina: pagina ? Number(pagina) : 1,
        tamanhoPagina: tamanhoPagina ? Number(tamanhoPagina) : 10,
      });
      res.json(resultado);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao listar pré-cadastros" });
    }
  });

  // 14. Obter Detalhe Completo do Pré-Cadastro (Modal Dossier 360)
  app.get("/api/admin/operacoes-financeiras/crm/precadastros/:id", (req: Request, res: Response) => {
    try {
      const pre = crmFinanceiraStore.obterPreCadastroPorId(req.params.id);
      if (!pre) {
        return res.status(404).json({ erro: "Pré-cadastro não encontrado" });
      }
      res.json(pre);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter detalhes do pré-cadastro" });
    }
  });

  // 15. Inserir Pré-Cadastro Manualmente
  app.post("/api/admin/operacoes-financeiras/crm/precadastros", (req: Request, res: Response) => {
    try {
      const novo = crmFinanceiraStore.criarPreCadastro(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: "Pré-cadastro registrado na esteira BancoFé com sucesso.",
        precadastro: novo,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao criar pré-cadastro" });
    }
  });

  // 16. Executar Comando no Pré-Cadastro (qualificar, descartar, oposicao)
  app.post("/api/admin/operacoes-financeiras/crm/precadastros/:id/comando", (req: Request, res: Response) => {
    try {
      const ok = crmFinanceiraStore.executarComandoPreCadastro(req.params.id, req.body || {});
      if (!ok) return res.status(404).json({ erro: "Pré-cadastro não encontrado" });
      res.json({
        sucesso: true,
        mensagem: "Comando executado com sucesso.",
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao executar comando" });
    }
  });

  // 17. Converter Pré-Cadastro em Oportunidade no Funil
  app.post("/api/admin/operacoes-financeiras/crm/precadastros/:id/converter", (req: Request, res: Response) => {
    try {
      const { produto, valorCentavos, responsavel } = req.body || {};
      const op = crmFinanceiraStore.converterPreCadastro(req.params.id, {
        produto: produto || "CAPITAL_GIRO_PJ",
        valorCentavos: valorCentavos || 35000000,
        responsavel,
      });
      if (!op) return res.status(404).json({ erro: "Pré-cadastro não encontrado para conversão" });

      res.json({
        sucesso: true,
        mensagem: "Oportunidade criada no funil com sucesso.",
        oportunidade: op,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao converter pré-cadastro" });
    }
  });

  // 18. Processar Carga Oficial da Casa Nova Imóveis
  app.post("/api/admin/operacoes-financeiras/crm/precadastros/carga/processar", (_req: Request, res: Response) => {
    try {
      const resultado = crmFinanceiraStore.processarCargaCasaNova();
      res.json(resultado);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao processar carga da Casa Nova" });
    }
  });

  // ============================================================================
  // CARTEIRA DE CRÉDITO ATIVA
  // ============================================================================

  // 19. Listagem da Carteira Ativa
  app.get("/api/admin/operacoes-financeiras/crm/carteira", (req: Request, res: Response) => {
    try {
      const { busca, status } = req.query as Record<string, string>;
      const dados = crmFinanceiraStore.listarCarteira({ busca, status, listaEscopo: oportunidadesDoEscopo(req) });
      res.json(dados);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao listar carteira" });
    }
  });

  // 20. Detalhe de Cliente na Carteira
  app.get("/api/admin/operacoes-financeiras/crm/carteira/:id", (req: Request, res: Response) => {
    try {
      const detalhe = crmFinanceiraStore.obterCarteiraDetalhe(req.params.id);
      if (!detalhe) return res.status(404).json({ erro: "Cliente não encontrado na carteira" });
      res.json(detalhe);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter detalhes da carteira" });
    }
  });

  // ============================================================================
  // TAREFAS & RÉGUA DE RELACIONAMENTO
  // ============================================================================

  // 21. Listagem de Tarefas
  app.get("/api/admin/operacoes-financeiras/crm/tarefas", (req: Request, res: Response) => {
    try {
      const { situacao, responsavel } = req.query as Record<string, string>;
      const dados = crmFinanceiraStore.listarTarefas({ situacao, responsavel });
      res.json(dados);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao listar tarefas" });
    }
  });

  // 22. Criar Nova Tarefa
  app.post("/api/admin/operacoes-financeiras/crm/tarefas", (req: Request, res: Response) => {
    try {
      const nova = crmFinanceiraStore.criarTarefa(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: "Tarefa criada com sucesso.",
        tarefa: nova,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao criar tarefa" });
    }
  });

  // 23. Concluir Tarefa
  app.post("/api/admin/operacoes-financeiras/crm/tarefas/:id/concluir", (req: Request, res: Response) => {
    try {
      const ok = crmFinanceiraStore.concluirTarefa(req.params.id);
      if (!ok) return res.status(404).json({ erro: "Tarefa não encontrada" });
      res.json({ sucesso: true, mensagem: "Tarefa concluída com sucesso." });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao concluir tarefa" });
    }
  });

  // 24. Adiar Tarefa
  app.post("/api/admin/operacoes-financeiras/crm/tarefas/:id/adiar", (req: Request, res: Response) => {
    try {
      const dias = req.body?.dias ? Number(req.body.dias) : 2;
      const ok = crmFinanceiraStore.adiarTarefa(req.params.id, dias);
      if (!ok) return res.status(404).json({ erro: "Tarefa não encontrada" });
      res.json({ sucesso: true, mensagem: "Tarefa adiada com sucesso." });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao adiar tarefa" });
    }
  });

  // 25. Processar Régua Automática
  app.post("/api/admin/operacoes-financeiras/crm/regua/processar", (_req: Request, res: Response) => {
    try {
      const resultado = crmFinanceiraStore.processarRegua();
      res.json(resultado);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao processar régua" });
    }
  });

  // ============================================================================
  // METAS MENSAIS
  // ============================================================================

  // 26. Obter Metas do Mês
  app.get("/api/admin/operacoes-financeiras/crm/metas", (req: Request, res: Response) => {
    try {
      const mes = req.query.mes ? String(req.query.mes) : undefined;
      const dados = crmFinanceiraStore.obterMetas(mes);
      res.json(dados);
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao obter metas" });
    }
  });

  // 27. Salvar Meta
  app.post("/api/admin/operacoes-financeiras/crm/metas", (req: Request, res: Response) => {
    try {
      const meta = crmFinanceiraStore.salvarMeta(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: "Meta salva com sucesso.",
        meta,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao salvar meta" });
    }
  });

  // 28. Excluir Meta
  app.delete("/api/admin/operacoes-financeiras/crm/metas/:id", (req: Request, res: Response) => {
    try {
      const ok = crmFinanceiraStore.excluirMeta(req.params.id);
      if (!ok) return res.status(404).json({ erro: "Meta não encontrada" });
      res.json({ sucesso: true, mensagem: "Meta excluída com sucesso." });
    } catch (e: any) {
      res.status(500).json({ erro: e?.message || "Erro ao excluir meta" });
    }
  });

  // ============================================================================
  // SIMULADOR FINANCEIRO SAC / PRICE
  // ============================================================================

  // 29. Simulação de Amortização
  app.post("/api/admin/operacoes-financeiras/crm/simular", (req: Request, res: Response) => {
    try {
      const resultado = crmFinanceiraStore.simularOperacao(req.body);
      res.json(resultado);
    } catch (e: any) {
      res.status(400).json({ erro: e?.message || "Erro ao realizar simulação" });
    }
  });
}
