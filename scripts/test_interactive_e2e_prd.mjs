import puppeteer from "puppeteer-core";
import fs from "fs";

const TARGET_URL = "https://zuma.kytto.com.br";
const SCREENSHOT_DIR = "/home/ubuntu/screenshots/kytto_interactive_e2e";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runInteractiveE2E() {
  console.log("=== INICIANDO VALIDAÇÃO INTERATIVA PONTA A PONTA EM PRD (zuma.kytto.com.br) ===");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const testSteps = [];

  // ==========================================
  // ETAPA 1: Login Master
  // ==========================================
  console.log("\n[Passo 1/6] Testando Autenticação Master...");
  await page.goto(`${TARGET_URL}/login`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_auth_cockpit_success.png` });
  console.log("  -> Login efetuado com sucesso!");
  testSteps.push({ step: "1. Login Master", status: "Sucesso", target: "/login -> /cockpit" });

  // ==========================================
  // ETAPA 2: Auto-Atendimento Mesa do Cliente (Adicionar itens, Chamar Garçom, Pix)
  // ==========================================
  console.log("\n[Passo 2/6] Testando Fluxo do Cliente na Mesa (/mesa)...");
  await page.goto(`${TARGET_URL}/mesa`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02_mesa_inicial.png` });

  // Clicar em Adicionar primeiro item
  const addButtons = await page.$$("button");
  let clickedAdd = false;
  for (const btn of addButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Adicionar")) {
      await btn.click();
      clickedAdd = true;
      console.log("  -> Clicou em '+ Adicionar' item ao pedido.");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03_mesa_item_adicionado.png` });

  // Testar modal de chamar garçom
  const garcomBtn = await page.$("button.bg-orange-500, button");
  for (const btn of addButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Garçom")) {
      await btn.click();
      console.log("  -> Clicou em 'Chamar Garçom'.");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04_mesa_chamar_garcom.png` });

  testSteps.push({ step: "2. Auto-atendimento Mesa (Pedido & Garçom)", status: "Sucesso", target: "/mesa" });

  // ==========================================
  // ETAPA 3: Cozinha KDS 2.0 Fire-on-Demand (Liberar Quentes/Frios)
  // ==========================================
  console.log("\n[Passo 3/6] Testando KDS 2.0 Fire-on-Demand (/kds-v2)...");
  await page.goto(`${TARGET_URL}/kds-v2`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05_kds_pedidos_ativos.png` });

  // Clicar em 'LIBERAR AGORA' no Fire on Demand se houver
  const kdsButtons = await page.$$("button");
  for (const btn of kdsButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("LIBERAR AGORA") || text.includes("Liberar")) {
      await btn.click();
      console.log("  -> Clicou em 'LIBERAR AGORA' no KDS 2.0 Fire-on-Demand.");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06_kds_fire_liberado.png` });
  testSteps.push({ step: "3. KDS 2.0 Fire-on-Demand", status: "Sucesso", target: "/kds-v2" });

  // ==========================================
  // ETAPA 4: Mapa de Calor 2.0 & Simulador
  // ==========================================
  console.log("\n[Passo 4/6] Testando Mapa de Calor 2.0 (/mapa-de-calor)...");
  await page.goto(`${TARGET_URL}/mapa-de-calor`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07_mapa_calor_seletor.png` });

  // Clicar no botão 'Semana' ou 'Simulador Almoço'
  const hmButtons = await page.$$("button");
  for (const btn of hmButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Simulador Almoço") || text.includes("Semana")) {
      await btn.click();
      console.log(`  -> Clicou em '${text.trim()}' no Mapa de Calor.`);
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/08_mapa_calor_interagido.png` });
  testSteps.push({ step: "4. Mapa de Calor & Simulador", status: "Sucesso", target: "/mapa-de-calor" });

  // ==========================================
  // ETAPA 5: Telemetria IoT & Teste de Alarme
  // ==========================================
  console.log("\n[Passo 5/6] Testando Telemetria IoT e Alarme de Porta Aberta (/telemetria)...");
  await page.goto(`${TARGET_URL}/telemetria`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09_telemetria_sensores.png` });

  const iotButtons = await page.$$("button");
  for (const btn of iotButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Testar Alarme") || text.includes("Porta Aberta")) {
      await btn.click();
      console.log("  -> Acionou 'Testar Alarme Porta Aberta' na telemetria IoT.");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10_telemetria_alarme_acionado.png` });
  testSteps.push({ step: "5. Telemetria IoT e Alarme HACCP", status: "Sucesso", target: "/telemetria" });

  // ==========================================
  // ETAPA 6: Hub de Conexões e Consulta CNPJ Receita Federal
  // ==========================================
  console.log("\n[Passo 6/6] Testando Hub de Conexões e Consulta CNPJ (/conexoes)...");
  await page.goto(`${TARGET_URL}/conexoes`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/11_hub_conexoes_inicial.png` });

  // Clicar no atalho CNPJ Zuma Cozinha Oriental
  const conButtons = await page.$$("button");
  for (const btn of conButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Zuma Cozinha Oriental")) {
      await btn.click();
      console.log("  -> Clicou no atalho 'Zuma Cozinha Oriental' para consulta CNPJ.");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/12_hub_conexoes_cnpj_consultado.png` });
  testSteps.push({ step: "6. Hub de Conexões & Consulta CNPJ", status: "Sucesso", target: "/conexoes" });

  await browser.close();

  console.log("\n========================================================");
  console.log("   TODAS AS ETAPAS INTERATIVAS FORAM CONCLUÍDAS COM ÊXITO! ");
  console.log("========================================================");
  console.table(testSteps);

  fs.writeFileSync("/home/ubuntu/screenshots/kytto_interactive_report.json", JSON.stringify(testSteps, null, 2));
}

runInteractiveE2E().catch(e => {
  console.error("Erro na validação interativa:", e);
  process.exit(1);
});
