import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/pagamentos-prd';
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
  await page.setViewport({ width: 1440, height: 950 });

  console.log("1. Acessando https://zuma.kytto.com.br/login para autenticar...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Tenta preenchimento rápido se o botão existir
  try {
    const quickFillBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso'));
    });
    if (quickFillBtn) {
      await quickFillBtn.click();
      console.log("   - Credenciais preenchidas.");
      await new Promise(r => setTimeout(r, 500));
      const submitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
        return btns[0];
      });
      if (submitBtn) {
        await submitBtn.click();
        console.log("   - Login enviado.");
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  } catch (e) {
    console.log("   - Login bypass/já autenticado:", e.message);
  }

  console.log("2. Acessando https://zuma.kytto.com.br/pagamentos...");
  await page.goto('https://zuma.kytto.com.br/pagamentos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // Captura 1: Terminal de Recebimento
  await page.screenshot({ path: `${screenshotDir}/01_terminal_cobranca.png`, fullPage: false });
  console.log("   ✓ Captura 01 salva: Terminal de Recebimento");

  // Clica na Aba Extrato & Transações
  console.log("3. Abrindo aba Extrato & Transações...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const extratoBtn = buttons.find(b => b.textContent && b.textContent.includes('Extrato & Transações'));
    if (extratoBtn) extratoBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/02_extrato_transacoes.png`, fullPage: false });
  console.log("   ✓ Captura 02 salva: Extrato & Transações");

  // Clica na Aba Fechamento Diário de Caixa
  console.log("4. Abrindo aba Fechamento Diário de Caixa...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fechamentoBtn = buttons.find(b => b.textContent && b.textContent.includes('Fechamento Diário de Caixa'));
    if (fechamentoBtn) fechamentoBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/03_fechamento_caixa.png`, fullPage: false });
  console.log("   ✓ Captura 03 salva: Fechamento Diário de Caixa");

  // Clica em Relatório Z Térmico
  console.log("5. Abrindo modal do Relatório Z Térmico...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnZ = buttons.find(b => b.textContent && b.textContent.includes('Relatório Z Térmico'));
    if (btnZ) btnZ.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/04_relatorio_z_termico.png`, fullPage: false });
  console.log("   ✓ Captura 04 salva: Relatório Z Térmico");

  // Fecha o modal do Relatório Z
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const closeBtn = closeBtns.find(b => b.textContent && b.textContent.trim() === 'Fechar');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Clica na Aba Terminais & Adquirentes
  console.log("6. Abrindo aba Terminais & Adquirentes...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const termBtn = buttons.find(b => b.textContent && b.textContent.includes('Terminais & Adquirentes'));
    if (termBtn) termBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/05_terminais_adquirentes.png`, fullPage: false });
  console.log("   ✓ Captura 05 salva: Terminais & Adquirentes");

  // Teste Mobile
  console.log("7. Testando visualização mobile...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cobrancaBtn = buttons.find(b => b.textContent && b.textContent.includes('Terminal de Recebimento'));
    if (cobrancaBtn) cobrancaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/06_mobile_terminal.png`, fullPage: false });
  console.log("   ✓ Captura 06 salva: Mobile Terminal");

  await browser.close();
  console.log("\n Todas as 6 capturas concluídas com sucesso em:", screenshotDir);
}

run().catch(err => {
  console.error("Erro na execução:", err);
  process.exit(1);
});
