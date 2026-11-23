const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // 1. Inicializa autenticação no Zuma Pilot
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

  const targets = [
    { url: 'http://localhost:3000/integracoes?tab=sefaz_dfe', path: '/home/ubuntu/screenshots/mercado-holding/27_integracoes_sefaz_dfe_fiscal.png' },
    { url: 'http://localhost:3000/integracoes?tab=supply_agro', path: '/home/ubuntu/screenshots/mercado-holding/28_integracoes_supply_chain_commodities_agro.png' },
    { url: 'http://localhost:3000/integracoes?tab=meta_social', path: '/home/ubuntu/screenshots/mercado-holding/29_integracoes_meta_social_commerce.png' },
    { url: 'http://localhost:3000/integracoes?tab=dr_clima_frota', path: '/home/ubuntu/screenshots/mercado-holding/30_integracoes_dr_clima_logistica_chuva.png' },
    { url: 'http://localhost:3000/integracoes?tab=crm_fidelidade', path: '/home/ubuntu/screenshots/mercado-holding/31_integracoes_crm_fidelidade_rfv.png' }
  ];

  for (const item of targets) {
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: item.path, fullPage: false });
    console.log(`Captured: ${item.path}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully with authenticated session!");
}

capture().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
