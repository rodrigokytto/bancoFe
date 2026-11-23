import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const PRD_BASE = 'https://zuma.kytto.com.br';
const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-validation-final';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyPrd() {
  console.log(`Iniciando auditoria visual e funcional em PRD: ${PRD_BASE}`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Login no PRD
  console.log('1. Acessando tela de login em PRD...');
  await page.goto(`${PRD_BASE}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_prd_login.png` });

  // Preencher acesso
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent && (b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher')));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.type === 'submit' || (b.textContent && b.textContent.includes('Entrar')));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02_prd_pos_login.png` });

  // 2. Mapa de Mesas do Salão no PRD (/mesas)
  console.log('2. Acessando Mapa de Mesas em PRD (/mesas)...');
  await page.goto(`${PRD_BASE}/mesas`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03_prd_mapa_mesas_salao.png` });

  // Clicar em uma mesa ocupada (ex: Mesa 03 ou Mesa 01) para abrir comanda e opções
  console.log('3. Clicando em mesa para abrir detalhes e opções de pagamento...');
  const clickedMesa = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button')).filter(el => {
      const text = el.innerText || '';
      return (text.includes('Mesa 03') || text.includes('Mesa 01') || text.includes('Mesa 05')) && text.includes('R$');
    });
    if (cards.length > 0) {
      const target = cards[0];
      target.click();
      return true;
    }
    return false;
  });
  console.log('Mesa clicada:', clickedMesa);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04_prd_modal_mesa_detalhes.png` });

  // 3. Abrir o Modal de Pagamento na Mesa pelo Garçom
  console.log('4. Acionando Pagamento na Mesa / Fechamento...');
  const clickedPay = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => {
      const t = b.innerText || '';
      return t.includes('Pagar na Mesa') || t.includes('Fechar Mesa') || t.includes('Pagamento');
    });
    if (payBtn) {
      payBtn.click();
      return true;
    }
    return false;
  });
  console.log('Botão de pagamento clicado:', clickedPay);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05_prd_modal_pagamento_mesa_multicanal.png` });

  // 4. Testar visualização Mobile do Garçom (/garcom) em iPhone
  console.log('5. Acessando App Garçom no PRD em viewport iPhone (/garcom)...');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto(`${PRD_BASE}/garcom`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06_prd_garcom_mobile_iphone.png` });

  // 5. Testar Cardápio Oficial 151 itens em PRD (/cardapio)
  console.log('6. Acessando Cardápio 151 itens em PRD (/cardapio)...');
  await page.setViewport({ width: 1440, height: 950, isMobile: false });
  await page.goto(`${PRD_BASE}/cardapio`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07_prd_cardapio_151_itens.png` });

  // 6. Testar Central de Logística & Entregas em PRD (/entregas)
  console.log('7. Acessando Central de Entregas em PRD (/entregas)...');
  await page.goto(`${PRD_BASE}/entregas`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/08_prd_entregas_rotas_tangara.png` });

  console.log('Auditoria visual concluída com sucesso!');
  await browser.close();
}

verifyPrd().catch(err => {
  console.error('Erro na auditoria PRD:', err);
  process.exit(1);
});
