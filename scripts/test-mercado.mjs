import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Autenticação local
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 2000));

  await page.goto("http://localhost:3000/mercado", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Mobile Topo com Concorrentes
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_top_mobile.png" });

  // Scroll para os cards de concorrentes (Zuma e Bonsai)
  await page.evaluate(() => window.scrollBy(0, 420));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_cards_mobile.png" });

  // Clicar em Comparativo de Preços
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Comparativo de Preços"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_precos_mobile.png" });

  // Clicar em Planos de Ataque
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Planos de Ataque"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_ataque_mobile.png" });

  // Clicar em Simulador
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Simulador de Market Share"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_simulador_mobile.png" });

  // Versão Desktop para visão panorâmica
  await page.setViewport({ width: 1280, height: 900, isMobile: false });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Concorrentes de Tangará"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_radar_desktop.png" });

  await browser.close();
  console.log("Todas as capturas mobile e desktop foram geradas com sucesso!");
}

run().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
