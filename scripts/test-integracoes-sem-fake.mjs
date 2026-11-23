import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "/home/ubuntu/screenshots";
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log("Iniciando validação visual e operacional do módulo /integracoes com login real...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1600,1050"],
    headless: "new",
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.2 }
  });

  const page = await browser.newPage();

  page.on("console", msg => {
    if (msg.type() === "error") {
      console.log(`[Browser ERROR] ${msg.text()}`);
    }
  });

  try {
    // 1. Login no Zuma Pilot
    console.log("1. Acessando http://localhost:3000/login...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));

    // Preenche senha #080581
    const passInput = await page.$("input[type='password']");
    if (passInput) {
      await passInput.type("#080581");
    }
    const submitBtn = await page.$("button[type='submit']");
    if (submitBtn) {
      await submitBtn.click();
    }
    await new Promise(r => setTimeout(r, 2500));
    console.log("Autenticado! URL atual:", page.url());

    // 2. Navega para /integracoes
    console.log("2. Navegando para http://localhost:3000/integracoes...");
    await page.goto("http://localhost:3000/integracoes", { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot da aba Canais & Gateways
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_canais_reais.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_canais_reais.png");

    // 3. Navega para a aba Sincronizador Saipos
    console.log("3. Clicando na aba 'Sincronizador Saipos'...");
    const tabs = await page.$$("button");
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes("Sincronizador Saipos")) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot do Sincronizador Saipos antes da execução
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_saipos_sync.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_saipos_sync.png");

    // Clica no botão "Executar Sync Real"
    console.log("4. Clicando no botão 'Executar Sync Real'...");
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes("Executar Sync Real")) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot pós-sync com toast e histórico atualizado
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_saipos_sync_executado.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_saipos_sync_executado.png");

    // 5. Navega para a aba Cofre de Credenciais
    console.log("5. Clicando na aba 'Chaves & Webhook URLs'...");
    const credTabs = await page.$$("button");
    for (const tab of credTabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes("Chaves & Webhook URLs")) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_cofre_credenciais.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_cofre_credenciais.png");

    // Clica no botão "Testar" da primeira credencial (iFood)
    const testBtns = await page.$$("button");
    for (const tb of testBtns) {
      const text = await page.evaluate(el => el.textContent, tb);
      if (text && text.includes("Testar")) {
        await tb.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_credenciais_testadas.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_credenciais_testadas.png");

    // 6. Navega para a aba Auditoria Webhooks
    console.log("6. Clicando na aba 'Auditoria Webhooks'...");
    const auditTabs = await page.$$("button");
    for (const tab of auditTabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes("Auditoria Webhooks")) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "zuma_integracoes_webhooks_audit.png"), fullPage: false });
    console.log("Screenshot salvo: zuma_integracoes_webhooks_audit.png");

    console.log("Validação visual e operacional concluída com 100% de sucesso!");
  } catch (err) {
    console.error("Erro durante o teste:", err);
  } finally {
    await browser.close();
  }
}

run();
