import puppeteer from 'puppeteer-core';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('Navegando para tela de login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Clicar em "Preencher Acesso Rodrigo (Dono)"
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Rodrigo (Dono)')) {
      console.log('Clicando em botão de preenchimento de login...');
      await b.click();
      await new Promise(r => setTimeout(r, 500));
      break;
    }
  }

  // Clicar em "Entrar no Zuma Pilot"
  const submitButtons = await page.$$('button');
  for (const b of submitButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Entrar no Zuma Pilot')) {
      console.log('Clicando em Entrar...');
      await b.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }

  console.log('Navegando para http://localhost:3000/pagamentos...');
  await page.goto('http://localhost:3000/pagamentos', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/pagamentos_autenticado.png', fullPage: true });

  // Procurar aba 'Fechamento' ou 'Fechamento de Caixa'
  const tabButtons = await page.$$('button');
  for (const b of tabButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Fechamento') || text.includes('Turno'))) {
      console.log('Clicando na aba de fechamento:', text.trim());
      await b.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/fechamento_dino_completo.png', fullPage: true });

  console.log('Navegando para http://localhost:3000/garcom...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/garcom_autenticado.png', fullPage: true });

  await browser.close();
  console.log('Todas as capturas internas foram geradas com êxito!');
}

capture().catch(err => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
