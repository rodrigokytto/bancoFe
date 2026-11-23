import puppeteer from "puppeteer-core";
import fs from "fs";

const PRD_BASE_URL = "https://zuma.kytto.com.br";
const SCREENSHOT_DIR = "/home/ubuntu/screenshots/prd_validation";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routesToTest = [
  { path: "/cockpit", name: "01_cockpit", desc: "Cockpit Geral & KPIs" },
  { path: "/mapa-de-calor", name: "02_mapa_calor", desc: "Mapa de Calor 360° Sazonalidade" },
  { path: "/ultra", name: "03_ultra_vision_ai", desc: "Zuma Ultra • CFTV & IA Visual 360°" },
  { path: "/comparativo-saipos", name: "04_comparativo_saipos", desc: "Comparativo Zuma vs Saipos & ROI" },
  { path: "/mercado", name: "05_mercado_radar", desc: "Radar de Concorrentes Tangará" },
  { path: "/kds-v2", name: "06_kds_v2", desc: "Cozinha KDS 2.0 Fire-on-Demand" },
  { path: "/mesa", name: "07_mesa_cliente", desc: "Auto-Atendimento Mesa Cliente" },
  { path: "/telemetria", name: "08_telemetria_iot", desc: "Telemetria IoT Câmaras Frias" },
  { path: "/previsao-compras", name: "09_previsao_salmao", desc: "Previsão Compras Salmão" },
  { path: "/fechamento-contabil", name: "10_fechamento_fiscal", desc: "Fechamento Contábil 1-Click SPED" },
  { path: "/apps", name: "11_central_apps", desc: "Central de 10 PWAs Mobile" },
  { path: "/garcom", name: "12_app_garcom", desc: "Comanda Móvel Garçom 27 Mesas" },
  { path: "/pdv", name: "13_pdv_caixa", desc: "Frente de Caixa Touch" },
  { path: "/conexoes", name: "14_conexoes_apis", desc: "Hub de 7 APIs Públicas & CNPJ" },
  { path: "/erp?tab=agro", name: "15_erp_agro_safra", desc: "Módulo Agro, Balança 80t & Silos" },
  { path: "/erp?tab=varejo", name: "16_erp_varejo_prix", desc: "Varejo & Balança Toledo Prix 6" },
  { path: "/erp?tab=comercial", name: "17_erp_comercial_b2b", desc: "Comercial & Propostas B2B" },
  { path: "/erp?tab=customer360", name: "18_erp_customer360", desc: "Customer 360 & Scoring Crédito" },
  { path: "/erp?tab=os", name: "19_erp_os_manutencao", desc: "Ordens de Serviço 360" },
  { path: "/erp?tab=expedicao", name: "20_erp_expedicao_rotas", desc: "Expedição & Roteirização Tangará" },
  { path: "/erp?tab=concreto", name: "21_erp_concreto_usina", desc: "Concreto Serrano & FCK NBR 5739" },
  { path: "/erp?tab=pizzaria", name: "22_erp_pizzaria", desc: "Pizzaria Fracionada & KDS Forno" },
  { path: "/erp?tab=barbearia", name: "23_erp_barbearia", desc: "Barbearia & Comissões" },
  { path: "/erp?tab=bar", name: "24_erp_bar_choperia", desc: "Bar & Comandas Eletrônicas" },
  { path: "/erp?tab=autopecas", name: "25_erp_autopecas", desc: "AutoPeças & Oficina Mecânica" },
  { path: "/erp?tab=clube", name: "26_erp_clube_arenas", desc: "Clube & Quadras Beach Tennis" },
];

async function runValidation() {
  console.log("=== INICIANDO SUÍTE COMPLETA DE TESTES NO GCP CLOUD RUN (PRD) ===");
  console.log("Alvo:", PRD_BASE_URL);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log("\n[Auth] Acessando tela de login...");
  await page.goto(`${PRD_BASE_URL}/login`, { waitUntil: "networkidle0", timeout: 45000 });

  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 3000));
  console.log("[Auth] Autenticado com sucesso. Redirecionado para:", page.url());

  const results = [];

  for (const route of routesToTest) {
    const fullUrl = `${PRD_BASE_URL}${route.path}`;
    const t0 = Date.now();
    try {
      const response = await page.goto(fullUrl, { waitUntil: "networkidle0", timeout: 30000 });
      const latency = Date.now() - t0;
      const status = response ? response.status() : 200;
      
      const screenshotPath = `${SCREENSHOT_DIR}/${route.name}.png`;
      await page.screenshot({ path: screenshotPath });

      const pageText = await page.evaluate(() => document.body.innerText);
      const hasError = pageText.includes("Cannot GET");

      results.push({
        name: route.name,
        path: route.path,
        desc: route.desc,
        status,
        latency: `${latency}ms`,
        ok: !hasError && status < 400,
        screenshot: screenshotPath,
      });

      console.log(`[✓] ${route.path.padEnd(25)} | Status: ${status} | ${latency}ms`);
    } catch (err) {
      console.error(`[✗] Erro na rota ${route.path}:`, err.message);
      results.push({
        name: route.name,
        path: route.path,
        desc: route.desc,
        status: "ERROR",
        latency: "Timeout",
        ok: false,
        error: err.message,
      });
    }
  }

  await browser.close();

  console.log("\n========================================================");
  console.log("   RELATÓRIO CONSOLIDADO DE VALIDAÇÃO GCP PRD           ");
  console.log("========================================================");
  console.table(results.map(r => ({ Rota: r.path, Módulo: r.desc, Status: r.status, Latência: r.latency, OK: r.ok ? "✓" : "✗" })));

  fs.writeFileSync("/home/ubuntu/screenshots/prd_validation_report.json", JSON.stringify(results, null, 2));
}

runValidation().catch(e => {
  console.error("Erro fatal na execução da suíte:", e);
  process.exit(1);
});
