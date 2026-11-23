import puppeteer from "puppeteer-core";
import fs from "fs";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function run() {
  console.log("Iniciando teste de interação de expedição e despacho...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1600,1100"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });

  // 1. Injetar auth
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

  await page.goto("http://localhost:3000/kds-v2", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Na comanda #104, clicar em "Barca Zuma Premium" para marcar como PRONTO
  console.log("Marcando 'Barca Zuma Premium' como pronto...");
  await page.evaluate(() => {
    const itemElements = Array.from(document.querySelectorAll("p"));
    const barca = itemElements.find(p => p.innerText.includes("Barca Zuma Premium"));
    if (barca) {
      // Clica no container pai clicável
      const clickable = barca.closest("div[class*='cursor-pointer']");
      if (clickable) clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/70_kds2_todos_itens_prontos.png` });

  // 3. Agora o botão "Despachar para Motoboy GPS" deve estar ativo na comanda #104!
  console.log("Clicando em 'Despachar para Motoboy GPS'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnDespachar = btns.find(b => b.innerText.includes("Despachar para Motoboy GPS") && !b.disabled);
    if (btnDespachar) btnDespachar.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUTPUT_DIR}/71_kds2_modal_despacho_aberto.png` });

  // 4. Selecionar o motoboy Tiago Silva e clicar em "Confirmar Despacho & Notificar"
  console.log("Confirmando despacho...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnConfirm = btns.find(b => b.innerText.includes("Confirmar Despacho & Notificar"));
    if (btnConfirm) btnConfirm.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUTPUT_DIR}/72_kds2_comanda_despachada_sucesso.png` });

  // 5. Testar mesa #101: marcar Shimeji e Guioza como pronto, ver Fire on Demand liberar o sushi automaticamente
  console.log("Testando Fire on Demand na Comanda #101...");
  await page.evaluate(() => {
    const itemElements = Array.from(document.querySelectorAll("p"));
    const shimeji = itemElements.find(p => p.innerText.includes("Shimeji Especial"));
    if (shimeji) {
      const clickShimeji = shimeji.closest("div[class*='cursor-pointer']");
      if (clickShimeji) clickShimeji.click();
    }
    const guioza = itemElements.find(p => p.innerText.includes("Guioza Suíno"));
    if (guioza) {
      const clickGuioza = guioza.closest("div[class*='cursor-pointer']");
      if (clickGuioza) clickGuioza.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUTPUT_DIR}/73_kds2_fire_on_demand_auto_liberado.png` });

  // 6. Navegar para App do Entregador para conferir a corrida despachada
  console.log("Conferindo App do Entregador com a corrida despachada...");
  await page.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUTPUT_DIR}/74_app_entregador_com_corrida_kds.png` });

  // 7. Navegar para Mapa de Mesas
  console.log("Conferindo Mapa de Mesas...");
  await page.goto("http://localhost:3000/mesas", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUTPUT_DIR}/75_mapa_mesas_audit.png` });

  await browser.close();
  console.log("Teste de interação concluído com sucesso!");
}

run().catch(e => {
  console.error("Erro:", e);
  process.exit(1);
});
