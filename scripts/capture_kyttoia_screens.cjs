const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function capture() {
  const outputDir = '/home/ubuntu/screenshots/kyttoia';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Iniciando Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1080'],
    defaultViewport: { width: 1440, height: 1080 }
  });

  const page = await browser.newPage();

  // 1. Login
  console.log('Navegando para tela de login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Preenchendo credenciais Rodrigo...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const quickBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso Rodrigo'));
    if (quickBtn) quickBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  console.log('Submetendo formulário de login...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // 2. Navegar para Mercado Benchmark
  console.log('Navegando para /mercado?locale=pt-BR...');
  await page.goto('http://localhost:3000/mercado?locale=pt-BR', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Clicar na aba "apis-reais" (APIs & Dados Reais)
  console.log('Localizando aba APIs & Dados Reais...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && b.textContent.includes('APIs & Dados Reais'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll até a Central KyttoIA
  await page.evaluate(() => {
    const el = document.querySelector('.bg-gradient-to-br.from-purple-950\\/20');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capturar Tela 1: Visão Geral da Central KyttoIA
  console.log('Capturando 01_kyttoia_central_estrategica.png...');
  await page.screenshot({ path: path.join(outputDir, '01_kyttoia_central_estrategica.png'), fullPage: false });

  // 4. Clicar no botão da sugestão rápida "Plano +R$ 100k Faturamento"
  console.log('Disparando consulta ao vivo KyttoIA: Plano +R$ 100k Faturamento...');
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && b.textContent.includes('Plano +R$ 100k Faturamento'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (clicked) {
    console.log('Aguardando resposta em tempo real da KyttoIA Neural Engine (v2.5 Flash)...');
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Diagnóstico & Plano Tático KyttoIA') ||
              document.body.innerText.includes('Projeção Faturamento'),
        { timeout: 45000 }
      );
      console.log('Resposta recebida com sucesso!');
    } catch (e) {
      console.warn('Timeout aguardando elemento exato:', e.message);
    }
  }

  await new Promise(r => setTimeout(r, 3000));

  // Scroll suave para focar no card do plano gerado
  await page.evaluate(() => {
    const el = document.querySelector('.bg-gradient-to-br.from-purple-950\\/20');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturando 02_kyttoia_plano_faturamento_gerado.png...');
  await page.screenshot({ path: path.join(outputDir, '02_kyttoia_plano_faturamento_gerado.png'), fullPage: false });

  // 5. Alternar para a aba "Chat IA & Inteligência"
  console.log('Alternando para aba Chat IA & Inteligência...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && (b.textContent.includes('Chat IA') || b.textContent.includes('Inteligência')));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Capturando 03_kyttoia_chat_consultora.png...');
  await page.screenshot({ path: path.join(outputDir, '03_kyttoia_chat_consultora.png'), fullPage: false });

  await browser.close();
  console.log('Todas as capturas finalizadas com sucesso!');
}

capture().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
