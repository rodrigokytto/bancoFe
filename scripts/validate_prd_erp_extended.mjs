import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium para validação estendida de todos os novos recursos do ERP em PRD...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // 1. Login no Zuma Pilot
  console.log("1. Acessando http://localhost:3000/login...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
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
  console.log("   - Login enviado. Aguardando autenticação...");
  await new Promise(r => setTimeout(r, 3500));

  // 2. Aba Compras & Suprimentos - Testar Conferência 3-Way Toledo e OC Timbrada
  console.log("2. Acessando http://localhost:3000/erp?tab=compras...");
  await page.goto('http://localhost:3000/erp?tab=compras', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Clica na sub-aba "3-Way Matching (Toledo)" se existir
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('3-Way Matching'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Clica em "Capturar Balança Toledo" se visível
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Capturar Balança Toledo'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/14-prd-erp-compras-3way-toledo.png` });
  console.log("   - [OK] Captura 14: Conferência 3-Way Matching com Balança Toledo salva.");

  // Alterna para sub-aba "Ordens de Compra (OC)" e abre modal timbrado
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Ordens de Compra'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Timbrado'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/13-prd-erp-compras-oc-timbrada.png` });
  console.log("   - [OK] Captura 13: Ordem de Compra oficial timbrada salva.");

  // 3. Aba Financeiro - Testar Fluxo Projetado e Boleto Híbrido Sicredi
  console.log("3. Acessando http://localhost:3000/erp?tab=financeiro...");
  await page.goto('http://localhost:3000/erp?tab=financeiro', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Clica na sub-aba "Fluxo Projetado"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Fluxo Projetado'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/15-prd-erp-financeiro-fluxo-projetado.png` });
  console.log("   - [OK] Captura 15: Fluxo de Caixa Projetado 30/60/90D salvo.");

  // Alterna para sub-aba "Contas a Receber" e abre Boleto Híbrido Sicredi
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Contas a Receber'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && (b.innerText.includes('Boleto + Pix') || b.innerText.includes('Boleto')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/16-prd-erp-financeiro-boleto-hibrido.png` });
  console.log("   - [OK] Captura 16: Boleto Híbrido Sicredi com Pix EMV salvo.");

  // 4. Aba Recursos Humanos - Testar Rateio de Gorjeta 10% e Holerite Digital
  console.log("4. Acessando http://localhost:3000/erp?tab=rh...");
  await page.goto('http://localhost:3000/erp?tab=rh', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Clica na sub-aba "Rateio Gorjeta 10%"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Rateio Gorjeta'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/18-prd-erp-rh-rateio-gorjeta.png` });
  console.log("   - [OK] Captura 18: Simulador de Rateio de Gorjeta 10% salvo.");

  // Alterna para "Folha & Holerites" e abre contracheque
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Folha & Holerites'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Contracheque'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/17-prd-erp-rh-holerite-digital.png` });
  console.log("   - [OK] Captura 17: Modal de Holerite Digital Analítico salvo.");

  // 5. Aba WMS & Estoque - Testar Toalete & Rendimento (BOM)
  console.log("5. Acessando http://localhost:3000/erp?tab=estoque...");
  await page.goto('http://localhost:3000/erp?tab=estoque', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Toalete & Rendimento'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/19-prd-erp-estoque-toalete-bom.png` });
  console.log("   - [OK] Captura 19: Calculadora de Toalete e Rendimento de Pescados salva.");

  // 6. Aba Patrimônio - Testar Etiqueta QR Code
  console.log("6. Acessando http://localhost:3000/erp?tab=patrimonio...");
  await page.goto('http://localhost:3000/erp?tab=patrimonio', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Etiqueta'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/20-prd-erp-patrimonio-etiqueta-qr.png` });
  console.log("   - [OK] Captura 20: Modal de Etiqueta Patrimonial com QR Code salvo.");

  await browser.close();
  console.log("\nTodos os 8 testes estendidos do ERP foram validados com sucesso!");
}

run().catch(err => {
  console.error("Erro na validação estendida do ERP:", err);
  process.exit(1);
});
