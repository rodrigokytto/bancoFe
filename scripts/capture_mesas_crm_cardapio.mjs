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
  await delay(500);

  console.log("Navegando para /mesas...");
  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await delay(1500);

  // 1. Abrir Modal da Mesa 03
  console.log("Clicando na Mesa 03...");
  const clicou = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find(el => el.childNodes.length === 1 && el.textContent && el.textContent.trim().startsWith('Mesa 03'));
    if (target) {
      const card = target.closest('div.cursor-pointer') || target;
      card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  });

  console.log("Resultado do clique na Mesa 03:", clicou);
  await delay(1500);

  // Selecionar modo Dividir Conta e clicar em preset 8 pessoas
  console.log("Configurando divisão para 8 pessoas...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnDividir = buttons.find(b => b.textContent && b.textContent.includes('Dividir Conta'));
    if (btnDividir) {
      btnDividir.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(600);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn8p = buttons.find(b => b.textContent && b.textContent.trim() === '8p');
    if (btn8p) {
      btn8p.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(800);

  console.log("Capturando 16-live-mapa-mesas-divisao-sem-limite.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '16-live-mapa-mesas-divisao-sem-limite.png'),
    fullPage: false
  });

  // 2. Abrir Modal do Cardápio Completo (100+ Itens)
  console.log("Abrindo Modal Cardápio Completo...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCardapio = buttons.find(b => b.textContent && b.textContent.includes('Abrir Cardápio Completo Zuma'));
    if (btnCardapio) {
      btnCardapio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(1500);

  console.log("Capturando 17-live-modal-cardapio-completo-100itens.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '17-live-modal-cardapio-completo-100itens.png'),
    fullPage: false
  });

  // Fechar Modal Cardápio
  console.log("Fechando Modal Cardápio...");
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const closeIcon = closeBtns.find(b => b.textContent && b.textContent.includes('Cancelar'));
    if (closeIcon) {
      closeIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(800);

  // 3. Abrir Modal de CRM do Cliente
  console.log("Abrindo Modal CRM do Cliente...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCrm = buttons.find(b => b.textContent && (b.textContent.includes('Vincular Cliente') || b.textContent.includes('Cliente:')));
    if (btnCrm) {
      btnCrm.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(1500);

  console.log("Capturando 18-live-modal-cliente-crm-historico.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '18-live-modal-cliente-crm-historico.png'),
    fullPage: false
  });

  await browser.close();
  console.log("Todas as 3 novas capturas operacionais foram salvas com sucesso em /home/ubuntu/screenshots/prd-live/!");
}

run().catch(err => {
  console.error("Erro na captura:", err);
  process.exit(1);
});
