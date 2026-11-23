import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromiumPath = '/usr/bin/chromium';
const outDir = '/home/ubuntu/screenshots/mercado-holding';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const baseUrl = 'http://localhost:3000';

  console.log('1. Login...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));

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

  console.log('2. Acessando /mercado...');
  await page.goto(`${baseUrl}/mercado?locale=pt-BR`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Selecionar Zuma Gastronomia
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const zumaBtn = btns.find(b => b.textContent?.includes('Zuma Gastronomia'));
    if (zumaBtn) zumaBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Selecionar Pilar 2: APIs & Integrações Reais
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pilarBtn = btns.find(b => b.textContent?.includes('APIs & Integrações Reais') || b.textContent?.includes('APIs & Telemetria'));
    if (pilarBtn) pilarBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 1. Clicar em Sicredi Pix & TEF Stone
  console.log('Clicando em Sicredi Pix & TEF Stone...');
  const clickedBancos = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent?.includes('Sicredi Pix'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicou em Bancos:', clickedBancos);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${outDir}/14_pilar_bancos_sicredi_tef_full.png`, fullPage: false });

  // Scroll Bancos
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outDir}/14b_bancos_extrato_conciliacao.png`, fullPage: false });

  // 2. Clicar em Open Delivery Abrasel
  console.log('Clicando em Open Delivery...');
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent?.includes('Open Delivery'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${outDir}/15_pilar_opendelivery_abrasel.png`, fullPage: false });

  await browser.close();
  console.log('Screenshots de Bancos e Open Delivery salvas!');
})();
