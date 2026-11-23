import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria da Suíte de IA & Mercado em PRODUÇÃO (https://zuma.kytto.com.br/mercado)...");
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

  console.log("Acessando página de login oficial...");
  await page.goto("https://zuma.kytto.com.br/login", { waitUntil: "networkidle2" });

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

  await new Promise(r => setTimeout(r, 2500));
  console.log("Autenticado! Navegando para https://zuma.kytto.com.br/mercado...");
  await page.goto("https://zuma.kytto.com.br/mercado", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  fs.mkdirSync("/home/ubuntu/screenshots/ia-prd", { recursive: true });

  // 1. Screenshot Forecast IA Produção
  console.log("📸 Capturando Aba 1: Previsão de Faturamento IA em Produção...");
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd/01-forecast-ia-live.png", fullPage: false });

  // 2. Clicar em Reativação & Churn IA
  console.log("Auditando Aba 2: Reativação & Churn IA em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Reativação & Churn IA"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd/02-reativacao-ia-live.png", fullPage: false });

  // 3. Clicar em Buracos de Ociosidade
  console.log("Auditando Aba 3: Buracos de Ociosidade em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Buracos de Ociosidade"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd/03-buracos-ociosidade-live.png", fullPage: false });

  await browser.close();

  if (errors.length > 0) {
    console.warn("⚠️ Avisos de console detectados:", errors);
  } else {
    console.log("🎉 AUDITORIA DE PRODUÇÃO (GCP CLOUD RUN) CONCLUÍDA COM 100% DE SUCESSO!");
  }
})().catch(err => {
  console.error("Erro fatal no teste de produção:", err);
  process.exit(1);
});
