import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-live';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const authSession = JSON.stringify({
  id: 1,
  openId: "zuma-admin-rodrigo",
  name: "Rodrigo Ribeiro Gonçalves",
  email: "rodrigo@kytto.com.br",
  role: "admin",
  cargo: "Sócio Fundador & Operações",
  unidade: "Tangará da Serra (MT)"
});

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((authData) => {
    localStorage.setItem('zuma_auth_session', authData);
    sessionStorage.setItem('zuma_auth_session', authData);
  }, authSession);

  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await delay(1200);

  // Abrir Mesa 03
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find(el => el.childNodes.length === 1 && el.textContent && el.textContent.trim().startsWith('Mesa 03'));
    if (target) {
      const card = target.closest('div.cursor-pointer') || target;
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(1200);

  // Clicar no botão "Pagar na Mesa & Despachar"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnPagar = buttons.find(b => b.textContent && b.textContent.includes('Pagar na Mesa & Despachar'));
    if (btnPagar) btnPagar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(1200);

  // Clicar diretamente no método Cotas na Mesa
  console.log("Clicando em Cotas na Mesa...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCotas = buttons.find(b => b.textContent && b.textContent.includes('Cotas na Mesa'));
    if (btnCotas) btnCotas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(800);

  // Marcar as 2 primeiras cotas como pagas
  console.log("Marcando 2 cotas como pagas na mesa...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div[class*="rounded-xl border flex items-center"]'));
    if (cards.length > 0) cards[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    if (cards.length > 1) cards[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(600);

  console.log("Capturando 22-live-modal-pagamento-mesa-cotas-divididas.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '22-live-modal-pagamento-mesa-cotas-divididas.png'),
    fullPage: false
  });

  await browser.close();
  console.log("Captura de cotas na mesa concluída!");
}

run().catch(console.error);
