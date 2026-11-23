import puppeteer from "puppeteer-core";
import fs from "fs";

const SCREENSHOT_DIR = "/home/ubuntu/screenshots/zuma_serin_menu";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1440,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Login
  await page.goto("http://127.0.0.1:3000/login", { waitUntil: "networkidle0" });
  const pass = await page.$("input[type='password']");
  if (pass) {
    await page.type("input[type='password']", "#080581");
    await page.click("button[type='submit']");
  }
  await new Promise(r => setTimeout(r, 2000));

  // Cockpit
  await page.goto("http://127.0.0.1:3000/cockpit", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_serin_menu_cockpit.png` });

  // Previsao Compras
  await page.goto("http://127.0.0.1:3000/previsao-compras", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02_serin_menu_previsao_compras.png` });

  // Integracoes
  await page.goto("http://127.0.0.1:3000/integracoes", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03_serin_menu_integracoes.png` });

  await browser.close();
  console.log("Screenshots do menu Serin salvos com sucesso!");
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
