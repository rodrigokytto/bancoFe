import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('📱 Acessando http://localhost:3000/garcom ...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));

  // Clicar na Mesa 03
  console.log('🍽️ Clicando na Mesa 03...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const mesa03 = cards.find(el => el.innerText && el.innerText.includes('03') && el.innerText.includes('235,29'));
    if (mesa03) mesa03.click();
    else {
      const tabMesa = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mesa 03'));
      if (tabMesa) tabMesa.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  // Tirar screenshot da tela da Mesa 03
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tela_mesa_03.png') });
  console.log('📸 Tela da Mesa 03 salva.');

  // Procurar botão de fechar conta / pagar
  console.log('💳 Procurando botão de Fechar Conta / Pagamento...');
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
  });
  console.log('Botões visíveis na Mesa 03:', buttons);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => 
      b.innerText.toLowerCase().includes('fechar') || 
      b.innerText.toLowerCase().includes('pagamento') || 
      b.innerText.toLowerCase().includes('conta') ||
      b.innerText.toLowerCase().includes('encerrar')
    );
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  // Screenshot do modal de pagamento
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_pagamento_aberto.png') });
  console.log('📸 Modal de pagamento capturado.');

  await browser.close();
}

run().catch(console.error);
