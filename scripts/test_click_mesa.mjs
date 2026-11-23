import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && (b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher')));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.type === 'submit' || (b.textContent && b.textContent.includes('Entrar')));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('https://zuma.kytto.com.br/mesas', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Clicar na Mesa 01
  const rect = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent === 'Família Barbosa · 3 pessoas');
    if (el) {
      const parent = el.closest('.cursor-pointer') || el.parentElement;
      const b = (parent || el).getBoundingClientRect();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }
    return null;
  });

  if (rect) {
    await page.mouse.click(rect.x, rect.y);
    await new Promise(r => setTimeout(r, 1500));
  }

  // Clicar em 'Pagar na Mesa & Despachar'
  console.log("Clicando no botão 'Pagar na Mesa & Despachar'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => b.textContent && b.textContent.includes('Pagar na Mesa & Despachar'));
    if (payBtn) payBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/14_prd_modal_pagamento_mesa_pix.png' });
  console.log("Capturado: 14_prd_modal_pagamento_mesa_pix.png");

  // Alternar para aba Cartão TEF Móvel
  console.log("Clicando na aba TEF Móvel...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tefBtn = btns.find(b => b.textContent && b.textContent.includes('TEF Móvel'));
    if (tefBtn) tefBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/15_prd_modal_tef_movel.png' });

  // Alternar para aba Baixa de Cotas
  console.log("Clicando na aba Baixa de Cotas...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cotasBtn = btns.find(b => b.textContent && b.textContent.includes('Cotas'));
    if (cotasBtn) cotasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/16_prd_modal_cotas_divisao.png' });

  await browser.close();
}

run().catch(console.error);
