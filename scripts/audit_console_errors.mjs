import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1400,900'],
    headless: 'new'
  });
  
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Preencher Acesso Rodrigo'));
    if (btn) btn.click();
  });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent.includes('Entrar no Zuma Pilot') || b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});

  const testRoutes = [
    '/cockpit',
    '/mapa-de-calor',
    '/previsao-compras',
    '/integracoes',
    '/pdv',
    '/erp',
    '/erp?tab=comercial',
    '/erp?tab=rh',
    '/erp?tab=compras',
    '/erp?tab=estoque',
    '/zumi',
    '/atendimento'
  ];

  console.log('Iniciando auditoria de erros de console...');
  for (const route of testRoutes) {
    consoleErrors.length = 0;
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 800));
      if (consoleErrors.length > 0) {
        console.log(`[ALERTA] Erros em ${route}:`, consoleErrors);
      } else {
        console.log(`[OK] ${route} carregou sem erros de console!`);
      }
    } catch (e) {
      console.log(`[FALHA] Timeout ou erro ao acessar ${route}:`, e.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
