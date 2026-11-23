import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');

async function run() {
  console.log('🚀 Iniciando Captura de Telas com Pagamentos Homologados...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1360,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 960 });

  // 1. FAZER LOGIN
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.innerText.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.innerText.includes('Entrar no Zuma Pilot'));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // 2. ABRIR MODAL DA MESA 03 NO APP DO GARÇOM
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const mesaEl = document.querySelector('div[data-table-num="3"]') || 
                   Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('Mesa 03'));
    if (mesaEl) mesaEl.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConta = btns.find(b => b.innerText.includes('Pedir Conta'));
    if (btnConta) btnConta.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Clicar em Cartão TEF
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnCartao = btns.find(b => b.innerText.includes('Cartão TEF'));
    if (btnCartao) btnCartao.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 3. DIGITAÇÃO APP COM DIGITAÇÃO REAL VIA PUPPETEER
  console.log('⌨️ Testando Digitação App com preenchimento real...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnDig = btns.find(b => b.innerText.includes('Digitação App'));
    if (btnDig) btnDig.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const last4 = await page.$('input[placeholder*="5821"]');
  if (last4) await last4.type('8912', { delay: 50 });

  const auth = await page.$('input[placeholder*="849201"]');
  if (auth) await auth.type('AUT-749102', { delay: 50 });

  await new Promise(r => setTimeout(r, 500));

  // Clicar no botão "Validar & Salvar Pagamento no App"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnVal = btns.find(b => b.innerText.includes('Validar & Salvar Pagamento no App'));
    if (btnVal) btnVal.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_digitacao_app_autorizado_liberado.png') });
  console.log('✅ modal_digitacao_app_autorizado_liberado.png salvo!');

  // 4. TESTAR TAP ON PHONE (NFC NO CELULAR)
  console.log('📱 Testando Tap on Phone NFC Contactless...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnTap = btns.find(b => b.innerText.includes('Tap on Phone'));
    if (btnTap) btnTap.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Clicar em "APROXIMAR CARTÃO NFC AGORA"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnAprox = btns.find(b => b.innerText.includes('APROXIMAR CARTÃO NFC AGORA'));
    if (btnAprox) btnAprox.click();
  });
  console.log('⏳ Aguardando leitura contactless e autorização NFC (3.5s)...');
  await new Promise(r => setTimeout(r, 3800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_tap_on_phone_autorizado_liberado.png') });
  console.log('✅ modal_tap_on_phone_autorizado_liberado.png salvo!');

  await browser.close();
  console.log('🎉 Validações concluídas!');
}

run().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
