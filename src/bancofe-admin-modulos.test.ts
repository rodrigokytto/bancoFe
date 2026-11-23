import { describe, expect, it } from "vitest";
import { GestorModulosNegocioBancoFe } from "./admin/gestor-modulos-negocio.ts";
import { criarServidorConsulta360 } from "./servidor.ts";

describe("Gestão Administrativa de Módulos por Negócio (/admin)", () => {
  it("deve inicializar com as linhas de negócio corporativas e módulos ativos", () => {
    const gestor = new GestorModulosNegocioBancoFe();
    const negocios = gestor.listarNegocios();
    expect(negocios.length).toBeGreaterThanOrEqual(5);

    const ids = negocios.map((n) => n.id);
    expect(ids).toContain("neg-bancofe");
    expect(ids).toContain("neg-operacoes-crm");
    expect(ids).toContain("neg-cadastro360-vault");
    expect(ids).toContain("neg-casanova");
    expect(ids).toContain("neg-agro");
    expect(ids).toContain("neg-ultra");
    expect(ids).toContain("neg-dino");

    const metricas = gestor.obterMetricasAdmin();
    expect(metricas.totalNegocios).toBeGreaterThanOrEqual(5);
    expect(metricas.totalModulos).toBeGreaterThanOrEqual(10);
    expect(metricas.modulosAtivos).toBeGreaterThanOrEqual(10);
  });

  it("deve permitir adicionar novo módulo dinamicamente a um negócio", () => {
    const gestor = new GestorModulosNegocioBancoFe();
    const novo = gestor.adicionarModulo("neg-bancofe", {
      nome: "Esteira de Consórcio Imobiliário",
      codigo: "CONSORCIO_IMOVEL_V1",
      descricao: "Gestão e lances de cotas contempladas para aquisição imobiliária",
      categoria: "credito",
      ativo: true,
      rotaUrl: "/plataforma/consorcios",
      icone: "fa-handshake",
      permissoesMinimas: "GERENTE",
    });

    expect(novo.id).toMatch(/^mod-/);
    expect(novo.codigo).toBe("CONSORCIO_IMOVEL_V1");

    const negocio = gestor.obterNegocio("neg-bancofe");
    expect(negocio?.modulos.some((m) => m.codigo === "CONSORCIO_IMOVEL_V1")).toBe(true);
  });

  it("deve atualizar e alternar status de ativação do módulo", () => {
    const gestor = new GestorModulosNegocioBancoFe();
    const modOriginal = gestor.obterNegocio("neg-bancofe")?.modulos[0]!;

    // Alternar status
    const modDesativado = gestor.alternarStatusModulo("neg-bancofe", modOriginal.id);
    expect(modDesativado?.ativo).toBe(false);

    // Reativar
    const modReativado = gestor.alternarStatusModulo("neg-bancofe", modOriginal.id);
    expect(modReativado?.ativo).toBe(true);

    // Atualizar dados
    const modAtualizado = gestor.atualizarModulo("neg-bancofe", modOriginal.id, {
      descricao: "Descrição operacional atualizada pelo administrador",
    });
    expect(modAtualizado?.descricao).toBe("Descrição operacional atualizada pelo administrador");
  });

  it("deve permitir excluir módulo de um negócio", () => {
    const gestor = new GestorModulosNegocioBancoFe();
    const modTemp = gestor.adicionarModulo("neg-dino", {
      nome: "Módulo Temporário de Teste",
      codigo: "MOD_TEMP_TESTE",
      descricao: "Criado para validar exclusão",
      categoria: "operacao",
      ativo: true,
      rotaUrl: "/temp",
      icone: "fa-trash",
      permissoesMinimas: "USUARIO",
    });
    const neg = gestor.obterNegocio("neg-dino")!;
    const totalAntes = neg.modulos.length;
    const excluido = gestor.excluirModulo("neg-dino", modTemp.id);
    expect(excluido).toBe(true);

    const negDepois = gestor.obterNegocio("neg-dino")!;
    expect(negDepois.modulos.length).toBe(totalAntes - 1);
    expect(negDepois.modulos.some((m) => m.id === modTemp.id)).toBe(false);
  });

  it("deve responder corretamente aos endpoints HTTP da API de administração e tela /admin", async () => {
    const { app } = criarServidorConsulta360(3363);

    // 1. Listagem de Negócios e Métricas
    const respNegocios = await app.inject({
      method: "GET",
      url: "/api/v1/admin/negocios",
    });
    expect(respNegocios.statusCode).toBe(200);
    const corpo = JSON.parse(respNegocios.body);
    expect(corpo.negocios.length).toBeGreaterThanOrEqual(5);
    expect(corpo.metricas.totalModulos).toBeGreaterThanOrEqual(10);

    // 2. Adicionar Módulo via API
    const respAdd = await app.inject({
      method: "POST",
      url: "/api/v1/admin/modulos/neg-agro",
      payload: {
        nome: "Barter de Fertilizantes & Insumos",
        codigo: "BARTER_FERTILIZANTES",
        descricao: "Operação estruturada de troca de insumos por entrega futura de soja",
        categoria: "credito",
        ativo: true,
        rotaUrl: "/plataforma/barter",
        icone: "fa-seedling",
        permissoesMinimas: "GERENTE",
      },
    });
    expect(respAdd.statusCode).toBe(201);
    const corpoAdd = JSON.parse(respAdd.body);
    expect(corpoAdd.sucesso).toBe(true);
    expect(corpoAdd.modulo.codigo).toBe("BARTER_FERTILIZANTES");

    // 3. Alternar Status via API
    const moduloId = corpoAdd.modulo.id;
    const respToggle = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/modulos/neg-agro/${moduloId}/status`,
    });
    expect(respToggle.statusCode).toBe(200);
    const corpoToggle = JSON.parse(respToggle.body);
    expect(corpoToggle.modulo.ativo).toBe(false);

    // 4. Excluir Módulo via API
    const respDel = await app.inject({
      method: "DELETE",
      url: `/api/v1/admin/modulos/neg-agro/${moduloId}`,
    });
    expect(respDel.statusCode).toBe(200);

    // 5. Tela Web /admin
    const respAdminHtml = await app.inject({
      method: "GET",
      url: "/admin",
    });
    expect(respAdminHtml.statusCode).toBe(200);
    expect(respAdminHtml.headers["content-type"]).toContain("text/html");
    expect(respAdminHtml.body).toContain("Gestão de Módulos por Negócio");
  });
});
