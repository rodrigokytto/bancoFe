import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// O usuário indicou a URL direta do Cloud Run: https://zuma-731517331463.southamerica-east1.run.app
// e o domínio corporativo: https://zuma.kytto.com.br
const PRD_BASE_URL = 'https://zuma-731517331463.southamerica-east1.run.app';

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 VALIDANDO PRODUÇÃO GOOGLE CLOUD RUN: ${PRD_BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // 1. Acessa login em produção
  console.log(`1. Acessando login: ${PRD_BASE_URL}/login...`);
  await page.goto(`${PRD_BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Preencher acesso
  console.log('Preenchendo credenciais...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Clica em Entrar
  console.log('Clicando em Entrar...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar no Zuma Pilot'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // 2. Navega para /mercado em produção
  console.log(`2. Acessando /mercado em produção: ${PRD_BASE_URL}/mercado...`);
  await page.goto(`${PRD_BASE_URL}/mercado`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await new Promise(r => setTimeout(r, 4000));

  console.log('📸 01_prd_mercado_hub_apis_kpis.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_prd_mercado_hub_apis_kpis.png'), fullPage: false });

  // 3. Clica na aba Concorrentes
  console.log('3. Clicando na aba Concorrentes...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Concorrentes'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('📸 02_prd_radar_concorrentes_multissetorial.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_prd_radar_concorrentes_multissetorial.png'), fullPage: false });

  // 4. Testar filtro Hamburguerias
  console.log('4. Clicando no filtro Hamburguerias...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Hamburguerias'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 1000));

  console.log('📸 03_prd_hamburguerias_ivans_santa_chapa.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_prd_hamburguerias_ivans_santa_chapa.png'), fullPage: false });

  // 5. Testar filtro Pizzarias
  console.log('5. Clicando no filtro Pizzarias & Forno...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Pizzarias & Forno'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 1000));

  console.log('📸 04_prd_pizzarias_babbo_giovanni_dtalia.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_prd_pizzarias_babbo_giovanni_dtalia.png'), fullPage: false });

  // 6. Testar aba Dr. Clima
  console.log('6. Clicando na aba Dr. Clima & Operação Chuva...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Dr. Clima'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('📸 05_prd_dr_clima_tempo_real.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_prd_dr_clima_tempo_real.png'), fullPage: false });

  // 7. Testar War Room
  console.log('7. Clicando na aba War Room...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('War Room'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('📸 06_prd_war_room_tomar_acoes.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_prd_war_room_tomar_acoes.png'), fullPage: false });

  await browser.close();
  console.log(`\n🎉 VALIDAÇÃO DE PRODUÇÃO CONCLUÍDA COM SUCESSO!`);
}

run().catch(err => {
  console.error('Erro na validação de produção:', err);
  process.exit(1);
});
