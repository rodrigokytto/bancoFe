import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-kytto-ia';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureEntregador() {
  console.log('Capturando telas da Aba Fila (10 Entregas) da IA Kytto...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  try {
    await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Clicar na aba "Fila"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
      if (btnFila) btnFila.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Captura da tela da Fila de 10 entregas com IA Kytto Multiobjetivo
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_kytto_multiobjetivo_10_entregas.png'), fullPage: false });
    console.log('Salvo: 01_kytto_multiobjetivo_10_entregas.png');

    // Scroll para baixo para ver a lista de paradas com justificativas da IA
    await page.evaluate(() => window.scrollBy(0, 480));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_paradas_justificativa_ia.png'), fullPage: false });
    console.log('Salvo: 02_paradas_justificativa_ia.png');

    // Scroll mais para baixo para ver paradas subsequentes
    await page.evaluate(() => window.scrollBy(0, 480));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02b_paradas_itens_frescor.png'), fullPage: false });
    console.log('Salvo: 02b_paradas_itens_frescor.png');

    // Scroll para o topo
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // 2. Clicar na estratégia 'Prioridade SLA (FIFO)'
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnFifo = btns.find(b => b.textContent && b.textContent.includes('Prioridade SLA (FIFO)'));
      if (btnFifo) btnFifo.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_estrategia_fifo_sla.png'), fullPage: false });
    console.log('Salvo: 03_estrategia_fifo_sla.png');

    // 3. Clicar na estratégia 'Qualidade Térmica'
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnTermico = btns.find(b => b.textContent && b.textContent.includes('Qualidade Térmica'));
      if (btnTermico) btnTermico.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_estrategia_qualidade_termica.png'), fullPage: false });
    console.log('Salvo: 04_estrategia_qualidade_termica.png');

    // 4. Voltar para 'IA Kytto Multiobjetivo' e capturar a página inteira
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnKytto = btns.find(b => b.textContent && b.textContent.includes('Multiobjetivo'));
      if (btnKytto) btnKytto.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_pagina_completa_10_entregas.png'), fullPage: true });
    console.log('Salvo: 05_pagina_completa_10_entregas.png');

    console.log('Todas as capturas da Aba Fila concluídas com sucesso!');
  } catch (err) {
    console.error('Erro na captura:', err);
  } finally {
    await browser.close();
  }
}

captureEntregador();
