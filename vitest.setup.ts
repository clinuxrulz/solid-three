/**
 * Vitest setup file for solid-three tests
 * Provides polyfills and global configurations for testing environment
 * 
 * This file is only loaded during test execution via vitest.config.dev.ts
 */

// Minimal WebGL2RenderingContext mock
class WebGL2RenderingContextMock {
  [key: string]: any

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.drawingBufferWidth = canvas.width
    this.drawingBufferHeight = canvas.height
  }

  getParameter(paramId: number) {
    switch (paramId) {
      case 7938: // GL_VERSION
        return ['WebGL2']
      case 3088: // SCISSOR_BOX
      case 2978: // VIEWPORT
        return [0, 0, 1, 1]
    }
  }

  getExtension() {
    return {}
  }

  getShaderPrecisionFormat() {
    return {
      rangeMin: 127,
      rangeMax: 127,
      precision: 23,
    }
  }

  getProgramInfoLog() {
    return ''
  }

  getShaderInfoLog() {
    return ''
  }
}

/**
 * Functional ResizeObserver polyfill for testing
 * Triggers callback on observe() call
 */
class ResizeObserverPolyfill {
  private callback: ResizeObserverCallback
  private observedElements = new Set<Element>()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    this.observedElements.add(element)
    // Trigger callback immediately for the first observation
    this.triggerCallback()
  }

  unobserve(element: Element) {
    this.observedElements.delete(element)
  }

  disconnect() {
    this.observedElements.clear()
  }

  private triggerCallback() {
    const entries: ResizeObserverEntry[] = []
    
    for (const element of this.observedElements) {
      let width = 0
      let height = 0
      
      try {
        const rect = element.getBoundingClientRect()
        width = rect.width || (element as any).width || 0
        height = rect.height || (element as any).height || 0
      } catch {
        // Element doesn't support getBoundingClientRect, try width/height properties
        width = (element as any).width || 0
        height = (element as any).height || 0
      }

      const entry = {
        target: element,
        contentRect: {
          x: 0,
          y: 0,
          width,
          height,
          top: 0,
          left: 0,
          bottom: height,
          right: width,
          toJSON: () => ({
            x: 0,
            y: 0,
            width,
            height,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
          }),
        },
        borderBoxSize: [
          {
            inlineSize: width,
            blockSize: height,
          },
        ],
        contentBoxSize: [
          {
            inlineSize: width,
            blockSize: height,
          },
        ],
        devicePixelContentBoxSize: [
          {
            inlineSize: width * (globalThis.devicePixelRatio || 1),
            blockSize: height * (globalThis.devicePixelRatio || 1),
          },
        ],
      } as ResizeObserverEntry

      entries.push(entry)
    }

    if (entries.length > 0) {
      // Call callback asynchronously to match browser behavior
      setTimeout(() => {
        this.callback(entries, this as any)
      }, 0)
    }
  }
}

// Apply ResizeObserver polyfill globally
if (typeof global !== 'undefined' && !global.ResizeObserver) {
  ;(global as any).ResizeObserver = ResizeObserverPolyfill
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  ;(window as any).ResizeObserver = ResizeObserverPolyfill
}

// EventTarget polyfill for node environment
if (typeof global !== 'undefined' && !(global as any).EventTarget) {
  class EventTargetPolyfill {
    private listeners: Record<string, any[]> = {}

    addEventListener(type: string, listener: any, options?: any) {
      if (!this.listeners[type]) {
        this.listeners[type] = []
      }
      this.listeners[type].push(listener)
    }

    removeEventListener(type: string, listener: any, options?: any) {
      if (this.listeners[type]) {
        this.listeners[type] = this.listeners[type].filter(l => l !== listener)
      }
    }

    dispatchEvent(event: Event): boolean {
      const type = (event as any).type
      if (this.listeners[type]) {
        for (const listener of this.listeners[type]) {
          if (typeof listener === 'function') {
            listener.call(this, event)
          } else if (listener && typeof (listener as any).handleEvent === 'function') {
            (listener as any).handleEvent.call(listener, event)
          }
        }
      }
      return true
    }
  }

  ;(global as any).EventTarget = EventTargetPolyfill
}

// Add event listeners to globalThis
if (typeof globalThis !== 'undefined' && !globalThis.addEventListener) {
  const eventTarget = new ((globalThis as any).EventTarget || class EventTarget {
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true
    }
  })()

  ;(globalThis as any).addEventListener = (type: string, listener: any, options?: any) => {
    if (eventTarget && typeof eventTarget.addEventListener === 'function') {
      eventTarget.addEventListener(type, listener, options)
    }
  }

  ;(globalThis as any).removeEventListener = (type: string, listener: any, options?: any) => {
    if (eventTarget && typeof eventTarget.removeEventListener === 'function') {
      eventTarget.removeEventListener(type, listener, options)
    }
  }
}

// Setup WebGL context polyfill
;(globalThis as any).WebGLRenderingContext ??= WebGL2RenderingContextMock
;(globalThis as any).WebGL2RenderingContext ??= WebGL2RenderingContextMock

// Patch HTMLCanvasElement.getContext to use our mock
if (typeof HTMLCanvasElement !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    ...args: any[]
  ) {
    if (contextId.startsWith('webgl')) {
      return new WebGL2RenderingContextMock(this) as any
    }
    return originalGetContext?.call(this, contextId, ...args) ?? null
  } as any
}

// requestAnimationFrame polyfill for node environment
if (typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'undefined') {
  let animationFrameId = 0
  const pendingCallbacks: Map<number, FrameRequestCallback> = new Map()

  ;(globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    const id = ++animationFrameId
    pendingCallbacks.set(id, callback)
    
    // Call the callback in next tick using setTimeout (not Promise)
    setTimeout(() => {
      if (pendingCallbacks.has(id)) {
        const cb = pendingCallbacks.get(id)!
        pendingCallbacks.delete(id)
        try {
          cb(performance.now())
        } catch (error) {
          console.error('Error in requestAnimationFrame callback:', error)
        }
      }
    }, 0)
    
    return id
  }

  ;(globalThis as any).cancelAnimationFrame = (id: number) => {
    pendingCallbacks.delete(id)
  }
}
