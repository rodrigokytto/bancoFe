import puppeteer from 'puppeteer-core';
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

  await page.goto('http://localhost:3000/nossa-gente', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Clicar no botão 'Simular Ponto' da tabela
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnSimular = buttons.find(b => b.textContent && b.textContent.includes('Simular Ponto'));
    if (btnSimular) btnSimular.click();
  });
  await delay(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-live-nossagente-ponto-facial-modal.png'), fullPage: false });
  console.log("Capturado com sucesso: 12-live-nossagente-ponto-facial-modal.png");

  // Também clicar na Mesa 01 para abrir o modal de Split Bill
  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await delay(2000);

  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h4, div, span'));
    const mesa01 = headings.find(el => el.textContent && el.textContent.trim() === 'Mesa 01');
    if (mesa01) {
      const card = mesa01.closest('.cursor-pointer') || mesa01.parentElement;
      if (card) (card ).click();
    }
  });
  await delay(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-live-mapa-mesas-modal-splitbill.png'), fullPage: false });
  console.log("Capturado com sucesso: 14-live-mapa-mesas-modal-splitbill.png");

  await browser.close();
}

run().catch(console.error);
