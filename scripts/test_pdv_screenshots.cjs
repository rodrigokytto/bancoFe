const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('Navigating to http://localhost:3000/pdv...');
  await page.goto('http://localhost:3000/pdv', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture main clean header view
  await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/13_pdv_novo_header_limpo.png', fullPage: false });
  console.log('Saved 13_pdv_novo_header_limpo.png');

  // 2. Click on "Operações" dropdown menu
  try {
    const operacoesBtn = await page.waitForSelector('button:has-text("Operações"), button', { timeout: 5000 });
    // find buttons with text "Operações"
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Operações')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/14_pdv_menu_dropdown_operacoes.png' });
        console.log('Saved 14_pdv_menu_dropdown_operacoes.png');
        break;
      }
    }
  } catch (err) {
    console.error('Error finding Operações button:', err);
  }

  // 3. Open Gestão de Bairros e Fretes MT Modal
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Bairros & Fretes MT')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/15_modal_gestao_bairros_fretes_mt.png' });
        console.log('Saved 15_modal_gestao_bairros_fretes_mt.png');

        // Click "+ Novo Bairro / Localidade MT" button inside modal
        const modalBtns = await page.$$('button');
        for (const mBtn of modalBtns) {
          const mText = await page.evaluate(el => el.textContent, mBtn);
          if (mText && mText.includes('Novo Bairro')) {
            await mBtn.click();
            await new Promise(r => setTimeout(r, 600));
            await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/16_modal_cadastro_novo_bairro_mt.png' });
            console.log('Saved 16_modal_cadastro_novo_bairro_mt.png');

            // Close submodal
            const cancelBtns = await page.$$('button');
            for (const cBtn of cancelBtns) {
              const cText = await page.evaluate(el => el.textContent, cBtn);
              if (cText && cText.includes('Cancelar')) {
                await cBtn.click();
                await new Promise(r => setTimeout(r, 400));
                break;
              }
            }
            break;
          }
        }

        // Close Gestão de Bairros modal
        const closeBtns = await page.$$('button');
        for (const cBtn of closeBtns) {
          const cText = await page.evaluate(el => el.textContent, cBtn);
          if (cText && (cText.includes('Concluir') || cText.includes('Fechar'))) {
            await cBtn.click();
            await new Promise(r => setTimeout(r, 500));
            break;
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error('Error in modal test:', err);
  }

  // 4. Test VIP customer search in the Delivery / Balcão panel
  try {
    // Select delivery mode
    const deliveryRadio = await page.$('input[value="delivery"]');
    if (deliveryRadio) {
      await deliveryRadio.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // Type "VIP-01" or "Rodrigo" into VIP customer input
    const vipInput = await page.$('input[placeholder*="VIP"]');
    if (vipInput) {
      await vipInput.click();
      await vipInput.type('VIP-01');
      await new Promise(r => setTimeout(r, 800));

      // Click on the autocomplete suggestion
      const suggestions = await page.$$('div, button');
      for (const item of suggestions) {
        const text = await page.evaluate(el => el.textContent, item);
        if (text && text.includes('Rodrigo Ribeiro Gonçalves') && text.includes('VIP-01')) {
          await item.click();
          await new Promise(r => setTimeout(r, 800));
          break;
        }
      }
    }

    // Add an item to the order to see the totals and free delivery
    const addButtons = await page.$$('button');
    for (const btn of addButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Costela') || text.includes('Picanha') || text.includes('Burger') || text.includes('Bife'))) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        break;
      }
    }

    await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/17_pdv_cliente_vip_frete_gratis.png' });
    console.log('Saved 17_pdv_cliente_vip_frete_gratis.png');

    // 5. Select a different MT destination (e.g., Cuiabá or Chapada) to show VIP free delivery holds across MT
    const selectElem = await page.$('select');
    if (selectElem) {
      await selectElem.select(await page.evaluate(el => {
        const opt = Array.from(el.options).find(o => o.text.includes('Cuiabá') || o.text.includes('Rondonópolis'));
        return opt ? opt.value : el.options[1].value;
      }, selectElem));
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: '/home/ubuntu/screenshots_enhanced/18_pdv_seletor_entrega_mt_selecionado.png' });
      console.log('Saved 18_pdv_seletor_entrega_mt_selecionado.png');
    }
  } catch (err) {
    console.error('Error in VIP / Delivery test:', err);
  }

  await browser.close();
  console.log('Puppeteer test run finished.');
})();
