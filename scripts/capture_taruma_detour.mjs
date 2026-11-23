import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-rotas-tangara';

async function captureDetour() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000/entregador', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Clica na aba Fila
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
    if (btnFila) btnFila.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Clica no card do 3º pedido (Lucas Ferreira)
  await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'));
    const card = allDivs.find(d => d.textContent && d.textContent.includes('Lucas Ferreira') && d.textContent.includes('Jardim Tarumã') && d.getAttribute('class')?.includes('cursor-pointer'));
    if (card) {
      card.click();
    } else {
      // Procura qualquer div com o texto e sobe pro cursor-pointer
      const textNode = allDivs.find(d => d.textContent && d.textContent.includes('Lucas Ferreira'));
      const clickable = textNode?.closest('.cursor-pointer');
      if (clickable) clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // Garante que está na aba GPS
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnGps = btns.find(b => b.textContent && b.textContent.includes('GPS'));
    if (btnGps) btnGps.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Captura no modo Mais Rápida para Tarumã
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'taruma_01_mais_rapida.png') });
  console.log('Salvo: taruma_01_mais_rapida.png');

  // Alterna para Menor Trajeto
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Menor Trajeto'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'taruma_02_menor_trajeto.png') });
  console.log('Salvo: taruma_02_menor_trajeto.png');

  // Alterna para Segura Chuva
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Segura Chuva'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'taruma_03_segura_chuva_desvio.png') });
  console.log('Salvo: taruma_03_segura_chuva_desvio.png');

  // Rola para baixo para ver os links de navegação externa (Google Maps, Waze)
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'taruma_04_links_google_maps_detour.png') });
  console.log('Salvo: taruma_04_links_google_maps_detour.png');

  await browser.close();
}

captureDetour();
