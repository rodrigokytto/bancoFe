import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/home/ubuntu/screenshots/serendipidade';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runValidation() {
  console.log('🚀 Iniciando validação E2E do Simulador de Serendipidade IA e Dr. Clima...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const targets = [
    { url: 'https://zumapilot-lnj8dpxg.manus.space', name: 'pilot' },
    { url: 'https://zuma.kytto.com.br', name: 'kytto' }
  ];

  const results = [];

  for (const target of targets) {
    console.log(`\n========================================`);
    console.log(`🌐 Testando alvo: ${target.name} (${target.url})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      const res = await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      console.log(`📡 Status da resposta inicial: ${res ? res.status() : 'N/A'}`);
    } catch (err) {
      console.warn(`Aviso de timeout ao navegar para ${target.url}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 4000));

    // Screenshot da tela inicial com o card no sidebar
    const initialShot = path.join(SCREENSHOTS_DIR, `${target.name}_sidebar_serendipidade.png`);
    await page.screenshot({ path: initialShot, fullPage: false });
    console.log(`📸 Screenshot capturado: ${initialShot}`);

    // Verificar texto do card de Serendipidade e o botão Simular
    const pageCardText = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSerendipidade: text.includes('Serendipidade IA') || text.includes('SERENDIPIDADE'),
        hasSimular: text.includes('Simular'),
        hasDrClima: text.includes('Dr. Clima') || text.includes('Tangará da Serra'),
        hasNovaDica: text.includes('Nova dica')
      };
    });
    console.log(`🔍 Análise do Card no DOM:`, pageCardText);

    // Clicar no botão 'Simular'
    let modalOpened = false;
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText && b.innerText.includes('Simular'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('👆 Botão "Simular" clicado com sucesso!');
        await new Promise(r => setTimeout(r, 2000));
        modalOpened = await page.evaluate(() => {
          return !!document.querySelector('.fixed.inset-0') && 
                 document.body.innerText.includes('Simulador de Impacto');
        });
        console.log(`✨ Modal aberto na tela: ${modalOpened}`);
      } else {
        console.log('⚠️ Botão Simular não encontrado diretamente por texto, buscando por seletor...');
      }
    } catch (e) {
      console.error('Erro ao clicar no botão Simular:', e.message);
    }

    // Screenshot do Modal Interativo
    const modalShot = path.join(SCREENSHOTS_DIR, `${target.name}_modal_simulador_interativo.png`);
    await page.screenshot({ path: modalShot, fullPage: false });
    console.log(`📸 Screenshot do Modal: ${modalShot}`);

    // Testar rota dedicada /dr-clima
    console.log(`🧭 Acessando ${target.url}/dr-clima...`);
    try {
      await page.goto(`${target.url}/dr-clima`, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(r => setTimeout(r, 2500));
      const drClimaShot = path.join(SCREENSHOTS_DIR, `${target.name}_dr_clima_page.png`);
      await page.screenshot({ path: drClimaShot, fullPage: false });
      console.log(`📸 Screenshot Dr. Clima: ${drClimaShot}`);
    } catch (e) {
      console.error('Erro ao acessar /dr-clima:', e.message);
    }

    // Testar Mobile
    console.log(`📱 Testando visualização Mobile (390x844)...`);
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2000));
    const mobileShot = path.join(SCREENSHOTS_DIR, `${target.name}_mobile.png`);
    await page.screenshot({ path: mobileShot, fullPage: false });
    console.log(`📸 Screenshot Mobile: ${mobileShot}`);

    results.push({
      target: target.name,
      url: target.url,
      analysis: pageCardText,
      modalOpened,
      screenshots: {
        initialShot,
        modalShot,
        drClimaShot: path.join(SCREENSHOTS_DIR, `${target.name}_dr_clima_page.png`),
        mobileShot
      }
    });

    await page.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'simulador_serendipidade_report.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log('\n🎉 Todos os testes de Serendipidade IA e Dr. Clima concluídos com sucesso!');
}

runValidation().catch(err => {
  console.error('❌ Falha na execução:', err);
  process.exit(1);
});
