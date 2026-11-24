import { Router, Request, Response } from "express";
import { Cadastro360Store } from "./cadastro360Store";
import { empresaAtivaDaRequisicao, origemNoEscopo } from "./escopoEmpresa";

export function registerCadastro360Routes(app: any) {
  const router = Router();
  const store = Cadastro360Store.getInstance();

  // 1. Métricas Executivas Gerais do Cadastro 360
  router.get("/metricas", (_req: Request, res: Response) => {
    try {
      const metricas = store.obterMetricasGerais();
      res.json({ success: true, data: metricas });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Listagem de Clientes / Empresas 360 com Filtros
  router.get("/clientes", (req: Request, res: Response) => {
    try {
      const { empresaOrigemId, statusCadastral, busca } = req.query;
      const clientes = store.listarClientes({
        empresaOrigemId: empresaOrigemId ? String(empresaOrigemId) : undefined,
        statusCadastral: statusCadastral ? String(statusCadastral) : undefined,
        busca: busca ? String(busca) : undefined,
      });
      res.json({ success: true, count: clientes.length, data: clientes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Obter Detalhes 360 de um Cliente
  router.get("/clientes/:id", (req: Request, res: Response) => {
    try {
      const cliente = store.obterClientePorId(req.params.id);
      if (!cliente) {
        return res.status(404).json({ success: false, error: "Cliente não encontrado" });
      }
      res.json({ success: true, data: cliente });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Criar Novo Pré-Cadastro / Cliente 360
  router.post("/clientes", (req: Request, res: Response) => {
    try {
      const novo = store.criarCliente(req.body);
      res.status(201).json({
        success: true,
        message: "Pré-cadastro 360 criado com sucesso com checklist de documentos e minutas regulatórias.",
        data: novo,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Atualizar Dados 360 do Cliente
  router.put("/clientes/:id", (req: Request, res: Response) => {
    try {
      const atualizado = store.atualizarCliente(req.params.id, req.body);
      res.json({ success: true, message: "Dados atualizados com sucesso", data: atualizado });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Executar Varredura de Compliance PLD-FT
  router.post("/clientes/:id/compliance-scan", (req: Request, res: Response) => {
    try {
      const resultado = store.executarVarreduraCompliance(req.params.id);
      res.json({
        success: true,
        message: "Varredura de Compliance PLD-FT (OFAC, CSNU, CEAF, CEPIM, CGF e SCR Bacen) executada com sucesso.",
        data: resultado,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Listar Documentos do Vault do Cliente
  router.get("/clientes/:id/documentos", (req: Request, res: Response) => {
    try {
      const docs = store.listarDocumentosPorCliente(req.params.id);
      res.json({ success: true, count: docs.length, data: docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Upload / Adicionar Documento ao Vault
  router.post("/clientes/:id/documentos", (req: Request, res: Response) => {
    try {
      const { tipoDocumento, arquivoNome, formato, tamanhoBytes, validadeData } = req.body;
      if (!tipoDocumento || !arquivoNome) {
        return res.status(400).json({
          success: false,
          error: "tipoDocumento e arquivoNome são obrigatórios",
        });
      }
      const doc = store.uploadDocumento(req.params.id, tipoDocumento, {
        arquivoNome,
        formato,
        tamanhoBytes,
        validadeData,
      });
      res.status(201).json({
        success: true,
        message: "Documento enviado e hash SHA-256 gerado com sucesso.",
        data: doc,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 9. Alterar Status de Validação do Documento (Aprovar / Rejeitar)
  router.patch("/clientes/:id/documentos/:docId/status", (req: Request, res: Response) => {
    try {
      const { status, justificativa, operador } = req.body;
      if (!status || !["aprovado", "rejeitado", "em_analise"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status inválido. Deve ser 'aprovado', 'rejeitado' ou 'em_analise'",
        });
      }
      const doc = store.alterarStatusDocumento(
        req.params.docId,
        status,
        operador || "Mesa de Operações BancoFe",
        justificativa
      );
      res.json({
        success: true,
        message: `Documento ${status === "aprovado" ? "aprovado" : status === "rejeitado" ? "rejeitado com pendência" : "colocado em análise"} com sucesso.`,
        data: doc,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 10. Listar Termos Digitais do Cliente
  router.get("/clientes/:id/termos", (req: Request, res: Response) => {
    try {
      const termos = store.listarTermosPorCliente(req.params.id);
      res.json({ success: true, count: termos.length, data: termos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10.1 Listar Todos os Termos da Holding (Central de Termos)
  router.get("/termos", (req: Request, res: Response) => {
    try {
      const empresaAtiva = empresaAtivaDaRequisicao(req);
      const termos = store
        .listarTodosTermos()
        .filter((t: any) => origemNoEscopo(empresaAtiva, store.obterClientePorId(t.clienteId)?.empresaOrigemId || t.empresaOrigemId));
      res.json({ success: true, count: termos.length, data: termos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Obter Minuta do Termo
  router.get("/clientes/:id/termos/:termoId/minuta", (req: Request, res: Response) => {
    try {
      const termo = store.obterTermoPorId(req.params.termoId);
      if (!termo) {
        return res.status(404).json({ success: false, error: "Termo não encontrado" });
      }
      res.json({ success: true, data: termo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. Assinar Termo Digitalmente
  router.post("/clientes/:id/termos/:termoId/assinar", (req: Request, res: Response) => {
    try {
      const { nome, cpf, ip } = req.body;
      if (!nome || !cpf) {
        return res.status(400).json({
          success: false,
          error: "nome e cpf do signatário são obrigatórios",
        });
      }
      const clientIp = ip || req.ip || req.headers["x-forwarded-for"] || "177.136.240.12";
      const termo = store.assinarTermo(req.params.termoId, {
        nome,
        cpf,
        ip: String(clientIp),
      });
      res.json({
        success: true,
        message: "Termo assinado digitalmente com hash SHA-256 e carimbo de tempo ICP-Brasil.",
        data: termo,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Registrar sub-roteador sob /api/bancofe/cadastro360
  app.use("/api/bancofe/cadastro360", router);
  // Alias conveniente sob /api/cadastro360
  app.use("/api/cadastro360", router);
}
