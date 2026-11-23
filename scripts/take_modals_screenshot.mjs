import puppeteer from "puppeteer-core";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  // 1. Modal Adicionar Módulo
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  const addBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Adicionar Módulo"));
  });
  if (addBtn) {
    await addBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    const addModalPath = "/home/ubuntu/bancoFe/client/public/modal_adicionar_modulo.png";
    await page.screenshot({ path: addModalPath });
    console.log("Screenshot do modal Adicionar salvo em:", addModalPath);
  }

  // 2. Negócio Zuma Gastronomia
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));
  const gastroBtn = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll("h3"));
    return cards.find((c) => c.textContent?.includes("Zuma Cozinha Oriental"))?.closest("div[class*='border']");
  });
  if (gastroBtn) {
    await gastroBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
    const gastroPath = "/home/ubuntu/bancoFe/client/public/admin_negocio_gastronomia.png";
    await page.screenshot({ path: gastroPath, fullPage: true });
    console.log("Screenshot Gastronomia salvo em:", gastroPath);
  }

  // 3. Negócio Zuma Agro & Safra MT
  const agroBtn = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll("h3"));
    return cards.find((c) => c.textContent?.includes("Zuma Agro & Safra MT"))?.closest("div[class*='border']");
  });
  if (agroBtn) {
    await agroBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
    const agroPath = "/home/ubuntu/bancoFe/client/public/admin_negocio_agro.png";
    await page.screenshot({ path: agroPath, fullPage: true });
    console.log("Screenshot Agro salvo em:", agroPath);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
