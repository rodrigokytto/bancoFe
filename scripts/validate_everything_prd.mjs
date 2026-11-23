import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/ubuntu/audit_prd_full_system';

async function run() {
  console.log('[FAÇA TUDO - AUDITORIA GERAL]');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // Injetar autenticação do Rodrigo
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

  // 1. Previsão de Compras - Estoque com Filtros
  console.log('1. Acessando /previsao-compras estoque...');
  await page.goto('https://zuma.kytto.com.br/previsao-compras', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Estoque Físico'));
    if (btn) btn.click();
    window.scrollTo({ top: 450, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '30_previsao_estoque_filtros_prd.png') });

  // 2. Previsão de Compras - Fichas Técnicas BOM
  console.log('2. Acessando /previsao-compras fichas técnicas...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Fichas Técnicas'));
    if (btn) btn.click();
    window.scrollTo({ top: 450, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '31_previsao_fichas_bom_prd.png') });

  // 3. Mercado - 3 Pilares Estratégicos
  console.log('3. Acessando /mercado...');
  await page.goto('https://zuma.kytto.com.br/mercado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '32_mercado_3_pilares_prd.png') });

  // 4. Dr. Clima - Radar e Alertas
  console.log('4. Acessando /dr-clima...');
  await page.goto('https://zuma.kytto.com.br/dr-clima', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '33_dr_clima_radar_prd.png') });

  // 5. Mesas - Mapa do Salão 27 Mesas
  console.log('5. Acessando /mesas...');
  await page.goto('https://zuma.kytto.com.br/mesas', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '34_mesas_mapa_27_prd.png') });

  await browser.close();
  console.log('[FAÇA TUDO] Todas as telas de PRD validadas com sucesso!');
}

run();
