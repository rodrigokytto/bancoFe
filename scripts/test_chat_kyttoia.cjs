const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testChat() {
  const outputDir = '/home/ubuntu/screenshots/kyttoia';

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 1080 }
  });

  const page = await browser.newPage();

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const quickBtn = btns.find(b => b.textContent && b.textContent.includes('Preencher Acesso Rodrigo'));
    if (quickBtn) quickBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Navegar para mercado
  await page.goto('http://localhost:3000/mercado?locale=pt-BR', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Clicar na aba Chat IA & Inteligência
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && (b.textContent.includes('Chat IA') || b.textContent.includes('Inteligência')));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Clicar na primeira pergunta rápida: "Capturar clientes do Bonsai no Jardim Europa"
  console.log('Clicando na pergunta rápida do chat...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && b.textContent.includes('Capturar clientes do Bonsai no Jardim Europa'));
    if (target) target.click();
  });

  console.log('Aguardando resposta da KyttoIA no chat...');
  try {
    await page.waitForFunction(
      () => {
        const msgs = document.querySelectorAll('.max-w-\\[85\\%\\]');
        return msgs.length >= 3; // inicial + pergunta + resposta da KyttoIA
      },
      { timeout: 45000 }
    );
    console.log('Resposta do chat KyttoIA recebida com sucesso!');
  } catch (e) {
    console.warn('Timeout aguardando mensagem:', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, '04_kyttoia_chat_resposta_concorrente.png'), fullPage: false });

  await browser.close();
  console.log('Screenshot 04 capturado com sucesso!');
}

testChat().catch(err => {
  console.error(err);
  process.exit(1);
});
