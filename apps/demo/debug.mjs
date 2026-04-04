import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const body = await page.textContent('body');
    console.log(`Body content (first 500 chars): ${body?.substring(0, 500)}`);
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS FOUND ===');
      errors.forEach(e => console.log(e));
    } else {
      console.log('\nNo console errors detected!');
    }
  } catch (err) {
    console.error('Navigation error:', err.message);
    if (errors.length > 0) {
      console.log('\n=== ERRORS FOUND ===');
      errors.forEach(e => console.log(e));
    }
  }

  await browser.close();
}

debug();
