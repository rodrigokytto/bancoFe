import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROMIUM_PATH = '/usr/bin/chromium';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  console.log('Navegando para http://localhost:3000/entregador...');
  await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  fs.mkdirSync('/home/ubuntu/screenshots/entregador-novos-recursos', { recursive: true });

  // 1. Tela Principal com Telemetria Eco, GPX/KML, Camadas e Controles
  await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/01_app_entregador_telemetria_eco.png' });
  console.log('Capturado: 01_app_entregador_telemetria_eco.png');

  // 2. Clicar no botão "Etapas" para abrir o Modal de Etapas Curva a Curva
  const etapasBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Etapas'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (etapasBtn) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/02_modal_etapas_curva_a_curva.png' });
    console.log('Capturado: 02_modal_etapas_curva_a_curva.png');

    // Fechar modal de etapas
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeBtn = closeButtons.find(b => b.textContent && (b.textContent.includes('✕') || b.textContent.includes('Fechar Itinerário')));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
  }

  // 3. Abrir Modal de Conclusão / Comprovação de Entrega
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Confirmar Chegada'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 4. Modal com Pix Ativo (QR Code Pix Sicredi Dinâmico)
  await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/03_modal_conclusao_pix_sicredi.png' });
  console.log('Capturado: 03_modal_conclusao_pix_sicredi.png');

  // 5. Clicar na forma "Dinheiro" para acionar a Calculadora de Troco Automática
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnDinheiro = buttons.find(b => b.textContent && b.textContent.includes('Dinheiro'));
    if (btnDinheiro) btnDinheiro.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Clicar em nota de R$ 100
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn100 = buttons.find(b => b.textContent && b.textContent.includes('R$100'));
    if (btn100) btn100.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/04_modal_calculadora_troco.png' });
  console.log('Capturado: 04_modal_calculadora_troco.png');

  await browser.close();
  console.log('Validação visual concluída com sucesso!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
