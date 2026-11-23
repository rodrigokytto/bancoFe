import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria: menu sem Saipos e tela de paridade total...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log("Navegando para http://localhost:3000/login...");
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

  fs.mkdirSync("/home/ubuntu/screenshots/saipos-audit", { recursive: true });

  // 1. Verificar menu lateral na página inicial
  console.log("📸 1. Verificando menu lateral na Home/Cockpit...");
  await page.goto("http://localhost:3000/cockpit", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1200));

  // Verificar se "Zuma vs Saipos" existe no menu
  const menuText = await page.evaluate(() => document.body.innerText);
  const temSaiposNoMenu = menuText.includes("Zuma vs Saipos");
  console.log("Item 'Zuma vs Saipos' presente no menu lateral?", temSaiposNoMenu ? "SIM (ERRO)" : "NÃO (CORRETO - REMOVIDO)");
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-audit/01-sidebar-sem-saipos.png", fullPage: false });

  // 2. Navegar para http://localhost:3000/comparativo-saipos
  console.log("📸 2. Navegando para http://localhost:3000/comparativo-saipos (Checklist de Paridade)...");
  await page.goto("http://localhost:3000/comparativo-saipos", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-audit/02-comparativo-saipos-paridade.png", fullPage: false });

  // 3. Alternar para a aba Matriz Comparativa Técnica
  console.log("📸 3. Clicando na aba Matriz Comparativa Técnica...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Matriz Comparativa"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: "/home/ubuntu/screenshots/saipos-audit/03-comparativo-matriz.png", fullPage: false });

  await browser.close();
  console.log("Auditoria concluída com sucesso!");
})();
