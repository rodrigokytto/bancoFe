import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando validação na PRODUÇÃO https://zuma.kytto.com.br...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log("Navegando para https://zuma.kytto.com.br/login...");
  await page.goto("https://zuma.kytto.com.br/login", { waitUntil: "networkidle2" });
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

  console.log("Navegando para https://zuma.kytto.com.br/mercado...");
  await page.goto("https://zuma.kytto.com.br/mercado", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  fs.mkdirSync("/home/ubuntu/screenshots/ia-prd-final", { recursive: true });

  // 1. Screenshot Gastronomia Oficial em Produção
  console.log("📸 1. Capturando Zuma Gastronomia Oficial em PRD...");
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd-final/01-prd-zuma-gastronomia.png", fullPage: false });

  // 2. Clicar em Zuma Loja de Roupas
  console.log("📸 2. Clicando em Zuma Loja de Roupas em PRD...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Zuma Loja de Roupas"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd-final/02-prd-zuma-roupas-previsao.png", fullPage: false });

  // 3. Clicar em Reativação & Churn IA
  console.log("📸 3. Clicando na aba Reativação em PRD...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Reativação & Churn IA"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/ia-prd-final/03-prd-zuma-roupas-reativacao.png", fullPage: false });

  await browser.close();
  console.log("Validação em produção concluída com êxito!");
})();
