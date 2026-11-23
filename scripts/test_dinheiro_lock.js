import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Abrir Mesa 03 e Pedir Conta
  await page.click('div[data-table-num="3"]');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConta = btns.find(b => b.innerText.includes('Pedir Conta'));
    if (btnConta) btnConta.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Clicar em Dinheiro
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnDinheiro = btns.find(b => b.innerText.includes('Dinheiro'));
    if (btnDinheiro) btnDinheiro.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Simular digitação de R$ 50 no input de dinheiro usando page.type ou native setter
  const inputEl = await page.$('input[inputmode="decimal"]');
  if (inputEl) {
    await inputEl.click({ clickCount: 3 });
    await inputEl.press('Backspace');
    await inputEl.type('50');
  }
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    const text = document.body.innerText;
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled,
      temAlertaFalta: text.includes('Falta para Quitar a Mesa')
    };
  });

  console.log('Resultado Dinheiro R$ 50,00 (Total R$ 235,29):', result);

  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_dinheiro_bloqueio_insuficiente.png' });

  await browser.close();
}

run().catch(console.error);
