import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/prd-validation';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando Chromium para validação visual E2E do ecossistema de integrações...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100'],
    defaultViewport: { width: 1440, height: 1100 }
  });

  const page = await browser.newPage();
  const BASE_URL = 'http://localhost:3000';

  // 0. Autenticação na tela de login
  console.log('0. Autenticando usuário master Rodrigo no sistema...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    const sessionObj = {
      id: 1,
      openId: 'usr_rodrigo_zuma',
      name: 'Rodrigo Ribeiro Gonçalves',
      email: 'rrodrigogon@gmail.com',
      role: 'admin',
      cargo: 'Proprietário & Administrador Geral',
      unidade: 'Tangará da Serra - MT',
      lastSignedIn: new Date().toISOString()
    };
    localStorage.setItem('zuma_auth_session', JSON.stringify(sessionObj));
    sessionStorage.setItem('zuma_auth_session', JSON.stringify(sessionObj));
  });
  await new Promise(r => setTimeout(r, 800));

  try {
    // 1. Aba Google Cloud & Workspace
    console.log('1. Acessando Aba Google Cloud & Workspace (/integracoes?tab=google)...');
    await page.goto(`${BASE_URL}/integracoes?tab=google`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-prd-integracoes-google-ecosystem-sheets-drive.png') });
    console.log('   - [OK] Screenshot 22 salva com sucesso!');

    // 2. Aba Bancos, Open Finance & TEF
    console.log('2. Acessando Aba Bancos, Open Finance & TEF (/integracoes?tab=bancos_tef)...');
    await page.goto(`${BASE_URL}/integracoes?tab=bancos_tef`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-prd-integracoes-bancos-open-finance-tef.png') });
    console.log('   - [OK] Screenshot 23 salva com sucesso!');

    // 3. Aba Git DevOps & Zuma MCP Server
    console.log('3. Acessando Aba Git DevOps & Zuma MCP Server (/integracoes?tab=git_mcps)...');
    await page.goto(`${BASE_URL}/integracoes?tab=git_mcps`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24-prd-integracoes-git-mcp-server-terminal.png') });
    console.log('   - [OK] Screenshot 24 salva com sucesso!');

    // 4. Aba Central de Tomada de Decisão 360°
    console.log('4. Acessando Aba Central de Tomada de Decisão (/integracoes?tab=decisao)...');
    await page.goto(`${BASE_URL}/integracoes?tab=decisao`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '25-prd-integracoes-central-tomada-decisao-360.png') });
    console.log('   - [OK] Screenshot 25 salva com sucesso!');

    // 5. Catálogo Expandido de Conexões (33 APIs)
    console.log('5. Acessando Catálogo de Conexões (/integracoes?tab=canais)...');
    await page.goto(`${BASE_URL}/integracoes?tab=canais`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '26-prd-integracoes-catalogo-expandido-33-apis.png') });
    console.log('   - [OK] Screenshot 26 salva com sucesso!');

  } catch (err) {
    console.error('Erro durante a auditoria E2E:', err);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('Auditoria E2E do ecossistema de integrações finalizada com sucesso!');
  }
}

run();
