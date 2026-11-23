import puppeteer from 'puppeteer-core';

async function capturePreConta() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896 });

  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Clicar no botão 'Mesa 03' no topo (com ícone de talheres)
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Mesa 03')) {
      console.log('Clicando na aba Mesa 03:', text.trim());
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }

  await page.screenshot({ path: '/home/ubuntu/screenshots/garcom_comanda_aberta.png' });

  // Clicar no botão 'Pré-Conta'
  const actionButtons = await page.$$('button');
  for (const b of actionButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Pré-Conta')) {
      console.log('Clicando em Pré-Conta...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }

  await page.screenshot({ path: '/home/ubuntu/screenshots/garcom_preconta_modal.png' });

  await browser.close();
  console.log('Pré-Conta capturada com sucesso!');
}

capturePreConta().catch(console.error);
