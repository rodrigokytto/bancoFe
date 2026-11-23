import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium para validação dos novos recursos do ERP em PRD (https://zuma.kytto.com.br/erp)...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // 1. Login
  console.log("1. Acessando https://zuma.kytto.com.br/login...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('button', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && (b.innerText.includes('Preencher Acesso') || b.innerText.includes('Rodrigo')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.getAttribute('type') === 'submit' || (b.innerText && b.innerText.includes('Entrar')));
    if (btn) btn.click();
  });
  console.log("   - Login enviado. Aguardando...");
  await new Promise(r => setTimeout(r, 3500));

  // 2. Acesso à Central ERP
  console.log("2. Acessando https://zuma.kytto.com.br/erp...");
  await page.goto('https://zuma.kytto.com.br/erp', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('aside', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  // Captura do Topo do ERP com KPIs e DRE Multi-Empresa
  await page.screenshot({ path: `${screenshotDir}/09-prd-erp-kpis-dre-multiempresa.png` });
  console.log("   - [OK] Captura 09: Topo do ERP com KPIs e DRE Multi-Empresa salva.");

  // 3. Teste do Modal "Exportar Relatórios (.CSV)"
  console.log("3. Abrindo Modal 'Exportar Relatórios (.CSV)'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Exportar Relatórios'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/10-prd-erp-modal-exportar-csv.png` });
  console.log("   - [OK] Captura 10: Modal de Exportação CSV salvo.");

  // Fecha o modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Fechar');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 4. Teste do Modal "Auditoria 360°"
  console.log("4. Abrindo Modal 'Auditoria 360°'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Auditoria 360°'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/11-prd-erp-modal-auditoria-360.png` });
  console.log("   - [OK] Captura 11: Modal de Auditoria 360° salvo.");

  // Fecha o modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Fechar');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 5. Teste de Deep Linking com Query Param (?tab=estoque)
  console.log("5. Testando Deep Linking direto para https://zuma.kytto.com.br/erp?tab=estoque...");
  await page.goto('https://zuma.kytto.com.br/erp?tab=estoque', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/12-prd-erp-tab-estoque-wms.png` });
  console.log("   - [OK] Captura 12: Aba Estoque WMS via Deep Linking salva.");

  await browser.close();
  console.log("\nValidação em PRD do ERP finalizada com sucesso!");
}

run().catch(err => {
  console.error("Erro na validação do ERP em PRD:", err);
  process.exit(1);
});
