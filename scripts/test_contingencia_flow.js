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

  await page.click('div[data-table-num="3"]');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConta = btns.find(b => b.innerText.includes('Pedir Conta'));
    if (btnConta) btnConta.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Cartão TEF já abre selecionado. Clicar no checkbox de contingência manual
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const labelContingencia = labels.find(l => l.innerText.includes('Contingência Manual'));
    if (labelContingencia) {
      const cb = labelContingencia.querySelector('input[type="checkbox"]');
      if (cb) cb.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Estado 1: Contingência aberta mas sem preencher os campos -> Deve estar BLOQUEADO
  const resultBloqueado = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled
    };
  });
  console.log('Contingência sem preenchimento:', resultBloqueado);
  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_tef_contingencia_vazia_bloqueada.png' });

  // Preencher os 4 últimos dígitos do cartão
  const inputs = await page.$$('input[type="text"]');
  for (const input of inputs) {
    const placeholder = await page.evaluate(el => el.placeholder, input);
    if (placeholder && placeholder.includes('4892')) {
      await input.type('5819');
    }
    if (placeholder && placeholder.includes('839102')) {
      await input.type('AUT-77291');
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Estado 2: Contingência totalmente preenchida -> Deve estar LIBERADO
  const resultLiberado = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento & Liberar Mesa') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled
    };
  });
  console.log('Contingência totalmente preenchida:', resultLiberado);
  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_tef_contingencia_preenchida_liberada.png' });

  await browser.close();
}

run().catch(console.error);
