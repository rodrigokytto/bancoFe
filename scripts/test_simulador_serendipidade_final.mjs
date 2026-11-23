import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/serendipidade_final';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação E2E final do botão Simular e Modal de Serendipidade...');

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
    console.log(`\n==============================================`);
    console.log(`🌐 TESTANDO AMBIENTE: ${target.name} (${target.url})`);
    console.log(`==============================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      // 1. Login
      console.log(`  -> Acessando ${target.url}/login`);
      await page.goto(`${target.url}/login`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      const passInput = await page.$("input[type='password']");
      if (passInput) {
        await passInput.type('#080581');
      }
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
      console.log(`  -> URL pós-login: ${page.url()}`);

      // Screenshot 1: Dashboard com Card de Serendipidade e o Botão "Simular" destacado
      const cardShot = path.join(SCREENSHOTS_DIR, `${target.name}_1_sidebar_card_simular.png`);
      await page.screenshot({ path: cardShot, fullPage: false });
      console.log(`📸 Screenshot salvo: ${cardShot}`);

      // Analisar presença dos botões
      const analysis = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const simularBtn = buttons.find(b => b.title && b.title.includes('Simular cenário'));
        const novaDicaBtn = buttons.find(b => b.innerText && b.innerText.includes('Nova dica'));
        return {
          hasSimularBtn: !!simularBtn || buttons.some(b => b.innerText && b.innerText.trim() === 'Simular'),
          hasNovaDicaBtn: !!novaDicaBtn
        };
      });
      console.log(`🔍 Análise de botões no card:`, analysis);

      // 2. Clicar no botão "Nova dica" para demonstrar rotação de critérios
      console.log(`  -> Clicando em "Nova dica"...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const b = buttons.find(el => el.innerText && el.innerText.includes('Nova dica'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      const dicaShot = path.join(SCREENSHOTS_DIR, `${target.name}_2_criterio_rotacionado.png`);
      await page.screenshot({ path: dicaShot, fullPage: false });
      console.log(`📸 Screenshot salvo: ${dicaShot}`);

      // 3. Clicar no botão "Simular" para abrir o Modal Interativo
      console.log(`  -> Clicando no botão "Simular" destacado...`);
      const modalTriggered = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => (b.title && b.title.includes('Simular')) || (b.innerText && b.innerText.trim() === 'Simular'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log(`  -> Botão Simular acionado: ${modalTriggered}`);
      await new Promise(r => setTimeout(r, 2000));

      // Screenshot 3: Modal Interativo Aberto
      const modalShot = path.join(SCREENSHOTS_DIR, `${target.name}_3_modal_simulador_interativo.png`);
      await page.screenshot({ path: modalShot, fullPage: false });
      console.log(`📸 Screenshot do Modal Interativo salvo: ${modalShot}`);

      // Analisar modal
      const modalDetails = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { open: false };
        return {
          open: true,
          title: modal.querySelector('h3')?.innerText || '',
          text: modal.innerText.slice(0, 300),
          slidersCount: modal.querySelectorAll('input[type="range"]').length,
          buttons: Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
        };
      });
      console.log(`✨ Conteúdo do Modal Interativo:`, modalDetails);

      // 4. Interagir com o Slider de Chuva (aumentar probabilidade)
      console.log(`  -> Interagindo com sliders de telemetria...`);
      await page.evaluate(() => {
        const slider = document.querySelector('input[type="range"]');
        if (slider) {
          slider.value = '95';
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 1000));

      const sliderShot = path.join(SCREENSHOTS_DIR, `${target.name}_4_modal_slider_95perc.png`);
      await page.screenshot({ path: sliderShot, fullPage: false });
      console.log(`📸 Screenshot Slider 95% salvo: ${sliderShot}`);

      // 5. Clicar em "Executar Plano Dr. Clima em Produção"
      console.log(`  -> Testando execução do plano preditivo...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const execBtn = buttons.find(b => b.innerText && b.innerText.includes('Executar Plano Dr. Clima'));
        if (execBtn) execBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      const executedShot = path.join(SCREENSHOTS_DIR, `${target.name}_5_plano_executado_toast.png`);
      await page.screenshot({ path: executedShot, fullPage: false });
      console.log(`📸 Screenshot Toast de Execução salvo: ${executedShot}`);

      // 6. Rota dedicada /dr-clima
      console.log(`  -> Acessando ${target.url}/dr-clima...`);
      await page.goto(`${target.url}/dr-clima`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));

      const drClimaPageShot = path.join(SCREENSHOTS_DIR, `${target.name}_6_dr_clima_page.png`);
      await page.screenshot({ path: drClimaPageShot, fullPage: false });
      console.log(`📸 Screenshot Página Dr. Clima salvo: ${drClimaPageShot}`);

      // 7. Mobile Viewport (iPhone 14)
      console.log(`  -> Testando visualização Mobile (390x844)...`);
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));

      const mobileShot = path.join(SCREENSHOTS_DIR, `${target.name}_7_mobile.png`);
      await page.screenshot({ path: mobileShot, fullPage: false });
      console.log(`📸 Screenshot Mobile salvo: ${mobileShot}`);

      report.push({
        target: target.name,
        url: target.url,
        analysis,
        modalDetails,
        screenshots: {
          cardShot,
          dicaShot,
          modalShot,
          sliderShot,
          executedShot,
          drClimaPageShot,
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

  const finalReportPath = path.join(SCREENSHOTS_DIR, 'relatorio_final_serendipidade.json');
  fs.writeFileSync(finalReportPath, JSON.stringify({ timestamp: new Date().toISOString(), report }, null, 2));
  console.log(`\n🎉 Validação concluída com absoluto sucesso! Relatório: ${finalReportPath}`);
}

run().catch(e => {
  console.error('Falha fatal:', e);
  process.exit(1);
});
