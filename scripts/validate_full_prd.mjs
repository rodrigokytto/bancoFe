import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/mesas_copilot_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log(`Iniciando bateria completa de validação em ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 1. Login inicial
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fillBtn = btns.find(b => b.textContent && (b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher')));
      if (fillBtn) fillBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar'));
      if (enterBtn) enterBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 2. Cockpit do Proprietário com Card Ultra Vision
    console.log('Validando Cockpit do Proprietário com Card Ultra Vision...');
    await page.goto(`${BASE_URL}/proprietario`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proprietario_com_ultra_vision.png') });
    console.log('Capturado: proprietario_com_ultra_vision.png');

    // 3. Radar de Concorrentes com 10 estabelecimentos
    console.log('Validando Radar de Concorrentes...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const radarBtn = btns.find(b => b.textContent && b.textContent.includes('Radar Tangará'));
      if (radarBtn) radarBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'radar_concorrentes_10_estabelecimentos.png') });
    console.log('Capturado: radar_concorrentes_10_estabelecimentos.png');

    // 4. Central de Câmeras Ultra Vision AI
    console.log('Validando Central de Câmeras Ultra Vision AI...');
    await page.goto(`${BASE_URL}/cameras`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ultra_vision_cameras_cftv_4k.png') });
    console.log('Capturado: ultra_vision_cameras_cftv_4k.png');

    // 5. Comparativo Saipos vs Zuma Pilot
    console.log('Validando Comparativo Saipos...');
    await page.goto(`${BASE_URL}/comparativo-saipos`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'comparativo_saipos_zuma_completo.png') });
    console.log('Capturado: comparativo_saipos_zuma_completo.png');

    // 6. Visualização Mobile (iPhone 14 Pro - 393 x 852)
    console.log('Validando layout responsivo mobile...');
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/cockpit`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_cockpit_responsivo.png') });
    console.log('Capturado: mobile_cockpit_responsivo.png');

    // Abrir menu lateral gaveta no celular
    console.log('Abrindo menu gaveta lateral no celular...');
    await page.evaluate(() => {
      const menuBtn = document.querySelector('button[aria-label="Abrir menu"]');
      if (menuBtn) menuBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_menu_gaveta_aberto.png') });
    console.log('Capturado: mobile_menu_gaveta_aberto.png');

    console.log('Todas as validações foram executadas com sucesso!');
  } catch (err) {
    console.error('Erro na bateria de validação:', err);
  } finally {
    await browser.close();
  }
}

main();
