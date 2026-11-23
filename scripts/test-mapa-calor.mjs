import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_URL || "http://127.0.0.1:3000";
const OUTPUT_DIR = "/home/ubuntu/screenshots/mapa-calor";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runTests() {
  console.log(`[TEST] Iniciando bateria completa de capturas do Mapa de Calor em: ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1280,1000"],
  });

  try {
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 2 });

    console.log("[1] Login com credenciais oficiais...");
    await desktopPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0", timeout: 30000 });
    const hasPass = await desktopPage.$("input[type='password']");
    if (hasPass) {
      await desktopPage.type("input[type='password']", "#080581");
      await desktopPage.click("button[type='submit']");
    }
    await new Promise((r) => setTimeout(r, 2000));

    console.log("[2] Acessando /mapa-de-calor...");
    await desktopPage.goto(`${BASE_URL}/mapa-de-calor`, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // 1. Matriz de Calor com Scroll
    console.log("[3] Capturando Matriz de Calor 7x11 completa...");
    await desktopPage.evaluate(() => window.scrollBy(0, 320));
    await new Promise((r) => setTimeout(r, 600));
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, "desktop_matriz_calor_grade.png"),
      fullPage: false,
    });

    // 2. Mosaico Calendário Contínuo
    console.log("[4] Clicando na aba Mosaico Calendário Contínuo...");
    await desktopPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab = btns.find((b) => b.textContent && b.textContent.includes("Mosaico Calendário"));
      if (tab) tab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await desktopPage.evaluate(() => window.scrollTo(0, 300));
    await new Promise((r) => setTimeout(r, 600));
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, "desktop_mosaico_continuo_detalhe.png"),
      fullPage: false,
    });

    // 3. IA Zumi Preditiva & Anti-Ociosidade
    console.log("[5] Clicando na aba IA Zumi Preditiva & Anti-Ociosidade...");
    await desktopPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab = btns.find((b) => b.textContent && b.textContent.includes("IA Zumi Preditiva"));
      if (tab) tab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await desktopPage.evaluate(() => window.scrollTo(0, 400));
    await new Promise((r) => setTimeout(r, 600));
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, "desktop_ia_zumi_estrategias.png"),
      fullPage: false,
    });

    // 4. Simulador de Deslocamento de Carga
    console.log("[6] Clicando na aba Simulador de Carga...");
    await desktopPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab = btns.find((b) => b.textContent && (b.textContent.includes("Simulador de Carga") || b.textContent.includes("Simulador")));
      if (tab) tab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await desktopPage.evaluate(() => window.scrollTo(0, 400));
    await new Promise((r) => setTimeout(r, 600));
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, "desktop_simulador_deslocamento_detalhe.png"),
      fullPage: false,
    });

    await desktopPage.close();

    // 5. Mobile iPhone 15/16 Pro
    console.log("[7] Capturando Mobile iPhone 15/16 Pro...");
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await mobilePage.goto(`${BASE_URL}/mapa-de-calor`, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    
    // Topo iPhone
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, "iphone_mapa_calor_top.png"),
      fullPage: false,
    });

    // Scroll seletor temporal e métricas no iPhone
    await mobilePage.evaluate(() => window.scrollBy(0, 300));
    await new Promise((r) => setTimeout(r, 600));
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, "iphone_mapa_calor_periodos.png"),
      fullPage: false,
    });

    // Scroll grade de calor no iPhone
    await mobilePage.evaluate(() => window.scrollBy(0, 380));
    await new Promise((r) => setTimeout(r, 600));
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, "iphone_mapa_calor_grid.png"),
      fullPage: false,
    });

    await mobilePage.close();
    console.log("\n>>> Capturas concluídas com sucesso! <<<");
  } catch (err) {
    console.error("Erro durante execução:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
