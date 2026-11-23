import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_mercado';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar no Zuma Pilot'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:3000/mercado', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Clica na aba Concorrentes
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Concorrentes'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Clica no filtro Hamburguerias
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Hamburguerias'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Rola um pouco para ver os cards completos de Ivan's Burger com público alvo e tabela de preços
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_ivans_burger_tabela_precos_scroll.png'), fullPage: false });

  // Agora clica em Pizzarias & Forno
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Pizzarias & Forno'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_babbo_giovanni_dtalia_scroll.png'), fullPage: false });

  // Agora clica em Carnes & Churrasco
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Carnes & Churrasco'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_la_carreta_carnes_scroll.png'), fullPage: false });

  await browser.close();
  console.log('Novos screenshots capturados com sucesso!');
}

run().catch(console.error);
