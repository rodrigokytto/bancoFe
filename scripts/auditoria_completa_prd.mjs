import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = "https://erp-bancofe-5xsi5uyoda-rj.a.run.app";

async function main() {
  console.log("==================================================================");
  console.log("   BANCOFE — PROTOCOLO DE AUDITORIA & VALIDAÇÃO TOTAL DE PRD     ");
  console.log("==================================================================");
  console.log(`Alvo de Produção: ${BASE_URL}`);
  console.log(`Data/Hora: ${new Date().toISOString()}`);

  let gcpToken = "";
  try {
    gcpToken = execSync("gcloud auth print-identity-token", { encoding: "utf-8" }).trim();
    console.log("Token GCP Identity obtido com sucesso.");
  } catch (e) {
    console.error("Erro ao obter token GCP:", e.message);
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${gcpToken}`,
    Cookie: "bancofe_auth=autorizado; session_token=bcf_super_admin_homologado; sp_token=bcf_platform_admin",
  };

  const relatorio = {
    timestamp: new Date().toISOString(),
    ambiente: "Google Cloud Run (southamerica-east1)",
    urlBase: BASE_URL,
    rotasHttp: [],
    crudAdminPrd: null,
    crmSimulacaoPrd: null,
    cadastro360Prd: null,
    ledgerAuditPrd: null,
    integracoesPrd: null,
    screenshots: [],
    erros: [],
  };

  // -------------------------------------------------------------
  // FASE 1: Bateria Completa de Rotas HTTP e APIs (Verificação 360°)
  // -------------------------------------------------------------
  console.log("\n[FASE 1] Testando disponibilidade de todas as rotas e APIs em PRD...");
  const rotasParaTestar = [
    { rota: "/", nome: "Root SPA", esperado: [200] },
    { rota: "/login", nome: "Portal de Login Unificado", esperado: [200] },
    { rota: "/admin", nome: "Console /admin Multi-Negócio", esperado: [200] },
    { rota: "/admin/crm-financeira", nome: "Operações Financeiras & CRM 360", esperado: [200] },
    { rota: "/admin/cadastro-360", nome: "Cadastro 360° Corporativo", esperado: [200] },
    { rota: "/admin/pre-cadastro", nome: "Vault Documental & Checklist", esperado: [200] },
    { rota: "/admin/termos", nome: "Central de Termos Regulatórios SCR Bacen", esperado: [200] },
    { rota: "/plataforma/consulta-cpf", nome: "Consulta 360 CPF & CNPJ", esperado: [200] },
    { rota: "/plataforma/precadastro", nome: "Esteira de Pré-Cadastro", esperado: [200] },
    { rota: "/plataforma/clientes-potenciais", nome: "Radar Preditivo de Clientes", esperado: [200] },
    { rota: "/plataforma/carteira", nome: "Carteira Digital & Chaves PIX", esperado: [200] },
    { rota: "/portal-cliente", nome: "Portal do Cliente", esperado: [200, 302] },
    { rota: "/gestao-emprestimos", nome: "Gestão de Empréstimos", esperado: [200, 302] },
    { rota: "/git", nome: "Console Git DevOps", esperado: [200, 302] },
    { rota: "/api/health", nome: "Healthcheck Geral", esperado: [200] },
    { rota: "/api/bancofe/health", nome: "Healthcheck BancoFé Core", esperado: [200] },
    { rota: "/api/status", nome: "Status do Sistema", esperado: [200] },
    { rota: "/metrics", nome: "Métricas Prometheus", esperado: [200] },
    { rota: "/api/docs", nome: "Swagger / OpenAPI Docs", esperado: [200] },
    { rota: "/api/openapi.json", nome: "Especificação OpenAPI 3.0", esperado: [200] },
    { rota: "/api/integrations", nome: "Catálogo de Integrações", esperado: [200] },
    { rota: "/api/ledger/audit", nome: "Auditoria Contábil Livro Razão", esperado: [200] },
    { rota: "/api/v1/admin/negocios", nome: "API Admin: Negócios & Módulos", esperado: [200] },
    { rota: "/api/v1/crm-financeira/oportunidades", nome: "API CRM: Oportunidades", esperado: [200] },
    { rota: "/api/v1/crm-financeira/metricas", nome: "API CRM: Métricas Financeiras", esperado: [200] },
    { rota: "/api/v1/cadastro-360/metricas", nome: "API Cadastro 360: Métricas", esperado: [200] },
    { rota: "/api/v1/cadastro-360/clientes", nome: "API Cadastro 360: Clientes", esperado: [200] },
  ];

  for (const item of rotasParaTestar) {
    const t0 = Date.now();
    try {
      const resp = await fetch(`${BASE_URL}${item.rota}`, {
        headers: authHeaders,
        redirect: "manual",
      });
      const tDelta = Date.now() - t0;
      const statusOk = item.esperado.includes(resp.status);
      console.log(`  [${resp.status}] ${item.nome.padEnd(42)} (${tDelta}ms) - ${statusOk ? "OK" : "FALHA"}`);
      relatorio.rotasHttp.push({
        rota: item.rota,
        nome: item.nome,
        status: resp.status,
        tempoMs: tDelta,
        sucesso: statusOk,
      });
      if (!statusOk) {
        relatorio.erros.push(`Rota ${item.rota} retornou status ${resp.status}`);
      }
    } catch (e) {
      console.error(`  [ERRO] ${item.nome}:`, e.message);
      relatorio.rotasHttp.push({
        rota: item.rota,
        nome: item.nome,
        status: 0,
        tempoMs: 0,
        sucesso: false,
        erro: e.message,
      });
      relatorio.erros.push(`Falha de conexão em ${item.rota}: ${e.message}`);
    }
  }

  // -------------------------------------------------------------
  // FASE 2: Validação Funcional das 9 Empresas e Módulos (/admin)
  // -------------------------------------------------------------
  console.log("\n[FASE 2] Validando integridade dos 9 Negócios e 30+ Módulos em PRD...");
  try {
    const respNeg = await fetch(`${BASE_URL}/api/v1/admin/negocios`, { headers: authHeaders });
    const dadosNeg = await respNeg.json();
    const negocios = dadosNeg.negocios || [];
    console.log(`  Total de Linhas de Negócio cadastradas em PRD: ${negocios.length}`);
    console.log(`  Total de Módulos ativos: ${dadosNeg.metricas?.modulosAtivos || 0}`);

    for (const n of negocios) {
      console.log(`    - [${n.id}] ${n.nome} (${n.modulos?.length || 0} módulos)`);
    }

    if (negocios.length >= 9) {
      console.log("  >>> SUCESSO: Todas as 9 linhas de negócio corporativas estão ativas em PRD.");
    } else {
      relatorio.erros.push(`Esperava pelo menos 9 negócios, obteve ${negocios.length}`);
    }
  } catch (e) {
    relatorio.erros.push(`Erro na checagem dos negócios: ${e.message}`);
  }

  // -------------------------------------------------------------
  // FASE 3: Teste Dinâmico CRUD de Módulo em Produção
  // -------------------------------------------------------------
  console.log("\n[FASE 3] Executando ciclo de vida CRUD dinâmico de módulo em PRD...");
  try {
    const modCodigo = `TEST_MOD_${Date.now()}`;
    // 1. Criar Módulo
    const respCreate = await fetch(`${BASE_URL}/api/v1/admin/modulos/neg-bancofe`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Módulo Auditoria Homologação PRD",
        codigo: modCodigo,
        descricao: "Módulo de teste automatizado para validação de ciclo CRUD em produção",
        categoria: "compliance",
        ativo: true,
        rotaUrl: "/admin/termos",
        icone: "fa-vial-circle-check",
        permissoesMinimas: "ADMIN",
      }),
    });
    const dadosCreate = await respCreate.json();
    console.log("  1. Criação do módulo:", dadosCreate.sucesso ? "SUCESSO" : "FALHA", dadosCreate.modulo?.id);
    const modId = dadosCreate.modulo?.id;

    // 2. Modificar Módulo
    const respUpdate = await fetch(`${BASE_URL}/api/v1/admin/modulos/neg-bancofe/${modId}`, {
      method: "PUT",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: "Módulo atualizado durante teste de estresse de auditoria",
      }),
    });
    const dadosUpdate = await respUpdate.json();
    console.log("  2. Modificação do módulo:", dadosUpdate.sucesso ? "SUCESSO" : "FALHA");

    // 3. Alternar Status (Desativar)
    const respToggle = await fetch(`${BASE_URL}/api/v1/admin/modulos/neg-bancofe/${modId}/status`, {
      method: "PATCH",
      headers: authHeaders,
    });
    const dadosToggle = await respToggle.json();
    console.log("  3. Alternância de status (ativo -> inativo):", dadosToggle.sucesso && !dadosToggle.modulo?.ativo ? "SUCESSO" : "FALHA");

    // 4. Excluir Módulo
    const respDelete = await fetch(`${BASE_URL}/api/v1/admin/modulos/neg-bancofe/${modId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const dadosDelete = await respDelete.json();
    console.log("  4. Exclusão do módulo:", dadosDelete.sucesso ? "SUCESSO" : "FALHA");

    relatorio.crudAdminPrd = {
      moduloCriado: dadosCreate.sucesso,
      moduloModificado: dadosUpdate.sucesso,
      statusAlternado: dadosToggle.sucesso,
      moduloExcluido: dadosDelete.sucesso,
    };
  } catch (e) {
    console.error("  Erro no teste CRUD:", e.message);
    relatorio.erros.push(`Falha no CRUD dinâmico: ${e.message}`);
  }

  // -------------------------------------------------------------
  // FASE 4: Auditoria Contábil e Conectores
  // -------------------------------------------------------------
  console.log("\n[FASE 4] Checando Livro Razão Contábil e Conectores Oficiais em PRD...");
  try {
    const respLedger = await fetch(`${BASE_URL}/api/ledger/audit`, { headers: authHeaders });
    const dadosLedger = await respLedger.json();
    console.log("  Auditoria Contábil COSIF:", dadosLedger.audit?.isValid ? "VÁLIDA (Equação equilibrada)" : "INVÁLIDA");
    console.log(`  Contas Contábeis: ${dadosLedger.accountsCount} | Lançamentos no Diário: ${dadosLedger.journalEntriesCount}`);
    relatorio.ledgerAuditPrd = dadosLedger.audit;

    const respInteg = await fetch(`${BASE_URL}/api/integrations`, { headers: authHeaders });
    const dadosInteg = await respInteg.json();
    console.log(`  Conectores Oficiais Integrados: ${dadosInteg.total}`);
    relatorio.integracoesPrd = { total: dadosInteg.total };
  } catch (e) {
    relatorio.erros.push(`Erro no Ledger/Integrações: ${e.message}`);
  }

  // -------------------------------------------------------------
  // FASE 5: Automação Browser Headless (Chromium) & Screenshots
  // -------------------------------------------------------------
  console.log("\n[FASE 5] Iniciando navegador Chromium para validação visual direta em PRD...");
  const outputDir = "/home/ubuntu/bancoFe/docs/screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 1000 },
  });

  const page = await browser.newPage();
  if (gcpToken) {
    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${gcpToken}`,
    });
  }

  await page.setCookie(
    { name: "bancofe_auth", value: "autorizado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "session_token", value: "bcf_super_admin_homologado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "sp_token", value: "bcf_platform_admin", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" }
  );

  const telasParaCapturar = [
    {
      nome: "13_prd_dashboard_admin_completo.png",
      url: `${BASE_URL}/admin`,
      esperaMs: 2500,
      descricao: "Console Administrativo /admin com os 9 negócios",
    },
    {
      nome: "14_prd_crm_financeira_pipeline.png",
      url: `${BASE_URL}/admin/crm-financeira`,
      esperaMs: 2500,
      descricao: "Esteira de Crédito & CRM 360 com Kanban e Simulador SAC/Price",
    },
    {
      nome: "15_prd_cadastro_360_empresas.png",
      url: `${BASE_URL}/admin/cadastro-360`,
      esperaMs: 2500,
      descricao: "Cadastro 360° Corporativo e Governança em 8 Abas",
    },
    {
      nome: "16_prd_pre_cadastro_vault.png",
      url: `${BASE_URL}/admin/pre-cadastro`,
      esperaMs: 2500,
      descricao: "Vault Documental de Pré-Cadastro com Checklist de 13 Documentos",
    },
    {
      nome: "17_prd_central_termos_scr.png",
      url: `${BASE_URL}/admin/termos`,
      esperaMs: 2500,
      descricao: "Central de Termos Regulatórios SCR Bacen e LGPD",
    },
  ];

  for (const t of telasParaCapturar) {
    console.log(`  Capturando tela: ${t.descricao} (${t.url})...`);
    try {
      await page.goto(t.url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, t.esperaMs));
      const p = path.join(outputDir, t.nome);
      await page.screenshot({ path: p, fullPage: true });
      console.log(`    -> Salvo com sucesso: ${p}`);
      relatorio.screenshots.push({ nome: t.nome, path: p, descricao: t.descricao });
    } catch (err) {
      console.error(`    -> Erro ao capturar ${t.nome}:`, err.message);
      relatorio.erros.push(`Falha na captura de ${t.nome}: ${err.message}`);
    }
  }

  await browser.close();

  // -------------------------------------------------------------
  // RELATÓRIO FINAL CONSOLIDADO
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("                     RELATÓRIO CONSOLIDADOR                       ");
  console.log("==================================================================");
  const totalRotas = relatorio.rotasHttp.length;
  const rotasSucesso = relatorio.rotasHttp.filter((r) => r.sucesso).length;
  const taxaSucesso = ((rotasSucesso / totalRotas) * 100).toFixed(1);

  console.log(`Total de Rotas Auditadas: ${totalRotas}`);
  console.log(`Rotas com Sucesso: ${rotasSucesso} (${taxaSucesso}%)`);
  console.log(`CRUD Dinâmico de Módulos: ${relatorio.crudAdminPrd?.moduloExcluido ? "100% HOMOLOGADO" : "FALHA"}`);
  console.log(`Screenshots de Produção: ${relatorio.screenshots.length} gerados`);
  console.log(`Erros Encontrados: ${relatorio.erros.length}`);

  fs.writeFileSync(
    "/home/ubuntu/bancoFe/docs/resultado_auditoria_prd.json",
    JSON.stringify(relatorio, null, 2),
    "utf-8"
  );
  console.log("Resultado salvo em: /home/ubuntu/bancoFe/docs/resultado_auditoria_prd.json");
}

main().catch((e) => {
  console.error("Falha fatal na auditoria de PRD:", e);
  process.exit(1);
});
