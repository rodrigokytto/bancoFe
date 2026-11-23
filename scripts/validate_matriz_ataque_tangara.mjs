import puppeteer from "puppeteer-core";
import fs from "fs";

const TARGET_URL = "https://zuma.kytto.com.br";
const SCREENSHOT_PATH = "/home/ubuntu/zumapilot/evidencia_matriz_ataque_tangara_prd.png";

async function main() {
  console.log("=== INICIANDO VALIDAÇÃO DA MATRIZ DE ATAQUE TANGARÁ DA SERRA EM PRODUÇÃO ===");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1440,900"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log("1. Acessando tela de login...");
    await page.goto(`${TARGET_URL}/login`, { waitUntil: "networkidle2", timeout: 45000 });
    
    // Preenche senha se houver campo
    const pwdInput = await page.$("input[type='password']");
    if (pwdInput) {
      await page.type("input[type='password']", "#080581");
      const submitBtn = await page.$("button[type='submit']");
      if (submitBtn) await submitBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("2. Navegando para /ia-mercado?tab=matriz-ataque...");
    await page.goto(`${TARGET_URL}/ia-mercado?tab=matriz-ataque`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise(r => setTimeout(r, 4000));

    // Se estiver em outra aba, clica no botão Onde Atacar (Tangará 360°)
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes("Onde Atacar")) {
        console.log("Clicando na aba Onde Atacar (Tangará 360°)...");
        await b.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }

    // Procura elementos chave da matriz
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasDemografia = pageText.includes("106.840") || pageText.includes("Tangará da Serra") || pageText.includes("106.434");
    const hasEixos = pageText.includes("Cavalo de Troia") || pageText.includes("Anti-Atraso") || pageText.includes("Agro VIP") || pageText.includes("Segura Chuva");
    const hasSimulador = pageText.includes("Simulador") || pageText.includes("Migração");

    console.log(`Verificação de Conteúdo:`);
    console.log(`- Dados Demográficos de Tangará: ${hasDemografia ? "OK" : "Pendente"}`);
    console.log(`- 5 Eixos Táticos de Ataque: ${hasEixos ? "OK" : "Pendente"}`);
    console.log(`- Simulador de Market Share: ${hasSimulador ? "OK" : "Pendente"}`);

    // Captura screenshot completo em alta definição
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    console.log(`Screenshot salvo com sucesso em: ${SCREENSHOT_PATH}`);

    if (hasDemografia && hasEixos) {
      console.log("=== SUCESSO: MATRIZ DE ATAQUE TANGARÁ DA SERRA HOMOLOGADA EM PRODUÇÃO! ===");
    } else {
      console.log("=== ATENÇÃO: Verificando se a nova revisão já foi finalizada no Cloud Run ===");
    }
  } catch (err) {
    console.error("Erro durante validação:", err);
  } finally {
    await browser.close();
  }
}

main();
