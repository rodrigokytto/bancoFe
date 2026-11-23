import puppeteer from "puppeteer-core";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function testCocaColaSearch() {
  console.log("Iniciando validação visual da busca por 'coca cola' no App do Garçom...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
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

  // 2. Acessar App do Garçom
  await page.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  // -------------------------------------------------------------
  // TESTE 1: MODAL DA MESA 04 (EXATAMENTE COMO NO PRINT DO USUÁRIO)
  // -------------------------------------------------------------
  console.log("1. Abrindo Modal Comanda da Mesa 04...");
  await page.waitForSelector("[data-table-num='4']", { timeout: 10000 });
  await page.click("[data-table-num='4']");
  await new Promise(r => setTimeout(r, 1200));

  console.log("2. Digitando 'coca cola' no input de busca do modal...");
  await page.waitForSelector("[data-testid='busca-cardapio-modal']", { timeout: 5000 });
  await page.type("[data-testid='busca-cardapio-modal']", "coca cola", { delay: 60 });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: `${OUTPUT_DIR}/110_garcom_comanda_modal_coca_cola.png` });
  console.log("Screenshot 110 gerado: Modal Comanda Mesa 04 com resultados de 'coca cola'!");

  // Clicar em Coca-Cola Zero 350ml para abrir adicionais
  console.log("3. Clicando no produto Coca-Cola Zero 350ml...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnCoca = btns.find(b => b.innerText && b.innerText.includes("Coca-Cola Zero 350ml"));
    if (btnCoca) btnCoca.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/113_garcom_modal_adicionais_coca_zero.png` });
  console.log("Screenshot 113 gerado: Modal de Adicionais de Bebida!");

  // -------------------------------------------------------------
  // TESTE 2: VISÃO SPLIT DESKTOP DA COMANDA (ABA MESA 04)
  // -------------------------------------------------------------
  console.log("4. Acessando Visão Split Desktop da Mesa 04...");
  const pageSplit = await browser.newPage();
  await pageSplit.setViewport({ width: 1440, height: 900 });
  await pageSplit.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  // Clica na Aba "Mesa 04" ou "Mesa 03" na Top Bar
  await pageSplit.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnMesaTab = btns.find(b => b.innerText.includes("Mesa 0") || (b.innerText.includes("Mesa") && !b.innerText.includes("Mesas (27)")));
    if (btnMesaTab) btnMesaTab.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Digita coca cola no input split
  console.log("5. Digitando 'coca cola' na barra de busca do cardápio completo split...");
  await pageSplit.waitForSelector("[data-testid='busca-cardapio-split']", { timeout: 5000 });
  await pageSplit.type("[data-testid='busca-cardapio-split']", "coca cola", { delay: 60 });
  await new Promise(r => setTimeout(r, 1000));

  await pageSplit.screenshot({ path: `${OUTPUT_DIR}/111_garcom_desktop_split_coca_cola.png` });
  console.log("Screenshot 111 gerado: Visão Split Desktop com busca de 'coca cola'!");
  await pageSplit.close();

  // -------------------------------------------------------------
  // TESTE 3: MOBILE IPHONE (393 x 852 px)
  // -------------------------------------------------------------
  console.log("6. Testando no iPhone...");
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await pageMobile.goto("http://localhost:3000/garcom", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  await pageMobile.waitForSelector("[data-table-num='4']", { timeout: 10000 });
  await pageMobile.click("[data-table-num='4']");
  await new Promise(r => setTimeout(r, 1200));

  await pageMobile.waitForSelector("[data-testid='busca-cardapio-modal']", { timeout: 5000 });
  await pageMobile.type("[data-testid='busca-cardapio-modal']", "coca cola", { delay: 60 });
  await new Promise(r => setTimeout(r, 1000));

  await pageMobile.screenshot({ path: `${OUTPUT_DIR}/112_garcom_iphone_coca_cola.png` });
  console.log("Screenshot 112 gerado: Mobile iPhone com busca 'coca cola' no modal!");
  await pageMobile.close();

  await page.close();
  await browser.close();
  console.log("Todos os testes finalizados com sucesso!");
}

testCocaColaSearch().catch(err => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
