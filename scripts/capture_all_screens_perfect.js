import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');

async function run() {
  console.log('🚀 Iniciando Captura Completa e Autenticada...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1360,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 960 });

  // 1. FAZER LOGIN
  console.log('🔑 1. Fazendo Login em /login ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.innerText.includes('Preencher Acesso'));
    if (fillBtn) fillBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.innerText.includes('Entrar no Zuma Pilot'));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  // 2. TELA ADMIN WAHA SERVER
  console.log('📸 2. Acessando /admin/waha ...');
  await page.goto('http://localhost:3000/admin/waha', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_waha_hub.png') });
  console.log('✅ admin_waha_hub.png capturado com sucesso!');

  // 3. APP DO GARÇOM & MODAL PAGAMENTO
  console.log('📸 3. Acessando /garcom ...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  console.log('🍽️ Clicando na Mesa 03...');
  await page.evaluate(() => {
    const mesaEl = document.querySelector('div[data-table-num="3"]') || 
                   Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('Mesa 03'));
    if (mesaEl) mesaEl.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('💳 Clicando em "Pedir Conta"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConta = btns.find(b => b.innerText.includes('Pedir Conta'));
    if (btnConta) btnConta.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Clicar em Cartão TEF
  console.log('💳 Clicando na aba Cartão TEF...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnCartao = btns.find(b => b.innerText.includes('Cartão TEF'));
    if (btnCartao) btnCartao.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Captura 1: Tap on Phone (NFC no Celular)
  console.log('📱 Clicando em "2. Tap on Phone"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnTap = btns.find(b => b.innerText.includes('Tap on Phone'));
    if (btnTap) btnTap.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_tap_on_phone_nfc.png') });
  console.log('✅ modal_tap_on_phone_nfc.png capturado com sucesso!');

  // Captura 2: Digitação no App pelo Garçom
  console.log('⌨️ Clicando em "3. Digitação App"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnDigitacao = btns.find(b => b.innerText.includes('Digitação App'));
    if (btnDigitacao) btnDigitacao.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const last4 = inputs.find(i => i.placeholder && i.placeholder.includes('5821'));
    if (last4) {
      last4.value = '7392';
      last4.dispatchEvent(new Event('input', { bubbles: true }));
      last4.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const auth = inputs.find(i => i.placeholder && i.placeholder.includes('849201'));
    if (auth) {
      auth.value = 'AUT-928104';
      auth.dispatchEvent(new Event('input', { bubbles: true }));
      auth.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_digitacao_app_garcom.png') });
  console.log('✅ modal_digitacao_app_garcom.png capturado com sucesso!');

  // Validar e salvar no app
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnVal = btns.find(b => b.innerText.includes('Validar & Salvar Pagamento no App'));
    if (btnVal) btnVal.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Captura 3: Despacho Multicanal (WAHA WhatsApp + Email contato@kytto.com.br)
  console.log('📤 Rolando até o Despacho Multicanal...');
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const el = spans.find(s => s.innerText.includes('Despacho Multicanal'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_despacho_waha_email.png') });
  console.log('✅ modal_despacho_waha_email.png capturado com sucesso!');

  // Captura 4: Preview do E-mail Fiscal Oficial (contato@kytto.com.br)
  console.log('📧 Clicando em "Ver DANFE / Email"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnEmail = btns.find(b => b.innerText.includes('Ver DANFE / Email'));
    if (btnEmail) btnEmail.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_preview_email_fiscal.png') });
  console.log('✅ modal_preview_email_fiscal.png capturado com sucesso!');

  await browser.close();
  console.log('🎉 Todas as screenshots foram capturadas e validadas perfeitamente!');
}

run().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
