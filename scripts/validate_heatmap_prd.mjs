import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando Chromium com rolagem para auditoria visual de PRD do Mapa de Calor...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 950 }
  });

  const page = await browser.newPage();
  const BASE_URL = 'http://localhost:3000';

  await page.evaluateOnNewDocument(() => {
    const masterSession = {
      id: "usr_rodrigo",
      name: "Rodrigo Ribeiro Gonçalves",
      email: "rrodrigogon@gmail.com",
      role: "dono",
      cargo: "Proprietário & Administrador Geral",
      nivelAcesso: "MASTER_PROPRIETARIO",
      token: "jwt_master_rodrigo_token_2026"
    };
    localStorage.setItem("zuma_auth_session", JSON.stringify(masterSession));
    sessionStorage.setItem("zuma_auth_session", JSON.stringify(masterSession));
  });

  try {
    console.log('1. Acessando Cockpit Principal com Seletor de Períodos...');
    await page.goto(`${BASE_URL}/cockpit`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Scroll para exibir o bloco de mapa de calor com seus seletores
    await page.evaluate(() => {
      window.scrollTo(0, 480);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17-prd-home-cockpit-mapa-calor-periodos.png') });
    console.log('   - [OK] Screenshot 17 salva com sucesso!');

    console.log('2. Acessando Mapa de Calor Analítico (Grade 7x11 com scroll)...');
    await page.goto(`${BASE_URL}/mapa-de-calor`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => {
      window.scrollTo(0, 420);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18-prd-mapa-calor-grade-termica-7x11.png') });
    console.log('   - [OK] Screenshot 18 salva com sucesso!');

    console.log('3. Clicando na Tab Calendário Mosaico Contínuo e rolando...');
    const buttonsTab = await page.$$('button');
    for (const btn of buttonsTab) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Calendário Mosaico')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      window.scrollTo(0, 420);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19-prd-mapa-calor-mosaico-calendario.png') });
    console.log('   - [OK] Screenshot 19 salva com sucesso!');

    console.log('4. Clicando na Tab Planta Baixa Térmica das 27 Mesas e rolando...');
    const buttonsTab2 = await page.$$('button');
    for (const btn of buttonsTab2) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Planta Baixa')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      window.scrollTo(0, 420);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-prd-mapa-calor-planta-baixa-27-mesas.png') });
    console.log('   - [OK] Screenshot 20 salva com sucesso!');

    console.log('5. Clicando na Tab IA Zumi Preditiva & Anti-Ociosidade e rolando...');
    const buttonsTab3 = await page.$$('button');
    for (const btn of buttonsTab3) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('IA Zumi Preditiva')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      window.scrollTo(0, 420);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-prd-mapa-calor-ia-zumi-preditiva.png') });
    console.log('   - [OK] Screenshot 21 salva com sucesso!');

  } catch (err) {
    console.error('Erro na validação visual:', err);
  } finally {
    await browser.close();
    console.log('Auditoria visual concluída!');
  }
}

run();
