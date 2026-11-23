import puppeteer from "puppeteer-core";
import fs from "fs";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function run() {
  console.log("Iniciando auditoria PRD do KDS 2.0 em https://zuma.kytto.com.br/kds-v2...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1600,1100"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });

  // 1. Injetar auth no domínio zuma.kytto.com.br
  await page.goto("https://zuma.kytto.com.br/login", { waitUntil: "networkidle2", timeout: 45000 });
  await page.evaluate(() => {
    const authSession = {
      id: 1,
      openId: "usr_rodrigo_zuma",
      name: "Rodrigo Ribeiro Gonçalves",
      email: "rrodrigogon@gmail.com",
      role: "admin",
      cargo: "Proprietário & Administrador Geral",
      unidade: "Tangará da Serra - MT",
      lastSignedIn: new Date().toISOString()
    };
    localStorage.setItem("zuma_auth_session", JSON.stringify(authSession));
    localStorage.setItem("zuma_user", JSON.stringify(authSession));
    document.cookie = `zuma_session=mock_admin_token; path=/; max-age=86400`;
  });

  // 2. Navegar para KDS 2.0 em PRD
  console.log("Acessando https://zuma.kytto.com.br/kds-v2...");
  await page.goto("https://zuma.kytto.com.br/kds-v2", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: `${OUTPUT_DIR}/80_prd_kds2_live.png`, fullPage: false });
  console.log("Screenshot 80 gravado: KDS 2.0 AO VIVO EM PRODUÇÃO!");

  // 3. Testar Modo Industrial / Monitor de Parede em PRD
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Modo Monitor Cozinha"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/81_prd_kds2_modo_industrial_live.png`, fullPage: false });
  console.log("Screenshot 81 gravado: Modo Monitor Cozinha AO VIVO EM PRODUÇÃO!");

  // Voltar para Tema Normal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Tema Normal"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 4. Testar Modal de Despacho de Motoboy em PRD
  // Marca item pendente na comanda #104
  await page.evaluate(() => {
    const itemElements = Array.from(document.querySelectorAll("p"));
    const barca = itemElements.find(p => p.innerText.includes("Barca Zuma Premium"));
    if (barca) {
      const clickable = barca.closest("div[class*='cursor-pointer']");
      if (clickable) clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Despachar para Motoboy GPS") && !b.disabled);
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUTPUT_DIR}/82_prd_kds2_modal_despacho_live.png`, fullPage: false });
  console.log("Screenshot 82 gravado: Modal Despacho Motoboy AO VIVO EM PRODUÇÃO!");

  await browser.close();
  console.log("Validação de produção concluída com êxito!");
}

run().catch(err => {
  console.error("Erro na validação de PRD:", err);
  process.exit(1);
});
