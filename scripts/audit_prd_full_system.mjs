import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/audit_prd_full_system';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const PRD_BASE_URL = 'https://zuma.kytto.com.br';

async function runFullAudit() {
  console.log(`[AUDIT FULL PRD] ========================================================`);
  console.log(`[AUDIT FULL PRD] Auditoria Geral de Produção: Previsão Compras, Mercado e Dr. Clima`);
  console.log(`[AUDIT FULL PRD] Domínio: ${PRD_BASE_URL}`);
  console.log(`[AUDIT FULL PRD] ========================================================`);

  const results = {
    timestamp: new Date().toISOString(),
    pagesTested: {},
    networkErrors: [],
    consoleErrors: [],
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

    // 0. Login injection
    console.log('[AUDIT FULL PRD] 0. Injetando sessão de autenticação do Rodrigo...');
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

    // =========================================================================
    // 1. AUDITORIA PREVISÃO DE COMPRAS 360°
    // =========================================================================
    console.log('[AUDIT FULL PRD] 1. Acessando /previsao-compras...');
    let t0 = Date.now();
    let resp = await page.goto(`${PRD_BASE_URL}/previsao-compras`, { waitUntil: 'networkidle2', timeout: 45000 });
    let loadTime = Date.now() - t0;
    results.pagesTested['previsao-compras'] = { status: resp?.status(), loadTimeMs: loadTime };
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_previsao_compras_geral.png') });
    console.log('[AUDIT FULL PRD] Screenshot 01 salvo: 01_previsao_compras_geral.png');

    // Navegar para aba Fichas Técnicas BOM
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Fichas Técnicas') || b.innerText.includes('BOM'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_previsao_fichas_tecnicas_bom.png') });
    console.log('[AUDIT FULL PRD] Screenshot 02 salvo: 02_previsao_fichas_tecnicas_bom.png');

    // Navegar para aba Ordens de Compra
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Ordens de Compra') || b.innerText.includes('OCs'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_previsao_ordens_compra.png') });
    console.log('[AUDIT FULL PRD] Screenshot 03 salvo: 03_previsao_ordens_compra.png');

    // =========================================================================
    // 2. AUDITORIA IA E MERCADO (WAR ROOM)
    // =========================================================================
    console.log('[AUDIT FULL PRD] 2. Acessando /mercado...');
    t0 = Date.now();
    resp = await page.goto(`${PRD_BASE_URL}/mercado`, { waitUntil: 'networkidle2', timeout: 45000 });
    loadTime = Date.now() - t0;
    results.pagesTested['mercado'] = { status: resp?.status(), loadTimeMs: loadTime };
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_mercado_apis_reais.png') });
    console.log('[AUDIT FULL PRD] Screenshot 04 salvo: 04_mercado_apis_reais.png');

    // Navegar para aba Concorrentes
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Concorrentes'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_mercado_concorrentes_multissetoriais.png') });
    console.log('[AUDIT FULL PRD] Screenshot 05 salvo: 05_mercado_concorrentes_multissetoriais.png');

    // Navegar para aba Tomar Ações & War Room
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('War Room') || b.innerText.includes('Tomar Ações'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_mercado_war_room_acoes.png') });
    console.log('[AUDIT FULL PRD] Screenshot 06 salvo: 06_mercado_war_room_acoes.png');

    // =========================================================================
    // 3. AUDITORIA DR. CLIMA TANGARÁ DA SERRA
    // =========================================================================
    console.log('[AUDIT FULL PRD] 3. Acessando /dr-clima...');
    t0 = Date.now();
    resp = await page.goto(`${PRD_BASE_URL}/dr-clima`, { waitUntil: 'networkidle2', timeout: 45000 });
    loadTime = Date.now() - t0;
    results.pagesTested['dr-clima'] = { status: resp?.status(), loadTimeMs: loadTime };
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_dr_clima_radar_chuva.png') });
    console.log('[AUDIT FULL PRD] Screenshot 07 salvo: 07_dr_clima_radar_chuva.png');

    // Salvar relatório JSON
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'audit_report.json'), JSON.stringify(results, null, 2));
    console.log('[AUDIT FULL PRD] Auditoria concluída com sucesso!');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('[AUDIT FULL PRD] Erro na auditoria:', err);
  } finally {
    await browser.close();
  }
}

runFullAudit();
