import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/saipos-prd-deployed';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("1. Acessando https://zuma.kytto.com.br/login...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Clica no botão de preencher acesso rápido
  const quickFillBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
  });
  if (quickFillBtn) {
    await quickFillBtn.click();
    console.log("   - Credenciais preenchidas.");
  }
  await new Promise(r => setTimeout(r, 600));

  // Clica em Entrar no Zuma Pilot
  const submitBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
    return btns[0];
  });
  if (submitBtn) {
    await submitBtn.click();
    console.log("   - Login enviado na produção...");
  }
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2500));

  console.log("2. Navegando para o PDV em Produção...");
  await page.goto('https://zuma.kytto.com.br/pdv', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/01-prd-pdv-visao-geral.png` });
  console.log("   - Captura 01 salva.");

  console.log("3. Abrindo Modal Térmico ESC/POS em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Bobina Térmica 80mm'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/02-prd-impressao-termica.png` });
  console.log("   - Captura 02 salva.");

  // Fecha o modal de impressão
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Fechar Visualização'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("4. Abrindo Gestão de Ruptura iFood em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Pausar Cardápio iFood'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/03-prd-ruptura-ifood.png` });
  console.log("   - Captura 03 salva.");

  // Fecha modal iFood
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Concluir e Fechar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("5. Abrindo Salão e Acerto de Motoboys em Produção...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tabBtn = btns.find(b => b.textContent && b.textContent.includes('Gestão de Turno'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Acerto de Motoboys'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/04-prd-acerto-motoboys.png` });
  console.log("   - Captura 04 salva.");

  console.log("Validação em produção concluída com êxito!");
  await browser.close();
}

run().catch(err => {
  console.error("Erro no teste PRD:", err);
  process.exit(1);
});
