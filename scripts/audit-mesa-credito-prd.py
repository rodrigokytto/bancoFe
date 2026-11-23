import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/usr/bin/chromium",
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Injetar cookie de autenticação institucional
        await context.add_cookies([
            {
                "name": "bancofe_auth",
                "value": "bcf_rodrigo_master_autorizado",
                "domain": "erp-bancofe-5xsi5uyoda-rj.a.run.app",
                "path": "/"
            }
        ])
        
        page = await context.new_page()
        print("Navegando para https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/mesa-credito ...")
        res = await page.goto("https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/mesa-credito", wait_until="networkidle")
        print(f"Status da resposta: {res.status}")
        
        await page.wait_for_timeout(2000)
        
        # Screenshot 1: Visão Geral Topo da Mesa de Crédito
        await page.screenshot(path="/tmp/mesa_credito_prd_visao_geral.png")
        print("Screenshot 1 salvo: /tmp/mesa_credito_prd_visao_geral.png")
        
        # Screenshot 2: Página inteira
        await page.screenshot(path="/tmp/mesa_credito_prd_full.png", full_page=True)
        print("Screenshot 2 salvo: /tmp/mesa_credito_prd_full.png")
        
        # Testar clique em uma proposta da fila para carregar no cockpit
        card_proposta = page.locator(".proposta-card").first
        if await card_proposta.count() > 0:
            print("Clicando no primeiro card de proposta...")
            await card_proposta.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/tmp/mesa_credito_prd_detalhe.png")
            print("Screenshot 3 salvo: /tmp/mesa_credito_prd_detalhe.png")
            
        # Testar abertura do modal de simulação SAC / PRICE
        print("Abrindo modal de Nova Simulação & Proposta...")
        await page.evaluate("abrirModalNovaProposta()")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/tmp/mesa_credito_prd_modal_simulacao.png")
        print("Screenshot 4 salvo: /tmp/mesa_credito_prd_modal_simulacao.png")

        # Navegar para /admin e capturar a tela do painel de módulos
        print("Navegando para https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin ...")
        await page.goto("https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="/tmp/admin_modulos_prd.png")
        print("Screenshot 5 salvo: /tmp/admin_modulos_prd.png")
            
        await browser.close()
        print("Auditoria concluída com sucesso!")

if __name__ == "__main__":
    asyncio.run(run())
