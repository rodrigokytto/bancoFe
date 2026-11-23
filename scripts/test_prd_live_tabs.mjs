import puppeteer from 'puppeteer-core';
import fs from 'fs';

const prdUrl = 'https://zuma-731517331463.southamerica-east1.run.app';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000'],
    headless: 'new'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  
  // Login
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
  await new Promise(r => setTimeout(r, 1500));

  const tabs = [
    { name: '04_erp_wms_kardex_lotes', url: `${prdUrl}/erp?tab=estoque` },
    { name: '05_erp_billing_contratos', url: `${prdUrl}/erp?tab=billing` },
    { name: '06_erp_governanca_auditoria', url: `${prdUrl}/erp?tab=governanca` },
    { name: '07_erp_financeiro_pagar_receber', url: `${prdUrl}/erp?tab=financeiro` }
  ];

  for (const item of tabs) {
    console.log(`Navegando para ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const shotPath = `/home/ubuntu/screenshots/prd_live/${item.name}.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Salvo: ${shotPath}`);
  }

  await browser.close();
  console.log('Capturas concluídas com sucesso!');
}

run().catch(console.error);
