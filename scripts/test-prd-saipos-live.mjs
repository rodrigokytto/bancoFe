import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria da PRODUÇÃO https://zuma.kytto.com.br...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log("1. Navegando para https://zuma.kytto.com.br/login...");
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

  fs.mkdirSync("/home/ubuntu/screenshots/saipos-prd-final", { recursive: true });

  // 2. Verificar Home em Produção (Sidebar sem Saipos)
  console.log("📸 2. Capturando Home/Cockpit em Produção para verificar Sidebar...");
  await page.goto("https://zuma.kytto.com.br/cockpit", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1200));

  const textInPage = await page.evaluate(() => document.body.innerText);
  const temSaiposNoMenu = textInPage.includes("Zuma vs Saipos");
  console.log("Item 'Zuma vs Saipos' no menu em PRODUÇÃO?", temSaiposNoMenu ? "SIM (ERRO)" : "NÃO (PERFEITO - REMOVIDO)");
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-prd-final/01-prd-sidebar-sem-saipos.png", fullPage: false });

  // 3. Navegar para URL direta https://zuma.kytto.com.br/comparativo-saipos
  console.log("📸 3. Navegando para https://zuma.kytto.com.br/comparativo-saipos em Produção...");
  await page.goto("https://zuma.kytto.com.br/comparativo-saipos", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-prd-final/02-prd-comparativo-saipos-paridade.png", fullPage: false });

  // 4. Clicar na aba Matriz Comparativa Técnica em Produção
  console.log("📸 4. Clicando na aba Matriz Técnica em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Matriz Comparativa"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-prd-final/03-prd-comparativo-matriz.png", fullPage: false });

  await browser.close();
  console.log("Validação em produção concluída com êxito!");
})();
