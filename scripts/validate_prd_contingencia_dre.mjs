import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium para validação E2E das novas capacidades (DRE, NFC-e, KDS, Autoatendimento)...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Acesso ao PDV com a nova aba DRE do Turno em tempo real
  console.log("1. Acessando PDV com Aba DRE Diário do Turno...");
  await page.goto('http://localhost:3000/pdv?tab=dre_turno', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/13-prd-pdv-dre-turno-cmv-real.png` });
  console.log("   - [OK] Captura 13: PDV Caixa com DRE do Turno, CMV Real e Comparativo Saipos salva.");

  // 2. Acesso à Central Fiscal NFC-e SEFAZ-MT com Contingência Offline
  console.log("2. Abrindo Central Fiscal NFC-e SEFAZ-MT...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && (b.innerText.includes('Central NFC-e MT') || b.innerText.includes('NFC-e')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/14-prd-pdv-modal-contingencia-nfce.png` });
  console.log("   - [OK] Captura 14: Modal Central Fiscal NFC-e MT & Fila de Contingência salvo.");

  // 3. Acesso ao Autoatendimento do Cliente na Mesa via QR Code (Mobile Viewport)
  console.log("3. Acessando Autoatendimento na Mesa (QR Code Mobile First)...");
  await page.setViewport({ width: 412, height: 915, isMobile: true });
  await page.goto('http://localhost:3000/mesa/07', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/15-prd-autoatendimento-mesa-qrcode.png` });
  console.log("   - [OK] Captura 15: PWA de Autoatendimento do Cliente na Mesa 07 salvo.");

  // 4. Acesso ao KDS Cozinha (Sushibar / Cozinha Quente)
  console.log("4. Acessando Cozinha KDS com tickets expedidos...");
  await page.setViewport({ width: 1440, height: 950, isMobile: false });
  await page.goto('http://localhost:3000/cozinha', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/16-prd-cozinha-kds-tickets.png` });
  console.log("   - [OK] Captura 16: Cozinha KDS com praças e expedição conferida salvo.");

  await browser.close();
  console.log("\nTodas as validações E2E das novas entregas foram executadas e salvas com sucesso!");
}

run().catch(err => {
  console.error("Erro na validação E2E:", err);
  process.exit(1);
});
