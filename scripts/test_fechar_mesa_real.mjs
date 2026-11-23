import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
  await page.type("input[type=\"password\"]", "#080581");
  await page.click("button[type=\"submit\"]");
  await new Promise(r => setTimeout(r, 2000));

  await page.goto("http://localhost:3000/mesas", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));

  // Clicar na Mesa 03
  const cardBox = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("div")).filter(el => {
      return el.textContent && el.textContent.includes("Mesa 03") && el.textContent.includes("Dr. Marcelo");
    });
    if (cards.length > 0) {
      const card = cards[cards.length - 1];
      const clickable = card.closest(".cursor-pointer") || card;
      const rect = clickable.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return null;
  });

  if (cardBox) {
    console.log("Abrindo Mesa 03...");
    await page.mouse.click(cardBox.x, cardBox.y);
    await new Promise(r => setTimeout(r, 1200));

    // Clicar em Lançamento Rápido: Barca Especial
    const barcaBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Barca Especial"));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Lançamento rápido executado:", barcaBtn);
    await new Promise(r => setTimeout(r, 1200));

    // Clicar em Fechar Conta (Pix Sicredi)
    const fecharBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Fechar Conta (Pix Sicredi)"));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Fechar Conta clicado:", fecharBtn);
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: "/home/ubuntu/screenshots/mesas_copilot/mesa_03_fechada_nfce.png" });
    console.log("Screenshot pós-fechamento salvo!");
  }

  await browser.close();
}

run().catch(console.error);
