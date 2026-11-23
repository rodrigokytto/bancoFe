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

  // Clicar em Cotas na Mesa
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnCotas = btns.find(b => b.innerText.includes('Cotas na Mesa'));
    if (btnCotas) btnCotas.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const result0Cotas = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled
    };
  });
  console.log('Resultado 0/2 Cotas Pagas:', result0Cotas);
  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_cotas_bloqueio_pendente.png' });

  // Pagar Cota 1
  await page.evaluate(() => {
    const cotas = Array.from(document.querySelectorAll('div'));
    const cota1 = cotas.find(c => c.innerText && c.innerText.includes('Pagante 1') && c.innerText.includes('Pendente'));
    if (cota1) cota1.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const result1Cota = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled
    };
  });
  console.log('Resultado 1/2 Cotas Pagas:', result1Cota);

  // Pagar Cota 2
  await page.evaluate(() => {
    const cotas = Array.from(document.querySelectorAll('div'));
    const cota2 = cotas.find(c => c.innerText && c.innerText.includes('Pagante 2') && c.innerText.includes('Pendente'));
    if (cota2) cota2.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const result2Cotas = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled
    };
  });
  console.log('Resultado 2/2 Cotas Pagas (100%):', result2Cotas);
  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_cotas_liberado_todas_pagas.png' });

  await browser.close();
}

run().catch(console.error);
