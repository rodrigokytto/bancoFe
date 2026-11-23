import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    os.makedirs('/home/ubuntu/screenshots_enhanced', exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path='/usr/bin/chromium',
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(viewport={'width': 1600, 'height': 1000})
        page = await context.new_page()

        print("Navigating to http://localhost:3000/login...")
        await page.goto("http://localhost:3000/login", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(1)

        # Click "Preencher Acesso Rodrigo (Dono)"
        quick_btn = page.locator("button:has-text('Preencher Acesso Rodrigo')").first
        if await quick_btn.count() > 0:
            print("Clicking quick login button...")
            await quick_btn.click()
            await asyncio.sleep(0.5)

        # Click "Entrar no Zuma Pilot"
        login_btn = page.locator("button:has-text('Entrar no Zuma Pilot')").first
        if await login_btn.count() > 0:
            print("Clicking submit login button...")
            await login_btn.click()
            await asyncio.sleep(2)

        print("Navigating to http://localhost:3000/pdv...")
        await page.goto("http://localhost:3000/pdv", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)

        # 1. Capture clean header
        await page.screenshot(path="/home/ubuntu/screenshots_enhanced/13_pdv_novo_header_limpo.png")
        print("Captured: 13_pdv_novo_header_limpo.png")

        # 2. Click on "Ferramentas" dropdown menu
        try:
            tools_btn = page.locator("button:has-text('Ferramentas')").first
            if await tools_btn.count() > 0:
                await tools_btn.click()
                await asyncio.sleep(0.6)
                await page.screenshot(path="/home/ubuntu/screenshots_enhanced/14_pdv_menu_dropdown_operacoes.png")
                print("Captured: 14_pdv_menu_dropdown_operacoes.png")
                # close dropdown
                await tools_btn.click()
                await asyncio.sleep(0.3)
        except Exception as e:
            print("Error in Ferramentas dropdown:", e)

        # 3. Open Gestão de Bairros e Fretes MT Modal
        try:
            bairros_btn = page.locator("button:has-text('Bairros & Frete MT')").first
            if await bairros_btn.count() > 0:
                await bairros_btn.click()
                await asyncio.sleep(1)
                await page.screenshot(path="/home/ubuntu/screenshots_enhanced/15_modal_gestao_bairros_fretes_mt.png")
                print("Captured: 15_modal_gestao_bairros_fretes_mt.png")

                # Click "+ Novo Bairro / Localidade MT"
                novo_btn = page.locator("button:has-text('Novo Bairro')").first
                if await novo_btn.count() > 0:
                    await novo_btn.click()
                    await asyncio.sleep(0.8)
                    await page.screenshot(path="/home/ubuntu/screenshots_enhanced/16_modal_cadastro_novo_bairro_mt.png")
                    print("Captured: 16_modal_cadastro_novo_bairro_mt.png")

                    # Cancel submodal
                    cancel_btn = page.locator("button:has-text('Cancelar')").first
                    if await cancel_btn.count() > 0:
                        await cancel_btn.click()
                        await asyncio.sleep(0.4)

                # Close Bairros modal
                close_btn = page.locator("button:has-text('Concluir'), button:has-text('Fechar')").first
                if await close_btn.count() > 0:
                    await close_btn.click()
                    await asyncio.sleep(0.5)
        except Exception as e:
            print("Error in Bairros modal:", e)

        # 4. In right panel, select Delivery mode
        try:
            # Click delivery radio or tab
            delivery_opt = page.locator("label:has-text('Delivery')").first
            if await delivery_opt.count() > 0:
                await delivery_opt.click()
                await asyncio.sleep(0.5)

            # Search VIP customer
            vip_input = page.locator("input[placeholder*='VIP']").first
            if await vip_input.count() > 0:
                await vip_input.fill("VIP-01")
                await asyncio.sleep(0.8)

                # Click on the suggestion
                suggestion = page.locator("button:has-text('Rodrigo Ribeiro Gonçalves')").first
                if await suggestion.count() > 0:
                    await suggestion.click()
                    await asyncio.sleep(0.8)

            # Add an item to cart to display order summary and free delivery calculation
            add_item = page.locator("button:has-text('Adicionar'), button:has-text('+')").first
            if await add_item.count() > 0:
                await add_item.click()
                await asyncio.sleep(0.5)

            await page.screenshot(path="/home/ubuntu/screenshots_enhanced/17_pdv_cliente_vip_frete_gratis.png")
            print("Captured: 17_pdv_cliente_vip_frete_gratis.png")

            # 5. Select another MT Region in select
            select_loc = page.locator("select").first
            if await select_loc.count() > 0:
                options = await select_loc.locator("option").all_inner_texts()
                cuiaba_val = None
                for opt in options:
                    if "Cuiabá" in opt:
                        cuiaba_val = opt
                        break
                if cuiaba_val:
                    await select_loc.select_option(label=cuiaba_val)
                    await asyncio.sleep(0.5)
                    await page.screenshot(path="/home/ubuntu/screenshots_enhanced/18_pdv_seletor_entrega_mt_selecionado.png")
                    print("Captured: 18_pdv_seletor_entrega_mt_selecionado.png")
        except Exception as e:
            print("Error in VIP / Delivery flow:", e)

        await browser.close()
        print("All screenshots taken successfully!")

if __name__ == '__main__':
    asyncio.run(main())
