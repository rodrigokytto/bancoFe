import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-kytto-ia';

async function testCleanMap() {
  console.log('Capturando telas com mapa limpo e sem sobreposição...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  // Resolução exata de iPhone (414 x 896, scale 2)
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Clicar na aba Fila (10)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
    if (btnFila) btnFila.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Capturar vista inicial da Fila com o mapa limpo no topo
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_mapa_perfeito_sem_sobreposicao_fila.png'), fullPage: false });
  console.log('Salvo: 09_mapa_perfeito_sem_sobreposicao_fila.png');

  // 2. Clicar em 'IAKytto Roteirizar Lote'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes('Roteirizar Lote'));
    if (btnOtimizar) btnOtimizar.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_mapa_apos_otimizar_10_entregas.png'), fullPage: false });
  console.log('Salvo: 11_mapa_apos_otimizar_10_entregas.png');

  // Scroll para baixo na Fila para ver os KPIs e paradas
  await page.evaluate(() => window.scrollBy(0, 520));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_kpis_e_paradas_com_botoes.png'), fullPage: false });
  console.log('Salvo: 12_kpis_e_paradas_com_botoes.png');

  // Scroll de volta para o topo e alternar para a aba GPS
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnGps = btns.find(b => b.textContent && b.textContent.includes('GPS'));
    if (btnGps) btnGps.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_mapa_perfeito_sem_sobreposicao_gps.png'), fullPage: false });
  console.log('Salvo: 10_mapa_perfeito_sem_sobreposicao_gps.png');

  await browser.close();
  console.log('Capturas concluídas com sucesso!');
}

testCleanMap();
