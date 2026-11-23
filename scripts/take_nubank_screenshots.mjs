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

  // 1. Screenshot Geral Nubank Minimalist
  await page.screenshot({ path: "/home/ubuntu/bancoFe/client/public/admin_nubank_minimalist.png", fullPage: true });
  console.log("Screenshot 1: admin_nubank_minimalist.png salvo!");

  // 2. Expandir Memória de Cálculo & Auditoria
  const calcBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Cálculos"));
  });
  if (calcBtn.asElement()) {
    await calcBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: "/home/ubuntu/bancoFe/client/public/admin_nubank_expanded_calcs.png" });
    console.log("Screenshot 2: admin_nubank_expanded_calcs.png salvo!");
  }

  // 3. Alternar para Zuma Gastronomia
  const gastBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Zuma Cozinha") || b.textContent?.includes("Gastronomia"));
  });
  if (gastBtn.asElement()) {
    await gastBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: "/home/ubuntu/bancoFe/client/public/admin_nubank_gastronomia.png", fullPage: true });
    console.log("Screenshot 3: admin_nubank_gastronomia.png salvo!");
  }

  // 4. Abrir modal Adicionar Módulo no novo estilo
  const addBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Adicionar Módulo"));
  });
  if (addBtn.asElement()) {
    await addBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: "/home/ubuntu/bancoFe/client/public/modal_adicionar_nubank.png" });
    console.log("Screenshot 4: modal_adicionar_nubank.png salvo!");
  }

  await browser.close();
}

main().catch(err => {
  console.error("Erro na captura de screenshots:", err);
  process.exit(1);
});
