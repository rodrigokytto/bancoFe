import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log("Navegando para http://localhost:3000/garcom...");
  await page.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  // Clicar na Mesa 03 no grid
  console.log("Clicando na Mesa 03 no grid...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const mesaBtn = buttons.find(b => b.textContent && b.textContent.includes("Mesa 03"));
    if (mesaBtn) mesaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Clicar em "Pedir Conta"
  console.log("Abrindo modal de pagamento...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => b.textContent && b.textContent.includes("Pedir Conta"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const screenshotsDir = "/home/ubuntu/zuma/docs/screenshots";
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Screenshot 1: Modal aberto no método Cartão TEF com seletor de 16 maquininhas
  console.log("Capturando screenshot 1: modal_tef_16_maquininhas.png...");
  await page.screenshot({
    path: path.join(screenshotsDir, "modal_tef_16_maquininhas.png"),
    fullPage: false,
  });

  // Testar Ping TEF
  console.log("Clicando no Ping TEF...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => b.textContent && b.textContent.includes("Ping TEF"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Disparar transação TEF
  console.log("Disparando comando TEF para o terminal...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => b.textContent && b.textContent.includes("Enviar") && b.textContent.includes("POS"));
    if (btn) btn.click();
  });

  // Aguardar autorização do TEF (4.5s)
  await new Promise(r => setTimeout(r, 4800));

  console.log("Capturando screenshot 2: modal_tef_autorizado_sucesso.png...");
  await page.screenshot({
    path: path.join(screenshotsDir, "modal_tef_autorizado_sucesso.png"),
    fullPage: false,
  });

  // Clicar em "Ver Comprovante TEF Térmico"
  console.log("Abrindo comprovante TEF térmico...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => b.textContent && b.textContent.includes("Ver Comprovante TEF"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("Capturando screenshot 3: comprovante_tef_bobina_termica.png...");
  await page.screenshot({
    path: path.join(screenshotsDir, "comprovante_tef_bobina_termica.png"),
    fullPage: false,
  });

  // Testar Visão Mobile Smartphone (412x915 - Samsung / Pixel / iPhone)
  console.log("Testando visão mobile smartphone (412x915)...");
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await mobilePage.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const mesaBtn = buttons.find(b => b.textContent && b.textContent.includes("Mesa 03"));
    if (mesaBtn) mesaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => b.textContent && b.textContent.includes("Pedir Conta"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log("Capturando screenshot 4: app_garcom_mobile_tef_modal.png...");
  await mobilePage.screenshot({
    path: path.join(screenshotsDir, "app_garcom_mobile_tef_modal.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("Todos os screenshots foram gerados com sucesso!");
}

run().catch(err => {
  console.error("Erro na validação:", err);
  process.exit(1);
});
