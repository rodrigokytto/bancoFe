import puppeteer from "puppeteer-core";
import fs from "fs";

const screenshotsDir = "/home/ubuntu/screenshots/modular-navigation";
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function run() {
  console.log("Iniciando Chromium...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--headless=new"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Injetar autenticação antes de qualquer navegação
  await page.evaluateOnNewDocument(() => {
    const user = {
      id: 1,
      openId: "usr_rodrigo_zuma",
      name: "Rodrigo Ribeiro Gonçalves",
      email: "rrodrigogon@gmail.com",
      role: "admin",
      cargo: "Proprietário & Administrador Geral",
      unidade: "Tangará da Serra - MT",
      lastSignedIn: new Date().toISOString(),
    };
    localStorage.setItem("zuma_auth_session", JSON.stringify(user));
  });

  console.log("1. Navegando para /cockpit (Módulo Comando)...");
  await page.goto("http://127.0.0.1:3000/cockpit", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector("aside", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotsDir}/01-modulo-comando-cockpit.png` });

  console.log("2. Abrindo dropdown do Seletor de Módulos...");
  const moduleButton = await page.$("aside button[title*='alternar entre os Módulos']");
  if (moduleButton) {
    await moduleButton.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${screenshotsDir}/02-seletor-modulos-dropdown-aberto.png` });
  }

  console.log("3. Navegando para Módulo Operação & Salão (/pdv)...");
  await page.goto("http://127.0.0.1:3000/pdv", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotsDir}/03-modulo-operacao-pdv.png` });

  console.log("4. Navegando para Central de Apps & APKs (/apps)...");
  await page.goto("http://127.0.0.1:3000/apps", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: `${screenshotsDir}/04-central-apps-e-apks.png` });

  console.log("5. Testando versão mobile (drawer)...");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000/cockpit", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));
  const menuBtn = await page.$("button[aria-label='Abrir menu']");
  if (menuBtn) {
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: `${screenshotsDir}/05-mobile-drawer-seletor.png` });

  await browser.close();
  console.log("Testes e capturas finalizados com sucesso em:", screenshotsDir);
}

run().catch((err) => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
