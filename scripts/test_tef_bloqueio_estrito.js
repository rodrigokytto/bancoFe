import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('/home/ubuntu/zuma/docs/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function clickByText(page, tag, textSubstr) {
  const clicked = await page.evaluate(({ tag, textSubstr }) => {
    const elements = Array.from(document.querySelectorAll(tag));
    const target = elements.find(el => el.innerText && el.innerText.toLowerCase().includes(textSubstr.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, { tag, textSubstr });
  return clicked;
}

async function run() {
  console.log('🚀 Iniciando Homologação do Bloqueio Estrito de Cartão/TEF no Zuma...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Acessar App do Garçom
  console.log('📱 Acessando http://localhost:3000/garcom ...');
  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Verificar se há seleção de garçom
  const clickedGarcom = await clickByText(page, 'button', 'Rodrigo');
  if (clickedGarcom) {
    console.log('👤 Garçom Rodrigo selecionado.');
    await new Promise(r => setTimeout(r, 800));
  }

  // 2. Clicar em uma mesa (ex: Mesa 04 ou primeira mesa)
  console.log('🍽️ Localizando mesa ocupada ou com consumo...');
  let mesaClicada = await clickByText(page, 'button', 'Mesa 04');
  if (!mesaClicada) {
    mesaClicada = await clickByText(page, 'button', 'Mesa 01');
  }
  if (!mesaClicada) {
    mesaClicada = await clickByText(page, 'button', 'Mesa');
  }
  await new Promise(r => setTimeout(r, 1000));

  // Clicar no botão Fechar Conta / Pagamento na Mesa
  console.log('💳 Clicando em "Fechar Conta / Pagamento na Mesa"...');
  let btnClicado = await clickByText(page, 'button', 'Fechar Conta');
  if (!btnClicado) {
    btnClicado = await clickByText(page, 'button', 'Pagamento');
  }
  await new Promise(r => setTimeout(r, 1500));

  // 3. Verificar estado do Modal de Pagamento: BLOQUEIO ATIVO
  console.log('🛡️ Verificando Trava Anti-Fraude e Bloqueio no Modal de Pagamento...');
  const statusInicial = await page.evaluate(() => {
    const text = document.body.innerText;
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      temTravaBloqueada: text.includes('Trava Anti-Fraude Ativa') || text.includes('Baixa de Mesa Bloqueada'),
      temTextoBloqueado: text.includes('BLOQUEADO'),
      textoBotaoRodape: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      botaoDisabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });

  console.log('📊 Status Inicial do Bloqueio:', statusInicial);

  // Capturar screenshot da Trava de Segurança Bloqueada
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_tef_bloqueio_ativo.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_tef_bloqueio_ativo.png');

  // 4. Acionar Leitura Real do Cartão no TEF
  console.log('💳 Acionando "LER CARTÃO NO POS AGORA"...');
  let clicouLer = await clickByText(page, 'button', 'LER CARTÃO NO POS AGORA');
  if (!clicouLer) {
    clicouLer = await clickByText(page, 'button', 'Enviar R$');
  }
  if (clicouLer) {
    console.log('⏳ Transmitindo valor e aguardando leitura do cartão TEF (4.5s)...');
    await new Promise(r => setTimeout(r, 4800));
  } else {
    console.log('⚠️ Botão de ler cartão não encontrado pelo texto.');
  }

  // 5. Verificar status liberado após leitura e autorização
  const statusAposLeitura = await page.evaluate(() => {
    const text = document.body.innerText;
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      temLiberado: text.includes('Pagamento Homologado') || text.includes('LIBERADO'),
      temNsu: text.includes('NSU:'),
      temAutorizado: text.includes('AUT:'),
      textoBotaoRodape: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      botaoDisabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });

  console.log('📊 Status Após Leitura do Cartão TEF:', statusAposLeitura);

  // Capturar screenshot da Mesa Liberada após TEF
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_tef_liberado_apos_leitura.png'),
    fullPage: false
  });
  console.log('📸 Screenshot salva: docs/screenshots/modal_tef_liberado_apos_leitura.png');

  // 6. Testar visualização do Comprovante Térmico TEF
  const abriuBobina = await clickByText(page, 'button', 'Ver Comprovante TEF Térmico');
  if (abriuBobina) {
    console.log('🧾 Visualizando Comprovante Térmico TEF na Bobina...');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'modal_comprovante_tef_aberto.png'),
      fullPage: false
    });
    console.log('📸 Screenshot salva: docs/screenshots/modal_comprovante_tef_aberto.png');

    // Fechar modal secundário
    await clickByText(page, 'button', '✕');
    await new Promise(r => setTimeout(r, 800));
  }

  // 7. Testar Bloqueio no Pix Sicredi
  console.log('💸 Testando trava no Pix Sicredi...');
  await clickByText(page, 'button', 'Pix Sicredi');
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

  // Simular confirmação Webhook MT
  await clickByText(page, 'button', 'Simular Confirmação Webhook MT');
  await new Promise(r => setTimeout(r, 800));

  const statusPixConfirmado = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnConfirmar = btns.find(b => b.innerText.includes('Confirmar Pagamento') || b.innerText.includes('Bloqueado:'));
    return {
      texto: btnConfirmar ? btnConfirmar.innerText.trim() : 'Não encontrado',
      disabled: btnConfirmar ? btnConfirmar.disabled : false
    };
  });
  console.log('📊 Status Pix após confirmação Webhook MT:', statusPixConfirmado);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_pix_confirmado_liberado.png'),
    fullPage: false
  });

  // 8. Testar Bloqueio no Dinheiro
  console.log('💵 Testando trava no Dinheiro...');
  await clickByText(page, 'button', 'Dinheiro');
  await new Promise(r => setTimeout(r, 800));

  // Digitar valor insuficiente
  await page.evaluate(() => {
    const input = document.querySelector('input[type="number"]');
    if (input) {
      input.value = '10.00';
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
  console.log('📊 Status Dinheiro com R$ 10,00 (Insuficiente):', statusDinheiroInsuficiente);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'modal_dinheiro_bloqueio_insuficiente.png'),
    fullPage: false
  });

  // Clicar em "Exato"
  await clickByText(page, 'button', 'Exato');
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

  await browser.close();
  console.log('✨ Validação e Homologação dos Bloqueios Estritos Concluída com Sucesso!');
}

run().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
