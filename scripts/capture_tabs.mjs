import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/ultra_vision';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2' });
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 2500));

  await page.goto('https://zuma.kytto.com.br/ultra', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Aba 1: Comportamento Equipe
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Comportamento Equipe')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'kytto_ultra_tab_equipe.png') });
      console.log('✅ Aba Comportamento Equipe capturada');
      break;
    }
  }

  // Aba 2: Comportamento Clientes
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Comportamento Clientes')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'kytto_ultra_tab_clientes.png') });
      console.log('✅ Aba Comportamento Clientes capturada');
      break;
    }
  }

  // Aba 3: Alertas em Tempo Real
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Alertas em Tempo Real')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'kytto_ultra_tab_alertas.png') });
      console.log('✅ Aba Alertas capturada');
      break;
    }
  }

  await browser.close();
}

run().catch(console.error);
