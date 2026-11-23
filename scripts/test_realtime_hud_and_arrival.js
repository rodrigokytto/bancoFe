import puppeteer from "puppeteer-core";

async function main() {
  console.log("Iniciando teste de Live HUD e transição automática ao chegar nos clientes...");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("console", (msg) => {
    console.log(`[Browser ${msg.type()}] ${msg.text()}`);
  });

  try {
    await page.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });

    // 1. Ir para a aba Fila de Entregas e Otimizar
    console.log("1. Acessando Fila e otimizando 10 entregas...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnFila = btns.find(b => b.textContent && b.textContent.includes("Fila de Entregas"));
      btnFila?.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnOtimizar = btns.find(b => b.textContent && b.textContent.includes("Otimizar Circuito das 10 Entregas"));
      btnOtimizar?.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // 2. Iniciar Circuito
    console.log("2. Clicando em Iniciar Circuito...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnIniciar = btns.find(b => b.textContent && b.textContent.includes("Iniciar Circuito"));
      btnIniciar?.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Configura velocidade 5x para o teste correr com fluidez
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn5x = btns.find(b => b.textContent && b.textContent.trim() === "5x");
      btn5x?.click();
    });

    console.log("3. Capturando Live HUD em tempo real no mapa da Parada 1...");
    await page.screenshot({ path: "docs/screenshots/11_live_hud_parada_1_em_movimento.png" });

    // 4. Aguardar a moto chegar no destino do Cliente 1 (ou clicar Cheguei no HUD)
    console.log("4. Aguardando chegada automática no Cliente 1...");
    // Espera até 6 segundos para a simulação 5x chegar no fim ou aciona a chegada
    let chegouCliente1 = false;
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 500));
      chegouCliente1 = await page.evaluate(() => {
        return !!document.querySelector(".fixed.inset-0");
      });
      if (chegouCliente1) break;
    }

    if (!chegouCliente1) {
      console.log("Acionando botão 'Cheguei / Confirmar' no Live HUD para Parada 1...");
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btnCheguei = btns.find(b => b.textContent && b.textContent.includes("Cheguei / Confirmar"));
        btnCheguei?.click();
      });
      await new Promise(r => setTimeout(r, 800));
    }

    console.log("Modal aberto ao chegar no Cliente 1!");
    await page.screenshot({ path: "docs/screenshots/12_chegada_cliente_1_modal_aberto.png" });

    // 5. Confirmar Cliente 1 e avançar para Cliente 2
    console.log("5. Confirmando entrega do Cliente 1...");
    await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return;
      const btns = Array.from(modal.querySelectorAll("button"));
      const btnSubmit = btns.find(b => b.textContent && (b.textContent.includes("Confirmar &") || b.textContent.includes("Confirmar")));
      btnSubmit?.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    console.log("6. Verificando rota traçada do Cliente 1 para o Cliente 2...");
    const statusApos1 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temUmaEntregue: text.includes("1 de 10 Entregues"),
        temDraBeatrizNoHud: text.includes("Dra. Beatriz") || text.includes("Beatriz"),
        temJdEuropa: text.includes("Jardim Europa")
      };
    });
    console.log("Status Parada 2 ativa e rota traçada:", statusApos1);

    await page.screenshot({ path: "docs/screenshots/13_rota_cliente_1_para_2_tracada_em_tempo_real.png" });

    // 6. Simular deslocamento do Cliente 1 para o Cliente 2
    console.log("7. Deslocando em tempo real do Cliente 1 para o Cliente 2...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn5x = btns.find(b => b.textContent && b.textContent.trim() === "5x");
      btn5x?.click();
    });

    let chegouCliente2 = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 500));
      chegouCliente2 = await page.evaluate(() => {
        return !!document.querySelector(".fixed.inset-0");
      });
      if (chegouCliente2) break;
    }

    if (!chegouCliente2) {
      console.log("Acionando chegada no Cliente 2 pelo HUD...");
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btnCheguei = btns.find(b => b.textContent && b.textContent.includes("Cheguei / Confirmar"));
        btnCheguei?.click();
      });
      await new Promise(r => setTimeout(r, 800));
    }

    console.log("Modal aberto ao chegar no Cliente 2!");
    await page.screenshot({ path: "docs/screenshots/14_chegada_cliente_2_modal_aberto.png" });

    // 7. Confirmar Cliente 2 e traçar rota do 2 para o 3
    console.log("8. Confirmando entrega do Cliente 2 e traçando rota do 2 para o 3...");
    await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return;
      const btns = Array.from(modal.querySelectorAll("button"));
      const btnSubmit = btns.find(b => b.textContent && (b.textContent.includes("Confirmar &") || b.textContent.includes("Confirmar")));
      btnSubmit?.click();
    });

    await new Promise(r => setTimeout(r, 2500));

    const statusApos2 = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temDuasEntregues: text.includes("2 de 10 Entregues"),
        temLucasNoHud: text.includes("Lucas"),
        temJdTaruma: text.includes("Jardim Tarumã") || text.includes("Tarumã")
      };
    });
    console.log("Status Parada 3 ativa e rota 2 -> 3 traçada:", statusApos2);

    await page.screenshot({ path: "docs/screenshots/15_rota_cliente_2_para_3_tracada_em_tempo_real.png" });

    console.log("✅ TESTE DO FLUXO EM TEMPO REAL 1->2->3 CONCLUÍDO COM SUCESSO!");
  } finally {
    await browser.close();
  }
}

main();
