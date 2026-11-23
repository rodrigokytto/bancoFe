import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/backoffice_completo';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const routes = [
    { name: '01_backoffice_rh_folha', url: 'http://localhost:3000/erp?tab=rh' },
    { name: '02_backoffice_compras_cotacoes', url: 'http://localhost:3000/erp?tab=compras' },
    { name: '03_backoffice_wms_kardex', url: 'http://localhost:3000/erp?tab=estoque' },
    { name: '04_backoffice_billing_contratos', url: 'http://localhost:3000/erp?tab=billing' },
    { name: '05_backoffice_governanca_multiempresa', url: 'http://localhost:3000/erp?tab=governanca' },
    { name: '06_backoffice_financeiro_pagar_receber', url: 'http://localhost:3000/erp?tab=financeiro' },
  ];

  console.log('Iniciando captura dos módulos de Backoffice...');

  for (const r of routes) {
    console.log(`Testando ${r.name}: ${r.url}`);
    await page.goto(r.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(res => setTimeout(res, 1500));
    const path = `${screenshotDir}/${r.name}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`Screenshot salvo: ${path}`);
  }

  await browser.close();
  console.log('Todos os módulos de Backoffice testados com sucesso!');
}

run().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
