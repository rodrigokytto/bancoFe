import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria da Suíte de IA & Mercado...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error("[Console Error]", msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error("[Page Error]", err.message);
  });

  console.log("Navegando para http://localhost:3000/login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });

  // Clicar no botão "Preencher Acesso Rodrigo (Dono)"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Preencher Acesso Rodrigo"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Clicar em Entrar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Entrar no Zuma Pilot"));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  console.log("Autenticado! Navegando para http://localhost:3000/mercado...");
  await page.goto("http://localhost:3000/mercado", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));

  fs.mkdirSync("/home/ubuntu/screenshots/ia", { recursive: true });

  // 1. Screenshot Forecast IA
  console.log("📸 Capturando Aba 1: Previsão de Faturamento IA...");
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia/01-forecast-ia-real.png", fullPage: false });

  // 2. Clicar em Reativação & Churn IA
  console.log("Auditando Aba 2: Reativação & Churn IA...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Reativação & Churn IA"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia/02-reativacao-ia-real.png", fullPage: false });

  // 3. Clicar em Buracos de Ociosidade
  console.log("Auditando Aba 3: Buracos de Ociosidade...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Buracos de Ociosidade"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia/03-buracos-ociosidade-real.png", fullPage: false });

  // 4. Testar Seletor Multinegócio para Barbearia Dino
  console.log("Auditando Seletor Multinegócio (Barbearia Dino)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Barbearia Dino"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia/04-multinegocio-dino-real.png", fullPage: false });

  // 5. Voltar para Forecast IA com Barbearia Dino calibrada
  console.log("Auditando Forecast IA com Barbearia Dino...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Previsão Faturamento IA"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia/05-forecast-dino-real.png", fullPage: false });

  await browser.close();
  console.log("🎉 AUDITORIA COMPLETA DE IA E MERCADO CONCLUÍDA COM SUCESSO!");
})().catch(err => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
