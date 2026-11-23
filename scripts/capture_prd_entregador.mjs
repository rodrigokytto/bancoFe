import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-rotas-tangara';

async function testPrdLive() {
  console.log('Testando produção: https://zuma.kytto.com.br/entregador...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  try {
    await page.goto('https://zuma.kytto.com.br/entregador', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'prd_01_entregador_live.png') });
    console.log('Salvo: prd_01_entregador_live.png');

    // Testar alternância de perfil em PRD
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnMenor = btns.find(b => b.textContent && b.textContent.includes('Menor Trajeto'));
      if (btnMenor) btnMenor.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'prd_02_menor_trajeto_live.png') });
    console.log('Salvo: prd_02_menor_trajeto_live.png');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnChuva = btns.find(b => b.textContent && b.textContent.includes('Segura Chuva'));
      if (btnChuva) btnChuva.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'prd_03_segura_chuva_live.png') });
    console.log('Salvo: prd_03_segura_chuva_live.png');

  } catch (e) {
    console.error('Erro em PRD:', e);
  } finally {
    await browser.close();
  }
}

testPrdLive();
