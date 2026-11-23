import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/ubuntu/screenshots/entregador-rotas-tangara';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function validateRoutes(baseUrl, prefix) {
  console.log(`\n======================================================`);
  console.log(`🛵 VALIDANDO APP ENTREGADOR EM ${baseUrl} (${prefix})`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  // Viewport mobile típico de entregador (iPhone 14 / Samsung Galaxy)
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  try {
    // 1. Acessa tela do entregador
    console.log(`1. Acessando ${baseUrl}/entregador...`);
    await page.goto(`${baseUrl}/entregador`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // Captura inicial (Perfil padrão: Mais Rápida)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_01_rota_mais_rapida.png`) });
    console.log(`📸 Salvo: ${prefix}_01_rota_mais_rapida.png`);

    // 2. Clica no Perfil "Menor Trajeto (Atalhos)"
    console.log(`2. Testando perfil: Menor Trajeto (Atalhos)...`);
    const clickedMenor = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('Menor Trajeto') || b.textContent.includes('Atalhos')));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedMenor) {
      console.log('✅ Botão Menor Trajeto clicado. Aguardando recálculo...');
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_02_perfil_menor_trajeto.png`) });
      console.log(`📸 Salvo: ${prefix}_02_perfil_menor_trajeto.png`);
    } else {
      console.warn('⚠️ Botão Menor Trajeto não encontrado');
    }

    // 3. Clica no Perfil "Segura Chuva (100% Asfalto)"
    console.log(`3. Testando perfil: Segura Chuva (100% Asfalto)...`);
    const clickedChuva = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('Segura Chuva') || b.textContent.includes('Asfalto')));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedChuva) {
      console.log('✅ Botão Segura Chuva clicado. Aguardando recálculo com desvio...');
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_03_perfil_segura_chuva.png`) });
      console.log(`📸 Salvo: ${prefix}_03_perfil_segura_chuva.png`);
    } else {
      console.warn('⚠️ Botão Segura Chuva não encontrado');
    }

    // 4. Seleciona a entrega para Jardim Tarumã (que cruza a baixada do Figueira)
    console.log('4. Selecionando entrega para Jardim Tarumã para auditar desvio pluvial...');
    // Clica na aba Fila
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnFila = btns.find(b => b.textContent && b.textContent.includes('Fila'));
      if (btnFila) btnFila.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Seleciona o pedido #3 (Jardim Tarumã)
    const selectedTaruma = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div'));
      const taruma = items.find(el => el.textContent && el.textContent.includes('Jardim Tarumã'));
      if (taruma) {
        taruma.click();
        return true;
      }
      return false;
    });

    if (selectedTaruma) {
      console.log('✅ Pedido Jardim Tarumã selecionado');
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_04_taruma_desvio_chuva.png`) });
      console.log(`📸 Salvo: ${prefix}_04_taruma_desvio_chuva.png`);
    }

    // 5. Testar visualização em desktop / tablet
    await page.setViewport({ width: 1280, height: 800, isMobile: false });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_05_desktop_cockpit_entregador.png`) });
    console.log(`📸 Salvo: ${prefix}_05_desktop_cockpit_entregador.png`);

  } catch (err) {
    console.error(`Erro ao validar ${baseUrl}:`, err);
  } finally {
    await browser.close();
  }
}

async function main() {
  // Executa no servidor local com o novo dist compilado
  await validateRoutes('http://localhost:3000', 'local');
  // Executa em produção
  await validateRoutes('https://zuma.kytto.com.br', 'prd');
}

main();
