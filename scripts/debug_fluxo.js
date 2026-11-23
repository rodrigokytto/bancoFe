import puppeteer from "puppeteer-core";

async function main() {
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

    // Clica na Fila de Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Fila de Entregas"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Clica em Otimizar Circuito das 10 Entregas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Otimizar Circuito das 10 Entregas"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // Clica em Iniciar Circuito
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Iniciar Circuito"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Clica em Confirmar Entrega #1 (abre o modal)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Confirmar Entrega #1"));
      btn?.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Clica no botão de confirmar DENTRO do modal
    const clicou = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return false;
      const btns = Array.from(modal.querySelectorAll("button"));
      const btnSubmit = btns.find(b => b.textContent && (b.textContent.includes("Confirmar &") || b.textContent.includes("Confirmar")));
      if (btnSubmit) {
        console.log("Clicando no botão de submit do modal:", btnSubmit.textContent);
        btnSubmit.click();
        return true;
      }
      return false;
    });
    console.log("Clicou no botão do modal?", clicou);
    await new Promise(r => setTimeout(r, 3000));

    // Verifica estado após confirmar
    const estado = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        modalAberto: !!document.querySelector(".fixed.inset-0"),
        temBeatriz: text.includes("Beatriz"),
        temParada2Ativa: text.includes("Confirmar Entrega #2"),
        temUmaEntregue: text.includes("1 de 10 Entregues")
      };
    });
    console.log("Estado pós confirmação:", estado);

    await page.screenshot({ path: "docs/screenshots/pos_confirmacao_real.png" });
  } finally {
    await browser.close();
  }
}

main();
