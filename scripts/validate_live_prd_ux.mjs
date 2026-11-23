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

  // 1. Injetar login em PRD
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

  // 2. Acessar /mercado em PRD
  await page.goto('https://zuma.kytto.com.br/mercado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '20_prd_mercado_live.png') });

  // 3. Acessar /dr-clima em PRD
  await page.goto('https://zuma.kytto.com.br/dr-clima', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '21_prd_dr_clima_live.png') });

  // 4. Acessar /previsao-compras em PRD
  await page.goto('https://zuma.kytto.com.br/previsao-compras', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '22_prd_previsao_live.png') });

  await browser.close();
  console.log('Validação de PRD concluída!');
}

run();
