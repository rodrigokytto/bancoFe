import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots_previsao_compras_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PRD_URL = 'https://zuma.kytto.com.br';

async function auditPrd() {
  console.log(`\n======================================================`);
  console.log(`🚀 AUDITORIA EM PRODUÇÃO CLOUD RUN: ${PRD_URL}/previsao-compras`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1050'],
    headless: 'new',
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  try {
    // 1. Login em Produção
    console.log(`1. Acessando login em produção: ${PRD_URL}/login...`);
    await page.goto(`${PRD_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fillBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
      if (fillBtn) fillBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Entrar no Zuma Pilot'));
      if (loginBtn) loginBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // 2. Acessa /previsao-compras em Produção
    console.log(`2. Acessando /previsao-compras em PRODUÇÃO...`);
    await page.goto(`${PRD_URL}/previsao-compras`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3500));

    // Fechar modais de aviso se houver
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent === '✕' || b.getAttribute('aria-label') === 'Close');
      closeBtns.forEach(b => b.click());
    });

    // Screenshot 1: Topo e KPIs
    console.log('📸 01_prd_topo_kpis.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `01_prd_topo_kpis.png`) });

    // Screenshot 2: Cronograma e Tabela de Insumos (Tab 1)
    console.log('📸 02_prd_tabela_insumos.png...');
    await page.evaluate(() => window.scrollBy(0, 480));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `02_prd_tabela_insumos.png`) });

    // Volta ao topo
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // 3. Tab 2: Fichas Técnicas & BOM
    console.log('3. Clicando na aba Fichas Técnicas em Produção...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('main button'));
      const tab = buttons.find(b => b.textContent && b.textContent.includes('Fichas Técnicas'));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 03_prd_fichas_tecnicas.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `03_prd_fichas_tecnicas.png`) });

    // Abrir Modal de Ficha Técnica
    console.log('3.1 Abrindo Modal de Ficha Técnica em Produção...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('main div.cursor-pointer'));
      const comboCard = cards.find(c => c.textContent && c.textContent.includes('Combo 26 Peças')) || cards[0];
      if (comboCard) comboCard.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 04_prd_modal_ficha_tecnica.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `04_prd_modal_ficha_tecnica.png`) });

    // Fechar modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Fechar Detalhes'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 4. Tab 3: Ordens de Compra & Fornecedores
    console.log('4. Clicando na aba Ordens de Compra em Produção...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('main button'));
      const tab = buttons.find(b => b.textContent && b.textContent.includes('Ordens de Compra & Fornecedores'));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 05_prd_ordens_compra.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `05_prd_ordens_compra.png`) });

    // Abrir Modal de Nova Ordem de Compra
    console.log('4.1 Abrindo Modal de Nova Ordem de Compra em Produção...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('main button'));
      const newOcBtn = btns.find(b => b.textContent && b.textContent.includes('Nova Ordem de Compra'));
      if (newOcBtn) newOcBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 06_prd_modal_nova_ordem_compra.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `06_prd_modal_nova_ordem_compra.png`) });

    // Fechar modal OC
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cancelar'));
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 5. Tab 4: Estoque Físico & ROP
    console.log('5. Clicando na aba Estoque Físico & ROP em Produção...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('main button'));
      const tab = buttons.find(b => b.textContent && b.textContent.includes('Estoque Físico & ROP'));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 07_prd_estoque_fisico_rop.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `07_prd_estoque_fisico_rop.png`) });

    // 6. Tab 5: Alavancas Zumi IA
    console.log('6. Clicando na aba Alavancas Zumi IA em Produção...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('main button'));
      const tab = buttons.find(b => b.textContent && b.textContent.includes('Alavancas Zumi IA'));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('📸 08_prd_alavancas_zumi_ia.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `08_prd_alavancas_zumi_ia.png`) });

    console.log(`\n🎉 Auditoria completa em PRODUÇÃO concluída com sucesso!`);
  } catch (err) {
    console.error(`❌ Erro durante auditoria em produção:`, err);
  } finally {
    await browser.close();
  }
}

auditPrd();
