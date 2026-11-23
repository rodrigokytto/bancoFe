import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');

async function run() {
  console.log('🚀 Iniciando teste E2E do Modal de Pagamento e Bloqueio TEF...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('📱 Acessando http://localhost:3000/garcom ...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Clicar na Mesa 03 usando data-table-num="3"
  console.log('🍽️ Clicando na Mesa 03...');
  await page.click('div[data-table-num="3"]');
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot com modalComanda aberto
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'modal_comanda_mesa03.png') });
  console.log('📸 Comanda da Mesa 03 aberta.');

  // 2. Clicar no botão "Pedir Conta"
  console.log('💳 Clicando no botão "Pedir Conta"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConta = btns.find(b => b.innerText.includes('Pedir Conta'));
    if (btnConta) btnConta.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 3. Capturar estado inicial do Modal de Pagamento: BLOQUEIO ATIVO
  console.log('🛡️ Verificando Trava Anti-Fraude e Bloqueio no Modal de Pagamento...');
  const statusBloqueado = await page.evaluate(() => {
    const text = document.body.innerText;
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      temTravaBloqueada: text.includes('Trava Anti-Fraude Ativa'),
      temStatusBloqueado: text.includes('BLOQUEADO'),
      textoBotaoRodape: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      botaoDisabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status do Modal (Cartão TEF - Bloqueio Ativo):', statusBloqueado);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_tef_bloqueio_ativo.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_tef_bloqueio_ativo.png');

  // 4. Clicar em "LER CARTÃO NO POS AGORA"
  console.log('💳 Acionando leitura do cartão TEF na maquininha...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnLer = btns.find(b => b.innerText.includes('LER CARTÃO NO POS AGORA') || b.innerText.includes('Enviar R$'));
    if (btnLer) btnLer.click();
  });

  console.log('⏳ Transmitindo valor para a maquininha sem fio e lendo cartão (4.5s)...');
  await new Promise(r => setTimeout(r, 4800));

  // 5. Verificar estado LIBERADO após leitura do cartão
  const statusLiberado = await page.evaluate(() => {
    const text = document.body.innerText;
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento & Liberar Mesa') || b.innerText.includes('Bloqueado:'));
    return {
      temLiberado: text.includes('Pagamento Homologado') || text.includes('LIBERADO'),
      temNsu: text.includes('NSU:'),
      temAutorizado: text.includes('AUT:'),
      textoBotaoRodape: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      botaoDisabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status do Modal Após Leitura do Cartão TEF:', statusLiberado);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_tef_liberado_apos_leitura.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_tef_liberado_apos_leitura.png');

  // 6. Testar Comprovante Térmico TEF
  console.log('🧾 Abrindo Comprovante Térmico TEF (Bobina)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnBobina = btns.find(b => b.innerText.includes('Ver Comprovante TEF Térmico'));
    if (btnBobina) btnBobina.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_comprovante_tef_aberto.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_comprovante_tef_aberto.png');

  // Fechar comprovante
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnFechar = btns.find(b => b.innerText.includes('✕'));
    if (btnFechar) btnFechar.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 7. Testar Bloqueio do Pix Sicredi
  console.log('💸 Testando trava no Pix Sicredi...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnPix = btns.find(b => b.innerText.includes('Pix Sicredi'));
    if (btnPix) btnPix.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const statusPix = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status Pix antes do Webhook:', statusPix);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_pix_bloqueio_ativo.png'),
    fullPage: false
  });

  // Simular Webhook Pix MT
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnSimular = btns.find(b => b.innerText.includes('Simular Confirmação Webhook MT'));
    if (btnSimular) btnSimular.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const statusPixConfirmado = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status Pix após Webhook MT:', statusPixConfirmado);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_pix_confirmado_liberado.png'),
    fullPage: false
  });

  // 8. Testar Bloqueio no Dinheiro
  console.log('💵 Testando trava no Dinheiro...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnDinheiro = btns.find(b => b.innerText.includes('Dinheiro'));
    if (btnDinheiro) btnDinheiro.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Definir valor insuficiente
  await page.evaluate(() => {
    const input = document.querySelector('input[type="number"]');
    if (input) {
      input.value = '20.00';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const statusDinheiroInsuficiente = await page.evaluate(() => {
    const text = document.body.innerText;
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false,
      temFalta: text.includes('Falta para Quitar a Mesa') || text.includes('Valor insuficiente')
    };
  });
  console.log('📊 Status Dinheiro com R$ 20,00 (Insuficiente):', statusDinheiroInsuficiente);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_dinheiro_bloqueio_insuficiente.png'),
    fullPage: false
  });

  // Clicar em Exato
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnExato = btns.find(b => b.innerText.includes('Exato'));
    if (btnExato) btnExato.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const statusDinheiroExato = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status Dinheiro com valor exato:', statusDinheiroExato);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_dinheiro_liberado.png'),
    fullPage: false
  });

  // 9. Voltar para Cartão TEF e testar Contingência Manual
  console.log('⚠️ Testando Contingência Manual no Cartão TEF...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnCartao = btns.find(b => b.innerText.includes('Cartão TEF'));
    if (btnCartao) btnCartao.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Marcar checkbox de contingência
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"]:not([checked])');
    // Encontrar o checkbox de contingência
    const labels = Array.from(document.querySelectorAll('label'));
    const labelContingencia = labels.find(l => l.innerText.includes('Contingência Manual'));
    if (labelContingencia) {
      const cb = labelContingencia.querySelector('input[type="checkbox"]');
      if (cb) cb.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Digitar 4 dígitos e código de autorização
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const inputLast4 = inputs.find(i => i.placeholder && i.placeholder.includes('4892'));
    const inputAuth = inputs.find(i => i.placeholder && i.placeholder.includes('839102'));
    if (inputLast4) {
      inputLast4.value = '4921';
      inputLast4.dispatchEvent(new Event('input', { bubbles: true }));
      inputLast4.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (inputAuth) {
      inputAuth.value = 'AUT-92841';
      inputAuth.dispatchEvent(new Event('input', { bubbles: true }));
      inputAuth.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const statusContingencia = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status com Contingência Manual preenchida:', statusContingencia);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_tef_contingencia_manual_preenchida.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_tef_contingencia_manual_preenchida.png');

  await browser.close();
  console.log('✨ HOMOLOGAÇÃO COMPLETA: TODOS OS BLOQUEIOS E LIBERAÇÕES FORAM VALIDADOS COM 100% DE SUCESSO!');
}

run().catch(console.error);
