import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

async function run() {
  const outputDir = "/home/ubuntu/bancoFe/docs/screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 1000 },
  });

  const page = await browser.newPage();
  page.on("console", (msg) => console.log("[BROWSER]", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.error("[BROWSER ERROR]", err));

  // Injetar cookies de autenticação institucional
  await page.setCookie(
    { name: "bancofe_auth", value: "autorizado", domain: "localhost", path: "/" },
    { name: "session_token", value: "bcf_super_admin_homologado", domain: "localhost", path: "/" },
    { name: "sp_token", value: "bcf_platform_admin", domain: "localhost", path: "/" }
  );

  console.log("Acessando http://localhost:3000/admin...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Screenshot Geral do /admin (BancoFé Digital selecionado)
  const p1 = path.join(outputDir, "05_admin_modulos_bancofe_core.png");
  await page.screenshot({ path: p1, fullPage: true });
  console.log("Screenshot 1 salvo em:", p1);

  // 2. Selecionar 'BancoFe — Operações Financeiras & CRM 360°'
  console.log("Selecionando Operações Financeiras & CRM 360...");
  await page.evaluate(() => {
    if (typeof window.selecionarNegocio === "function") {
      window.selecionarNegocio("neg-operacoes-crm");
    }
  });
  await new Promise((r) => setTimeout(r, 1000));
  const p2 = path.join(outputDir, "06_admin_modulos_operacoes_crm.png");
  await page.screenshot({ path: p2, fullPage: true });
  console.log("Screenshot 2 salvo em:", p2);

  // 3. Abrir Modal de Adição de Módulo
  console.log("Abrindo modal de Adicionar Módulo...");
  await page.evaluate(() => {
    if (typeof window.abrirModalAdicionarModulo === "function") {
      window.abrirModalAdicionarModulo();
    }
  });
  await new Promise((r) => setTimeout(r, 800));
  const p3 = path.join(outputDir, "07_admin_modal_adicionar_modulo.png");
  await page.screenshot({ path: p3, fullPage: false });
  console.log("Screenshot 3 salvo em:", p3);

  // 4. Fechar modal de adicionar e selecionar 'BancoFe — Cadastro 360°, Vault & Compliance'
  console.log("Selecionando Cadastro 360, Vault & Compliance...");
  await page.evaluate(() => {
    if (typeof window.fecharModalAdicionarModulo === "function") {
      window.fecharModalAdicionarModulo();
    }
    if (typeof window.selecionarNegocio === "function") {
      window.selecionarNegocio("neg-cadastro360-vault");
    }
  });
  await new Promise((r) => setTimeout(r, 800));
  const p4 = path.join(outputDir, "08_admin_modulos_cadastro360_vault.png");
  await page.screenshot({ path: p4, fullPage: true });
  console.log("Screenshot 4 salvo em:", p4);

  await browser.close();
  console.log("Todas as validações visuais concluídas com sucesso!");
}

run().catch((err) => {
  console.error("Falha ao executar validação visual:", err);
  process.exit(1);
});
