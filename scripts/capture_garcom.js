import puppeteer from 'puppeteer-core';

async function captureGarcom() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896 }); // Formato iPhone/Mobile real

  await page.goto('http://localhost:3000/garcom', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/ubuntu/screenshots/garcom_mobile.png', fullPage: true });

  await browser.close();
}

captureGarcom().catch(console.error);
