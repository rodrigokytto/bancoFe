import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria da correção de Unidades Zuma...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log("Navegando para login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Preencher Acesso Rodrigo"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Entrar no Zuma Pilot"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log("Navegando para Mercado & IA...");
  await page.goto("http://localhost:3000/mercado", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1200));

  fs.mkdirSync("/home/ubuntu/screenshots/ia-correcao", { recursive: true });

  // 1. Screenshot Gastronomia
  console.log("📸 1. Capturando Zuma Gastronomia Oficial...");
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-correcao/01-zuma-gastronomia.png", fullPage: false });

  // 2. Clicar em Zuma Loja de Roupas
  console.log("📸 2. Clicando em Zuma Loja de Roupas & Moda...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Zuma Loja de Roupas"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-correcao/02-zuma-roupas-previsao.png", fullPage: false });

  // 3. Clicar em Reativação & Churn IA
  console.log("📸 3. Clicando na aba Reativação & Churn IA (Loja de Roupas)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Reativação & Churn IA"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-correcao/03-zuma-roupas-reativacao.png", fullPage: false });

  // 4. Clicar em Buracos de Ociosidade
  console.log("📸 4. Clicando na aba Buracos de Ociosidade (Loja de Roupas)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Buracos de Ociosidade"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-correcao/04-zuma-roupas-buracos.png", fullPage: false });

  await browser.close();
  console.log("Auditoria visual finalizada com sucesso!");
})();
