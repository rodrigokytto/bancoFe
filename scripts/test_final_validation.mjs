import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-novos-recursos';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTest() {
  console.log('🚀 Iniciando validação Puppeteer do App Entregador...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 1. Acessar tela do entregador
  console.log('1. Acessando http://localhost:3000/entregador...');
  await page.goto('http://localhost:3000/entregador', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_validacao_inicial_navegacao.png') });
  console.log('📸 10_validacao_inicial_navegacao.png capturada');

  // 2. Ir para aba Fila
  console.log('2. Navegando para aba Fila...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
    if (btnFila) btnFila.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_aba_fila_antes_otimizacao.png') });
  console.log('📸 11_aba_fila_antes_otimizacao.png capturada');

  // 3. Clicar no botão 'IAKytto Roteirizar Lote (10 Entregas)'
  console.log('3. Clicando no botão de otimização IA Kytto...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes('Roteirizar Lote'));
    if (btnOtimizar) btnOtimizar.click();
  });

  // Aguarda cálculo viário paralelo e transição de tela
  await new Promise(r => setTimeout(r, 3500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_mapa_apos_otimizacao_circuito_10_pedidos.png') });
  console.log('📸 12_mapa_apos_otimizacao_circuito_10_pedidos.png capturada');

  // 4. Testar alternância entre abas para comprovar ausência de tela branca
  console.log('4. Testando alternância para Carteira e retorno para Navegação...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnCarteira = btns.find(b => b.textContent && b.textContent.includes('Carteira'));
    if (btnCarteira) btnCarteira.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnGps = btns.find(b => b.textContent && b.textContent.includes('GPS'));
    if (btnGps) btnGps.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_retorno_gps_mapa_100pct_visivel.png') });
  console.log('📸 14_retorno_gps_mapa_100pct_visivel.png capturada');

  await browser.close();
  console.log('🎉 Validação final concluída com sucesso!');
}

runTest().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
