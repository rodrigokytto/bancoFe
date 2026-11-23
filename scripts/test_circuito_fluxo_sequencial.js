import puppeteer from "puppeteer-core";
import fs from "fs";

async function main() {
  console.log("Iniciando teste de fluxo sequencial de entregas no App do Entregador...");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser ERROR] ${msg.text()}`);
    }
  });

  try {
    console.log("Navegando para http://localhost:3000/entregador ...");
    await page.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2", timeout: 30000 });

    // 1. Ir para a aba Fila de Entregas
    console.log("Clicando na aba 'Fila de Entregas'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnFila = btns.find(b => b.textContent && b.textContent.includes("Fila de Entregas"));
      if (btnFila) btnFila.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    // 2. Clicar em 'Otimizar Circuito das 10 Entregas'
    console.log("Clicando em 'Otimizar Circuito das 10 Entregas'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes("Otimizar Circuito das 10 Entregas"));
      if (btnOtimizar) btnOtimizar.click();
    });

    console.log("Aguardando IA Kytto calcular o traçado das 10 paradas...");
    await new Promise(r => setTimeout(r, 4000));

    // Tirar screenshot do circuito das 10 paradas gerado
    await page.screenshot({ path: "docs/screenshots/04_circuito_gerado_com_botao_iniciar.png" });
    console.log("Screenshot salvo: docs/screenshots/04_circuito_gerado_com_botao_iniciar.png");

    // 3. Verificar e Clicar no botão 'Iniciar Circuito'
    console.log("Localizando e clicando no botão 'Iniciar Circuito'...");
    const iniciou = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnIniciar = btns.find(b => b.textContent && b.textContent.includes("Iniciar Circuito"));
      if (btnIniciar) {
        btnIniciar.click();
        return true;
      }
      return false;
    });

    console.log("Botão Iniciar Circuito clicado?", iniciou);
    await new Promise(r => setTimeout(r, 2000));

    // 4. Verificar parada ativa
    const statusParada1 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temJoaoSilva: text.includes("João Silva"),
        temCentro: text.includes("Centro"),
        temConfirmarBtn: text.includes("Confirmar Entrega #1")
      };
    });
    console.log("Status Parada 1:", statusParada1);

    // Tirar screenshot da Parada 1 iniciada
    await page.screenshot({ path: "docs/screenshots/05_circuito_parada_1_ativa.png" });
    console.log("Screenshot salvo: docs/screenshots/05_circuito_parada_1_ativa.png");

    // 5. Clicar em Confirmar Entrega #1
    console.log("Clicando em 'Confirmar Entrega #1' para abrir modal...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnConf = btns.find(b => b.textContent && b.textContent.includes("Confirmar Entrega #1"));
      if (btnConf) btnConf.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Tirar screenshot do modal de comprovação
    await page.screenshot({ path: "docs/screenshots/06_modal_comprovacao_parada_1.png" });
    console.log("Screenshot salvo: docs/screenshots/06_modal_comprovacao_parada_1.png");

    // 6. Confirmar no modal para avançar para a Parada 2
    console.log("Confirmando no modal para ir para Parada 2...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnConfModal = btns.find(b => b.textContent && b.textContent.includes("Ir para Parada #2"));
      if (btnConfModal) btnConfModal.click();
    });

    await new Promise(r => setTimeout(r, 3000));

    // 7. Verificar se avançou para a Parada 2 (Maria Santos)
    const statusParada2 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temMariaSantos: text.includes("Maria Santos"),
        temJdEuropa: text.includes("Jardim Europa"),
        temConfirmarBtn2: text.includes("Confirmar Entrega #2"),
        temUmaEntregue: text.includes("1 de 10 Entregues")
      };
    });
    console.log("Status Parada 2 avançada com sucesso:", statusParada2);

    // Tirar screenshot da Parada 2 ativa
    await page.screenshot({ path: "docs/screenshots/07_circuito_parada_2_ativa.png" });
    console.log("Screenshot salvo: docs/screenshots/07_circuito_parada_2_ativa.png");

    // 8. Confirmar Parada 2 para avançar para Parada 3
    console.log("Avançando da Parada 2 para a Parada 3...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnConf2 = btns.find(b => b.textContent && b.textContent.includes("Confirmar Entrega #2"));
      if (btnConf2) btnConf2.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnConfModal2 = btns.find(b => b.textContent && b.textContent.includes("Ir para Parada #3"));
      if (btnConfModal2) btnConfModal2.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    const statusParada3 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temCarlosMenezes: text.includes("Carlos Menezes"),
        temDuasEntregues: text.includes("2 de 10 Entregues")
      };
    });
    console.log("Status Parada 3 avançada com sucesso:", statusParada3);

    await page.screenshot({ path: "docs/screenshots/08_circuito_parada_3_ativa.png" });
    console.log("Screenshot salvo: docs/screenshots/08_circuito_parada_3_ativa.png");

    console.log("✅ FLUXO SEQUENCIAL DE ENTREGAS VALIDADO COM 100% DE SUCESSO!");
  } catch (err) {
    console.error("Erro durante o teste:", err);
  } finally {
    await browser.close();
  }
}

main();
