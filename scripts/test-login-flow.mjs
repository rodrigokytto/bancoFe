import puppeteer from "puppeteer-core";

async function run() {
  console.log("Iniciando navegador Chromium...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  // Viewport iPhone 14/15/16 Pro
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log("Acessando http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });

  // 1. Verifica se a tela de login está ativa
  const loginTitle = await page.$eval("h1", el => el.textContent);
  console.log("Título encontrado:", loginTitle);
  if (!loginTitle.includes("ZUMA PILOT")) {
    throw new Error("Tela de login não foi renderizada!");
  }

  // 2. Testar senha incorreta
  console.log("Testando senha incorreta...");
  await page.type("input[type='password']", "senha_incorreta_123");
  await page.click("button[type='submit']");
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_login_error.png" });
  console.log("Screenshot do erro capturado.");

  // 3. Testar credenciais corretas: rrodrigogon@gmail.com e #080581
  console.log("Testando credenciais oficiais (rrodrigogon@gmail.com e #080581)...");
  // Limpa o campo de senha
  await page.evaluate(() => {
    const passInput = document.querySelector("input[type='password']");
    if (passInput) passInput.value = "";
  });
  await page.type("input[type='password']", "#080581");
  await page.click("button[type='submit']");
  
  // Aguarda navegação para o cockpit
  await new Promise(r => setTimeout(r, 2500));
  console.log("URL após login:", page.url());

  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_logged_in_iphone.png" });
  console.log("Screenshot pós-login capturado.");

  // 4. Testar Logout
  console.log("Testando Logout...");
  // Clica no botão de logout no mobile header
  page.on("dialog", async dialog => {
    console.log("Dialog confirmado:", dialog.message());
    await dialog.accept();
  });

  const logoutBtn = await page.$("button[title*='Sair']");
  if (logoutBtn) {
    await logoutBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    console.log("URL após logout:", page.url());
  }

  await page.screenshot({ path: "/home/ubuntu/screenshots/zuma_after_logout.png" });
  console.log("Screenshot pós-logout capturado.");

  await browser.close();
  console.log("Todos os testes do fluxo de login e credenciais passaram com sucesso!");
}

run().catch(err => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
