import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.type("input[type=\"password\"]", "#080581");
  await page.click("button[type=\"submit\"]");
  await new Promise(r => setTimeout(r, 2000));

  await page.goto("http://localhost:3000/mesas", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  const copilotBtn = await page.$("button[title=\"Abrir Copiloto Executivo Zumi IA\"]");
  if (copilotBtn) {
    await copilotBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // Digitar pergunta no input
    const inputField = await page.$("input[placeholder*=\"Pergunte à Zumi\"]");
    if (inputField) {
      await inputField.type("Qual a previsão de salmão e consumo do fim de semana?");
      await page.keyboard.press("Enter");
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: "/home/ubuntu/screenshots/mesas_copilot/zumi_copilot_resposta_salmao.png" });
      console.log("Screenshot com resposta de previsão de salmão salvo!");
    }
  }
  await browser.close();
}

run().catch(console.error);
