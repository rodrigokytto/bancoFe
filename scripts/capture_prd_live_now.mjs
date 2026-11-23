import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-prd-live';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPrdCapture() {
  console.log('🌐 Acessando ambiente de Produção Oficial: https://zuma.kytto.com.br/entregador...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto('https://zuma.kytto.com.br/entregador', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_prd_live_navegacao.png') });
  console.log('📸 01_prd_live_navegacao.png capturada');

  // Testar clique na aba Fila em PRD
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
    if (btnFila) btnFila.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_prd_live_fila.png') });
  console.log('📸 02_prd_live_fila.png capturada');

  // Clicar em Otimizar Lote em PRD
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnOtimizar = btns.find(b => b.textContent && (b.textContent.includes('Roteirizar Lote') || b.textContent.includes('Otimizar')));
    if (btnOtimizar) btnOtimizar.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_prd_live_circuito_10_pedidos.png') });
  console.log('📸 03_prd_live_circuito_10_pedidos.png capturada');

  await browser.close();
  console.log('✅ Captura ao vivo de PRD concluída!');
}

runPrdCapture().catch(e => {
  console.error('Erro ao capturar PRD:', e);
  process.exit(1);
});
