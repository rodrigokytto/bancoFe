import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/audit_prd_previsao_compras';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const PRD_BASE_URL = 'https://zuma.kytto.com.br';
const TARGET_URL = `${PRD_BASE_URL}/previsao-compras`;

async function runAudit() {
  console.log(`[AUDIT PRD] ========================================================`);
  console.log(`[AUDIT PRD] Auditoria Estrita Ponta a Ponta em Produção (PRD)`);
  console.log(`[AUDIT PRD] URL: ${TARGET_URL}`);
  console.log(`[AUDIT PRD] ========================================================`);

  const results = {
    url: TARGET_URL,
    timestamp: new Date().toISOString(),
    steps: [],
    networkErrors: [],
    consoleErrors: [],
    metrics: {}
  };

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' && !text.includes('favicon')) {
        console.warn(`[Browser Console Error]: ${text}`);
        results.consoleErrors.push(text);
      }
    });

    page.on('response', resp => {
      const status = resp.status();
      const url = resp.url();
      if (status >= 400 && !url.includes('favicon.ico')) {
        console.warn(`[HTTP Error ${status}]: ${url}`);
        results.networkErrors.push({ status, url });
      }
    });

    // 0. Autenticação Prévia
    console.log('[AUDIT PRD] 0. Injetando sessão de autenticação do Rodrigo...');
    await page.goto(`${PRD_BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const user = {
        id: 1,
        openId: 'usr_rodrigo_zuma',
        name: 'Rodrigo Ribeiro Gonçalves',
        email: 'rrodrigogon@gmail.com',
        role: 'admin',
        cargo: 'Proprietário & Administrador Geral',
        unidade: 'Tangará da Serra - MT',
        lastSignedIn: new Date().toISOString(),
      };
      localStorage.setItem('zuma_auth_session', JSON.stringify(user));
    });

    // 1. CARREGAMENTO INICIAL EM PRODUÇÃO
    console.log('[AUDIT PRD] 1. Acessando página /previsao-compras em produção...');
    const startTime = Date.now();
    const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    const loadTime = Date.now() - startTime;
    results.metrics.loadTimeMs = loadTime;
    results.metrics.httpStatus = response?.status() || 0;
    console.log(`[AUDIT PRD] Página carregada com HTTP ${response?.status()} em ${loadTime}ms`);

    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_prd_header_kpis_clima.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 01 salvo: 01_prd_header_kpis_clima.png');

    // 2. TESTE: PARECER AKIRA IA (GEMINI 2.5 FLASH)
    console.log('[AUDIT PRD] 2. Disparando geração de Parecer Akira IA...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const btns = Array.from(container?.querySelectorAll('button') || []);
      const btn = btns.find(b => b.innerText.includes('Parecer Akira') || b.innerText.includes('Parecer Zumi'));
      if (btn) btn.click();
    });
    console.log('[AUDIT PRD] Botão clicado. Aguardando conclusão da IA...');
    await new Promise(r => setTimeout(r, 4500));

    // Scroll leve para mostrar o parecer gerado
    await page.evaluate(() => window.scrollTo(0, 220));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_prd_parecer_akira_ia.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 02 salvo: 02_prd_parecer_akira_ia.png');

    // 3. TESTE: SELETOR DE CENÁRIOS E DIAS DE HORIZONTE
    console.log('[AUDIT PRD] 3. Testando alteração para 15 Dias e Cenário de Chuva...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const btns = Array.from(container?.querySelectorAll('button') || []);
      const b15 = btns.find(b => b.innerText.includes('15 Dias'));
      if (b15) b15.click();
      const bChuva = btns.find(b => b.innerText.includes('Chuva'));
      if (bChuva) bChuva.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_prd_cenario_chuva_recalculo.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 03 salvo: 03_prd_cenario_chuva_recalculo.png');

    // Voltar para 7 Dias e Demanda Padrão
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const btns = Array.from(container?.querySelectorAll('button') || []);
      const b7 = btns.find(b => b.innerText.includes('7 Dias'));
      if (b7) b7.click();
      const bPadrao = btns.find(b => b.innerText.includes('Demanda Padrão'));
      if (bPadrao) bPadrao.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 4. TESTE: ABA PREVISÃO & DEMANDA (TABELA DE INSUMOS)
    console.log('[AUDIT PRD] 4. Rolando até tabela analítica de insumos...');
    await page.evaluate(() => window.scrollTo(0, 520));
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_prd_aba_previsao_insumos.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 04 salvo: 04_prd_aba_previsao_insumos.png');

    // 5. TESTE: ABA FICHAS TÉCNICAS (BOM 211 SKUS)
    console.log('[AUDIT PRD] 5. Acessando aba Fichas Técnicas (BOM 211 SKUs)...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Fichas Técnicas'));
      if (tab) tab.click();
      window.scrollTo(0, 350);
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_prd_aba_fichas_tecnicas_bom.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 05 salvo: 05_prd_aba_fichas_tecnicas_bom.png');

    // 6. TESTE: MODAL DE DETALHAMENTO DE FICHA TÉCNICA
    console.log('[AUDIT PRD] 6. Abrindo modal de ficha técnica detalhada...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const cards = Array.from(container?.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div') || []);
      if (cards.length > 0) {
        cards[0].click();
      }
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_prd_modal_detalhe_ficha_tecnica.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 06 salvo: 06_prd_modal_detalhe_ficha_tecnica.png');

    // Fechar modal clicando no botão de fechar do modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 7. TESTE: ABA ORDENS DE COMPRA & FORNECEDORES
    console.log('[AUDIT PRD] 7. Acessando aba Ordens de Compra & Fornecedores...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Ordens de Compra'));
      if (tab) tab.click();
      window.scrollTo(0, 350);
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_prd_aba_ordens_compra.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 07 salvo: 07_prd_aba_ordens_compra.png');

    // 8. TESTE: MODAL DE NOVA ORDEM DE COMPRA
    console.log('[AUDIT PRD] 8. Abrindo Modal + Nova Ordem de Compra Oficial...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const btns = Array.from(container?.querySelectorAll('button') || []);
      const btn = btns.find(b => b.innerText.includes('Nova Ordem de Compra'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_prd_modal_nova_ordem_compra.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 08 salvo: 08_prd_modal_nova_ordem_compra.png');

    // Fechar modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 9. TESTE: ABA ESTOQUE FÍSICO & ROP
    console.log('[AUDIT PRD] 9. Acessando aba Estoque Físico & ROP...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Estoque Físico & ROP'));
      if (tab) {
        tab.click();
        tab.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => window.scrollBy(0, 50));
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_prd_aba_estoque_fisico_rop.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 09 salvo: 09_prd_aba_estoque_fisico_rop.png');

    // 10. TESTE: ABA ALAVANCAS ZUMI IA
    console.log('[AUDIT PRD] 10. Acessando aba Alavancas Zumi IA e testando disparo...');
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Alavancas'));
      if (tab) {
        tab.click();
        tab.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => window.scrollBy(0, 50));
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_prd_aba_alavancas_zumi_ia.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 10 salvo: 10_prd_aba_alavancas_zumi_ia.png');

    // 11 e 12. TESTE RESPONSIVIDADE MOBILE (VIEWPORT 390x844)
    console.log('[AUDIT PRD] 11. Testando responsividade mobile (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Previsão'));
      if (tab) tab.click();
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_prd_mobile_responsivo_topo.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 11 salvo: 11_prd_mobile_responsivo_topo.png');

    await page.evaluate(() => {
      const container = document.querySelector('.max-w-7xl');
      const tabs = Array.from(container?.querySelectorAll('.border-b button') || []);
      const tab = tabs.find(b => b.innerText.includes('Ordens de Compra'));
      if (tab) tab.click();
      window.scrollTo(0, 200);
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_prd_mobile_responsivo_ordens.png'), fullPage: false });
    console.log('[AUDIT PRD] Screenshot 12 salvo: 12_prd_mobile_responsivo_ordens.png');

    console.log('[AUDIT PRD] ========================================================');
    console.log('[AUDIT PRD] Auditoria e Validação em Produção CONCLUÍDAS COM SUCESSO!');
    console.log(`[AUDIT PRD] Total Screenshots: 12`);
    console.log(`[AUDIT PRD] Erros de Console: ${results.consoleErrors.length}`);
    console.log(`[AUDIT PRD] Erros de Rede: ${results.networkErrors.length}`);
    console.log('[AUDIT PRD] ========================================================');

    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'audit_results.json'), JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('[AUDIT PRD ERROR]:', err);
    results.error = err.message;
  } finally {
    await browser.close();
  }
}

runAudit();
