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

  // 1. Injetar login
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

  // 2. Previsão de Compras - Fichas Técnicas BOM
  await page.goto('https://zuma.kytto.com.br/previsao-compras', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Fichas Técnicas'));
    if (btn) btn.click();
    window.scrollTo({ top: 480, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '02b_fichas_tecnicas_scrolled.png') });

  // 3. Previsão de Compras - Ordens de Compra
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Ordens de Compra'));
    if (btn) btn.click();
    window.scrollTo({ top: 480, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '03b_ordens_compra_scrolled.png') });

  // 4. Previsão de Compras - Estoque Físico & ROP
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Estoque Físico'));
    if (btn) btn.click();
    window.scrollTo({ top: 480, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '03c_estoque_rop_scrolled.png') });

  // 5. Mercado - Scrolled Concorrentes
  await page.goto('https://zuma.kytto.com.br/mercado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Todos os Setores') || b.innerText.includes('Concorrentes'));
    if (btn) btn.click();
    window.scrollTo({ top: 520, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '05b_mercado_concorrentes_scrolled.png') });

  // 6. Dr. Clima - Scrolled Plano Chuva e Bairros
  await page.goto('https://zuma.kytto.com.br/dr-clima', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    window.scrollTo({ top: 450, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '07b_dr_clima_scrolled.png') });

  await browser.close();
  console.log('Capturas detalhadas salvas em', OUT_DIR);
}

run();
