import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/ultra_vision';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando validação completa de autenticação e Ultra Vision AI...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const targets = [
    { url: 'https://zumapilot-lnj8dpxg.manus.space', name: 'pilot_ultra' },
    { url: 'https://zuma.kytto.com.br', name: 'kytto_ultra' }
  ];

  for (const target of targets) {
    try {
      console.log(`\n========================================`);
      console.log(`🔍 Testando ambiente: ${target.url}...`);
      const page = await browser.newPage();
      
      // 1. Mobile viewport (iPhone 14)
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      
      // Acessar login
      console.log(`  -> Acessando ${target.url}/login`);
      await page.goto(`${target.url}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Preencher senha
      const passInput = await page.$("input[type='password']");
      if (passInput) {
        await passInput.type("#080581");
        console.log(`  -> Senha #080581 digitada.`);
      }

      // Clicar em Entrar
      const submitBtn = await page.$("button[type='submit']");
      if (submitBtn) {
        await submitBtn.click();
        console.log(`  -> Clicou no botão de submissão.`);
      } else {
        console.log(`  -> Botão submit não encontrado, clicando no botão por texto...`);
        const buttons = await page.$$("button");
        for (const b of buttons) {
          const txt = await page.evaluate(el => el.innerText, b);
          if (txt.includes("Entrar no Zuma Pilot")) {
            await b.click();
            break;
          }
        }
      }

      // Aguardar redirecionamento para o Cockpit ou autenticação
      await new Promise(r => setTimeout(r, 3000));
      console.log(`  -> URL atual após login: ${page.url()}`);

      // Navegar diretamente para /ultra
      console.log(`  -> Navegando para ${target.url}/ultra`);
      await page.goto(`${target.url}/ultra`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      console.log(`  -> URL atual em /ultra: ${page.url()}`);

      // Capturar screenshot Mobile
      const mobileShot = path.join(SCREENSHOTS_DIR, `${target.name}_mobile.png`);
      await page.screenshot({ path: mobileShot, fullPage: true });
      console.log(`  ✅ Mobile screenshot: ${mobileShot}`);

      // Capturar screenshot Desktop
      await page.setViewport({ width: 1440, height: 900 });
      await new Promise(r => setTimeout(r, 1500));
      const desktopShot = path.join(SCREENSHOTS_DIR, `${target.name}_desktop.png`);
      await page.screenshot({ path: desktopShot, fullPage: false });
      console.log(`  ✅ Desktop screenshot: ${desktopShot}`);

      // Avaliar dados carregados no DOM
      const pageTitle = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText);
      
      const checks = {
        currentUrl: page.url(),
        title: pageTitle,
        hasUltraVision: bodyText.includes('Ultra Vision') || bodyText.includes('CFTV AI'),
        hasAnvisa: bodyText.includes('ANVISA') || bodyText.includes('98.4%') || bodyText.includes('Sanitária'),
        hasYOLO: bodyText.includes('YOLO') || bodyText.includes('Pose'),
        hasCameras: bodyText.includes('CAM-01') || bodyText.includes('Sushibar'),
        hasColaboradores: bodyText.includes('Carlos') || bodyText.includes('Sushiman') || bodyText.includes('Equipe'),
        bodyLength: bodyText.length
      };

      console.log(`  📊 Diagnóstico Ultra Vision [${target.name}]:`, JSON.stringify(checks, null, 2));

      // Testar troca de abas (ex: Clientes e Alertas)
      const tabs = await page.$$('button');
      for (const t of tabs) {
        const text = await page.evaluate(el => el.textContent, t);
        if (text && text.includes('Mapeamento de Clientes')) {
          await t.click();
          await new Promise(r => setTimeout(r, 800));
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${target.name}_clientes_tab.png`), fullPage: false });
          console.log(`  ✅ Aba Clientes capturada!`);
          break;
        }
      }

      await page.close();
    } catch (err) {
      console.error(`❌ Erro em ${target.url}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n🎉 Validação e captura de telas concluídas com sucesso!');
}

run().catch(console.error);
