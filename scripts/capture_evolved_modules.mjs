import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-live';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
  console.log("Iniciando Chromium via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Injetar auth no localStorage antes de navegar
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((authData) => {
    localStorage.setItem('zuma_auth_session', authData);
    sessionStorage.setItem('zuma_auth_session', authData);
  }, authSession);

  console.log("Sessão autenticada injetada!");

  // --- CAPTURA 10: KDS 2.0 Modo Comandas + Bump Bar ---
  console.log("Navegando para KDS 2.0...");
  await page.goto('http://localhost:3000/kds-v2', { waitUntil: 'networkidle2' });
  await delay(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-live-kds-comandas-bumpbar.png'), fullPage: false });
  console.log("Capturado: 10-live-kds-comandas-bumpbar.png");

  // --- CAPTURA 11: KDS 2.0 Modo All-Day ---
  console.log("Alternando para Modo All-Day no KDS 2.0...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allDayBtn = buttons.find(b => b.textContent && b.textContent.includes('All-Day'));
    if (allDayBtn) allDayBtn.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-live-kds-allday-mode.png'), fullPage: false });
  console.log("Capturado: 11-live-kds-allday-mode.png");

  // --- CAPTURA 12: Nossa Gente - Ponto Facial Biométrico REP-P ---
  console.log("Navegando para Nossa Gente...");
  await page.goto('http://localhost:3000/nossa-gente', { waitUntil: 'networkidle2' });
  await delay(2500);

  // Clicar para abrir modal ponto facial
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnPonto = buttons.find(b => b.textContent && (b.textContent.includes('Ponto Facial') || b.textContent.includes('Bater Ponto')));
    if (btnPonto) btnPonto.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-live-nossagente-ponto-facial-repp.png'), fullPage: false });
  console.log("Capturado: 12-live-nossagente-ponto-facial-repp.png");

  // --- CAPTURA 13: Nossa Gente - Barramento Interno Ultra x Nossa Gente ---
  console.log("Acessando aba Barramento Interno Ultra...");
  await page.evaluate(() => {
    const closeButtons = Array.from(document.querySelectorAll('button'));
    const btnFechar = closeButtons.find(b => b.textContent && b.textContent.includes('Fechar'));
    if (btnFechar) btnFechar.click();

    const tabButtons = Array.from(document.querySelectorAll('button'));
    const tabBus = tabButtons.find(b => b.textContent && b.textContent.includes('Barramento Interno Ultra'));
    if (tabBus) tabBus.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-live-nossagente-ultra-eventbus.png'), fullPage: false });
  console.log("Capturado: 13-live-nossagente-ultra-eventbus.png");

  // --- CAPTURA 14: Mapa de Mesas Salão 360° (Split Bill) ---
  console.log("Navegando para Mapa de Mesas Salão...");
  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await delay(2500);
  await page.evaluate(() => {
    const mesaCards = Array.from(document.querySelectorAll('div, button'));
    const cardMesa = mesaCards.find(el => el.textContent && el.textContent.includes('Mesa 01'));
    if (cardMesa) cardMesa.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-live-mapa-mesas-splitbill.png'), fullPage: false });
  console.log("Capturado: 14-live-mapa-mesas-splitbill.png");

  // --- CAPTURA 15: Dr. Clima Simulador & Plano Chuva ---
  console.log("Navegando para Dr. Clima Simulador...");
  await page.goto('http://localhost:3000/dr-clima', { waitUntil: 'networkidle2' });
  await delay(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-live-drclima-plano-chuva.png'), fullPage: false });
  console.log("Capturado: 15-live-drclima-plano-chuva.png");

  await browser.close();
  console.log("Todas as capturas dos módulos foram concluídas com sucesso!");
}

run().catch(err => {
  console.error("Erro no script Puppeteer:", err);
  process.exit(1);
});
