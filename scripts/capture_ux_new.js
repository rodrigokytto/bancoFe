import puppeteer from 'puppeteer-core';

async function captureUx() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('Login...');
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

  console.log('Acessando pagamentos...');
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

  // 1. Clicar na Aba 3 (Conferência & Correção de Lançamentos) com os novos filtros
  const subTabs = await page.$$('button');
  for (const b of subTabs) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Conferência & Correção')) {
      console.log('Clicando na Aba 3 de Correção...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/ux_aba3_filtros_busca.png', fullPage: true });

  // 2. Abrir Modal de Fechamento de Turno / Caixa para exibir a nova calculadora de cédulas
  const fecharBtn = await page.$$('button');
  for (const b of fecharBtn) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Fechar Turno / Caixa')) {
      console.log('Abrindo modal de fechamento...');
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/ux_modal_calculadora_cedulas.png' });

  await browser.close();
  console.log('Telas de UX capturadas com sucesso!');
}

captureUx().catch(console.error);
