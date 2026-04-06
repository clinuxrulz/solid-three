/**
 * Vitest setup file for solid-three tests
 * Provides polyfills and global configurations for testing environment
 * 
 * This file is only loaded during test execution via vitest.config.dev.ts
 */

// Enhanced WebGL2RenderingContext mock
class WebGL2RenderingContextMock {
  [key: string]: any

  // WebGL constants - organized by category
  
  // Buffer usage hints
  STATIC_DRAW = 35044
  DYNAMIC_DRAW = 35048
  STREAM_DRAW = 35040
  STATIC_READ = 35045
  DYNAMIC_READ = 35049
  STREAM_READ = 35041
  STATIC_COPY = 35046
  DYNAMIC_COPY = 35050
  STREAM_COPY = 35042

  // Framebuffer status
  FRAMEBUFFER_COMPLETE = 36053
  FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054
  FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055
  FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057
  FRAMEBUFFER_UNSUPPORTED = 36061

  // DrawBuffer bits
  DEPTH_BUFFER_BIT = 256
  COLOR_BUFFER_BIT = 16384
  STENCIL_BUFFER_BIT = 1024

  // Texture units
  TEXTURE0 = 33984
  TEXTURE1 = 33985
  TEXTURE2 = 33986
  TEXTURE3 = 33987
  TEXTURE4 = 33988
  TEXTURE5 = 33989
  TEXTURE6 = 33990
  TEXTURE7 = 33991
  TEXTURE8 = 33992
  TEXTURE9 = 33993
  TEXTURE10 = 33994
  TEXTURE11 = 33995
  TEXTURE12 = 33996
  TEXTURE13 = 33997
  TEXTURE14 = 33998
  TEXTURE15 = 33999
  TEXTURE16 = 34000
  TEXTURE17 = 34001
  TEXTURE18 = 34002
  TEXTURE19 = 34003
  TEXTURE20 = 34004
  TEXTURE21 = 34005
  TEXTURE22 = 34006
  TEXTURE23 = 34007
  TEXTURE24 = 34008
  TEXTURE25 = 34009
  TEXTURE26 = 34010
  TEXTURE27 = 34011
  TEXTURE28 = 34012
  TEXTURE29 = 34013
  TEXTURE30 = 34014
  TEXTURE31 = 34015

  // Texture types
  TEXTURE_2D = 3553
  TEXTURE_CUBE_MAP = 34067
  TEXTURE_3D = 32879
  TEXTURE_2D_ARRAY = 35866

  // Pixel format
  ALPHA = 6406
  RGB = 6407
  RGBA = 6408
  LUMINANCE = 6409
  LUMINANCE_ALPHA = 6410

  // Pixel type
  UNSIGNED_BYTE = 5121
  UNSIGNED_SHORT_5_6_5 = 33635
  UNSIGNED_SHORT_4_4_4_4 = 32819
  UNSIGNED_SHORT_5_5_5_1 = 32820
  FLOAT = 5126
  HALF_FLOAT = 36193

  // Texture filtering
  LINEAR = 9729
  NEAREST = 9728
  LINEAR_MIPMAP_LINEAR = 9987
  LINEAR_MIPMAP_NEAREST = 9985
  NEAREST_MIPMAP_LINEAR = 9986
  NEAREST_MIPMAP_NEAREST = 9984

  // Texture wrapping
  CLAMP_TO_EDGE = 33071
  REPEAT = 10497
  MIRRORED_REPEAT = 33648

  // Primitive types
  POINTS = 0
  LINES = 1
  LINE_LOOP = 2
  LINE_STRIP = 3
  TRIANGLES = 4
  TRIANGLE_STRIP = 5
  TRIANGLE_FAN = 6

  // Capability
  CULL_FACE = 2884
  BLEND = 3042
  DITHER = 3024
  STENCIL_TEST = 2960
  DEPTH_TEST = 2929
  SCISSOR_TEST = 3089
  POLYGON_OFFSET_FILL = 32823
  SAMPLE_ALPHA_TO_COVERAGE = 32910
  SAMPLE_COVERAGE = 32913

  // Blend equations
  FUNC_ADD = 32774
  FUNC_SUBTRACT = 32778
  FUNC_REVERSE_SUBTRACT = 32779
  MIN = 32775
  MAX = 32776

  // Blend functions
  ZERO = 0
  ONE = 1
  SRC_COLOR = 768
  ONE_MINUS_SRC_COLOR = 769
  SRC_ALPHA = 770
  ONE_MINUS_SRC_ALPHA = 771
  DST_ALPHA = 772
  ONE_MINUS_DST_ALPHA = 773
  DST_COLOR = 774
  ONE_MINUS_DST_COLOR = 775
  SRC_ALPHA_SATURATE = 776

  // Depth test functions
  NEVER = 512
  LESS = 513
  EQUAL = 514
  LEQUAL = 515
  GREATER = 516
  NOTEQUAL = 517
  GEQUAL = 518
  ALWAYS = 519

  // Front face
  FRONT = 1028
  BACK = 1029
  FRONT_AND_BACK = 1032
  CW = 2304
  CCW = 2305

  // Shader type
  VERTEX_SHADER = 35633
  FRAGMENT_SHADER = 35632

  // Framebuffer binding points
  FRAMEBUFFER = 36160
  RENDERBUFFER = 36161
  READ_FRAMEBUFFER = 36007
  DRAW_FRAMEBUFFER = 36009

  // Attachment points
  COLOR_ATTACHMENT0 = 36064
  COLOR_ATTACHMENT1 = 36065
  COLOR_ATTACHMENT2 = 36066
  COLOR_ATTACHMENT3 = 36067
  COLOR_ATTACHMENT4 = 36068
  COLOR_ATTACHMENT5 = 36069
  COLOR_ATTACHMENT6 = 36070
  COLOR_ATTACHMENT7 = 36071
  COLOR_ATTACHMENT8 = 36072
  COLOR_ATTACHMENT9 = 36073
  COLOR_ATTACHMENT10 = 36074
  COLOR_ATTACHMENT11 = 36075
  COLOR_ATTACHMENT12 = 36076
  COLOR_ATTACHMENT13 = 36077
  COLOR_ATTACHMENT14 = 36078
  COLOR_ATTACHMENT15 = 36079
  DEPTH_ATTACHMENT = 36096
  STENCIL_ATTACHMENT = 36128
  DEPTH_STENCIL_ATTACHMENT = 33306

  // Buffer binding points
  ARRAY_BUFFER = 34962
  ELEMENT_ARRAY_BUFFER = 34963
  COPY_READ_BUFFER = 36662
  COPY_WRITE_BUFFER = 36663
  TRANSFORM_FEEDBACK_BUFFER = 35982
  UNIFORM_BUFFER = 35345
  PIXEL_PACK_BUFFER = 35051
  PIXEL_UNPACK_BUFFER = 35052

  // Query targets
  QUERY_RESULT = 34918
  QUERY_RESULT_AVAILABLE = 34919
  SAMPLES_PASSED = 35092
  ANY_SAMPLES_PASSED = 35887
  ANY_SAMPLES_PASSED_CONSERVATIVE = 36202
  TIME_ELAPSED = 35007

  // Get parameter constants
  VERSION = 37444
  SHADING_LANGUAGE_VERSION = 37445
  VENDOR = 37445
  RENDERER = 37446
  MAX_RENDERBUFFER_SIZE = 34024
  MAX_TEXTURE_SIZE = 3379
  MAX_VIEWPORT_DIMS = 36349
  MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661
  SCISSOR_BOX = 3088
  VIEWPORT = 2978

  // Pixel storage parameters
  UNPACK_ALIGNMENT = 3317
  UNPACK_ROW_LENGTH = 3314
  UNPACK_IMAGE_HEIGHT = 32879
  UNPACK_SKIP_PIXELS = 3316
  UNPACK_SKIP_ROWS = 3315
  UNPACK_SKIP_IMAGES = 32878
  PACK_ALIGNMENT = 3333
  PACK_ROW_LENGTH = 3330
  PACK_SKIP_PIXELS = 3332
  PACK_SKIP_ROWS = 3331

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.drawingBufferWidth = canvas.width || 800
    this.drawingBufferHeight = canvas.height || 600
    this.drawingBufferColorSpace = 'srgb'
    this.unpackAlignment = 4
  }

  // Program and shader compilation
  createProgram() { return {} }
  createShader() { return {} }
  attachShader() {}
  bindAttribLocation() {}
  linkProgram() {}
  useProgram() {}
  getAttribLocation() { return 0 }
  getUniformLocation() { return null }
  getShaderiv() {}
  getProgramiv() {}
  getShaderSource() { return '' }
  shaderSource() {}
  compileShader() {}
  deleteShader() {}
  deleteProgram() {}
  getProgramInfoLog() { return '' }
  getShaderInfoLog() { return '' }

  // Vertex/Index buffers
  createBuffer() { return {} }
  bindBuffer() {}
  bufferData() {}
  bufferSubData() {}
  deleteBuffer() {}
  getBufferParameter() { return 0 }

  // Vertex Array Objects
  createVertexArray() { return {} }
  bindVertexArray() {}
  deleteVertexArray() {}
  enableVertexAttribArray() {}
  disableVertexAttribArray() {}
  vertexAttribPointer() {}
  vertexAttrib4f() {}

  // Textures
  createTexture() { return {} }
  bindTexture() {}
  texImage2D() {}
  texSubImage2D() {}
  texImage3D() {}
  texSubImage3D() {}
  deleteTexture() {}
  texParameterf() {}
  texParameteri() {}
  texParameterfv() {}
  texParameteriv() {}
  generateMipmap() {}
  getTexParameter() { return 0 }
  copyTexImage2D() {}
  copyTexSubImage2D() {}
  copyTexSubImage3D() {}

  // Renderbuffers
  createRenderbuffer() { return {} }
  bindRenderbuffer() {}
  renderbufferStorage() {}
  renderbufferStorageMultisample() {}
  deleteRenderbuffer() {}
  getRenderbufferParameter() { return 0 }

  // Framebuffers
  createFramebuffer() { return {} }
  bindFramebuffer() {}
  deleteFramebuffer() {}
  framebufferTexture2D() {}
  framebufferTextureLayer() {}
  framebufferRenderbuffer() {}
  checkFramebufferStatus() { return this.FRAMEBUFFER_COMPLETE }
  getFramebufferAttachmentParameter() { return null }
  blitFramebuffer() {}
  readPixels() { return new Uint8Array(4) }

  // State management
  enable() {}
  disable() {}
  
  getParameter(paramId: number | undefined): any {
    // Handle undefined parameter IDs gracefully
    if (paramId === undefined) {
      return 0
    }

    switch (paramId) {
      // String parameters (most critical for Three.js)
      case this.VERSION:
      case 37444:
        return 'WebGL 2.0'
      case this.SHADING_LANGUAGE_VERSION:
      case 37445:
        return 'WebGL GLSL ES 3.00'
      case 37445: // VENDOR
        return 'Mock Vendor'
      case 37446: // RENDERER
        return 'Mock Renderer'

      // Array parameters
      case this.SCISSOR_BOX:
      case this.VIEWPORT:
      case 3088:
      case 2978:
        return [0, 0, this.drawingBufferWidth, this.drawingBufferHeight]
      case this.MAX_VIEWPORT_DIMS:
      case 36349:
        return [8192, 8192]

      // Integer parameters
      case this.MAX_RENDERBUFFER_SIZE:
      case 34024:
        return 8192
      case this.MAX_TEXTURE_SIZE:
      case 3379:
        return 8192
      case this.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
      case 35661:
        return 16
      case 3408: // MAX_ARRAY_TEXTURE_LAYERS
        return 256
      case 36348: // MAX_RENDERBUFFER_SIZE
        return 8192
      case 3379: // MAX_TEXTURE_SIZE
        return 8192

      // Default to 0
      default:
        return 0
    }
  }

  getBoolean() { return false }
  getFloat() { return 0 }
  getInt() { return 0 }
  getIntv() { return [0] }
  getFloatv() { return [0] }
  getBooleav() { return [false] }
  getString() { return '' }

  // Drawing
  clear() {}
  clearColor() {}
  clearDepth() {}
  clearStencil() {}
  drawArrays() {}
  drawElements() {}
  drawRangeElements() {}
  drawArraysInstanced() {}
  drawElementsInstanced() {}
  multiDrawArrays() {}
  multiDrawElements() {}
  flush() {}
  finish() {}

  // Scissor and viewport
  scissor() {}
  viewport() {}

  // Pixel storage
  pixelStorei() {}
  pixelStoref() {}

  // Stencil operations
  stencilFunc() {}
  stencilOp() {}
  stencilOpSeparate() {}
  stencilFuncSeparate() {}
  stencilMask() {}
  stencilMaskSeparate() {}

  // Depth operations
  depthFunc() {}
  depthMask() {}
  depthRange() {}

  // Blending
  blendFunc() {}
  blendFuncSeparate() {}
  blendEquation() {}
  blendEquationSeparate() {}
  blendColor() {}

  // Polygon offset
  polygonOffset() {}

  // Color mask
  colorMask() {}

  // Culling
  cullFace() {}
  frontFace() {}

  // Uniform setting
  uniform1f() {}
  uniform1fv() {}
  uniform1i() {}
  uniform1iv() {}
  uniform1ui() {}
  uniform1uiv() {}
  uniform2f() {}
  uniform2fv() {}
  uniform2i() {}
  uniform2iv() {}
  uniform2ui() {}
  uniform2uiv() {}
  uniform3f() {}
  uniform3fv() {}
  uniform3i() {}
  uniform3iv() {}
  uniform3ui() {}
  uniform3uiv() {}
  uniform4f() {}
  uniform4fv() {}
  uniform4i() {}
  uniform4iv() {}
  uniform4ui() {}
  uniform4uiv() {}
  uniformMatrix2fv() {}
  uniformMatrix3fv() {}
  uniformMatrix4fv() {}
  uniformMatrix2x3fv() {}
  uniformMatrix2x4fv() {}
  uniformMatrix3x2fv() {}
  uniformMatrix3x4fv() {}
  uniformMatrix4x2fv() {}
  uniformMatrix4x3fv() {}

  // Uniform block
  uniformBlockBinding() {}
  getUniformBlockIndex() { return 0 }

  // Sampler
  bindSampler() {}
  createSampler() { return {} }
  deleteSampler() {}
  samplerParameterf() {}
  samplerParameteri() {}
  getSamplerParameter() { return 0 }

  // Transform feedback
  createTransformFeedback() { return {} }
  deleteTransformFeedback() {}
  bindTransformFeedback() {}
  beginTransformFeedback() {}
  endTransformFeedback() {}
  transformFeedbackVaryings() {}
  getTransformFeedbackVarying() { return null }

  // Queries
  createQuery() { return {} }
  deleteQuery() {}
  getQueryParameter() { return 0 }
  getQuery() { return null }
  beginQuery() {}
  endQuery() {}
  queryCounter() {}

  // Other state
  hint() {}
  lineWidth() {}
  getError() { return 0 } // GL_NO_ERROR
  activeTexture() {}
  getActiveAttrib() { return null }
   getActiveUniform() { return null }
   getAttachedShaders() { return [] }
   getExtension() { return null }
   getSupportedExtensions() { return [] }
   getVertexAttrib() { return null }
   getVertexAttribOffset() { return 0 }
   
   // Additional WebGL methods required by Three.js
   getContextAttributes() {
     return {
       alpha: true,
       antialias: true,
       depth: true,
       failIfMajorPerformanceCaveat: false,
       powerPreference: 'default',
       premultipliedAlpha: true,
       preserveDrawingBuffer: false,
       stencil: false,
       desynchronized: false,
     }
   }
   
   getShaderPrecisionFormat() {
     return {
       rangeMin: 127,
       rangeMax: 127,
       precision: 23,
     }
   }
 }

// ResizeObserver polyfill for node environment
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserverPolyfill {
    callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  ;(globalThis as any).ResizeObserver = ResizeObserverPolyfill
}

// EventTarget polyfill for node environment
if (typeof globalThis !== 'undefined' && typeof EventTarget === 'undefined') {
  class EventTargetPolyfill {
    listeners: { [key: string]: any[] } = {}

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
