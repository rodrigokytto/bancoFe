import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path='/usr/bin/chromium',
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(viewport={'width': 1600, 'height': 1000})
        page = await context.new_page()

        await page.goto("http://localhost:3000/login", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(1)

        quick_btn = page.locator("button:has-text('Preencher Acesso Rodrigo')").first
        if await quick_btn.count() > 0:
            await quick_btn.click()
            await asyncio.sleep(0.5)

        login_btn = page.locator("button:has-text('Entrar no Zuma Pilot')").first
        if await login_btn.count() > 0:
            await login_btn.click()
            await asyncio.sleep(2)

        await page.goto("http://localhost:3000/pdv", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)

        # 1. Click "Delivery MT" button
        delivery_btn = page.locator("button:has-text('Delivery MT')").first
        if await delivery_btn.count() > 0:
            print("Clicking Delivery MT button...")
            await delivery_btn.click()
            await asyncio.sleep(0.8)

        # Add an item to cart if empty
        add_btn = page.locator("button:has-text('Combo 26 Peças')").first
        if await add_btn.count() > 0:
            await add_btn.click()
            await asyncio.sleep(0.5)

        # Capture Delivery MT with VIP Free Shipping
        await page.screenshot(path="/home/ubuntu/screenshots_enhanced/17_pdv_delivery_mt_vip_frete_gratis.png")
        print("Captured: 17_pdv_delivery_mt_vip_frete_gratis.png")

        # 2. Click "+ Novo Cliente"
        novo_cliente_btn = page.locator("button:has-text('Novo Cliente')").first
        if await novo_cliente_btn.count() > 0:
            print("Clicking + Novo Cliente button...")
            await novo_cliente_btn.click()
            await asyncio.sleep(0.8)
            await page.screenshot(path="/home/ubuntu/screenshots_enhanced/18_modal_cadastrar_novo_cliente_vip.png")
            print("Captured: 18_modal_cadastrar_novo_cliente_vip.png")

        await browser.close()
        print("Done!")

if __name__ == '__main__':
    asyncio.run(main())
