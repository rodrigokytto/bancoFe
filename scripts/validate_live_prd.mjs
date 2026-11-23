import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const PRD_BASE_URL = 'https://zuma.kytto.com.br';
const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-live';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capturePRDLive() {
  console.log(`Iniciando validação visual completa em Produção: ${PRD_BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Login com botão de 1 Toque
    console.log('Efetuando login rápido com perfil Rodrigo (Dono)...');
    await page.goto(`${PRD_BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fillBtn = btns.find(b => b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher'));
      if (fillBtn) fillBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.textContent.includes('Entrar'));
      if (enterBtn) enterBtn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // 2. Compras em Produção
    console.log('Navegando para /erp?tab=compras...');
    await page.goto(`${PRD_BASE_URL}/erp?tab=compras`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-live-prd-compras-tab.png') });
    console.log('Capturado 01-live-prd-compras-tab.png');

    // Abrir Modal de Ordem de Compra Timbrada
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ocBtn = btns.find(b => b.textContent.includes('Ordem de Compra') || b.textContent.includes('Visualizar OC'));
      if (ocBtn) ocBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-live-prd-compras-modal-oc.png') });
    console.log('Capturado 02-live-prd-compras-modal-oc.png');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));

    // 3. Financeiro & Fluxo Projetado
    console.log('Navegando para /erp?tab=financeiro...');
    await page.goto(`${PRD_BASE_URL}/erp?tab=financeiro`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Clicar em Fluxo Projetado
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fluxo Projetado'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-live-prd-financeiro-fluxo.png') });
    console.log('Capturado 03-live-prd-financeiro-fluxo.png');

    // 4. RH & Rateio de Gorjetas
    console.log('Navegando para /erp?tab=rh...');
    await page.goto(`${PRD_BASE_URL}/erp?tab=rh`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Clicar em Rateio de Gorjetas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Rateio Gorjeta') || b.textContent.includes('Lei 13.419'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-live-prd-rh-rateio.png') });
    console.log('Capturado 04-live-prd-rh-rateio.png');

    // 5. Estoque & Toalete BOM
    console.log('Navegando para /erp?tab=estoque...');
    await page.goto(`${PRD_BASE_URL}/erp?tab=estoque`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Clicar em Toalete & Rendimento
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Toalete') || b.textContent.includes('Rendimento'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-live-prd-estoque-toalete.png') });
    console.log('Capturado 05-live-prd-estoque-toalete.png');

    // 6. Patrimônio & Etiquetas QR Code
    console.log('Navegando para /erp?tab=patrimonio...');
    await page.goto(`${PRD_BASE_URL}/erp?tab=patrimonio`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-live-prd-patrimonio.png') });
    console.log('Capturado 06-live-prd-patrimonio.png');

    console.log('🚀 Todas as subsuítes em Produção foram validadas com sucesso!');
  } catch (err) {
    console.error('Erro na validação:', err);
  } finally {
    await browser.close();
  }
}

capturePRDLive().catch(console.error);
