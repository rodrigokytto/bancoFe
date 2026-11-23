import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_dr_clima';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
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

  // Acessa /dr-clima
  console.log('Navegando para http://localhost:3000/dr-clima...');
  await page.goto('http://localhost:3000/dr-clima', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturando 01_dr_clima_visao_geral_topo.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dr_clima_visao_geral_topo.png'), fullPage: false });

  // Scroll para ver Simulador e DRE
  await page.evaluate(() => window.scrollBy(0, 480));
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturando 02_dr_clima_simulador_dre.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dr_clima_simulador_dre.png'), fullPage: false });

  // Scroll para ver 7 Dias e Janela do Jantar
  await page.evaluate(() => window.scrollBy(0, 520));
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturando 03_dr_clima_7dias_jantar.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dr_clima_7dias_jantar.png'), fullPage: false });

  // Scroll para ver Cardápio e Plano IA
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturando 04_dr_clima_ia_disparo.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dr_clima_ia_disparo.png'), fullPage: false });

  // Clica na aba "Previsão 7 Dias & Janela Jantar"
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Previsão 7 Dias'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturando 05_dr_clima_aba_previsao.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dr_clima_aba_previsao.png'), fullPage: false });

  await browser.close();
  console.log('Capturas concluídas com sucesso!');
}

run().catch(console.error);
