import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function clickByText(page, tag, textSubstr) {
  const clicked = await page.evaluate(({ tag, textSubstr }) => {
    const elements = Array.from(document.querySelectorAll(tag));
    const target = elements.find(el => el.innerText && el.innerText.toLowerCase().includes(textSubstr.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, { tag, textSubstr });
  return clicked;
}

async function run() {
  console.log('🚀 Iniciando Captura de Screenshots das Novas Funcionalidades...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

  // 1. CAPTURA: TELA DE ADMINISTRAÇÃO WHATS (WAHA SERVER)
  console.log('📸 1. Acessando /admin/waha ...');
  await page.goto('http://localhost:3000/admin/waha', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_waha_hub.png'), fullPage: false });
  console.log('✅ admin_waha_hub.png capturado!');

  // 2. CAPTURA: MODAL DE PAGAMENTO - TAP ON PHONE NFC
  console.log('📸 2. Acessando /garcom e abrindo Modal de Pagamento ...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  await clickByText(page, 'button', 'Rodrigo');
  await new Promise(r => setTimeout(r, 800));

  let mesaClicada = await clickByText(page, 'button', 'Mesa 04');
  if (!mesaClicada) mesaClicada = await clickByText(page, 'button', 'Mesa 03');
  if (!mesaClicada) mesaClicada = await clickByText(page, 'button', 'Mesa 01');
  await new Promise(r => setTimeout(r, 1000));

  await clickByText(page, 'button', 'Fechar Conta');
  await new Promise(r => setTimeout(r, 1200));

  // Clicar em Cartão TEF
  await clickByText(page, 'button', 'Cartão TEF');
  await new Promise(r => setTimeout(r, 600));

  // Clicar no modo Tap on Phone
  await clickByText(page, 'button', 'Tap on Phone');
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_tap_on_phone_nfc.png') });
  console.log('✅ modal_tap_on_phone_nfc.png capturado!');

  // 3. CAPTURA: MODAL DE PAGAMENTO - DIGITAÇÃO NO APP PELO GARÇOM
  console.log('📸 3. Selecionando Digitação App e preenchendo campos ...');
  await clickByText(page, 'button', 'Digitação App');
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
  console.log('✅ modal_digitacao_app_garcom.png capturado!');

  // Validar e salvar no app para liberar o pagamento
  await clickByText(page, 'button', 'Validar & Salvar Pagamento no App');
  await new Promise(r => setTimeout(r, 1000));

  // 4. CAPTURA: DESPACHO MULTICANAL (WHATSAPP WAHA + EMAIL FISCAL CONTATO@KYTTO.COM.BR)
  console.log('📸 4. Rolando até o Despacho Multicanal ...');
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Despacho Multicanal'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_despacho_waha_email.png') });
  console.log('✅ modal_despacho_waha_email.png capturado!');

  // 5. CAPTURA: PREVIEW DO E-MAIL FISCAL OFICIAL (contato@kytto.com.br)
  console.log('📸 5. Abrindo Preview do E-mail Fiscal ...');
  await clickByText(page, 'button', 'Ver DANFE / Email');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_preview_email_fiscal.png') });
  console.log('✅ modal_preview_email_fiscal.png capturado!');

  await browser.close();
  console.log('🎉 Todas as screenshots foram capturadas com sucesso!');
}

run().catch(err => {
  console.error('❌ Erro durante a captura:', err);
  process.exit(1);
});
