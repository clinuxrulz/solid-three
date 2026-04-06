console.log('vitest.setup.minimal.ts loading...')

class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // Empty
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof global !== 'undefined' && !global.ResizeObserver) {
  ;(global as any).ResizeObserver = ResizeObserver
}
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  ;(window as any).ResizeObserver = ResizeObserver
}

console.log('vitest.setup.minimal.ts loaded')
