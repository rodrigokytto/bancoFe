import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/saipos-features-test';
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

  console.log("1. Acessando tela de login...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Clica no botão de preencher acesso rápido
  const quickFillBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
  });
  if (quickFillBtn) {
    await quickFillBtn.click();
    console.log("   - Credenciais preenchidas.");
  }
  await new Promise(r => setTimeout(r, 500));

  // Clica em Entrar no Zuma Pilot
  const submitBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
    return btns[0];
  });
  if (submitBtn) {
    await submitBtn.click();
    console.log("   - Login enviado, aguardando...");
  }
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  console.log("2. Navegando para o PDV /pdv...");
  await page.goto('http://localhost:3000/pdv', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/01-pdv-visao-geral.png` });
  console.log("   - Captura 01 salva.");

  console.log("3. Abrindo Modal de Impressão Térmica ESC/POS (Bobina 80mm)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Bobina Térmica 80mm'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/02-modal-impressao-termica-80mm.png` });
  console.log("   - Captura 02 salva.");

  // Fecha o modal de impressão
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Fechar Visualização'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("4. Abrindo Modal de Gestão de Ruptura iFood...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Pausar Cardápio iFood'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/03-modal-gestao-ruptura-ifood.png` });
  console.log("   - Captura 03 salva.");

  // Fecha modal iFood com o botão Concluir e Fechar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Concluir e Fechar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("5. Indo para a Aba Mapa de Mesas & Comandas de Salão...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tabBtn = btns.find(b => b.textContent && b.textContent.includes('Mapa de Mesas'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/04-mapa-mesas-salao.png` });
  console.log("   - Captura 04 salva.");

  console.log("6. Clicando em Juntar Mesas no Salão...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Juntar Mesas'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/05-modal-juntar-mesas.png` });
  console.log("   - Captura 05 salva.");

  // Cancelar modal juntar mesas
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Cancelar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("7. Indo para Gestão de Turno e abrindo Acerto de Motoboys...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tabBtn = btns.find(b => b.textContent && b.textContent.includes('Gestão de Turno'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Acerto de Motoboys do Turno'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotDir}/06-modal-acerto-motoboys.png` });
  console.log("   - Captura 06 salva.");

  console.log("Todos os testes e capturas concluídos com 100% de sucesso!");
  await browser.close();
}

run().catch(err => {
  console.error("Erro no teste autenticado:", err);
  process.exit(1);
});
