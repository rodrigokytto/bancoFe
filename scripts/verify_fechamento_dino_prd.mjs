import puppeteer from 'puppeteer-core';
import fs from 'fs';

const PRD_BASE = 'https://zuma.kytto.com.br';
const SCREENSHOT_DIR = '/home/ubuntu/screenshots/fechamento-prd';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log(`[PRD AUDIT] Iniciando validação em produção de ${PRD_BASE}`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Acesso à tela de Pagamentos (/pagamentos)
  console.log('1. Acessando /pagamentos em produção...');
  await page.goto(`${PRD_BASE}/pagamentos`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_prd_pagamentos_terminal.png` });

  // 2. Clicar na aba "Fechamento Diário de Caixa"
  console.log('2. Clicando na aba Fechamento Diário de Caixa...');
  const clickedTab = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('Fechamento Diário de Caixa'));
    if (tab) {
      tab.click();
      return true;
    }
    return false;
  });
  console.log('Aba Fechamento clicada:', clickedTab);
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02_prd_fechamento_aba_conciliacao.png` });

  // 3. Clicar na Aba "Sangrias & Suprimentos"
  console.log('3. Clicando na aba Sangrias & Suprimentos...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('Sangrias & Suprimentos'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03_prd_fechamento_sangrias_suprimentos.png` });

  // 4. Clicar na Aba "Conferência & Correção"
  console.log('4. Clicando na aba Conferência & Correção de Lançamentos...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('Conferência & Correção'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04_prd_fechamento_conferencia_correcao.png` });

  // 5. Clicar na Aba "Quebra de Caixa & DRE"
  console.log('5. Clicando na aba Quebra de Caixa & DRE...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('Quebra de Caixa & DRE'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05_prd_fechamento_quebra_dre.png` });

  // 6. Clicar no botão "Comprovante Térmico (80mm)"
  console.log('6. Abrindo modal do Comprovante Térmico 80mm...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && (b.textContent.includes('Comprovante Térmico') || b.textContent.includes('Cupom Térmico')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06_prd_modal_comprovante_termico_80mm.png` });

  console.log('[PRD AUDIT] Auditoria visual finalizada com sucesso! Screenshots salvas em:', SCREENSHOT_DIR);
  await browser.close();
}

run().catch(err => {
  console.error('[PRD AUDIT ERROR]', err);
  process.exit(1);
});
