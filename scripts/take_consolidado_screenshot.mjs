import puppeteer from "puppeteer-core";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1440,1100"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });

  console.log("Navegando para http://localhost:3000/admin...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Clicar no botão 'Grupo Consolidado'
  const groupBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Grupo Consolidado"));
  });

  if (groupBtn.asElement()) {
    console.log("Clicando em Grupo Consolidado...");
    await groupBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 1200));

    const path = "/home/ubuntu/bancoFe/client/public/admin_nubank_consolidado.png";
    await page.screenshot({ path, fullPage: true });
    console.log("Screenshot do Grupo Consolidado salvo em:", path);
  } else {
    console.error("Botão Grupo Consolidado não encontrado!");
  }

  await browser.close();
}

main().catch(err => {
  console.error("Erro na captura:", err);
  process.exit(1);
});
