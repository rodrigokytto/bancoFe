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

  console.log('Navegando para o ERP aba comercial...');
  await page.goto('http://localhost:3000/erp?tab=comercial', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  fs.mkdirSync('/home/ubuntu/screenshots/playbook_gtm', { recursive: true });

  await page.screenshot({ path: '/home/ubuntu/screenshots/playbook_gtm/01_playbook_4_etapas.png', fullPage: false });
  console.log('01_playbook_4_etapas.png capturado!');

  // Clicar na Calculadora Dino
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Calculadora Dino'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/playbook_gtm/02_calculadora_dino.png', fullPage: false });
  console.log('02_calculadora_dino.png capturado!');

  // Clicar em Kytto Data Bridge
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Kytto Data Bridge'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/playbook_gtm/03_kytto_databridge.png', fullPage: false });
  console.log('03_kytto_databridge.png capturado!');

  // Clicar em Aliança Contadores
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Aliança Contadores'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/playbook_gtm/04_alianca_contadores.png', fullPage: false });
  console.log('04_alianca_contadores.png capturado!');

  await browser.close();
  console.log('Todos os prints do Playbook Go-to-Market foram salvos com sucesso!');
}

run().catch(console.error);
