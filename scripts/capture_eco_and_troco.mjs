import puppeteer from 'puppeteer-core';

const CHROMIUM_PATH = '/usr/bin/chromium';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Rola até o card de telemetria eco
  await page.evaluate(() => {
    window.scrollTo({ top: 480, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/05_card_telemetria_eco_gpx_kml.png' });
  console.log('Capturado: 05_card_telemetria_eco_gpx_kml.png');

  // Modal com R$ 200 pago e troco calculado
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Confirmar Chegada'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnDinheiro = buttons.find(b => b.textContent && b.textContent.includes('Dinheiro'));
    if (btnDinheiro) btnDinheiro.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn200 = buttons.find(b => b.textContent && b.textContent.includes('R$200'));
    if (btn200) btn200.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: '/home/ubuntu/screenshots/entregador-novos-recursos/06_modal_troco_calculado_sucesso.png' });
  console.log('Capturado: 06_modal_troco_calculado_sucesso.png');

  await browser.close();
}

run();
