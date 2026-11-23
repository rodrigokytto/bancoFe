import puppeteer from 'puppeteer-core';

const prdUrl = 'https://zuma-731517331463.southamerica-east1.run.app';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000'],
    headless: 'new'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  
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

  console.log('Navegando para mapa de calor logado...');
  await page.goto(`${prdUrl}/mapa-de-calor`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd_live/08_mapa_calor_autenticado.png', fullPage: false });
  console.log('Print do Mapa de Calor salvo com sucesso!');
  await browser.close();
}

run().catch(console.error);
