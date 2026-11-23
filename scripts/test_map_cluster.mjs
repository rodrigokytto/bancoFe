import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-kytto-ia';

async function testMapCluster() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Clicar na aba Fila
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
    if (btnFila) btnFila.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Roteirizar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes('Roteirizar Lote'));
    if (btnOtimizar) btnOtimizar.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Voltar para aba GPS
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnGps = btns.find(b => b.textContent && b.textContent.includes('GPS'));
    if (btnGps) btnGps.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mapa_cluster_10_entregas.png'), fullPage: false });
  console.log('Salvo: 08_mapa_cluster_10_entregas.png');

  await browser.close();
}

testMapCluster();
