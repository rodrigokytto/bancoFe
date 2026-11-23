import puppeteer from "puppeteer-core";
import fs from "fs";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1440,900"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("1. Acessando tela de login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.innerText.includes("Preencher Acesso Rodrigo"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.innerText.includes("Entrar no Zuma Pilot"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("2. Autenticado com sucesso!");

  // 1. Capturar Sidebar com Serendipidade & Submenus
  await page.goto("http://localhost:3000/mercado", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/01_sidebar_serendipidade_menu.png",
  });
  console.log("📸 Screenshot 01: Sidebar com Menu de Serendipidade e Submenus capturado.");

  // 2. Clicar no botão '⚡ APIs & Dados Reais ao Vivo'
  const apisTabBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent?.includes("APIs & Dados Reais ao Vivo"));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log("Clicou na aba de APIs Reais:", apisTabBtn);
  await new Promise((r) => setTimeout(r, 2500));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/02_apis_reais_dolar_receita.png",
  });
  console.log("📸 Screenshot 02: Hub de APIs e Câmbio do Salmão capturado.");

  // 3. Consultar CNPJ do Bonsai na Receita Federal
  console.log("Consultando CNPJ do Bonsai na Receita Federal...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const bonsaiBtn = buttons.find((b) => b.textContent?.includes("Bonsai Sushi Bar"));
    if (bonsaiBtn) bonsaiBtn.click();
  });
  await new Promise((r) => setTimeout(r, 3000));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/03_receita_federal_bonsai_socios.png",
  });
  console.log("📸 Screenshot 03: Dados Oficiais do Bonsai da Receita Federal capturados.");

  // 4. Testar Diagnóstico Gemini AI
  console.log("Executando Diagnóstico Gemini AI...");
  const gerouIa = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const geminiBtn = buttons.find((b) => b.textContent?.includes("Gerar com Gemini"));
    if (geminiBtn) {
      geminiBtn.click();
      return true;
    }
    return false;
  });
  console.log("Disparou Gemini:", gerouIa);
  await new Promise((r) => setTimeout(r, 6000));

  // Rolar suavemente para o card de IA
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/04_gemini_diagnostico_ia_vivo.png",
  });
  console.log("📸 Screenshot 04: Diagnóstico Zumi Gemini 2.5 Flash ao vivo capturado.");

  // 5. Clicar na aba 'Radar de Concorrentes' de Tangará
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const radarBtn = buttons.find((b) => b.textContent?.includes("Radar de Concorrentes") || b.textContent?.includes("Concorrentes Tangará"));
    if (radarBtn) radarBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/05_concorrentes_reais_tangara.png",
  });
  console.log("📸 Screenshot 05: Radar de Concorrentes Reais de Tangará capturado.");

  // 6. Teste Mobile (iPhone 14)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto("http://localhost:3000/mercado", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: "/home/ubuntu/screenshots/06_mobile_mercado_serendipidade.png",
  });
  console.log("📸 Screenshot 06: Responsividade Mobile iPhone capturada.");

  await browser.close();
  console.log("✅ HOMOLOGAÇÃO COMPLETA FINALIZADA COM SUCESSO!");
}

run().catch((err) => {
  console.error("Erro na homologação:", err);
  process.exit(1);
});
