import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium para captura aprofundada em PRD (https://zuma.kytto.com.br/integracoes)...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // 1. Login
  console.log("1. Acessando https://zuma.kytto.com.br/login...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('button', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && (b.innerText.includes('Preencher Acesso') || b.innerText.includes('Rodrigo')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.getAttribute('type') === 'submit' || (b.innerText && b.innerText.includes('Entrar')));
    if (btn) btn.click();
  });
  console.log("   - Login enviado. Aguardando...");
  await new Promise(r => setTimeout(r, 3500));

  // 2. Hub de Integrações
  console.log("2. Acessando https://zuma.kytto.com.br/integracoes...");
  await page.goto('https://zuma.kytto.com.br/integracoes', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('aside', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll um pouco para ver os cards das 26 conexões
  await page.evaluate(() => window.scrollBy(0, 320));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${screenshotDir}/05-prd-hub-26-integracoes.png` });
  console.log("   - [OK] Captura 05: Cards de Integrações salva.");

  // 3. Teste Filtro "Hardware & IoT"
  console.log("3. Clicando no filtro 'Hardware & IoT'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Hardware & IoT'));
    if (btn) {
      btn.scrollIntoView();
      btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/06-prd-filtro-hardware-iot.png` });
  console.log("   - [OK] Captura 06: Filtro Hardware & IoT salva.");

  // 4. Teste Filtro "Pagamentos & Pix"
  console.log("4. Clicando no filtro 'Pagamentos & Pix'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Pagamentos & Pix'));
    if (btn) {
      btn.scrollIntoView();
      btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/06b-prd-filtro-pagamentos-pix.png` });
  console.log("   - [OK] Captura 06b: Filtro Pagamentos & Pix salva.");

  // 5. Clica na aba "Matriz de Dados & Protocolos"
  console.log("5. Clicando na aba 'Matriz de Dados & Protocolos'...");
  await page.evaluate(() => {
    // Rola para o topo para clicar na aba
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Matriz de Dados & Protocolos'));
    if (btn) {
      btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Rola suavemente para mostrar a tabela de matriz técnica
  await page.evaluate(() => window.scrollBy(0, 320));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${screenshotDir}/07-prd-matriz-protocolos.png` });
  console.log("   - [OK] Captura 07: Tabela da Matriz Técnica de Protocolos salva.");

  // 6. Teste da busca instantânea (ex: buscar "Sicredi")
  console.log("6. Testando busca instantânea por 'Sicredi'...");
  await page.evaluate(() => {
    // Clica de volta na primeira aba
    const btns = Array.from(document.querySelectorAll('button'));
    const tab1 = btns.find(b => b.innerText && b.innerText.includes('Catálogo de Conexões'));
    if (tab1) tab1.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Preenche o input de busca
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Buscar conexão"]');
    if (input) {
      input.value = 'Sicredi';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/07b-prd-busca-instantanea.png` });
  console.log("   - [OK] Captura 07b: Busca instantânea salva.");

  await browser.close();
  console.log("\nTodas as capturas detalhadas foram concluídas!");
}

run().catch(err => {
  console.error("Erro na execução:", err);
  process.exit(1);
});
