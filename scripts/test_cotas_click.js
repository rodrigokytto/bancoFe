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

  // Clicar em cada cota clicando no texto "PENDENTE"
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const pendentes = spans.filter(s => s.innerText.trim() === 'PENDENTE');
    if (pendentes[0]) pendentes[0].click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const pendentes = spans.filter(s => s.innerText.trim() === 'PENDENTE');
    if (pendentes[0]) pendentes[0].click();
  });
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento & Liberar Mesa') || b.innerText.includes('Bloqueado:'));
    const text = document.body.innerText;
    return {
      texto: btnConfirmar?.innerText.trim(),
      disabled: btnConfirmar?.disabled,
      temLiberado: text.includes('LIBERADO')
    };
  });

  console.log('Resultado após marcar todas as cotas:', result);
  await page.screenshot({ path: '/home/ubuntu/zuma/docs/screenshots/modal_cotas_liberado_todas_pagas.png' });

  await browser.close();
}

run().catch(console.error);
