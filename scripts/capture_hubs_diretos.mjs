import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromiumPath = '/usr/bin/chromium';
const outDir = '/home/ubuntu/screenshots/mercado-holding';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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

  // 1. Clicar no botão Zuma Gastronomia Oriental
  console.log('Selecionando Zuma Gastronomia Oriental...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const zumaBtn = btns.find(b => b.textContent?.includes('Zuma Gastronomia'));
    if (zumaBtn) zumaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Clicar no Pilar "2. APIs & Integrações Reais"
  console.log('Selecionando Pilar 2: APIs & Integrações Reais...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pilarBtn = btns.find(b => b.textContent?.includes('APIs & Integrações Reais'));
    if (pilarBtn) pilarBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Clicar na sub-aba iFood Merchant v2
  console.log('Selecionando Sub-Aba: iFood Merchant v2...');
  const clickedIfood = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ifoodBtn = btns.find(b => b.textContent?.includes('iFood Merchant v2'));
    if (ifoodBtn) {
      ifoodBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicou no iFood:', clickedIfood);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: `${outDir}/12_pilar_ifood_merchant_v2_full.png`, fullPage: false });
  console.log('Screenshot salva: 12_pilar_ifood_merchant_v2_full.png');

  // Scroll para ver o comparativo de taxas e pedidos do iFood
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${outDir}/12b_ifood_taxas_pedidos_ao_vivo.png`, fullPage: false });
  console.log('Screenshot salva: 12b_ifood_taxas_pedidos_ao_vivo.png');

  // 4. Clicar na sub-aba Keeto POS & Mesas
  console.log('Selecionando Sub-Aba: Keeto POS & Mesas...');
  await page.evaluate(() => window.scrollTo(0, 200));
  const clickedKeeto = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const keetoBtn = btns.find(b => b.textContent?.includes('Keeto POS & Mesas'));
    if (keetoBtn) {
      keetoBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicou no Keeto:', clickedKeeto);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: `${outDir}/13_pilar_keeto_pos_mesas_full.png`, fullPage: false });
  console.log('Screenshot salva: 13_pilar_keeto_pos_mesas_full.png');

  // Scroll para ver as 27 mesas do salão e o KDS
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${outDir}/13b_keeto_mesas_salao_kds.png`, fullPage: false });
  console.log('Screenshot salva: 13b_keeto_mesas_salao_kds.png');

  // 5. Clicar na sub-aba Bancos & TEF
  console.log('Selecionando Sub-Aba: Bancos & TEF...');
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bancosBtn = btns.find(b => b.textContent?.includes('Bancos & TEF'));
    if (bancosBtn) bancosBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${outDir}/14_pilar_bancos_sicredi_tef.png`, fullPage: false });
  console.log('Screenshot salva: 14_pilar_bancos_sicredi_tef.png');

  await browser.close();
  console.log('Concluído com sucesso!');
})();
