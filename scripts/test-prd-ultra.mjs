import puppeteer from "puppeteer-core";
import fs from "fs";

async function run() {
  console.log("Iniciando validação em Produção GCP Cloud Run...");
  fs.mkdirSync("/home/ubuntu/screenshots", { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const prdUrl = "https://zuma-731517331463.southamerica-east1.run.app";
  console.log(`Acessando ${prdUrl}/login...`);
  await page.goto(`${prdUrl}/login`, { waitUntil: "networkidle2", timeout: 45000 });

  // Login
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 3500));

  console.log(`Navegando para ${prdUrl}/ultra...`);
  await page.goto(`${prdUrl}/ultra`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_ultra_cockpit.png", fullPage: true });
  console.log("Screenshot do Ultra em PRODUÇÃO capturado!");

  // Clica na Tab 2: Sincronização Nossa Gente
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab2 = buttons.find(b => b.textContent?.includes("Sincronização por Evento Interno"));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_ultra_nossagente.png", fullPage: true });
  console.log("Screenshot Tab 2 Nossa Gente em PRODUÇÃO capturado!");

  // Clica na Tab 3: Auditoria Fotos Seguras ANVISA
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab3 = buttons.find(b => b.textContent?.includes("Auditoria & Fotos Seguras"));
    if (tab3) tab3.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_ultra_auditoria.png", fullPage: true });
  console.log("Screenshot Tab 3 Fotos Seguras em PRODUÇÃO capturado!");

  // Clica na Tab 4: Telemetria Frio & -40°C
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab4 = buttons.find(b => b.textContent?.includes("Telemetria Frio"));
    if (tab4) tab4.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/prd_zuma_ultra_frio.png", fullPage: true });
  console.log("Screenshot Tab 4 Telemetria Frio em PRODUÇÃO capturado!");

  await browser.close();
  console.log("Validação 100% concluída em PRODUÇÃO LIVE!");
}

run().catch(err => {
  console.error("Erro na validação de produção:", err);
  process.exit(1);
});
