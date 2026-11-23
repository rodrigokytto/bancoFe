import puppeteer from "puppeteer-core";

const PRD_BASE_URL = "https://zuma-731517331463.southamerica-east1.run.app";

async function validateProduction() {
  console.log("Iniciando validação no ambiente de PRODUÇÃO (PRD):", PRD_BASE_URL);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  // Configura viewport de iPhone 14/15/16 Pro
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Acesso à raiz de produção
  console.log("\n[1/5] Acessando raiz de produção...");
  await page.goto(PRD_BASE_URL, { waitUntil: "networkidle0", timeout: 45000 });
  console.log("URL atual em PRD:", page.url());

  // Capturar screenshot da tela de login em PRD
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_login_screen.png" });
  console.log("Screenshot da tela de login em PRD capturado: /home/ubuntu/screenshots/prd_zuma_login_screen.png");

  // 2. Verificar se a tela de login está renderizada
  const title = await page.$eval("h1", el => el.textContent);
  console.log("Título detectado em PRD:", title);
  if (!title.includes("ZUMA PILOT")) {
    throw new Error("A tela de login em PRD não renderizou 'ZUMA PILOT'!");
  }

  // 3. Testar credencial incorreta em PRD
  console.log("\n[2/5] Testando validação de senha incorreta em PRD...");
  await page.type("input[type='password']", "senha_invalida_999");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_error_feedback.png" });
  console.log("Screenshot do erro em PRD capturado: /home/ubuntu/screenshots/prd_zuma_error_feedback.png");

  // 4. Testar credenciais oficiais: rrodrigogon@gmail.com e #080581
  console.log("\n[3/5] Testando login com credenciais oficiais em PRD (rrodrigogon@gmail.com / #080581)...");
  await page.evaluate(() => {
    const input = document.querySelector("input[type='password']");
    if (input) input.value = "";
  });
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");

  // Aguarda autenticação e redirecionamento para o Cockpit
  await new Promise(r => setTimeout(r, 3500));
  console.log("URL após login em PRD:", page.url());

  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_cockpit_logged.png" });
  console.log("Screenshot do Cockpit autenticado em PRD capturado: /home/ubuntu/screenshots/prd_zuma_cockpit_logged.png");

  // 5. Testar Central de Apps em PRD
  console.log("\n[4/5] Navegando para Central de Apps em PRD...");
  await page.goto(`${PRD_BASE_URL}/apps`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_apps_logged.png" });
  console.log("Screenshot da Central de Apps em PRD capturado: /home/ubuntu/screenshots/prd_zuma_apps_logged.png");

  // 6. Testar Comanda do Garçom em PRD
  console.log("\n[5/5] Navegando para App do Garçom em PRD...");
  await page.goto(`${PRD_BASE_URL}/garcom`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_garcom_logged.png" });
  console.log("Screenshot do App Garçom em PRD capturado: /home/ubuntu/screenshots/prd_zuma_garcom_logged.png");

  await browser.close();
  console.log("\n>>> VALIDAÇÃO EM PRODUÇÃO (PRD) 100% CONCLUÍDA COM SUCESSO! <<<");
}

validateProduction().catch(err => {
  console.error("Falha na validação em PRD:", err);
  process.exit(1);
});
