import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/mesas_copilot_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log(`Capturando evidências visuais das 12 Fontes e Automações 360° em ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  try {
    // Login
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

    // Navegar para /proprietario
    console.log('Navegando para /proprietario...');
    await page.goto(`${BASE_URL}/proprietario`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Clicar na aba Fontes & APIs (12 Vivas)
    console.log('Clicando na aba Fontes & APIs...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fontes & APIs'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_12_fontes_12_apis.png') });
    console.log('Capturado: proprietario_12_fontes_12_apis.png');

    // 2. Clicar na aba Automações 360° (8 Robôs)
    console.log('Clicando na aba Automações 360°...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Automações 360°') || b.textContent.includes('Automações'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_13_automacoes_360.png') });
    console.log('Capturado: proprietario_13_automacoes_360.png');

    // 3. Testar disparo de um robô
    console.log('Clicando em Testar Disparo Agora do primeiro robô...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Testar Disparo Agora'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_14_automacoes_disparo_teste.png') });
    console.log('Capturado: proprietario_14_automacoes_disparo_teste.png');

    console.log('Capturas concluídas com sucesso!');
  } catch (err) {
    console.error('Erro na captura:', err);
  } finally {
    await browser.close();
  }
}

main();
