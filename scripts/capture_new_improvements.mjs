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

  // 1. Injetar login em localhost:3000
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
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

  // 2. Acessar /mercado com o novo seletor de 3 Pilares
  await page.goto('http://localhost:3000/mercado', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '10_mercado_novo_3_pilares.png') });

  // 3. Clicar no Pilar 1: Concorrência & War Room
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Concorrência & War Room'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '11_mercado_pilar_concorrencia.png') });

  // 4. Acessar /dr-clima e abrir o novo Modal Operacional de Contingência
  await page.goto('http://localhost:3000/dr-clima', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '12_dr_clima_alertas_contextuais.png') });

  // Clicar em Ativar Plano Chuva para abrir o Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Ativar Plano Chuva'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '13_dr_clima_modal_operacional.png') });

  await browser.close();
  console.log('Novas capturas salvas em', OUT_DIR);
}

run();
