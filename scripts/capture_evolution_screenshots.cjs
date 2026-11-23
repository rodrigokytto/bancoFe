const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // 1. Configura sessão de login segura do Rodrigo
  console.log("Setting up authentication session...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    const user = {
      id: 1,
      openId: "usr_rodrigo_zuma",
      name: "Rodrigo Ribeiro Gonçalves",
      email: "rrodrigogon@gmail.com",
      role: "admin",
      cargo: "Proprietário & Administrador Geral",
      unidade: "Tangará da Serra - MT",
      lastSignedIn: new Date().toISOString()
    };
    localStorage.setItem("zuma_auth_session", JSON.stringify(user));
  });

  // 2. Captura do Simulador Estratégico da Holding em /mercado
  console.log("Navigating to /mercado...");
  await page.goto('http://localhost:3000/mercado?locale=pt-BR', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Clica no botão do Simulador Estratégico e faz scroll até o componente
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const simBtn = buttons.find(b => b.textContent && b.textContent.includes('Simulador Estratégico'));
    if (simBtn) {
      simBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    window.scrollBy(0, 480);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/mercado-holding/32_mercado_simulador_estrategico_holding.png', fullPage: false });
  console.log("Captured: 32_mercado_simulador_estrategico_holding.png");

  // 3. Captura Toledo Prix 6 em /integracoes?tab=toledo_balanca
  console.log("Navigating to Toledo Prix 6...");
  await page.goto('http://localhost:3000/integracoes?tab=toledo_balanca', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/mercado-holding/33_integracoes_toledo_prix6_pesagem.png', fullPage: false });
  console.log("Captured: 33_integracoes_toledo_prix6_pesagem.png");

  // 4. Captura ANVISA IoT Frio em /integracoes?tab=anvisa_iot
  console.log("Navigating to ANVISA IoT Frio...");
  await page.goto('http://localhost:3000/integracoes?tab=anvisa_iot', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/mercado-holding/34_integracoes_anvisa_iot_frio.png', fullPage: false });
  console.log("Captured: 34_integracoes_anvisa_iot_frio.png");

  await browser.close();
  console.log("Evolution screenshots captured successfully!");
}

capture().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
