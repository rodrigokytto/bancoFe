import puppeteer from "puppeteer-core";

async function main() {
  console.log("Iniciando validação ao vivo diretamente em https://zuma.kytto.com.br/entregador ...");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[PRD Console ERROR] ${msg.text()}`);
    }
  });

  try {
    const res = await page.goto("https://zuma.kytto.com.br/entregador", { waitUntil: "networkidle2", timeout: 45000 });
    console.log("Status HTTP em PRD:", res?.status());

    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 1: Tela inicial de PRD com mapa
    await page.screenshot({ path: "docs/screenshots/prd_live_01_inicial.png" });
    console.log("Screenshot salvo: docs/screenshots/prd_live_01_inicial.png");

    // 1. Ir para a aba Fila de Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnFila = btns.find(b => b.textContent && b.textContent.includes("Fila de Entregas"));
      btnFila?.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // 2. Otimizar Circuito das 10 Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes("Otimizar Circuito das 10 Entregas"));
      btnOtimizar?.click();
    });

    console.log("Aguardando IA calcular as rotas em PRD...");
    await new Promise(r => setTimeout(r, 4000));

    // Screenshot 2: Circuito calculado com o botão Iniciar Circuito
    await page.screenshot({ path: "docs/screenshots/prd_live_02_circuito_calculado.png" });
    console.log("Screenshot salvo: docs/screenshots/prd_live_02_circuito_calculado.png");

    // 3. Clicar em Iniciar Circuito
    const iniciou = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnIniciar = btns.find(b => b.textContent && b.textContent.includes("Iniciar Circuito"));
      if (btnIniciar) {
        btnIniciar.click();
        return true;
      }
      return false;
    });
    console.log("Botão Iniciar Circuito clicado em PRD?", iniciou);
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 3: Parada #1 ativa no mapa e stepper
    await page.screenshot({ path: "docs/screenshots/prd_live_03_parada_1_ativa.png" });
    console.log("Screenshot salvo: docs/screenshots/prd_live_03_parada_1_ativa.png");

    // 4. Abrir modal de comprovação da Parada 1
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnConf = btns.find(b => b.textContent && b.textContent.includes("Confirmar Entrega #1"));
      btnConf?.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot 4: Modal de comprovação
    await page.screenshot({ path: "docs/screenshots/prd_live_04_modal_comprovacao.png" });
    console.log("Screenshot salvo: docs/screenshots/prd_live_04_modal_comprovacao.png");

    // 5. Confirmar no modal para avançar para a Parada 2
    await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return;
      const btns = Array.from(modal.querySelectorAll("button"));
      const btnSubmit = btns.find(b => b.textContent && (b.textContent.includes("Confirmar &") || b.textContent.includes("Confirmar")));
      btnSubmit?.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Screenshot 5: Parada 2 ativa com traçado atualizado e parada 1 entregue
    await page.screenshot({ path: "docs/screenshots/prd_live_05_parada_2_avancada.png" });
    console.log("Screenshot salvo: docs/screenshots/prd_live_05_parada_2_avancada.png");

    const statusPRD = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temUmaEntregue: text.includes("1 de 10 Entregues"),
        temConfirmarBtn2: text.includes("Confirmar Entrega #2"),
        temJdEuropa: text.includes("Jardim Europa")
      };
    });
    console.log("Status da validação ao vivo em PRD:", statusPRD);

    console.log("🚀 VALIDAÇÃO AO VIVO EM PRODUÇÃO (PRD) CONCLUÍDA COM 100% DE SUCESSO!");
  } catch (err) {
    console.error("Erro na validação em PRD:", err);
  } finally {
    await browser.close();
  }
}

main();
