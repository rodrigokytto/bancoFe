import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium para validação em PRD (https://zuma.kytto.com.br)...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Acesso à tela de login
  console.log("1. Acessando https://zuma.kytto.com.br/login...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('button', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Clica no botão de preencher acesso rápido
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && (b.innerText.includes('Preencher Acesso') || b.innerText.includes('Rodrigo')));
    if (btn) btn.click();
  });
  console.log("   - Credenciais preenchidas.");
  await new Promise(r => setTimeout(r, 800));

  // Clica no botão Entrar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.getAttribute('type') === 'submit' || (b.innerText && b.innerText.includes('Entrar')));
    if (btn) btn.click();
  });
  console.log("   - Login submetido.");
  await new Promise(r => setTimeout(r, 3500));

  // 2. Validação da Frente de Caixa (/pdv)
  console.log("2. Acessando https://zuma.kytto.com.br/pdv...");
  await page.goto('https://zuma.kytto.com.br/pdv', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('aside', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/01-prd-pdv-menu-padronizado.png` });
  console.log("   - [OK] Captura 01: PDV com menu padronizado salva.");

  // 3. Validação do Cockpit (/cockpit) e Dropdown de Módulos
  console.log("3. Acessando https://zuma.kytto.com.br/cockpit...");
  await page.goto('https://zuma.kytto.com.br/cockpit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('aside', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // Abre dropdown do seletor de módulos
  const dropdownTrigger = await page.$('aside button[title*="alternar entre os Módulos"]');
  if (dropdownTrigger) {
    await dropdownTrigger.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `${screenshotDir}/02-prd-dropdown-modulos-aberto.png` });
    console.log("   - [OK] Captura 02: Dropdown de módulos em PRD salva.");
  }

  // 4. Validação da Central de Apps (/apps)
  console.log("4. Acessando https://zuma.kytto.com.br/apps...");
  await page.goto('https://zuma.kytto.com.br/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('aside', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/03-prd-central-apps-e-apks.png` });
  console.log("   - [OK] Captura 03: Central de Apps e APKs em PRD salva.");

  // 5. Validação Mobile Drawer (390 x 844)
  console.log("5. Testando versão mobile em PRD...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://zuma.kytto.com.br/cockpit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  const mobileMenuBtn = await page.$('button[aria-label="Abrir menu"]');
  if (mobileMenuBtn) {
    await mobileMenuBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `${screenshotDir}/04-prd-mobile-drawer.png` });
    console.log("   - [OK] Captura 04: Drawer mobile padronizado em PRD salva.");
  }

  await browser.close();
  console.log("\nValidação em PRD finalizada com sucesso!");
}

run().catch(err => {
  console.error("Erro na validação em PRD:", err);
  process.exit(1);
});
