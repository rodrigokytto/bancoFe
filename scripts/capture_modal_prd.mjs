import puppeteer from 'puppeteer-core';

async function run() {
  console.log("Iniciando captura do Modal de Pagamento na Mesa em PRD...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  // Login
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

  // Ir para /mesas
  await page.goto('https://zuma.kytto.com.br/mesas', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Clicar no card da Mesa 01 (Mesa 01 (4 lug) - Família Barbosa - R$ 286,00)
  console.log("Clicando na Mesa 01...");
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('h3, div, span'));
    const mesa01Title = elements.find(el => el.textContent && el.textContent.trim().startsWith('Mesa 01'));
    if (mesa01Title) {
      const card = mesa01Title.closest('.cursor-pointer') || mesa01Title.parentElement;
      if (card) card.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/09_prd_mesa01_drawer_aberto.png' });
  console.log("Drawer da Mesa 01 aberto.");

  // Clicar no botão '⚡ Pagar na Mesa & Despachar'
  console.log("Clicando em '⚡ Pagar na Mesa & Despachar'...");
  const clickedModal = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => b.textContent && b.textContent.includes('Pagar na Mesa'));
    if (payBtn) {
      payBtn.click();
      return true;
    }
    return false;
  });

  console.log("Botão clicado:", clickedModal);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/10_prd_modal_pagamento_mesa_aberto.png' });

  // Clicar na aba TEF Móvel
  console.log("Alternando para aba Cartão TEF Móvel...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tefBtn = btns.find(b => b.textContent && b.textContent.includes('TEF Móvel'));
    if (tefBtn) tefBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/11_prd_modal_tef_movel.png' });

  // Clicar na aba Cotas / Divisão
  console.log("Alternando para aba Cotas / Divisão...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cotasBtn = btns.find(b => b.textContent && b.textContent.includes('Cotas'));
    if (cotasBtn) cotasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/prd-validation-final/12_prd_modal_cotas_divisao.png' });

  console.log("Bateria de capturas concluída com sucesso!");
  await browser.close();
}

run().catch(console.error);
