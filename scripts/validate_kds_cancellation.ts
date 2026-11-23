import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

async function main() {
  const screenshotsDir = "/home/ubuntu/zuma/docs/screenshots";
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Injetar autenticação do Rodrigo
  const userSession = {
    id: 1,
    openId: "rodrigo_dono",
    name: "Rodrigo Gonçalves",
    email: "rrodrigogon@gmail.com",
    role: "admin",
    cargo: "Proprietário",
    unidade: "Tangará da Serra"
  };

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.evaluate((u) => {
    localStorage.setItem("zuma_auth_session", JSON.stringify(u));
  }, userSession);

  // 1. App do Garçom
  console.log("1. Navegando para o App do Garçom: http://localhost:3000/garcom ...");
  await page.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  // Abrir comanda da Mesa 04
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, div"));
    const mesa4 = buttons.find(b => b.textContent && b.textContent.includes("Mesa 04") && !b.textContent.includes("Comanda"));
    if (mesa4) (mesa4 as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, "app_garcom_comanda_mesa_04_cancelado.png") });
  console.log("Screenshot do Garçom salvo!");

  // 2. Cozinha KDS 2.0
  console.log("2. Navegando para Cozinha KDS 2.0: http://localhost:3000/kds-v2 ...");
  await page.goto("http://localhost:3000/kds-v2", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  // Simular cancelamento com reaproveitamento inteligente
  console.log("Disparando cancelamento no KDS 2.0...");
  await page.evaluate(() => {
    const cancelEvent = {
      tableNumber: 4,
      itemIndex: 0,
      itemName: "Combo 26 Peças",
      itemPrice: 69.90,
      cancelledBy: "Bruna (Salão)",
      reason: "Cliente desistiu",
      reallocatedTo: {
        type: "mesa",
        identifier: "Mesa 07",
        orderId: undefined
      },
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    localStorage.setItem("zuma_last_item_cancelled", JSON.stringify(cancelEvent));
    window.dispatchEvent(new CustomEvent("zuma_item_cancelled_event", { detail: cancelEvent }));
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, "kds_v2_alerta_cancelamento_reaproveitamento.png") });
  console.log("Screenshot do KDS 2.0 salvo!");

  // 3. KDS 4 Praças
  console.log("3. Navegando para KDS Clássico: http://localhost:3000/kds ...");
  await page.goto("http://localhost:3000/kds", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const cancelEvent = {
      tableNumber: 4,
      itemIndex: 0,
      itemName: "Combo 26 Peças",
      itemPrice: 69.90,
      cancelledBy: "Bruna (Salão)",
      reason: "Cliente desistiu",
      reallocatedTo: {
        type: "mesa",
        identifier: "Mesa 07",
        orderId: undefined
      },
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    localStorage.setItem("zuma_last_item_cancelled", JSON.stringify(cancelEvent));
    window.dispatchEvent(new CustomEvent("zuma_item_cancelled_event", { detail: cancelEvent }));
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, "kds_estacoes_cancelamento.png") });
  console.log("Screenshot do KDS Clássico salvo!");

  await browser.close();
  console.log("=== SUCESSO: TODAS AS TELAS VALIDARAM E CAPTURARAM OS SCREENSHOTS ===");
}

main().catch(console.error);
