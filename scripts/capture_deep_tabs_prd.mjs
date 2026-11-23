import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = "https://erp-bancofe-5xsi5uyoda-rj.a.run.app";

async function run() {
  const outputDir = "/home/ubuntu/bancoFe/docs/screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let gcpToken = "";
  try {
    gcpToken = execSync("gcloud auth print-identity-token", { encoding: "utf-8" }).trim();
  } catch (e) {
    console.error("Aviso gcloud token:", e.message);
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 1100 },
  });

  const page = await browser.newPage();
  if (gcpToken) {
    await page.setExtraHTTPHeaders({ Authorization: `Bearer ${gcpToken}` });
  }

  await page.setCookie(
    { name: "bancofe_auth", value: "autorizado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "session_token", value: "bcf_super_admin_homologado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "sp_token", value: "bcf_platform_admin", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" }
  );

  // 1. Navegar para Cadastro 360 e clicar em "Pré-Cadastro & Vault Documental"
  console.log("Navegando para /admin/cadastro-360...");
  await page.goto(`${BASE_URL}/admin/cadastro-360`, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Clicando na aba 'Pré-Cadastro & Vault Documental'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnVault = btns.find((b) => b.textContent && b.textContent.includes("Pré-Cadastro & Vault Documental"));
    if (btnVault) btnVault.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const p1 = path.join(outputDir, "18_prd_vault_13docs_checklist.png");
  await page.screenshot({ path: p1, fullPage: true });
  console.log("Salvo:", p1);

  // 2. Clicar na aba "Central de Termos & SCR Bacen"
  console.log("Clicando na aba 'Central de Termos & SCR Bacen'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnTermos = btns.find((b) => b.textContent && b.textContent.includes("Central de Termos & SCR Bacen"));
    if (btnTermos) btnTermos.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const p2 = path.join(outputDir, "19_prd_termos_digitais_scr.png");
  await page.screenshot({ path: p2, fullPage: true });
  console.log("Salvo:", p2);

  // 3. Navegar para CRM Financeira e clicar em "Simulador SAC & PRICE"
  console.log("Navegando para /admin/crm-financeira...");
  await page.goto(`${BASE_URL}/admin/crm-financeira`, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Clicando na aba 'Simulador SAC & PRICE'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnSimulador = btns.find((b) => b.textContent && b.textContent.includes("Simulador SAC & PRICE"));
    if (btnSimulador) btnSimulador.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const p3 = path.join(outputDir, "20_prd_crm_simulador_sac_price.png");
  await page.screenshot({ path: p3, fullPage: true });
  console.log("Salvo:", p3);

  // 4. Clicar na aba "Formalização CCB Digital"
  console.log("Clicando na aba 'Formalização CCB Digital'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnCcb = btns.find((b) => b.textContent && b.textContent.includes("Formalização CCB Digital"));
    if (btnCcb) btnCcb.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const p4 = path.join(outputDir, "21_prd_crm_formalizacao_ccb.png");
  await page.screenshot({ path: p4, fullPage: true });
  console.log("Salvo:", p4);

  await browser.close();
  console.log("Todas as capturas detalhadas em PRD foram concluídas com sucesso!");
}

run().catch((e) => {
  console.error("Erro na captura de abas:", e);
  process.exit(1);
});
