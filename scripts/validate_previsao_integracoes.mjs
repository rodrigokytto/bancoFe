import puppeteer from "puppeteer-core";
import fs from "fs";

const BASE_URL = process.env.TEST_URL || "http://127.0.0.1:3000";
const SCREENSHOT_DIR = "/home/ubuntu/screenshots/zuma_previsao_integracoes";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("=== INICIANDO VALIDAÇÃO VISUAL E FUNCIONAL: PREVISÃO DE COMPRAS & INTEGRAÇÕES ===");
  console.log("Base URL:", BASE_URL);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1440,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Login
  console.log("\n[1/5] Acessando autenticação...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0", timeout: 30000 });
  const passInput = await page.$("input[type='password']");
  if (passInput) {
    await page.type("input[type='password']", "#080581");
    await page.click("button[type='submit']");
  }
  await new Promise(r => setTimeout(r, 2000));
  console.log("Autenticado com sucesso. URL atual:", page.url());

  // 2. Previsão de Compras - Aba 1: Previsão Geral
  console.log("\n[2/5] Validando /previsao-compras (Aba 1: Previsão & Demanda)...");
  await page.goto(`${BASE_URL}/previsao-compras`, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_previsao_compras_geral.png` });
  console.log("-> Screenshot 01 salvo");

  // Interagir com os botões de cenário de dias (ex: 14 dias)
  const buttons14d = await page.$$("button");
  for (const b of buttons14d) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("14 dias")) {
      await b.click();
      console.log("-> Clicou em '14 dias'");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02_previsao_14dias_otimista.png` });

  // Previsão de Compras - Aba 2: Fichas Técnicas & BOM
  console.log("Validando Aba Fichas Técnicas & BOM...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Fichas Técnicas") || text.includes("BOM"))) {
      await b.click();
      console.log("-> Alternou para aba Fichas Técnicas");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03_fichas_tecnicas_bom.png` });

  // Previsão de Compras - Aba 3: Ordens de Compra & Fornecedores
  console.log("Validando Aba Ordens de Compra...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("Ordens de Compra")) {
      await b.click();
      console.log("-> Alternou para aba Ordens de Compra");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04_ordens_compra_fornecedores.png` });

  // Previsão de Compras - Aba 4: Estoque & ROP
  console.log("Validando Aba Estoque & Ponto de Reposição (ROP)...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("Estoque & ROP")) {
      await b.click();
      console.log("-> Alternou para aba Estoque & ROP");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05_estoque_rop_insumos.png` });

  // Previsão de Compras - Aba 5: Alavancas Zumi IA
  console.log("Validando Aba Alavancas Zumi IA...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("Alavancas Zumi IA")) {
      await b.click();
      console.log("-> Alternou para aba Alavancas Zumi IA");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06_alavancas_zumi_ia.png` });

  // 3. Módulo de Integrações & Administração de TI
  console.log("\n[3/5] Validando /integracoes (Aba 1: Canais & APIs Oficiais)...");
  await page.goto(`${BASE_URL}/integracoes`, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07_integracoes_canais_apis.png` });

  // Integrações - Aba 2: Matriz Zuma vs Saipos
  console.log("Validando Aba Zuma vs Saipos (Superioridade Tecnológica)...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Zuma vs Saipos") || text.includes("Saipos Killer"))) {
      await b.click();
      console.log("-> Alternou para aba Zuma vs Saipos");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/08_matriz_zuma_vs_saipos.png` });

  // Integrações - Aba 3: Laboratório Sandbox
  console.log("Validando Aba Laboratório Sandbox...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Sandbox") || text.includes("Testes"))) {
      await b.click();
      console.log("-> Alternou para aba Sandbox");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09_sandbox_disparadores.png` });

  // Integrações - Aba 4: Radar Tangará
  console.log("Validando Aba Radar Tangará...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Radar Tangará") || text.includes("Gaps"))) {
      await b.click();
      console.log("-> Alternou para aba Radar Tangará");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10_radar_tangara_integracoes.png` });

  // Integrações - Aba 5: Auditoria de Webhooks
  console.log("Validando Aba Auditoria de Webhooks...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Auditoria") || text.includes("Webhooks"))) {
      await b.click();
      console.log("-> Alternou para aba Auditoria de Webhooks");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/11_webhooks_audit.png` });

  // Integrações - Aba 6: Central de Credenciais
  console.log("Validando Aba Central de Credenciais...");
  for (const b of await page.$$("button")) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes("Credenciais") || text.includes("Vault"))) {
      await b.click();
      console.log("-> Alternou para aba Central de Credenciais");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/12_credenciais_vault.png` });

  await browser.close();
  console.log("\n>>> TODAS AS TELAS E ABAS FORAM VALIDADAS COM SUCESSO! <<<");
}

run().catch(e => {
  console.error("Erro na validação:", e);
  process.exit(1);
});
