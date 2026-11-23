import puppeteer from 'puppeteer-core';
import fs from 'fs';

const prdUrl = 'https://zuma-731517331463.southamerica-east1.run.app';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  console.log(`Login em ${prdUrl}/login...`);
  await page.goto(`${prdUrl}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
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

  console.log(`Navegando para ${prdUrl}/erp?tab=comercial...`);
  await page.goto(`${prdUrl}/erp?tab=comercial`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  fs.mkdirSync('/home/ubuntu/screenshots/prd_live', { recursive: true });

  const shotPath = '/home/ubuntu/screenshots/prd_live/09_playbook_40_clientes_prd.png';
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`Salvo em produção: ${shotPath}`);

  await browser.close();
  console.log('Validação de produção concluída com sucesso!');
}

run().catch(console.error);
