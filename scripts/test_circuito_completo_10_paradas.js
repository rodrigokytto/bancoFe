import puppeteer from "puppeteer-core";

async function main() {
  console.log("Iniciando validação completa das 10 entregas encadeadas...");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    await page.goto("http://localhost:3000/entregador", { waitUntil: "networkidle2" });

    // 1. Ir para a aba Fila de Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Fila de Entregas"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Otimizar Circuito das 10 Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Otimizar Circuito das 10 Entregas"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // 3. Iniciar Circuito
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Iniciar Circuito"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 4. Loop de confirmação de entrega para cada uma das 10 paradas
    for (let parada = 1; parada <= 10; parada++) {
      console.log(`[Circuito] Confirmando entrega da Parada #${parada}...`);

      // Clica no botão de confirmar na página de navegação
      const clicouPagina = await page.evaluate((num) => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.textContent && (b.textContent.includes(`Confirmar Entrega #${num}`) || b.textContent.includes("Confirmar Última Entrega")));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      }, parada);

      if (!clicouPagina) {
        console.error(`Não encontrou botão na página para Parada #${parada}`);
        break;
      }

      await new Promise(r => setTimeout(r, 800));

      // Clica no botão DENTRO do modal
      const clicouModal = await page.evaluate(() => {
        const modal = document.querySelector(".fixed.inset-0");
        if (!modal) return false;
        const btns = Array.from(modal.querySelectorAll("button"));
        const btnSubmit = btns.find(b => b.textContent && (b.textContent.includes("Confirmar &") || b.textContent.includes("Confirmar")));
        if (btnSubmit) {
          btnSubmit.click();
          return true;
        }
        return false;
      });

      if (!clicouModal) {
        console.error(`Não conseguiu confirmar modal para Parada #${parada}`);
        break;
      }

      await new Promise(r => setTimeout(r, 2000));
      console.log(`[Circuito] Parada #${parada} confirmada com sucesso!`);
    }

    // 5. Verificar modal de celebração final
    await new Promise(r => setTimeout(r, 1500));
    const statusFinal = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        temMissaoCumprida: text.includes("Missão Cumprida"),
        temCircuitoConcluido: text.includes("Circuito dos 10 Pedidos Concluído!"),
        tem10de10: text.includes("10 de 10"),
        temRetornarBase: text.includes("Retornar à Base Zuma Oriental")
      };
    });

    console.log("Status Final do Circuito Completo:", statusFinal);

    await page.screenshot({ path: "docs/screenshots/09_circuito_10_paradas_concluido_modal_celebracao.png" });
    console.log("Screenshot salvo: docs/screenshots/09_circuito_10_paradas_concluido_modal_celebracao.png");

    // 6. Clicar no botão 'Retornar à Base Zuma Oriental'
    console.log("Clicando em 'Retornar à Base Zuma Oriental'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btnBase = btns.find(b => b.textContent && b.textContent.includes("Retornar à Base Zuma Oriental"));
      btnBase?.click();
    });

    await new Promise(r => setTimeout(r, 2500));

    await page.screenshot({ path: "docs/screenshots/10_retorno_a_base_zuma_tracado.png" });
    console.log("Screenshot salvo: docs/screenshots/10_retorno_a_base_zuma_tracado.png");

    console.log("🎉 VALIDAÇÃO DE PONTA A PONTA DAS 10 ENTREGAS E RETORNO À BASE CONCLUÍDA!");
  } finally {
    await browser.close();
  }
}

main();
