import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    } else {
      logs.push(`Console ${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}\nStack: ${err.stack}`);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    await page.waitForTimeout(5000);
    
    // Get updated debug info after objects attach
    const finalDebugInfo = await page.evaluate(() => window.__solidThreeDebug);
    
    const debugInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { found: false };
      
      // Get scene info directly from the debug exposure
      const sceneInfo = window.__solidThreeDebug;
      
      // Get renderer info from canvas dataset
      const rendererInfo = canvas.dataset.engine || 'no engine info';
      
      // Check canvas dimensions
      const rect = canvas.getBoundingClientRect();
      
      return {
        found: true,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        rectWidth: rect.width,
        rectHeight: rect.height,
        rendererInfo,
        sceneInfo,
      };
    });
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Check if scene has children
    if (debugInfo.sceneInfo) {
      console.log(`\n=== SCENE STATUS ===`);
      console.log(`Scene type: ${debugInfo.sceneInfo.scene}`);
      console.log(`Scene children: ${debugInfo.sceneInfo.sceneChildren}`);
      console.log(`Camera: ${debugInfo.sceneInfo.camera}`);
      
      if (debugInfo.sceneInfo.sceneChildren === 0) {
        console.log('\n⚠️  Scene has 0 children - 3D objects not being added!');
      } else {
        console.log('\n✅ Scene has children - 3D objects are being added!');
      }
    } else {
      console.log('\n⚠️  No scene info available - DebugScene may not have run');
    }
    
    if (logs.length > 0) {
      console.log('\n=== CONSOLE LOGS ===');
      logs.forEach(l => console.log(l));
    }
    
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
