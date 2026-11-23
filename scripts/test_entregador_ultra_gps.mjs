import puppeteer from "puppeteer-core";
import fs from "fs";

const BROWSER_PATH = "/usr/bin/chromium";
const OUTPUT_DIR = "/home/ubuntu/audit_prd_full_system";

async function run() {
  console.log("Iniciando auditoria detalhada do GPS Fiel de Alta Precisão...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  // ==========================================
  // PARTE 1: TESTE NO IPHONE (393 x 852 px)
  // ==========================================
  console.log("Testando visualização mobile iPhone...");
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  await pageMobile.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await pageMobile.evaluate(() => {
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

  await pageMobile.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: `${OUTPUT_DIR}/90_entregador_iphone_view.png` });
  console.log("Screenshot 90 gravado: App Entregador no iPhone");

  // Iniciar Simulação de Deslocamento no iPhone
  console.log("Iniciando simulação de trajeto...");
  await pageMobile.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnSim = btns.find(b => b.innerText.includes("Simular Rota") || b.innerText.includes("Simular Trajeto"));
    if (btnSim) btnSim.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await pageMobile.screenshot({ path: `${OUTPUT_DIR}/91_entregador_iphone_em_rota_rumo.png` });
  console.log("Screenshot 91 gravado: Moto em movimento com rumo e velocímetro no iPhone");

  // Abrir Modal de Comprovação de Entrega e Assinatura Touch
  console.log("Abrindo modal de conclusão...");
  await pageMobile.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnConcluir = btns.find(b => b.innerText.includes("Concluir Entrega") || b.innerText.includes("Finalizar Entrega"));
    if (btnConcluir) btnConcluir.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Desenhar assinatura no canvas touch
  console.log("Desenhando assinatura touch no canvas...");
  await pageMobile.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#0284C7";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(30, 60);
      ctx.bezierCurveTo(80, 20, 120, 90, 180, 45);
      ctx.bezierCurveTo(220, 20, 260, 80, 320, 50);
      ctx.stroke();
    }
    // Preencher OTP
    const input = document.querySelector("input[placeholder*='Ex:']");
    if (input) {
      input.value = "4192";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await pageMobile.screenshot({ path: `${OUTPUT_DIR}/92_entregador_iphone_modal_assinatura_otp.png` });
  console.log("Screenshot 92 gravado: Modal de Comprovação com Assinatura Touch e OTP");

  await pageMobile.close();

  // ==========================================
  // PARTE 2: TESTE DESKTOP (1600 x 1100 px)
  // ==========================================
  console.log("Testando visualização Desktop ampla...");
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

  await pageDesk.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  // Clicar em "Cluster IA Rota" para otimizar rota multiponto
  console.log("Testando Otimizador de Rota Multiponto...");
  await pageDesk.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnCluster = btns.find(b => b.innerText.includes("Cluster IA Rota"));
    if (btnCluster) btnCluster.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await pageDesk.screenshot({ path: `${OUTPUT_DIR}/93_entregador_desktop_cluster_ia.png` });
  console.log("Screenshot 93 gravado: Otimizador de Rota Multiponto com Cluster IA");

  // Expandir mapa para tela cheia
  await pageDesk.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btnExpand = btns.find(b => b.title && b.title.includes("Expandir"));
    if (btnExpand) btnExpand.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await pageDesk.screenshot({ path: `${OUTPUT_DIR}/94_entregador_mapa_expandido.png` });
  console.log("Screenshot 94 gravado: Mapa GPS em Modo Expandido");

  await pageDesk.close();
  await browser.close();
  console.log("Auditoria completa do GPS finalizada!");
}

run().catch(err => {
  console.error("Erro na auditoria:", err);
  process.exit(1);
});
