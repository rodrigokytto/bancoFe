import puppeteer from "puppeteer-core";
import fs from "fs";

async function run() {
  console.log("Iniciando Chromium...");
  fs.mkdirSync("/home/ubuntu/screenshots", { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Acessando tela de login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });

  // Preenche senha oficial
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 2500));

  console.log("Navegando para /ultra...");
  await page.goto("http://localhost:3000/ultra", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot Tab 1: Cockpit Praças & KDS
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_tab1_cockpit.png", fullPage: true });
  console.log("Screenshot Tab 1 Cockpit capturado.");

  // Clica na Tab 2: Sincronização por Evento Interno
  console.log("Acessando Tab 2: Sincronização Nossa Gente...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab2Btn = buttons.find(b => b.textContent?.includes("Sincronização por Evento Interno"));
    if (tab2Btn) tab2Btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_tab2_nossagente.png", fullPage: true });
  console.log("Screenshot Tab 2 Sincronização capturado.");

  // Clica na Tab 3: Auditoria & Fotos Seguras ANVISA
  console.log("Acessando Tab 3: Auditoria & Fotos Seguras...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab3Btn = buttons.find(b => b.textContent?.includes("Auditoria & Fotos Seguras"));
    if (tab3Btn) tab3Btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_tab3_auditoria.png", fullPage: true });
  console.log("Screenshot Tab 3 Fotos Seguras capturado.");

  // Clica no primeiro botão "Ver Laudo" para abrir o modal de laudo fotográfico
  console.log("Abrindo modal de laudo fotográfico...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const laudoBtn = buttons.find(b => b.textContent?.includes("Ver Laudo"));
    if (laudoBtn) laudoBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_modal_laudo.png" });
  console.log("Screenshot Modal Laudo capturado.");

  // Fecha o modal
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Fechar Laudo") || b.textContent?.includes("✕"));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Clica na Tab 4: Telemetria de Frio & Ultracongelamento (-40°C)
  console.log("Acessando Tab 4: Telemetria de Frio...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab4Btn = buttons.find(b => b.textContent?.includes("Telemetria Frio"));
    if (tab4Btn) tab4Btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_tab4_frio.png", fullPage: true });
  console.log("Screenshot Tab 4 Frio capturado.");

  // Clica na Tab 5: Alavancas Ultra IA
  console.log("Acessando Tab 5: Alavancas Ultra IA...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tab5Btn = buttons.find(b => b.textContent?.includes("Alavancas Ultra IA"));
    if (tab5Btn) tab5Btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_tab5_ia.png", fullPage: true });
  console.log("Screenshot Tab 5 IA capturado.");

  // Abre modal de emissão de evento interno
  console.log("Abrindo modal de emissão de evento interno...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const emitBtn = buttons.find(b => b.textContent?.includes("Emitir Evento Interno"));
    if (emitBtn) emitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_ultra_modal_evento.png" });
  console.log("Screenshot Modal Evento capturado.");

  await browser.close();
  console.log("Validação com Puppeteer finalizada com sucesso!");
}

run().catch(err => {
  console.error("Erro no teste Puppeteer:", err);
  process.exit(1);
});
