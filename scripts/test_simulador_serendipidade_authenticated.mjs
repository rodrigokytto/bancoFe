import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/serendipidade_auth';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação autenticada com Puppeteer...');

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
      // 1. Acessar página de login
      console.log(`  -> Acessando ${target.url}/login`);
      await page.goto(`${target.url}/login`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      // 2. Preencher senha e autenticar
      const passInput = await page.$("input[type='password']");
      if (passInput) {
        await passInput.type('#080581');
        console.log(`  -> Senha #080581 digitada.`);
      }

      // Clicar em Entrar
      const submitBtn = await page.$("button[type='submit']");
      if (submitBtn) {
        await submitBtn.click();
        console.log(`  -> Botão de login clicado.`);
      } else {
        const buttons = await page.$$("button");
        for (const b of buttons) {
          const txt = await page.evaluate(el => el.innerText, b);
          if (txt && txt.includes("Entrar no Zuma Pilot")) {
            await b.click();
            console.log(`  -> Botão 'Entrar no Zuma Pilot' clicado.`);
            break;
          }
        }
      }

      // Aguardar autenticação e carregamento do Dashboard
      await new Promise(r => setTimeout(r, 4000));
      console.log(`  -> URL pós-login: ${page.url()}`);

      // Screenshot 1: Dashboard autenticado com Sidebar e Card Serendipidade IA
      const dashShot = path.join(SCREENSHOTS_DIR, `${target.name}_1_dashboard_autenticado.png`);
      await page.screenshot({ path: dashShot, fullPage: false });
      console.log(`📸 Screenshot salvo: ${dashShot}`);

      // Analisar card de Serendipidade
      const cardAnalysis = await page.evaluate(() => {
        const allText = document.body.innerText;
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        const hasCard = allText.includes('SERENDIPIDADE IA') || allText.includes('Serendipidade IA');
        const hasSimularBtn = buttons.some(b => b.includes('Simular'));
        const hasNovaDicaBtn = buttons.some(b => b.includes('Nova dica'));
        const hasDrClima = allText.includes('Dr. Clima') || allText.includes('Tangará');

        return {
          hasCard,
          hasSimularBtn,
          hasNovaDicaBtn,
          hasDrClima,
          buttonLabels: buttons.slice(0, 20)
        };
      });
      console.log(`🔍 Análise do Card de Serendipidade:`, cardAnalysis);

      // 3. Testar botão "Nova dica" (rotação de critérios)
      console.log(`  -> Testando rotação de critérios via botão "Nova dica"...`);
      const rotated = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const novaDica = buttons.find(b => b.innerText && b.innerText.includes('Nova dica'));
        if (novaDica) {
          novaDica.click();
          return true;
        }
        return false;
      });
      console.log(`  -> Botão 'Nova dica' clicado: ${rotated}`);
      await new Promise(r => setTimeout(r, 1500));

      const dicaRotatedShot = path.join(SCREENSHOTS_DIR, `${target.name}_2_nova_dica_rotacionada.png`);
      await page.screenshot({ path: dicaRotatedShot, fullPage: false });
      console.log(`📸 Screenshot da dica rotacionada salvo: ${dicaRotatedShot}`);

      // 4. Testar botão "Simular" para abrir o Modal Interativo de Serendipidade IA
      console.log(`  -> Clicando no botão "Simular" para abrir o modal...`);
      const modalTriggered = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const simularBtn = buttons.find(b => b.innerText && b.innerText.includes('Simular'));
        if (simularBtn) {
          simularBtn.click();
          return true;
        }
        return false;
      });
      console.log(`  -> Botão 'Simular' disparado: ${modalTriggered}`);
      await new Promise(r => setTimeout(r, 2000));

      // Screenshot 3: Modal Interativo Aberto
      const modalShot = path.join(SCREENSHOTS_DIR, `${target.name}_3_modal_simulador_interativo.png`);
      await page.screenshot({ path: modalShot, fullPage: false });
      console.log(`📸 Screenshot do Modal Interativo salvo: ${modalShot}`);

      // Analisar conteúdo do modal
      const modalData = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return { open: false };
        const text = modal.innerText;
        return {
          open: true,
          hasTangara: text.includes('Tangará da Serra') || text.includes('-14.6228'),
          hasSliders: !!modal.querySelector('input[type="range"]'),
          hasProjetado: text.includes('Receita Projetada') || text.includes('R$'),
          hasExecutarBtn: text.includes('Executar Plano') || text.includes('Plano Dr. Clima')
        };
      });
      console.log(`✨ Dados do Modal Interativo:`, modalData);

      // 5. Testar interação com slider e clique no botão de execução
      console.log(`  -> Movendo slider de probabilidade de chuva para 90%...`);
      await page.evaluate(() => {
        const slider = document.querySelector('input[type="range"]');
        if (slider) {
          slider.value = '90';
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 1000));

      const sliderMovedShot = path.join(SCREENSHOTS_DIR, `${target.name}_4_modal_slider_interagido.png`);
      await page.screenshot({ path: sliderMovedShot, fullPage: false });
      console.log(`📸 Screenshot pós-slider salvo: ${sliderMovedShot}`);

      // 6. Testar navegação para página dedicada /dr-clima
      console.log(`  -> Navegando para página dedicada ${target.url}/dr-clima...`);
      await page.goto(`${target.url}/dr-clima`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2500));

      const drClimaPageShot = path.join(SCREENSHOTS_DIR, `${target.name}_5_dr_clima_pagina_dedicada.png`);
      await page.screenshot({ path: drClimaPageShot, fullPage: false });
      console.log(`📸 Screenshot Página Dr. Clima salvo: ${drClimaPageShot}`);

      // 7. Testar Mobile Viewport (iPhone 14)
      console.log(`  -> Testando visualização Mobile (390x844)...`);
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2500));

      const mobileShot = path.join(SCREENSHOTS_DIR, `${target.name}_6_mobile_view.png`);
      await page.screenshot({ path: mobileShot, fullPage: false });
      console.log(`📸 Screenshot Mobile salvo: ${mobileShot}`);

      report.push({
        target: target.name,
        url: target.url,
        cardAnalysis,
        modalData,
        screenshots: {
          dashShot,
          dicaRotatedShot,
          modalShot,
          sliderMovedShot,
          drClimaPageShot,
          mobileShot
        }
      });

    } catch (err) {
      console.error(`Erro ao validar ${target.name}:`, err);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const reportPath = path.join(SCREENSHOTS_DIR, 'relatorio_validacao_autenticada.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), report }, null, 2));
  console.log(`\n🎉 Relatório final salvo em: ${reportPath}`);
}

run().catch(e => {
  console.error('Falha fatal:', e);
  process.exit(1);
});
