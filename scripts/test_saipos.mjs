import puppeteer from 'puppeteer-core';
import fs from 'fs';

const screenshotDir = '/home/ubuntu/screenshots/saipos-features-test';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("1. Navegando para /pdv...");
  await page.goto('http://localhost:3000/pdv', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${screenshotDir}/01-pdv-visao-geral.png` });

  console.log("2. Abrindo Modal de Impressão Térmica ESC/POS (80mm)...");
  // Clica no botão "Bobina Térmica 80mm"
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Bobina Térmica 80mm')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/02-modal-impressao-termica-80mm.png` });

  // Fecha o modal de impressão
  const closeBtns = await page.$$('button');
  for (const b of closeBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Fechar Visualização')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  console.log("3. Abrindo Modal de Gestão de Ruptura iFood...");
  const ifoodBtns = await page.$$('button');
  for (const b of ifoodBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Pausar Cardápio iFood')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/03-modal-gestao-ruptura-ifood.png` });

  // Fecha o modal do iFood
  const closeIfoodBtns = await page.$$('button');
  for (const b of closeIfoodBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Concluir Sincronização')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  console.log("4. Clicando em Mesa 01 para abrir comanda e ações rápidas...");
  const elements = await page.$$('div, button');
  for (const el of elements) {
    const text = await page.evaluate(e => e.innerText, el);
    if (text && text.includes('Mesa 01') && text.includes('OCUPADA')) {
      await el.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${screenshotDir}/04-pdv-mesa-comanda-acoes.png` });

  console.log("5. Abrindo Modal Juntar Mesas...");
  const actionBtns = await page.$$('button');
  for (const b of actionBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Juntar Mesas')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${screenshotDir}/05-modal-juntar-mesas.png` });

  // Cancelar modal juntar mesas
  const cancelBtns = await page.$$('button');
  for (const b of cancelBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Cancelar')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  console.log("6. Indo para Gestão de Caixa e abrindo Acerto de Motoboys...");
  const tabBtns = await page.$$('button');
  for (const b of tabBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Gestão de Caixa & Turno')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  const motoboyBtns = await page.$$('button');
  for (const b of motoboyBtns) {
    const text = await page.evaluate(e => e.innerText, b);
    if (text && text.includes('Acerto de Motoboys do Turno')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${screenshotDir}/06-modal-acerto-motoboys.png` });

  console.log("Capturas finalizadas com sucesso!");
  await browser.close();
}

run().catch(err => {
  console.error("Erro no script puppeteer:", err);
  process.exit(1);
});
