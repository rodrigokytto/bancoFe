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
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  console.log('Login...');
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

  // 1. Clicar na Aba "Redes Sociais & Tráfego Multicanal (Instagram, Meta, TikTok)"
  console.log('Clicando na aba Redes Sociais & Tráfego Multicanal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Redes Sociais & Tráfego'));
    if (b) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      b.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando 03_hub_redes_sociais_trafego.png...');
  await page.screenshot({ path: path.join(outDir, '03_hub_redes_sociais_trafego.png') });

  // 2. Scroll para ver mais redes (TikTok, Google, WhatsApp)
  console.log('Scrollando para ver mais canais (TikTok, Google, WhatsApp)...');
  await page.evaluate(() => {
    window.scrollBy({ top: 400, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturando 03b_redes_tiktok_google_whatsapp.png...');
  await page.screenshot({ path: path.join(outDir, '03b_redes_tiktok_google_whatsapp.png') });

  // 3. Clicar na Aba "Sinergias Cruzadas & LTV do Grupo"
  console.log('Clicando na aba Sinergias Cruzadas...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Sinergias Cruzadas'));
    if (b) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      b.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturando 03c_sinergias_cruzadas_ltv.png...');
  await page.screenshot({ path: path.join(outDir, '03c_sinergias_cruzadas_ltv.png') });

  // 4. Abrir Modal de Disparo de Campanha Cruzada
  console.log('Clicando em Simular Campanha Cruzada...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Simular Campanha Cruzada'));
    if (b) {
      b.scrollIntoView({ behavior: 'instant', block: 'center' });
      b.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturando 06_modal_campanha_multicanal.png...');
  await page.screenshot({ path: path.join(outDir, '06_modal_campanha_multicanal.png') });

  await browser.close();
  console.log('Capturas adicionais concluídas com sucesso!');
}

run().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
