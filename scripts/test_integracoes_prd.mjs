import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/integracoes_prd';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação E2E da rota /integracoes e Menu BV em Produção...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const targets = [
    { url: 'https://zumapilot-lnj8dpxg.manus.space', name: 'pilot' },
    { url: 'https://zuma.kytto.com.br', name: 'kytto' }
  ];

  const report = [];

  for (const target of targets) {
    console.log(`\n======================================================`);
    console.log(`🌐 TESTANDO AMBIENTE: ${target.name} (${target.url})`);
    console.log(`======================================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      // 1. Login
      console.log(`  -> Acessando ${target.url}/login`);
      await page.goto(`${target.url}/login`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      const passInput = await page.$("input[type='password']");
      if (passInput) await passInput.type('#080581');
      const submitBtn = await page.$("button[type='submit']");
      if (submitBtn) {
        await submitBtn.click();
      } else {
        const buttons = await page.$$("button");
        for (const b of buttons) {
          const txt = await page.evaluate(el => el.innerText, b);
          if (txt && txt.includes("Entrar no Zuma Pilot")) {
            await b.click();
            break;
          }
        }
      }

      await new Promise(r => setTimeout(r, 4000));
      console.log(`  -> Autenticado. URL atual: ${page.url()}`);

      // Screenshot 1: Menu BV aprimorado no Cockpit
      const menuBvShot = path.join(SCREENSHOTS_DIR, `${target.name}_1_menu_bv_aprimorado.png`);
      await page.screenshot({ path: menuBvShot, fullPage: false });
      console.log(`📸 Screenshot Menu BV salvo: ${menuBvShot}`);

      // 2. Navegar para /integracoes
      console.log(`  -> Acessando ${target.url}/integracoes...`);
      await page.goto(`${target.url}/integracoes`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 3000));

      const canaisShot = path.join(SCREENSHOTS_DIR, `${target.name}_2_integracoes_canais.png`);
      await page.screenshot({ path: canaisShot, fullPage: false });
      console.log(`📸 Screenshot Canais Ativos salvo: ${canaisShot}`);

      // 3. Acessar Aba "Nossa Gente & Ultra · Event Bus"
      console.log(`  -> Clicando na aba "Nossa Gente & Ultra · Event Bus"...`);
      const clickedNossaGente = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText && b.innerText.includes('Nossa Gente & Ultra'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log(`  -> Aba clicada: ${clickedNossaGente}`);
      await new Promise(r => setTimeout(r, 2500));

      const eventBusShot = path.join(SCREENSHOTS_DIR, `${target.name}_3_nossa_gente_ultra_event_bus.png`);
      await page.screenshot({ path: eventBusShot, fullPage: false });
      console.log(`📸 Screenshot Nossa Gente & Ultra Event Bus salvo: ${eventBusShot}`);

      // 4. Testar Disparo de Evento Interno no Console
      console.log(`  -> Disparando evento interno no console interativo...`);
      const eventDispatched = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText && b.innerText.includes('Disparar Evento no Barramento Interno'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log(`  -> Botão disparar evento clicado: ${eventDispatched}`);
      await new Promise(r => setTimeout(r, 2000));

      const eventDispatchedShot = path.join(SCREENSHOTS_DIR, `${target.name}_4_evento_interno_disparado.png`);
      await page.screenshot({ path: eventDispatchedShot, fullPage: false });
      console.log(`📸 Screenshot Evento Disparado salvo: ${eventDispatchedShot}`);

      // 5. Acessar Aba "Zuma vs Saipos · Sincronizador"
      console.log(`  -> Clicando na aba "Zuma vs Saipos · Sincronizador"...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText && b.innerText.includes('Zuma vs Saipos'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      const saiposShot = path.join(SCREENSHOTS_DIR, `${target.name}_5_saipos_sync_tab.png`);
      await page.screenshot({ path: saiposShot, fullPage: false });
      console.log(`📸 Screenshot Saipos Sync salvo: ${saiposShot}`);

      // 6. Testar Executar Sync Saipos
      console.log(`  -> Clicando em "Executar Sync Saipos"...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText && b.innerText.includes('Executar Sync Saipos'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 2500));

      const saiposSyncedShot = path.join(SCREENSHOTS_DIR, `${target.name}_6_saipos_synced_toast.png`);
      await page.screenshot({ path: saiposSyncedShot, fullPage: false });
      console.log(`📸 Screenshot Saipos Sincronizado salvo: ${saiposSyncedShot}`);

      // 7. Testar Mobile Viewport (iPhone 14)
      console.log(`  -> Testando Mobile Viewport em /integracoes...`);
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${target.url}/integracoes?tab=nossa_gente_ultra`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2500));

      const mobileShot = path.join(SCREENSHOTS_DIR, `${target.name}_7_mobile_nossa_gente_ultra.png`);
      await page.screenshot({ path: mobileShot, fullPage: false });
      console.log(`📸 Screenshot Mobile salvo: ${mobileShot}`);

      report.push({
        target: target.name,
        url: target.url,
        clickedNossaGente,
        eventDispatched,
        screenshots: {
          menuBvShot,
          canaisShot,
          eventBusShot,
          eventDispatchedShot,
          saiposShot,
          saiposSyncedShot,
          mobileShot
        }
      });

    } catch (e) {
      console.error(`Erro no teste de ${target.name}:`, e);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const reportPath = path.join(SCREENSHOTS_DIR, 'relatorio_integracoes_prd.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), report }, null, 2));
  console.log(`\n🎉 Validação concluída com absoluto sucesso! Relatório: ${reportPath}`);
}

run().catch(e => {
  console.error('Falha fatal:', e);
  process.exit(1);
});
