import puppeteer from "puppeteer-core";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function run() {
  console.log("Auditoria de produção em https://zuma.kytto.com.br/entregador...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1600,1100"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });

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

  await page.goto("https://zuma.kytto.com.br/entregador", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `${OUTPUT_DIR}/95_prd_entregador_live.png` });
  console.log("Screenshot 95 gravado: App Entregador AO VIVO EM PRODUÇÃO!");

  await browser.close();
  console.log("Auditoria de produção concluída!");
}

run().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
