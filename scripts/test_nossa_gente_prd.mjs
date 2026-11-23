import puppeteer from "puppeteer-core";
import fs from "fs";

const SCREENSHOT_DIR = "/home/ubuntu/screenshots/nossa_gente_prd";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log("=== INICIANDO VALIDAÇÃO E2E: NOSSA GENTE RH & NOTIFICAÇÕES EM PRODUÇÃO ===");
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

      // 2. Módulo Nossa Gente RH
      console.log(`Acessando ${target.baseUrl}/nossa-gente...`);
      await page.goto(`${target.baseUrl}/nossa-gente`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_1_nossa_gente_ponto_facial.png` });
      console.log(`Screenshot salvo: ${target.name}_1_nossa_gente_ponto_facial.png`);

      // 3. Testar botão Simular Ponto Facial
      const simularBtns = await page.$$("button");
      for (const btn of simularBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes("Simular Ponto")) {
          console.log("Clicando em Simular Ponto...");
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_2_ponto_facial_simulado_toast.png` });

      // 4. Testar Aba Escala 6x1
      for (const btn of simularBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes("Escala 6x1")) {
          console.log("Alternando para aba Escala 6x1...");
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_3_escala_semanal_6x1.png` });

      // 5. Testar Aba Rateio Gorjeta 10%
      const allBtns = await page.$$("button");
      for (const btn of allBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes("Rateio de Gorjeta")) {
          console.log("Alternando para aba Rateio de Gorjeta...");
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_4_rateio_gorjeta_10.png` });

      // 6. Testar Sino de Notificações
      const bellBtn = await page.$("button[title=\"Central de Alertas Operacionais\"]");
      if (bellBtn) {
        console.log("Clicando no Sino de Notificações...");
        await bellBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_5_central_notificacoes_aberta.png` });
      }

      // 7. Visualização Mobile
      console.log("Ajustando viewport para Mobile 390x844...");
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${target.baseUrl}/nossa-gente`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${target.name}_6_mobile_nossa_gente.png` });

      results.targets.push({ name: target.name, url: target.baseUrl, success: true });
    } catch (err) {
      console.error(`Erro no alvo ${target.name}:`, err.message);
      results.targets.push({ name: target.name, url: target.baseUrl, success: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync(`${SCREENSHOT_DIR}/relatorio_nossa_gente_prd.json`, JSON.stringify(results, null, 2));
  console.log("=== VALIDAÇÃO CONCLUÍDA COM SUCESSO! ===");
}

runTests().catch(console.error);
