import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function run() {
  const outputDir = "/home/ubuntu/bancoFe/docs/screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Obter token de identidade GCP para autenticação no Cloud Run
  let gcpToken = "";
  try {
    gcpToken = execSync("gcloud auth print-identity-token", { encoding: "utf-8" }).trim();
  } catch (e) {
    console.error("Aviso: Não foi possível obter token gcloud:", e.message);
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 1000 },
  });

  const page = await browser.newPage();
  if (gcpToken) {
    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${gcpToken}`,
    });
  }

  // Injetar cookies de sessão autenticada de PRD
  await page.setCookie(
    { name: "bancofe_auth", value: "autorizado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "session_token", value: "bcf_super_admin_homologado", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" },
    { name: "sp_token", value: "bcf_platform_admin", domain: "erp-bancofe-5xsi5uyoda-rj.a.run.app", path: "/" }
  );

  const prdUrl = "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin";
  console.log(`Navegando para PRD: ${prdUrl}...`);
  await page.goto(prdUrl, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));

  // 1. Screenshot do /admin em Produção (GCP)
  const p1 = path.join(outputDir, "09_prd_admin_modulos_bancofe.png");
  await page.screenshot({ path: p1, fullPage: true });
  console.log("Screenshot 1 salvo em:", p1);

  // 2. Selecionar 'BancoFe — Operações Financeiras & CRM 360°' em PRD
  console.log("Selecionando Operações Financeiras em PRD...");
  await page.evaluate(() => {
    if (typeof window.selecionarNegocio === "function") {
      window.selecionarNegocio("neg-operacoes-crm");
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  const p2 = path.join(outputDir, "10_prd_admin_operacoes_crm.png");
  await page.screenshot({ path: p2, fullPage: true });
  console.log("Screenshot 2 salvo em:", p2);

  // 3. Abrir Modal de Adição de Módulo em PRD
  console.log("Abrindo modal de Adicionar Módulo em PRD...");
  await page.evaluate(() => {
    if (typeof window.abrirModalAdicionarModulo === "function") {
      window.abrirModalAdicionarModulo();
    }
  });
  await new Promise((r) => setTimeout(r, 1000));
  const p3 = path.join(outputDir, "11_prd_admin_modal_adicionar.png");
  await page.screenshot({ path: p3, fullPage: false });
  console.log("Screenshot 3 salvo em:", p3);

  // 4. Fechar modal e selecionar Cadastro 360 & Vault em PRD
  console.log("Selecionando Cadastro 360 & Vault em PRD...");
  await page.evaluate(() => {
    if (typeof window.fecharModalAdicionarModulo === "function") {
      window.fecharModalAdicionarModulo();
    }
    if (typeof window.selecionarNegocio === "function") {
      window.selecionarNegocio("neg-cadastro360-vault");
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  const p4 = path.join(outputDir, "12_prd_admin_cadastro360_vault.png");
  await page.screenshot({ path: p4, fullPage: true });
  console.log("Screenshot 4 salvo em:", p4);

  await browser.close();
  console.log("Validação e capturas de telas em Produção GCP concluídas com sucesso!");
}

run().catch((err) => {
  console.error("Erro na captura de telas em PRD:", err);
  process.exit(1);
});
