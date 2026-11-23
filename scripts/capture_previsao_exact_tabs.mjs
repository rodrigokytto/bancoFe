import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/ubuntu/audit_prd_full_system';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // Injetar login
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('zuma_auth_session', JSON.stringify({
      id: 1,
      openId: 'usr_rodrigo_zuma',
      name: 'Rodrigo Ribeiro Gonçalves',
      email: 'rrodrigogon@gmail.com',
      role: 'admin',
      cargo: 'Proprietário & Administrador Geral',
      unidade: 'Tangará da Serra - MT',
      lastSignedIn: new Date().toISOString()
    }));
  });

  // Acessar /previsao-compras
  await page.goto('https://zuma.kytto.com.br/previsao-compras', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Aba Fichas Técnicas (BOM 211 SKUs)
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('BOM 211 SKUs'));
    if (tabs.length > 0) tabs[0].click();
    window.scrollTo({ top: 580, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '40_prd_fichas_tecnicas_bom.png') });

  // 2. Aba Estoque Físico & ROP
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Estoque Físico & ROP'));
    if (tabs.length > 0) tabs[0].click();
    window.scrollTo({ top: 580, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '41_prd_estoque_fisico_rop.png') });

  // 3. Aba Ordens de Compra & Fornecedores
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Ordens de Compra & Fornecedores'));
    if (tabs.length > 0) tabs[0].click();
    window.scrollTo({ top: 580, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '42_prd_ordens_compra.png') });

  await browser.close();
  console.log('Capturas exatas de abas salvas em', OUT_DIR);
}

run();
