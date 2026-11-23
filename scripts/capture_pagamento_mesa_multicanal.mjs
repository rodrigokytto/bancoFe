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
  console.log("Iniciando Chromium via puppeteer-core...");
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
  console.log("Abrindo Mesa 03...");
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const target = elements.find(el => el.childNodes.length === 1 && el.textContent && el.textContent.trim().startsWith('Mesa 03'));
    if (target) {
      const card = target.closest('div.cursor-pointer') || target;
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await delay(1200);

  // Clicar no botão "Pagar na Mesa & Despachar"
  console.log("Abrindo Modal Pagamento na Mesa...");
  const abriuPagamento = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnPagar = buttons.find(b => b.textContent && b.textContent.includes('Pagar na Mesa & Despachar'));
    if (btnPagar) {
      btnPagar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log("Abriu modal de pagamento:", abriuPagamento);

  await delay(1200);

  // 1. Capturar tela do Modal de Pagamento (Pix Sicredi + Multicanal)
  console.log("Capturando 19-live-modal-pagamento-mesa-pix-multicanal.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '19-live-modal-pagamento-mesa-pix-multicanal.png'),
    fullPage: false
  });

  // 2. Clicar em "Ver Bobina" (Impressão Térmica do Caixa)
  console.log("Abrindo Preview da Bobina Térmica 80mm...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnBobina = buttons.find(b => b.textContent && b.textContent.includes('Ver Bobina'));
    if (btnBobina) btnBobina.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(800);

  console.log("Capturando 20-live-modal-pagamento-mesa-bobina-termica.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '20-live-modal-pagamento-mesa-bobina-termica.png'),
    fullPage: false
  });

  // Fechar Preview Bobina
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnFechar = buttons.find(b => b.textContent && b.textContent.trim() === 'Fechar');
    if (btnFechar) btnFechar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(600);

  // 3. Clicar em "Ver Texto" (Mensagem WhatsApp)
  console.log("Abrindo Preview do WhatsApp...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnWhats = buttons.find(b => b.textContent && b.textContent.includes('Ver Texto'));
    if (btnWhats) btnWhats.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(800);

  console.log("Capturando 21-live-modal-pagamento-mesa-whats-preview.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '21-live-modal-pagamento-mesa-whats-preview.png'),
    fullPage: false
  });

  // Fechar Preview WhatsApp
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const closeIcon = closeBtns.find(b => b.querySelector('svg.lucide-x'));
    if (closeIcon) closeIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(600);

  // 4. Selecionar aba "Cotas na Mesa"
  console.log("Selecionando método Cotas na Mesa...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnCotas = buttons.find(b => b.textContent && b.textContent.includes('Cotas na Mesa'));
    if (btnCotas) btnCotas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(800);

  // Marcar as 2 primeiras cotas como pagas
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div[class*="rounded-xl border flex items-center"]'));
    if (cards.length > 0) cards[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    if (cards.length > 1) cards[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await delay(600);

  console.log("Capturando 22-live-modal-pagamento-mesa-cotas-divididas.png...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '22-live-modal-pagamento-mesa-cotas-divididas.png'),
    fullPage: false
  });

  await browser.close();
  console.log("Todas as 4 capturas de pagamento na mesa foram concluídas com sucesso!");
}

run().catch(console.error);
