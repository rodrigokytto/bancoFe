import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/home/ubuntu/screenshots/mercado-holding';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Iniciando Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  console.log('Login oficial de Rodrigo (Dono)...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Preencher Acesso Rodrigo'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Entrar no Zuma Pilot'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Acessando /mercado...');
  await page.goto(`${baseUrl}/mercado?locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Clicar na aba "Integrações & Canais" da Holding
  console.log('Clicando na aba Integrações & Canais...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Integrações & Canais'));
    if (b) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      b.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capturar 08: iFood Merchant v2 na Holding
  console.log('Capturando 08_holding_integracoes_ifood.png...');
  await page.screenshot({ path: path.join(outDir, '08_holding_integracoes_ifood.png') });

  // 1b. Expandir o Hub Completo iFood dentro da Holding
  console.log('Clicando em Abrir Hub Completo iFood na Holding...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Abrir Hub Completo iFood'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 08b_holding_ifood_hub_expandido.png...');
  await page.screenshot({ path: path.join(outDir, '08b_holding_ifood_hub_expandido.png') });

  // 2. Clicar em "Keeto POS & Mesas" na Holding
  console.log('Clicando em Keeto POS & Mesas na Holding...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Keeto POS & Mesas') && btn.textContent.includes('KDS'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando 09_holding_integracoes_keeto.png...');
  await page.screenshot({ path: path.join(outDir, '09_holding_integracoes_keeto.png') });

  // 2b. Expandir o Hub Completo Keeto POS na Holding
  console.log('Clicando em Abrir Hub Completo Keeto POS na Holding...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Abrir Hub Completo Keeto POS'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 09b_holding_keeto_hub_expandido.png...');
  await page.screenshot({ path: path.join(outDir, '09b_holding_keeto_hub_expandido.png') });

  // 3. Clicar em "Sicredi Pix & TEF Stone" na Holding
  console.log('Clicando em Sicredi Pix & TEF Stone na Holding...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Sicredi Pix & TEF Stone'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando 10_holding_integracoes_bancos.png...');
  await page.screenshot({ path: path.join(outDir, '10_holding_integracoes_bancos.png') });

  // 4. Navegar até o Pilar 2 (APIs & Telemetria) e clicar no 2º botão de iFood Merchant v2
  console.log('Scrollando até o Pilar APIs & Telemetria...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('APIs & Telemetria ao Vivo'));
    if (b) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      b.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicando no botão iFood Merchant v2 do Pilar APIs...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent && btn.textContent.includes('iFood Merchant v2'));
    if (btns.length >= 2) {
      btns[1].scrollIntoView({ behavior: 'instant', block: 'center' });
      btns[1].click();
    } else if (btns.length === 1) {
      btns[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Capturando 11_pilar_apis_ifood_hub.png...');
  await page.screenshot({ path: path.join(outDir, '11_pilar_apis_ifood_hub.png') });

  // 5. Clicar no 2º botão de Keeto POS & Mesas no Pilar APIs
  console.log('Clicando no botão Keeto POS & Mesas do Pilar APIs...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent && btn.textContent.includes('Keeto POS & Mesas'));
    if (btns.length >= 2) {
      btns[1].scrollIntoView({ behavior: 'instant', block: 'center' });
      btns[1].click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Capturando 12_pilar_apis_keeto_hub.png...');
  await page.screenshot({ path: path.join(outDir, '12_pilar_apis_keeto_hub.png') });

  await browser.close();
  console.log('Todas as capturas foram concluídas!');
}

run().catch(err => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
