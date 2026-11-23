import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_prd_dr_clima';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TARGET_URL = 'https://zuma-731517331463.southamerica-east1.run.app';

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 AUDITORIA DE PRODUÇÃO CLOUD RUN: ${TARGET_URL}/dr-clima`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // 1. Login em Produção
  console.log(`1. Acessando login em produção: ${TARGET_URL}/login...`);
  await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar no Zuma Pilot'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // 2. Acessa /dr-clima em Produção
  console.log(`2. Acessando rota /dr-clima em PRODUÇÃO: ${TARGET_URL}/dr-clima...`);
  await page.goto(`${TARGET_URL}/dr-clima`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3500));

  console.log('📸 01_prd_dr_clima_topo.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_prd_dr_clima_topo.png'), fullPage: false });

  // 3. Scroll para ver o Simulador e DRE Marginal em Produção
  await page.evaluate(() => window.scrollBy(0, 480));
  await new Promise(r => setTimeout(r, 1000));
  console.log('📸 02_prd_dr_clima_simulador_dre.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_prd_dr_clima_simulador_dre.png'), fullPage: false });

  // 4. Scroll para ver 7 Dias e Janela do Jantar em Produção
  await page.evaluate(() => window.scrollBy(0, 520));
  await new Promise(r => setTimeout(r, 1000));
  console.log('📸 03_prd_dr_clima_7dias_jantar.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_prd_dr_clima_7dias_jantar.png'), fullPage: false });

  // 5. Scroll para ver Cardápio Térmico e Plano IA em Produção
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 1000));
  console.log('📸 04_prd_dr_clima_cardapio_ia_whatsapp.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_prd_dr_clima_cardapio_ia_whatsapp.png'), fullPage: false });

  // 6. Testar aba Simulador Financeiro & DRE
  console.log('6. Testando aba Simulador Financeiro & DRE...');
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Simulador Financeiro'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('📸 05_prd_dr_clima_aba_simulador.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_prd_dr_clima_aba_simulador.png'), fullPage: false });

  await browser.close();
  console.log(`\n🎉 AUDITORIA DE PRODUÇÃO DO DR. CLIMA CONCLUÍDA COM ÊXITO!`);
}

run().catch(err => {
  console.error('Erro na auditoria de produção:', err);
  process.exit(1);
});
