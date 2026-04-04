import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}\nLocation: ${msg.location()?.url}:${msg.location()?.lineNumber}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}\nStack: ${err.stack}`);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');
    
    await page.waitForTimeout(3000);
    
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      console.log('Canvas box:', JSON.stringify(box));
    } else {
      console.log('No canvas found');
    }
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS FOUND ===');
      errors.forEach(e => console.log(e));
    } else {
      console.log('\nNo console errors detected!');
    }
  } catch (err) {
    console.error('Navigation error:', err.message);
  }

  await browser.close();
}

debug();
