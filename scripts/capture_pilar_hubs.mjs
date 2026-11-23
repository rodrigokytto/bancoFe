import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/home/ubuntu/screenshots/mercado-holding';

async function run() {
  console.log('Iniciando Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 950 }
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  console.log('1. Efetuando login...');
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
  await new Promise(r => setTimeout(r, 2000));

  console.log('2. Acessando /mercado...');
  await page.goto(`${baseUrl}/mercado?locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Rolar até os Pilares de Inteligência
  console.log('Rolando até Pilar 2 (APIs & Telemetria)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pilarBtn = btns.find(b => b.textContent && b.textContent.includes('APIs & Telemetria ao Vivo'));
    if (pilarBtn) {
      pilarBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      pilarBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // 4. Clicar no botão iFood Merchant v2 do Pilar APIs (segundo botão)
  console.log('Clicando na aba iFood Merchant v2...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('iFood Merchant v2'));
    if (btns.length >= 2) {
      btns[1].click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Rolar para focar no conteúdo do IfoodHubV2
  console.log('Rolando até o painel iFood...');
  await page.evaluate(() => {
    window.scrollBy({ top: 500, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Capturando 15_pilar_ifood_pedidos_cardapio.png...');
  await page.screenshot({ path: path.join(outDir, '15_pilar_ifood_pedidos_cardapio.png') });

  // 5. Clicar na aba Keeto POS & Mesas do Pilar APIs (segundo botão)
  console.log('Clicando na aba Keeto POS & Mesas...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Keeto POS & Mesas'));
    if (btns.length >= 2) {
      btns[1].click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando 16_pilar_keeto_mesas_salao.png...');
  await page.screenshot({ path: path.join(outDir, '16_pilar_keeto_mesas_salao.png') });

  await browser.close();
  console.log('Capturas de hubs detalhados concluídas com sucesso!');
}

run().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
