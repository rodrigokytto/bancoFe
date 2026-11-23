import axios from "axios";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const ROUTES = [
  // Rotas Principais do Ecossistema
  { path: "/", type: "frontend", desc: "Cockpit Geral BancoFe / Zuma" },
  { path: "/admin", type: "frontend", desc: "Gestão Multi-Negócio de Módulos (Novo)" },
  { path: "/admin/modulos", type: "frontend", desc: "Alias direto para Gestão de Módulos" },
  { path: "/admin/crm-financeira", type: "frontend", desc: "Painel BancoFe — Operações Financeiras & CRM 360°" },
  { path: "/admin/operacoes-financeiras", type: "frontend", desc: "Alias direto Operações Financeiras" },
  { path: "/crm-financeira", type: "frontend", desc: "Rota amigável CRM Financeira" },
  { path: "/operacoes-financeiras", type: "frontend", desc: "Rota amigável Operações Financeiras" },
  { path: "/administracao", type: "frontend", desc: "Painel Administrativo" },
  { path: "/bancofe", type: "frontend", desc: "BancoFe Hub & Banking Core" },
  { path: "/banking", type: "frontend", desc: "Open Finance & Serviços Bancários" },
  { path: "/bancofe-core", type: "frontend", desc: "Core Bancário & Liquidação" },
  
  // Operação & Salão / Delivery
  { path: "/mesas", type: "frontend", desc: "Mapa de Mesas & Salão 360" },
  { path: "/salao", type: "frontend", desc: "Gestão do Salão de Atendimento" },
  { path: "/operacao", type: "frontend", desc: "Operação Central Unificada" },
  { path: "/kds", type: "frontend", desc: "KDS Cozinha v1" },
  { path: "/kds-v2", type: "frontend", desc: "KDS Cozinha v2 Fire-on-Demand" },
  { path: "/pdv", type: "frontend", desc: "PDV Frente de Caixa & NFC-e" },
  { path: "/caixa", type: "frontend", desc: "Frente de Caixa" },
  { path: "/tabela-entregas", type: "frontend", desc: "Tabela de Entregas Tangará da Serra" },
  { path: "/entregas", type: "frontend", desc: "Logística e Frotas de Entrega" },
  
  // Mobile / PWA / QR Code
  { path: "/entregador", type: "frontend", desc: "App do Piloto/Entregador PWA" },
  { path: "/garcom", type: "frontend", desc: "App Mobile do Garçom" },
  { path: "/mesa", type: "frontend", desc: "Autoatendimento Mobile Mesa QR Code" },
  { path: "/cardapio-mesa", type: "frontend", desc: "Cardápio Digital Mobile" },
  { path: "/passaporte-salmao", type: "frontend", desc: "Rastreabilidade Passaporte Salmão" },
  { path: "/loja", type: "frontend", desc: "Vitrine Digital da Loja / Cardápio Online" },
  
  // ERP & Backoffice
  { path: "/erp", type: "frontend", desc: "ERP Master Centralizado" },
  { path: "/erp-master", type: "frontend", desc: "Visão Master ERP Corporativo" },
  { path: "/estoque", type: "frontend", desc: "Controle de Estoque & Ficha Técnica" },
  { path: "/fiscal", type: "frontend", desc: "Módulo Fiscal & Sped" },
  { path: "/financeiro", type: "frontend", desc: "Financeiro & DRE Consolidado" },
  { path: "/fechamento-contabil", type: "frontend", desc: "Fechamento Contábil Mensal" },
  { path: "/compras", type: "frontend", desc: "Suprimentos & Ordens de Compra" },
  { path: "/patrimonio", type: "frontend", desc: "Controle Patrimonial" },
  
  // Inteligência & Mercado
  { path: "/clientes", type: "frontend", desc: "Base de Clientes & CRM 360" },
  { path: "/recuperacao", type: "frontend", desc: "Esteira de Recuperação de Clientes" },
  { path: "/reservas", type: "frontend", desc: "Fila de Espera & Reservas" },
  { path: "/mercado", type: "frontend", desc: "Benchmark de Mercado & Concorrência" },
  { path: "/ia-mercado", type: "frontend", desc: "Inteligência Artificial Kytto Mercado" },
  { path: "/mapa-calor", type: "frontend", desc: "Heatmap Analítico de Faturamento" },
  { path: "/previsao-compras", type: "frontend", desc: "Motor Preditivo de Compras" },
  
  // Demais Negócios da Holding
  { path: "/agro", type: "frontend", desc: "Módulo Agro MT Fazendas & Grãos" },
  { path: "/moda", type: "frontend", desc: "Módulo Varejo Boutique Moda" },
  { path: "/zuma-moda", type: "frontend", desc: "Boutique & Varejo Zuma" },
  { path: "/nossa-gente", type: "frontend", desc: "RH, Folha & Gestão de Pessoas" },
  { path: "/telemetria", type: "frontend", desc: "IoT & Sensores de Temperatura/Energia" },
  { path: "/dr-clima", type: "frontend", desc: "Simulador Climático & Climatização" },
  { path: "/ultra-vision", type: "frontend", desc: "Visão Computacional & Câmeras AI" },
  { path: "/zumi", type: "frontend", desc: "WhatsApp Zumi Bot & Conversacional" },
  { path: "/waha", type: "frontend", desc: "Admin WhatsApp API (Waha)" },
  { path: "/integracoes", type: "frontend", desc: "Hub de Integrações Externas" },
  { path: "/login", type: "frontend", desc: "Portal de Autenticação / Login" },

  // APIs do Backend & Healthchecks
  { path: "/healthz", type: "api", desc: "Healthcheck TCP/HTTP do Cloud Run" },
  { path: "/api/status", type: "api", desc: "Status de Operação e Uptime da Engine" },
  { path: "/api/platform/config.js", type: "static", desc: "Script de Configuração Pública da Plataforma" },
  { path: "/api/v1/bancofe/config", type: "api", desc: "Configurações Oficiais BancoFe" },
  { path: "/api/v1/admin/modulos", type: "api", desc: "API Multi-Negócio de Módulos (Catálogo Completo)" },
  { path: "/api/v1/admin/modulos/bancofe", type: "api", desc: "Módulos do BancoFe Fintech" },
  { path: "/api/v1/admin/modulos/zuma", type: "api", desc: "Módulos da Zuma Gastronomia" },
  { path: "/api/v1/admin/modulos/boutique", type: "api", desc: "Módulos da Boutique Moda" },
  { path: "/api/v1/admin/modulos/agro", type: "api", desc: "Módulos do Agro MT" },
  { path: "/api/v1/admin/modulos/kytto", type: "api", desc: "Módulos da Kytto Holding" },
  { path: "/api/v1/admin/modulos/logistica", type: "api", desc: "Módulos de Logística & Frotas" },
  { path: "/api/v1/admin/modulos/credito_pj", type: "api", desc: "Módulos de Antecipação & Crédito PJ" },
  { path: "/api/v1/admin/modulos/operacoes_financeiras_crm", type: "api", desc: "Módulos da Empresa Operações Financeiras & CRM" },
  { path: "/api/admin/operacoes-financeiras/crm/gestao", type: "api", desc: "API Métricas e Gestão da Mesa de Crédito" },
  { path: "/api/admin/operacoes-financeiras/crm/oportunidades", type: "api", desc: "API Listagem de Oportunidades do Funil CRM" },
  { path: "/api/admin/notificacoes", type: "api", desc: "API Central de Notificações em Tempo Real" },
  { path: "/api/v1/precadastro/metricas", type: "api", desc: "Métricas Consolidadas de Pré-Cadastro" },
  { path: "/api/v1/precadastro/listar", type: "api", desc: "Listagem de Propostas de Pré-Cadastro" },
  { path: "/api/v1/integracoes/validar-todas", type: "api", desc: "Diagnóstico Integrado de Conectores" },
  { path: "/api/v1/compliance-ambiental/53338003000104", type: "api", desc: "Consulta Compliance SEMA/CAR" },
  { path: "/api/v1/scr-bacen/53338003000104", type: "api", desc: "Consulta SCR Bacen Registrato" },
  { path: "/api/v1/cartorios-protestos/53338003000104", type: "api", desc: "Consulta Cartórios & Protestos IEPTB" },
];

async function runValidation() {
  console.log(`\n================================================================`);
  console.log(`VALIDAÇÃO INTEGRAL DE LINKS & ROTAS BANCOFE EM PRODUÇÃO (PRD)`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total de rotas a testar: ${ROUTES.length}`);
  console.log(`================================================================\n`);

  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    const start = Date.now();
    const timeoutMs = route.path.includes("validar-todas") ? 35000 : 8000;
    try {
      const res = await axios.get(url, {
        timeout: timeoutMs,
        validateStatus: () => true, // Captura qualquer status code
      });
      const latency = Date.now() - start;
      const isSuccess = res.status >= 200 && res.status < 400;

      if (isSuccess) {
        passed++;
        console.log(`✅ [${res.status}] ${latency}ms | ${route.path.padEnd(38)} | ${route.desc}`);
      } else {
        failed++;
        console.error(`❌ [${res.status}] ${latency}ms | ${route.path.padEnd(38)} | ${route.desc}`);
      }

      results.push({
        path: route.path,
        type: route.type,
        status: res.status,
        latencyMs: latency,
        desc: route.desc,
        ok: isSuccess,
      });
    } catch (err: any) {
      failed++;
      console.error(`💥 [ERROR] ${route.path.padEnd(38)} | ${err.message}`);
      results.push({
        path: route.path,
        type: route.type,
        status: 0,
        latencyMs: 0,
        desc: route.desc,
        ok: false,
        error: err.message,
      });
    }
  }

  console.log(`\n================================================================`);
  console.log(`RESUMO DA VALIDAÇÃO:`);
  console.log(`Total testado: ${ROUTES.length}`);
  console.log(`Sucesso: ${passed} rotas`);
  console.log(`Falhas:  ${failed} rotas`);
  console.log(`Taxa de Sucesso: ${((passed / ROUTES.length) * 100).toFixed(1)}%`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runValidation();
