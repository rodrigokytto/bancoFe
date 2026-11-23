import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("[BROWSER PAGE ERROR STACK]:", err.stack);
  });

  console.log("Navigating to https://erp-bancofe-243135142712.southamerica-east1.run.app/admin/cadastro-360 ...");
  
  try {
    await page.goto("https://erp-bancofe-243135142712.southamerica-east1.run.app/admin/cadastro-360", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
}

run();
