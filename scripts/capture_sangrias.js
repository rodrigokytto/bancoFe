import puppeteer from 'puppeteer-core';

async function captureSangrias() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Rodrigo (Dono)')) {
      await b.click();
      await new Promise(r => setTimeout(r, 500));
      break;
    }
  }
  const submitButtons = await page.$$('button');
  for (const b of submitButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Entrar no Zuma Pilot')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }

  await page.goto('http://localhost:3000/pagamentos', { waitUntil: 'networkidle0', timeout: 30000 });
  
  const tabButtons = await page.$$('button');
  for (const b of tabButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Fechamento Diário de Caixa') || text.includes('Fechamento'))) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }

  // Clicar na aba 2: Sangrias & Suprimentos
  const subTabs = await page.$$('button');
  for (const b of subTabs) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Sangrias & Suprimentos')) {
      console.log('Clicando na aba de Sangrias & Suprimentos...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/fechamento_aba_sangrias.png', fullPage: true });

  await browser.close();
}

captureSangrias().catch(console.error);
