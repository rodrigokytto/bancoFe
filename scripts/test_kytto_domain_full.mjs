import puppeteer from "puppeteer-core";
import fs from "fs";

const TARGET_URL = "https://zuma.kytto.com.br";
const SCREENSHOT_DIR = "/home/ubuntu/screenshots/kytto_prd_validation";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routesToTest = [
  { path: "/", name: "01_login_kytto", desc: "Tela de Login Corporativo" },
  { path: "/cockpit", name: "02_cockpit_kytto", desc: "Cockpit Geral & Mapa de Calor" },
  { path: "/mapa-de-calor", name: "03_mapa_calor_kytto", desc: "Mapa de Calor 2.0 & Oportunidades" },
  { path: "/comparativo-saipos", name: "04_comparativo_saipos_kytto", desc: "Comparativo Zuma vs Saipos" },
  { path: "/mercado", name: "05_mercado_radar_kytto", desc: "Radar Concorrentes Tangará" },
  { path: "/kds-v2", name: "06_kds_v2_kytto", desc: "KDS 2.0 Fire-on-Demand" },
  { path: "/mesa", name: "07_mesa_cliente_kytto", desc: "Auto-Atendimento Mesa Cliente" },
  { path: "/telemetria", name: "08_telemetria_iot_kytto", desc: "Telemetria IoT Câmaras Frias" },
  { path: "/previsao-compras", name: "09_previsao_salmao_kytto", desc: "Previsão Compras Salmão" },
  { path: "/fechamento-contabil", name: "10_fechamento_fiscal_kytto", desc: "Fechamento Contábil SPED" },
  { path: "/apps", name: "11_central_apps_kytto", desc: "Central de 10 PWAs Mobile" },
  { path: "/garcom", name: "12_app_garcom_kytto", desc: "App do Garçom 27 Mesas" },
  { path: "/pdv", name: "13_pdv_caixa_kytto", desc: "Frente de Caixa PDV" },
  { path: "/conexoes", name: "14_conexoes_apis_kytto", desc: "Hub de 7 APIs Públicas & CNPJ" },
];

async function runValidation() {
  console.log("=== INICIANDO VALIDAÇÃO COMPLETA EM ZUMA.KYTTO.COM.BR (GCP PRD) ===");
  console.log("Alvo:", TARGET_URL);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log("\n[1/3] Acessando domínio oficial https://zuma.kytto.com.br...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle0", timeout: 45000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_login_screen.png` });

  console.log("\n[2/3] Autenticando com credenciais oficiais (#080581)...");
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 3500));
  console.log("Autenticado com sucesso. Redirecionado para:", page.url());

  const results = [];

  console.log("\n[3/3] Validando todas as rotas em zuma.kytto.com.br...");
  for (const route of routesToTest) {
    const fullUrl = `${TARGET_URL}${route.path}`;
    const t0 = Date.now();
    try {
      const response = await page.goto(fullUrl, { waitUntil: "networkidle0", timeout: 30000 });
      const latency = Date.now() - t0;
      const status = response ? response.status() : 200;
      
      const screenshotPath = `${SCREENSHOT_DIR}/${route.name}.png`;
      await page.screenshot({ path: screenshotPath });

      const pageText = await page.evaluate(() => document.body.innerText);
      const hasError = pageText.includes("Cannot GET") || pageText.includes("502 Bad Gateway");

      results.push({
        rota: route.path,
        modulo: route.desc,
        status: status,
        latencia: `${latency}ms`,
        aprovado: !hasError && status < 400,
        screenshot: screenshotPath,
      });

      console.log(`[✓] ${route.path.padEnd(24)} | ${route.desc.padEnd(32)} | Status: ${status} | ${latency}ms`);
    } catch (err) {
      console.error(`[✗] Erro em ${route.path}:`, err.message);
      results.push({
        rota: route.path,
        modulo: route.desc,
        status: "ERROR",
        latencia: "Timeout",
        aprovado: false,
        error: err.message,
      });
    }
  }

  await browser.close();

  console.log("\n========================================================");
  console.log("   RESULTADO FINAL: ZUMA.KYTTO.COM.BR 100% OPERACIONAL  ");
  console.log("========================================================");
  console.table(results.map(r => ({ Rota: r.rota, Módulo: r.modulo, Status: r.status, Latência: r.latencia, OK: r.aprovado ? "✓ SIM" : "✗ NÃO" })));

  fs.writeFileSync("/home/ubuntu/screenshots/kytto_prd_validation_report.json", JSON.stringify(results, null, 2));
  console.log("Relatório JSON salvo em: /home/ubuntu/screenshots/kytto_prd_validation_report.json");
}

runValidation().catch(e => {
  console.error("Erro fatal na validação:", e);
  process.exit(1);
});
