import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_mercado';
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

  // 1. Acessa login primeiro para garantir autenticação
  console.log('Acessando página de login para autenticar...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

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
  await new Promise(r => setTimeout(r, 2000));

  // 2. Agora navega para /mercado
  console.log('Navegando para http://localhost:3000/mercado...');
  await page.goto('http://localhost:3000/mercado', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Capturando 01_mercado_hub_apis_kpis.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_mercado_hub_apis_kpis.png'), fullPage: false });

  // 3. Clicar na aba Concorrentes
  console.log('Clicando na aba Concorrentes...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Concorrentes'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturando 02_radar_concorrentes_multissetorial_todos.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_radar_concorrentes_multissetorial_todos.png'), fullPage: false });

  // Scroll um pouco para ver os cards com tabelas de pratos e preços comparativos
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturando 03_cards_concorrentes_tabela_precos.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_cards_concorrentes_tabela_precos.png'), fullPage: false });

  // 4. Testar filtro por setor: Hamburguerias
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  console.log('Filtrando por Hamburguerias...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Hamburguerias'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 04_filtro_hamburguerias_ivans.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_filtro_hamburguerias_ivans.png'), fullPage: false });

  // 5. Testar filtro por setor: Pizzarias & Forno
  console.log('Filtrando por Pizzarias & Forno...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Pizzarias & Forno'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 05_filtro_pizzarias_babbo.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_filtro_pizzarias_babbo.png'), fullPage: false });

  // 6. Testar filtro por setor: Chopp & Gastrobar
  console.log('Filtrando por Chopp & Gastrobar...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Chopp & Gastrobar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 06_filtro_chopp_lugui_bahamas.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_filtro_chopp_lugui_bahamas.png'), fullPage: false });

  // 7. Clicar na aba Dr. Clima & Operação Chuva
  console.log('Clicando na aba Dr. Clima & Operação Chuva...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Dr. Clima'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturando 07_dr_clima_alertas_tempo_real.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_dr_clima_alertas_tempo_real.png'), fullPage: false });

  // 8. Clicar na aba War Room
  console.log('Clicando na aba War Room...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('War Room'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturando 08_war_room_tomar_acoes.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_war_room_tomar_acoes.png'), fullPage: false });

  await browser.close();
  console.log('Processo finalizado com sucesso! Todos os screenshots salvos em /home/ubuntu/screenshots_mercado');
}

run().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
