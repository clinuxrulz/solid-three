import { chromium } from 'playwright';

async function inspectScene() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Inject code to access the solid-three internals
    const sceneData = await page.evaluate(() => {
      // Try to get the Three.js scene by looking at what the renderer is using
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      
      // Get any debug info that might have been logged
      const logs: string[] = [];
      console.log('=== DEBUG: Checking scene state ===');
      
      // Check if there are any solid-three specific elements or state
      const solidElements = document.querySelectorAll('[data-solid]');
      const solidMeta = (window as any).__solidMeta;
      const solidContext = (window as any).__solidContext;
      
      return {
        canvasExists: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
        webglContext: gl ? (gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1') : null,
        solidMeta: solidMeta ? 'found' : 'not found',
        solidContext: solidContext ? 'found' : 'not found',
        solidElementsCount: solidElements.length
      };
    });
    
    console.log('\n=== SCENE DATA ===');
    console.log(JSON.stringify(sceneData, null, 2));
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.forEach(e => console.log(e));
    }
    
    if (warnings.length > 0) {
      console.log('\n=== WARNINGS ===');
      warnings.forEach(w => console.log(w));
    }
    
    // Let's try to inject a script that exposes the scene on the window
    await page.evaluate(() => {
      // Create a global variable we can set
      (window as any).__debugScene = null;
      
      // Monkey-patch the Scene constructor to capture instances
      const originalScene = (window as any).THREE?.Scene;
      if (originalScene) {
        (window as any).THREE.Scene = class extends originalScene {
          constructor(...args: any[]) {
            super(...args);
            console.log('=== SCENE CREATED ===', 'children:', this.children.length);
            (window as any).__debugScene = this;
          }
        };
      }
    });
    
    // Reload and check
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const sceneCheck = await page.evaluate(() => {
      const debugScene = (window as any).__debugScene;
      if (debugScene) {
        return {
          sceneFound: true,
          children: debugScene.children.map((c: any) => ({
            type: c.type || c.constructor?.name,
            name: c.name,
            children: c.children?.length || 0
          }))
        };
      }
      return { sceneFound: false, message: 'No scene captured' };
    });
    
    console.log('\n=== SCENE CHECK ===');
    console.log(JSON.stringify(sceneCheck, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

inspectScene();
