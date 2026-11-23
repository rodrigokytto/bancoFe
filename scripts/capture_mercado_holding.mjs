import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/home/ubuntu/screenshots/mercado-holding';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Iniciando Chromium via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
  });

  const baseUrl = 'http://localhost:3000';

  console.log('1. Acessando página de Login...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  console.log('2. Clicando em Preencher Acesso Rodrigo (Dono)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Preencher Acesso Rodrigo'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Submetendo formulário...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Entrar no Zuma Pilot'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Acessando /mercado...');
  await page.goto(`${baseUrl}/mercado?locale=pt-BR`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Topo: Holding Consolidada e Seletor
  console.log('Capturando 01_holding_seletor_kpis.png...');
  await page.screenshot({ path: path.join(outDir, '01_holding_seletor_kpis.png') });

  // 2. Scroll para Matriz de Gaps
  console.log('Scrollando até Matriz de Gaps & Oportunidades...');
  await page.evaluate(() => {
    window.scrollBy({ top: 620, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturando 02_matriz_gaps_oportunidades.png...');
  await page.screenshot({ path: path.join(outDir, '02_matriz_gaps_oportunidades.png') });

  // 3. Scroll para Hub de Redes Sociais
  console.log('Scrollando até Hub de Redes Sociais...');
  await page.evaluate(() => {
    window.scrollBy({ top: 750, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturando 03_hub_redes_sociais_trafego.png...');
  await page.screenshot({ path: path.join(outDir, '03_hub_redes_sociais_trafego.png') });

  // 4. Testar clique em Zuma Loja de Roupas
  console.log('Voltando ao topo e clicando em Zuma Loja de Roupas...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Zuma Loja de Roupas'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Capturando 04_visao_negocio_loja_roupas.png...');
  await page.screenshot({ path: path.join(outDir, '04_visao_negocio_loja_roupas.png') });

  // 5. Testar clique em Kytto Agro & B2B
  console.log('Clicando em Kytto Agro & B2B...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Kytto Agro & B2B'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Capturando 05_visao_negocio_kytto_agro.png...');
  await page.screenshot({ path: path.join(outDir, '05_visao_negocio_kytto_agro.png') });

  // 6. Voltar à Empresa Consolidada e abrir Modal
  console.log('Retornando à Empresa Consolidada...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('EMPRESA CONSOLIDADA'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Abrindo Modal de Campanha Integrada...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Simular Campanha Cruzada') || (btn.textContent && btn.textContent.includes('Disparar Campanha')));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando 06_modal_campanha_multicanal.png...');
  await page.screenshot({ path: path.join(outDir, '06_modal_campanha_multicanal.png') });

  await browser.close();
  console.log('Todas as capturas foram salvas!');
}

run().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
