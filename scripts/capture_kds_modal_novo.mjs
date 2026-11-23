import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/mesas_copilot_prd';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log(`Validando modal avançado do KDS em ${BASE_URL}/cozinha...`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  try {
    // Login inicial
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fillBtn = btns.find(b => b.textContent.includes('Rodrigo') || b.textContent.includes('Preencher'));
      if (fillBtn) fillBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.textContent.includes('Entrar'));
      if (enterBtn) enterBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Navegar para /cozinha
    console.log('Navegando para /cozinha...');
    await page.goto(`${BASE_URL}/cozinha`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Abrir o modal de detalhes de uma comanda
    console.log('Abrindo modal de detalhes da comanda...');
    const opened = await page.evaluate(() => {
      // Clicar no primeiro card que tem draggable="true"
      const draggableCards = Array.from(document.querySelectorAll('div[draggable="true"]'));
      if (draggableCards.length > 0) {
        draggableCards[0].click();
        return true;
      }
      // Ou procurar por texto Camila Nogueira
      const allDivs = Array.from(document.querySelectorAll('div'));
      const card = allDivs.find(d => d.textContent && d.textContent.includes('Camila Nogueira') && d.textContent.includes('#1089'));
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log('Card clicado com sucesso:', opened);

    await new Promise(r => setTimeout(r, 1500));


    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'kds_modal_1_geral_novo.png') });
    console.log('Capturado: kds_modal_1_geral_novo.png');

    // 1. Clicar no botão +2 do primeiro item e clicar na tag rápida "+ Sem Cebolinha"
    console.log('Clicando no botão +2 e na tag + Sem Cebolinha...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const plusTwoBtn = buttons.find(b => b.textContent && b.textContent.trim() === '+2');
      if (plusTwoBtn) plusTwoBtn.click();

      const cebolinhaTag = buttons.find(b => b.textContent && b.textContent.includes('Sem Cebolinha'));
      if (cebolinhaTag) cebolinhaTag.click();

      // Clicar no seletor de quantidade 3x para o catálogo
      const threeXBtn = buttons.find(b => b.textContent && b.textContent.trim() === '3x');
      if (threeXBtn) threeXBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'kds_modal_1_geral_novo.png') });
    console.log('Capturado: kds_modal_1_geral_novo.png com +2 e Sem Cebolinha');

    // 2. Interagir com a barra de busca digitando "Salmão" com page.type
    console.log('Digitando busca por "Salmão" via page.type...');
    const searchSelector = 'input[placeholder*="Buscar prato"]';
    await page.click(searchSelector);
    await page.type(searchSelector, 'Salmao', { delay: 100 });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'kds_modal_2_busca_salmao.png') });
    console.log('Capturado: kds_modal_2_busca_salmao.png');

    // 3. Limpar a busca e clicar na categoria Uramakis
    console.log('Limpando busca e selecionando categoria Uramakis...');
    await page.evaluate(() => {
      // Clicar no botão X de limpar busca se existir ou selecionar todos e apagar
      const buttons = Array.from(document.querySelectorAll('button'));
      const clearBtn = buttons.find(b => b.getAttribute('title') === 'Limpar busca');
      if (clearBtn) clearBtn.click();

      const catBtns = Array.from(document.querySelectorAll('button'));
      const uramakiCat = catBtns.find(b => b.textContent && b.textContent.includes('Uramakis'));
      if (uramakiCat) uramakiCat.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'kds_modal_3_categoria_hotrolls.png') });
    console.log('Capturado: kds_modal_3_categoria_hotrolls.png');

    console.log('Validação e capturas do modal KDS concluídas com sucesso!');
  } catch (err) {
    console.error('Erro na validação do KDS:', err);
  } finally {
    await browser.close();
  }
}

main();
