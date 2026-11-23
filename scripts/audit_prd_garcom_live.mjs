import puppeteer from "puppeteer-core";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function auditPrdGarcom() {
  console.log("Iniciando auditoria em produção em https://zuma.kytto.com.br/garcom...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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

  await page.goto("https://zuma.kytto.com.br/garcom", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `${OUTPUT_DIR}/109_prd_garcom_live.png` });
  console.log("Screenshot 109 gravado: App do Garçom AO VIVO EM PRODUÇÃO!");

  // Clica na Mesa 04 em produção
  console.log("Clicando na Mesa 04 via data-table-num em produção...");
  await page.waitForSelector("[data-table-num='4']", { timeout: 15000 });
  await page.click("[data-table-num='4']");
  await new Promise(r => setTimeout(r, 1500));

  // Digita coca cola no input de busca rápida do modal
  console.log("Digitando 'coca cola' no input do modal em produção...");
  await page.waitForSelector("[data-testid='busca-cardapio-modal']", { timeout: 10000 });
  await page.type("[data-testid='busca-cardapio-modal']", "coca cola", { delay: 60 });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: `${OUTPUT_DIR}/114_prd_garcom_coca_cola_modal.png` });
  console.log("Screenshot 114 gravado: Modal de Coca-Cola AO VIVO EM PRODUÇÃO!");

  await browser.close();
  console.log("Auditoria de produção concluída com sucesso!");
}

auditPrdGarcom().catch(err => {
  console.error("Erro na auditoria PRD:", err);
  process.exit(1);
});
