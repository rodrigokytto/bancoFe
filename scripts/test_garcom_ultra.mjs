import puppeteer from "puppeteer-core";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function testGarcom() {
  console.log("Iniciando auditoria completa do novo App do Garçom Ultra Clean...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  // ==========================================
  // PARTE 1: TESTE NO IPHONE (393 x 852 px)
  // ==========================================
  console.log("Configurando viewport mobile iPhone...");
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
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

  await page.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUTPUT_DIR}/100_garcom_iphone_mesas_grid.png` });
  console.log("Screenshot 100: Grid de 27 Mesas no iPhone");

  // Navegar para Aba 2: Comanda da Mesa 03
  console.log("Abrindo aba Comanda da Mesa 03...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnComanda = btns.find(b => b.innerText.includes("Mesa 03"));
    if (btnComanda) btnComanda.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUTPUT_DIR}/101_garcom_iphone_comanda_mesa03.png` });
  console.log("Screenshot 101: Comanda da Mesa 03 com Cardápio Rápido");

  // Abrir Modal de Adicionais e Observações Rápidas
  console.log("Abrindo modal de adicionais de um prato...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("div"));
    const cardProd = cards.find(d => d.innerText.includes("Barca Especial 50 Pçs") && d.innerText.includes("Lançar"));
    if (cardProd) cardProd.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/102_garcom_iphone_modal_adicionais.png` });
  console.log("Screenshot 102: Modal de Adicionais e Observações Rápidas");

  // Fechar modal de adicionais
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnClose = btns.find(b => b.innerText === "✕");
    if (btnClose) btnClose.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Abrir Modal de Divisão de Conta
  console.log("Abrindo modal de divisão de conta...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnDividir = btns.find(b => b.innerText.includes("Dividir Conta"));
    if (btnDividir) btnDividir.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/103_garcom_iphone_modal_divisao_conta.png` });
  console.log("Screenshot 103: Modal de Divisão Tátil de Conta com Rateio");

  // Fechar modal de divisão
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnEnv = btns.find(b => b.innerText.includes("Enviar ao Caixa"));
    if (btnEnv) btnEnv.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Navegar para Aba 3: Pass da Cozinha (KDS)
  console.log("Abrindo aba Pass KDS...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnPass = btns.find(b => b.innerText.includes("Pass KDS"));
    if (btnPass) btnPass.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUTPUT_DIR}/104_garcom_iphone_pass_kds.png` });
  console.log("Screenshot 104: Aba Pass KDS com Pratos Prontos");

  // Navegar para Aba 4: Meu Turno & Gorjetas 10%
  console.log("Abrindo aba Meu Turno...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnTurno = btns.find(b => b.innerText.includes("Meu Turno"));
    if (btnTurno) btnTurno.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUTPUT_DIR}/105_garcom_iphone_meu_turno.png` });
  console.log("Screenshot 105: Aba Meu Turno e Gorjetas 10%");

  await page.close();

  // ==========================================
  // PARTE 2: TESTE DESKTOP (1600 x 1100 px)
  // ==========================================
  console.log("Configurando viewport Desktop...");
  const pageDesk = await browser.newPage();
  await pageDesk.setViewport({ width: 1600, height: 1100 });

  await pageDesk.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await pageDesk.evaluate(() => {
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

  await pageDesk.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await pageDesk.screenshot({ path: `${OUTPUT_DIR}/106_garcom_desktop_comanda_split.png` });
  console.log("Screenshot 106: Visão Desktop do App do Garçom");

  await pageDesk.close();
  await browser.close();
  console.log("Auditoria completa do App do Garçom finalizada!");
}

testGarcom().catch(err => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
