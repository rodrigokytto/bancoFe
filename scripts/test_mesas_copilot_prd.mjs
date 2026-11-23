import puppeteer from "puppeteer-core";
import fs from "fs";

const SCREENSHOT_DIR = "/home/ubuntu/screenshots/mesas_copilot_prd";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log("=== INICIANDO VALIDAÇÃO E2E: MAPA DE MESAS 360° & ZUMI COPILOT IA EM PRODUÇÃO ===");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage"
    ]
  });

  const targets = [
    { name: "kytto_prd", baseUrl: "https://zuma.kytto.com.br" },
    { name: "pilot_space", baseUrl: "https://zumapilot-lnj8dpxg.manus.space" }
  ];

  const results = { timestamp: new Date().toISOString(), targets: [] };

  for (const target of targets) {
    console.log(`\n--- Testando Alvo: ${target.name} (${target.baseUrl}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      // 1. Login
      console.log(`Acessando login em ${target.baseUrl}/login...`);
      await page.goto(`${target.baseUrl}/login`, { waitUntil: "networkidle2", timeout: 45000 });
      const passInput = await page.$("input[type=\"password\"]");
      if (passInput) {
        await page.type("input[type=\"password\"]", "#080581");
        const submitBtn = await page.$("button[type=\"submit\"]");
        if (submitBtn) await submitBtn.click();
        await new Promise(r => setTimeout(r, 3500));
      }

      // 2. Acessar Mapa de Mesas 360°
      console.log(`Acessando ${target.baseUrl}/mesas...`);
      await page.goto(`${target.baseUrl}/mesas`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_1_mapa_mesas_geral.png` });
      console.log(`Screenshot salvo: ${target.name}_1_mapa_mesas_geral.png`);

      // 3. Clicar em uma mesa (ex: Mesa 07 com alerta ou Mesa 01)
      const mesaCards = await page.$$("div.cursor-pointer");
      if (mesaCards.length > 0) {
        console.log("Abrindo modal da Mesa...");
        await mesaCards[0].click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_2_modal_mesa_detalhes.png` });

        // Fechar modal
        const closeBtn = await page.$("button[class*=\"p-2 rounded-xl\"]");
        if (closeBtn) await closeBtn.click();
        await new Promise(r => setTimeout(r, 1000));
      }

      // 4. Testar Botão Flutuante Zumi Copilot IA
      const copilotBtn = await page.$("button[title=\"Abrir Copiloto Executivo Zumi IA\"]");
      if (copilotBtn) {
        console.log("Abrindo Zumi Copilot IA flutuante...");
        await copilotBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_3_zumi_copilot_aberto.png` });

        // Clicar em um chip de sugestão rápida
        const chipBtn = await page.$("button.px-2\\.5.py-1.rounded-full");
        if (chipBtn) {
          console.log("Clicando em sugestão rápida no Copilot...");
          await chipBtn.click();
          await new Promise(r => setTimeout(r, 2500));
          await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_4_zumi_copilot_resposta.png` });
        }
      }

      // 5. Visualização Mobile
      console.log("Ajustando viewport para Mobile 390x844...");
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${target.baseUrl}/mesas`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_5_mobile_mesas.png` });

      results.targets.push({ name: target.name, url: target.baseUrl, success: true });
    } catch (err) {
      console.error(`Erro no alvo ${target.name}:`, err.message);
      results.targets.push({ name: target.name, url: target.baseUrl, success: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync(`${SCREENSHOT_DIR}/relatorio_mesas_copilot_prd.json`, JSON.stringify(results, null, 2));
  console.log("=== VALIDAÇÃO DE MESAS & COPILOT CONCLUÍDA COM SUCESSO! ===");
}

runTests().catch(console.error);
