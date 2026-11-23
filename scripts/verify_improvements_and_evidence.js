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
  console.log('🚀 Iniciando Homologação e Captura das Melhorias TEF, WAHA & E-mail...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1366,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850 });

  // 1. Admin WAHA Hub
  console.log('🌐 1. Acessando Administração Whats (WAHA) http://localhost:3000/admin/waha ...');
  await page.goto('http://localhost:3000/admin/waha', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Clicar em Testador de Disparos
  await clickByText(page, 'button', 'Testador de Disparos');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_waha_hub_melhorado.png'), fullPage: true });
  console.log('✅ Salvo: admin_waha_hub_melhorado.png');

  // 2. Acessar Mesas
  console.log('🍽️ 2. Acessando Gestão de Mesas http://localhost:3000/mesas ...');
  await page.goto('http://localhost:3000/mesas', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Abrir Modal de Pagamento da Mesa 03
  await clickByText(page, 'button', 'Fechar Conta');
  await new Promise(r => setTimeout(r, 1200));

  // Selecionar Cartão
  await clickByText(page, 'button', 'Cartão TEF');
  await new Promise(r => setTimeout(r, 800));

  // Selecionar Tap on Phone NFC
  await clickByText(page, 'button', 'Tap on Phone');
  await new Promise(r => setTimeout(r, 800));

  // Aproximar Cartão NFC
  await clickByText(page, 'button', 'APROXIMAR CARTÃO NFC');
  console.log('💳 Processando aproximação NFC...');
  await new Promise(r => setTimeout(r, 2200));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_tap_on_phone_aprovado_melhorado.png') });
  console.log('✅ Salvo: modal_tap_on_phone_aprovado_melhorado.png');

  // Abrir Modal de Preview do E-mail Fiscal
  await clickByText(page, 'button', 'Ver DANFE / Email');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_preview_email_fiscal_melhorado.png') });
  console.log('✅ Salvo: modal_preview_email_fiscal_melhorado.png');

  // Fechar Preview do E-mail
  await clickByText(page, 'button', 'Fechar Visualização');
  await new Promise(r => setTimeout(r, 600));

  // Selecionar Modo 3: Digitação no App pelo Garçom
  await clickByText(page, 'button', 'Digitação App');
  await new Promise(r => setTimeout(r, 800));

  // Digitar 4 últimos dígitos e autorização
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const last4 = inputs.find(i => i.placeholder && i.placeholder.includes('5821'));
    if (last4) {
      last4.value = '4892';
      last4.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const auth = inputs.find(i => i.placeholder && i.placeholder.includes('849201'));
    if (auth) {
      auth.value = 'AUT987102';
      auth.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await clickByText(page, 'button', 'Validar & Salvar Pagamento no App');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_digitacao_app_melhorado.png') });
  console.log('✅ Salvo: modal_digitacao_app_melhorado.png');

  await browser.close();
  console.log('🎉 Todas as evidências visuais capturadas com sucesso!');
}

run().catch(err => {
  console.error('Erro na execução do teste:', err);
  process.exit(1);
});
