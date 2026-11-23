import puppeteer from 'puppeteer-core';
import fs from 'fs';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando navegador Chromium para validar novas funcionalidades...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // 1. Acessa tela pública do Passaporte do Salmão
  console.log('1. Acessando /passaporte-salmao...');
  await page.goto('http://localhost:3000/passaporte-salmao', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/zuma_passaporte_salmao_publico.png`, fullPage: false });
  console.log('Screenshot salva: zuma_passaporte_salmao_publico.png');

  // 2. Acessa /login e preenche
  console.log('2. Acessando login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar no Zuma'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 3. Acessa /ultra
  console.log('3. Acessando /ultra...');
  await page.goto('http://localhost:3000/ultra', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // Clica na aba Passaporte Salmão 360°
  console.log('4. Clicando na aba Passaporte Salmão 360°...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tabBtn = btns.find(b => b.textContent && b.textContent.includes('Passaporte Salmão'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/zuma_ultra_tab6_passaporte.png`, fullPage: false });
  console.log('Screenshot salva: zuma_ultra_tab6_passaporte.png');

  // Clica no botão "Ver Laudo Técnico" do primeiro lote
  console.log('5. Abrindo modal de Laudo Técnico do Salmão...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const laudoBtn = btns.find(b => b.textContent && b.textContent.includes('Ver Laudo Técnico'));
    if (laudoBtn) laudoBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/zuma_ultra_modal_passaporte_laudo.png`, fullPage: false });
  console.log('Screenshot salva: zuma_ultra_modal_passaporte_laudo.png');

  // Fecha modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.textContent && b.textContent.includes('Fechar'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Clica na aba Gatilhos Inteligentes (Smart Rules)
  console.log('6. Clicando na aba Gatilhos Inteligentes (Smart Rules)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tabBtn = btns.find(b => b.textContent && b.textContent.includes('Gatilhos Inteligentes'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/zuma_ultra_tab7_smart_triggers.png`, fullPage: false });
  console.log('Screenshot salva: zuma_ultra_tab7_smart_triggers.png');

  // Simula disparo de um gatilho
  console.log('7. Disparando gatilho de teste...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const triggerBtn = btns.find(b => b.textContent && b.textContent.includes('Simular Disparo'));
    if (triggerBtn) triggerBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/zuma_ultra_trigger_disparado.png`, fullPage: false });
  console.log('Screenshot salva: zuma_ultra_trigger_disparado.png');

  await browser.close();
  console.log('Validação visual concluída com sucesso!');
}

run().catch((err) => {
  console.error('Erro na validação Puppeteer:', err);
  process.exit(1);
});
