import puppeteer from 'puppeteer-core';
import fs from 'fs';

const outDir = '/home/ubuntu/screenshots/mercado-holding';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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

  // 1. Tela /mercado com UX Sereno e Unificado
  console.log('1. Capturando /mercado sereno...');
  await page.goto(`${baseUrl}/mercado?locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/20_mercado_sereno_topo_holding.png`, fullPage: false });

  // Scroll para ver a Matriz de Gaps e Oportunidades
  await page.evaluate(() => window.scrollBy(0, 480));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${outDir}/21_mercado_sereno_gaps_oportunidades.png`, fullPage: false });

  // 2. Tela /integracoes - Central Geral de Integrações
  console.log('2. Capturando /integracoes (Catálogo Geral)...');
  await page.goto(`${baseUrl}/integracoes?locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/22_integracoes_catalogo_geral_status.png`, fullPage: false });

  // 3. Tela /integracoes?tab=ifood - Hub iFood Merchant v2
  console.log('3. Capturando /integracoes?tab=ifood...');
  await page.goto(`${baseUrl}/integracoes?tab=ifood&locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/23_integracoes_ifood_merchant_ao_vivo.png`, fullPage: false });

  // 4. Tela /integracoes?tab=keeto - Hub Keeto POS & Mesas
  console.log('4. Capturando /integracoes?tab=keeto...');
  await page.goto(`${baseUrl}/integracoes?tab=keeto&locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/24_integracoes_keeto_pos_mesas_ao_vivo.png`, fullPage: false });

  // 5. Tela /integracoes?tab=bancos_tef - Hub Bancos Sicredi & Stone
  console.log('5. Capturando /integracoes?tab=bancos_tef...');
  await page.goto(`${baseUrl}/integracoes?tab=bancos_tef&locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/25_integracoes_bancos_sicredi_stone.png`, fullPage: false });

  // 6. Tela /integracoes?tab=nossa_gente_ultra - Sincronização por Evento Interno
  console.log('6. Capturando /integracoes?tab=nossa_gente_ultra...');
  await page.goto(`${baseUrl}/integracoes?tab=nossa_gente_ultra&locale=pt-BR`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outDir}/26_integracoes_nossa_gente_ultra_eventbus.png`, fullPage: false });

  await browser.close();
  console.log('Todas as evidências de integrações capturadas com sucesso!');
})();
