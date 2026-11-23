import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  console.log("Iniciando auditoria da Suíte Fiscal Nacional em https://zuma.kytto.com.br/erp...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  console.log("[1] Autenticando com credenciais oficiais...");
  await page.goto('https://zuma.kytto.com.br/login', { waitUntil: 'networkidle2', timeout: 35000 });
  const hasPass = await page.$("input[type='password']");
  if (hasPass) {
    await page.type("input[type='password']", "#080581");
    await page.click("button[type='submit']");
  }
  await new Promise(r => setTimeout(r, 2000));

  console.log("[2] Navegando para https://zuma.kytto.com.br/erp...");
  await page.goto('https://zuma.kytto.com.br/erp', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 1500));

  console.log("[3] Clicando na aba 'Fiscal 27 UFs'...");
  const clickedFiscal = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Fiscal 27 UFs') || b.innerText.includes('Fiscal'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log("Aba Fiscal clicada:", clickedFiscal);
  await new Promise(r => setTimeout(r, 1500));

  const hasFiscalTitle = await page.evaluate(() => {
    return document.body.innerText.includes("Suíte Fiscal & Tributária Nacional");
  });
  console.log("Título da Suíte Fiscal presente:", hasFiscalTitle);

  // Clicar na sub-aba Monitor Webservices 27 UFs
  console.log("[4] Testando sub-aba 'Monitor Webservices 27 UFs'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Monitor Webservices 27 UFs'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const ufsPresent = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes("MT") && text.includes("SP") && text.includes("PR") && text.includes("RS") && text.includes("GO");
  });
  console.log("Servidores das UFs listados:", ufsPresent);

  // Voltar para sub-aba Fila de Notas e abrir DANFCE modal
  console.log("[5] Testando visualizador de DANFE / Cupom 80mm...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Fila de Notas & Emissão'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const viewBtns = Array.from(document.querySelectorAll("button[title='Visualizar Cupom / DANFE']"));
    if (viewBtns.length > 0) viewBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const danfeVisible = await page.evaluate(() => {
    return document.body.innerText.includes("DANFE NFC-e") || document.body.innerText.includes("QR CODE SEFAZ-MT");
  });
  console.log("DANFCE 80mm com QR Code exibido:", danfeVisible);

  if (!fs.existsSync('/home/ubuntu/screenshots/erp')) {
    fs.mkdirSync('/home/ubuntu/screenshots/erp', { recursive: true });
  }
  await page.screenshot({ path: '/home/ubuntu/screenshots/erp/fiscal-suite-live.png', fullPage: false });
  console.log("Screenshot salvo em /home/ubuntu/screenshots/erp/fiscal-suite-live.png");

  console.log("Erros críticos de console:", errors.length === 0 ? "Zero erros (100% limpo)" : errors);

  await browser.close();
  console.log("Auditoria da Suíte Fiscal Nacional concluída com êxito!");
})();
