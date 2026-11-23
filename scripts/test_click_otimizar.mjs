import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-kytto-ia';

async function testClickOtimizar() {
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
  await new Promise(r => setTimeout(r, 1500));

  // 2. Clicar no botão 'IAKytto Roteirizar Lote (10 Entregas)'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes('Roteirizar Lote'));
    if (btnOtimizar) {
      console.log('Clicando em:', btnOtimizar.textContent);
      btnOtimizar.click();
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  // 3. Capturar tela com o painel de telemetria IA Kytto renderizado
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_telemetria_ia_painel_ativo.png'), fullPage: false });
  console.log('Salvo: 06_telemetria_ia_painel_ativo.png');

  // Scroll um pouco para ver as paradas com o motivo da decisão da IA Kytto
  await page.evaluate(() => window.scrollBy(0, 520));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_paradas_com_motivo_ia.png'), fullPage: false });
  console.log('Salvo: 07_paradas_com_motivo_ia.png');

  await browser.close();
  console.log('Finalizado com sucesso!');
}

testClickOtimizar();
