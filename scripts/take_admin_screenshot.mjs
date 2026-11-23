import puppeteer from "puppeteer-core";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err));

  console.log("Navigating to http://localhost:3000/admin...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded", timeout: 15000 });

  await new Promise((r) => setTimeout(r, 4000));

  const url = page.url();
  console.log("Current page URL:", url);

  const screenshotPath = "/home/ubuntu/bancoFe/client/public/admin_dashboard_screenshot.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Screenshot saved at:", screenshotPath);

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
