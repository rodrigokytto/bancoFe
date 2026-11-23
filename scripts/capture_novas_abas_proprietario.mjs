import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/mesas_copilot_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log(`Iniciando validação do Cockpit do Proprietário em ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  try {
    // 1. Login inicial rápido com perfil Rodrigo
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fillBtn = btns.find(b => b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher'));
      if (fillBtn) fillBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.textContent.includes('Entrar'));
      if (enterBtn) enterBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 2. Navegar para o Cockpit do Proprietário
    console.log('Navegando para /proprietario...');
    await page.goto(`${BASE_URL}/proprietario`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Visão Geral
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_1_visao_real.png') });
    console.log('Capturado: proprietario_1_visao_real.png');

    // Aba 2: Tomada de Decisão & Simulador What-If
    console.log('Clicando na aba Tomada de Decisão (Simulador What-If)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Tomada de Decisão'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Interagir com os sliders do Simulador
    await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      if (sliders[0]) {
        sliders[0].value = '85';
        sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
        sliders[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (sliders[1]) {
        sliders[1].value = '350';
        sliders[1].dispatchEvent(new Event('input', { bubbles: true }));
        sliders[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_9_simulador_what_if.png') });
    console.log('Capturado: proprietario_9_simulador_what_if.png');

    // Aba 3: Fases Expansão MT
    console.log('Clicando na aba Fases Expansão MT...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fases Expansão MT'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_10_fases_expansao_mt.png') });
    console.log('Capturado: proprietario_10_fases_expansao_mt.png');

    // Aba 4: Cohorts & LTV
    console.log('Clicando na aba Cohorts & LTV...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Cohorts & LTV'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_11_cohorts_ltv.png') });
    console.log('Capturado: proprietario_11_cohorts_ltv.png');

    // Aba 5: Fontes & APIs
    console.log('Clicando na aba Fontes & APIs...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fontes & APIs'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_6_fontes_apis_vivas.png') });
    console.log('Capturado: proprietario_6_fontes_apis_vivas.png');

    // Aba 6: Ranking Digital
    console.log('Clicando na aba Ranking Digital...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Ranking Digital'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_7_ranking_digital.png') });
    console.log('Capturado: proprietario_7_ranking_digital.png');

    // Aba 7: Radar Tangará
    console.log('Clicando na aba Radar Tangará...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Radar Tangará'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_8_radar_concorrencial_links.png') });
    console.log('Capturado: proprietario_8_radar_concorrencial_links.png');

    console.log('Todas as abas foram validadas e capturadas com sucesso!');
  } catch (err) {
    console.error('Erro na validação das abas:', err);
  } finally {
    await browser.close();
  }
}

main();
