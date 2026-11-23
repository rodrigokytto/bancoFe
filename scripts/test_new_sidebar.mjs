import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  console.log('Login no localhost:3000/login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Preencher Acesso Rodrigo'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent.includes('Entrar no Zuma Pilot') || b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));

  console.log('Navegando para o Cockpit...');
  await page.goto('http://localhost:3000/cockpit', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  fs.mkdirSync('/home/ubuntu/screenshots/sidebar_clean', { recursive: true });

  await page.screenshot({ path: '/home/ubuntu/screenshots/sidebar_clean/01_cockpit_sidebar_clean.png', fullPage: false });
  console.log('01_cockpit_sidebar_clean.png capturado!');

  console.log('Navegando para o ERP com o novo sidebar...');
  await page.goto('http://localhost:3000/erp', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/sidebar_clean/02_erp_sidebar_clean.png', fullPage: false });
  console.log('02_erp_sidebar_clean.png capturado!');

  await browser.close();
  console.log('Capturas do novo Sidebar concluídas com sucesso!');
}

run().catch(console.error);
