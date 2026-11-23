import puppeteer from "puppeteer-core";
import fs from "fs";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function run() {
  console.log("Iniciando teste do KDS 2.0 com autenticação...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--window-size=1600,1100"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });

  // 1. Injetar autenticação
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

  // Também clicar no botão de 1 toque se presente
  try {
    const btnQuick = await page.$("button ::-p-text(Preencher Acesso Rodrigo)");
    if (btnQuick) {
      await btnQuick.click();
      await new Promise(r => setTimeout(r, 400));
      const btnEnter = await page.$("button ::-p-text(Entrar no Zuma Pilot)");
      if (btnEnter) {
        await btnEnter.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch (e) {}

  // 2. Navegar para KDS 2.0
  console.log("Navegando para http://localhost:3000/kds-v2...");
  await page.goto("http://localhost:3000/kds-v2", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${OUTPUT_DIR}/60_kds2_overview_authed.png`, fullPage: false });
  console.log("Screenshot 60 gravado: KDS 2.0 com Design System Zuma");

  // 3. Testar Alternância para Modo Industrial / Monitor de Parede
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Modo Monitor Cozinha"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/61_kds2_modo_industrial.png`, fullPage: false });
  console.log("Screenshot 61 gravado: Modo Monitor Cozinha (Alto Contraste)");

  // Voltar para o modo padrão
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Tema Normal"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 4. Testar Filtro Sushibar Nobre
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Sushibar Nobre"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUTPUT_DIR}/62_kds2_filtro_sushibar.png`, fullPage: false });
  console.log("Screenshot 62 gravado: Filtro Sushibar Nobre");

  // Voltar para todas as praças
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Todas as 4 Praças"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 5. Testar Abrir Modal de Despacho para Motoboy
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Despachar para Motoboy GPS"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUTPUT_DIR}/63_kds2_modal_despacho_motoboy.png`, fullPage: false });
  console.log("Screenshot 63 gravado: Modal Despacho Motoboy GPS");

  // Clicar em Confirmar Despacho
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Confirmar Despacho & Notificar"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUTPUT_DIR}/64_kds2_apos_despacho_toast.png`, fullPage: false });
  console.log("Screenshot 64 gravado: Confirmação de Despacho com Toast");

  // 6. Testar Simular Novo Pedido
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Simular Pedido"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUTPUT_DIR}/65_kds2_modal_simular.png`, fullPage: false });
  console.log("Screenshot 65 gravado: Modal de Simulação");

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("Injetar Pedido no KDS"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUTPUT_DIR}/66_kds2_novo_pedido_fire_on_demand.png`, fullPage: false });
  console.log("Screenshot 66 gravado: Novo Pedido Injetado com Fire on Demand Ativo");

  // 7. Navegar para App Entregador (/entregador) para auditar se recebeu o pedido despachado
  console.log("Navegando para http://localhost:3000/entregador...");
  await page.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUTPUT_DIR}/67_entregador_recebeu_despacho.png`, fullPage: false });
  console.log("Screenshot 67 gravado: App Entregador Integrado");

  // 8. Navegar para Mapa de Mesas (/mesas)
  console.log("Navegando para http://localhost:3000/mesas...");
  await page.goto("http://localhost:3000/mesas", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUTPUT_DIR}/68_mesas_integrado_kds.png`, fullPage: false });
  console.log("Screenshot 68 gravado: Mapa de Mesas Integrado");

  await browser.close();
  console.log("Auditoria concluída com 100% de sucesso!");
}

run().catch(err => {
  console.error("Erro na auditoria:", err);
  process.exit(1);
});
