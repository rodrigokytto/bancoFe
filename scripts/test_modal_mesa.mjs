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

  // Encontrar o bounding box do primeiro card de mesa
  const cardBox = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("div")).filter(el => {
      return el.textContent && el.textContent.includes("Mesa 01") && el.textContent.includes("Família Barbosa");
    });
    if (cards.length > 0) {
      // Find the card container
      const card = cards[cards.length - 1]; // or the one with cursor-pointer
      const clickable = card.closest(".cursor-pointer") || card;
      const rect = clickable.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return null;
  });

  if (cardBox) {
    console.log("Clicando na posição:", cardBox);
    await page.mouse.click(cardBox.x, cardBox.y);
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: "/home/ubuntu/screenshots/mesas_copilot/modal_mesa_01_detalhes.png" });
    console.log("Screenshot do modal da Mesa 01 capturado com sucesso!");
  }

  await browser.close();
}

run().catch(console.error);
