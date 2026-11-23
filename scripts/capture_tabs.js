import puppeteer from 'puppeteer-core';

async function captureTabs() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // Login
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
  
  // Ir para fechamento
  const tabButtons = await page.$$('button');
  for (const b of tabButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Fechamento Diário de Caixa') || text.includes('Fechamento'))) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }

  // Clicar na aba 3: Conferência & Correção de Lançamentos
  const subTabs = await page.$$('button');
  for (const b of subTabs) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Conferência & Correção')) {
      console.log('Clicando na aba de Correção de Lançamentos...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/fechamento_aba_correcao.png', fullPage: true });

  // Clicar na aba 4: Quebra de Caixa & DRE
  const subTabs2 = await page.$$('button');
  for (const b of subTabs2) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Quebra de Caixa')) {
      console.log('Clicando na aba de Quebra de Caixa & DRE...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/fechamento_aba_quebra.png', fullPage: true });

  await browser.close();
  console.log('Abas capturadas com sucesso!');
}

captureTabs().catch(console.error);
