import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-live';
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
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((authData) => {
    localStorage.setItem('zuma_auth_session', authData);
    sessionStorage.setItem('zuma_auth_session', authData);
  }, authSession);

  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await delay(1200);

  // Abrir Mesa 03
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find(el => el.childNodes.length === 1 && el.textContent && el.textContent.trim().startsWith('Mesa 03'));
    if (target) {
      const card = target.closest('div.cursor-pointer') || target;
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(1200);

  // Abrir Cardápio Completo
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCardapio = buttons.find(b => b.textContent && b.textContent.includes('Abrir Cardápio Completo Zuma'));
    if (btnCardapio) btnCardapio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(1200);

  // Clicar em um item (ex: Combo 26 Peças)
  console.log("Selecionando item Combo 26 Peças no cardápio...");
  const selecionou = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const itemBtn = buttons.find(b => b.textContent && b.textContent.includes('Combo 26 Peças'));
    if (itemBtn) {
      itemBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log("Item selecionado:", selecionou);

  await delay(800);

  // Selecionar observação "Sem cebolinha"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const chip = buttons.find(b => b.textContent && b.textContent.includes('Sem cebolinha'));
    if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(600);

  console.log("Capturando 17b-live-modal-cardapio-item-selecionado.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '17b-live-modal-cardapio-item-selecionado.png'),
    fullPage: false
  });

  // Fechar Modal Cardápio
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const closeIcon = closeBtns.find(b => b.textContent && b.textContent.includes('Cancelar'));
    if (closeIcon) closeIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(800);

  // Abrir Modal de CRM do Cliente
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCrm = buttons.find(b => b.textContent && (b.textContent.includes('Vincular Cliente') || b.textContent.includes('Cliente:')));
    if (btnCrm) btnCrm.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(1200);

  // Clicar na aba "Histórico de Pedidos"
  console.log("Clicando na aba Histórico de Pedidos no CRM...");
  const clicouHist = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabHist = buttons.find(b => b.textContent && b.textContent.includes('Histórico de Pedidos'));
    if (tabHist) {
      tabHist.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log("Clicou no histórico:", clicouHist);

  await delay(1000);

  console.log("Capturando 18b-live-modal-cliente-crm-historico-pedidos.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '18b-live-modal-cliente-crm-historico-pedidos.png'),
    fullPage: false
  });

  await browser.close();
  console.log("Capturas complementares concluídas com sucesso!");
}

run().catch(console.error);
