import { type Accessor, type JSX, createRoot, createSignal, merge } from "solid-js"
import { render } from "@solidjs/web"
import type { CanvasProps } from "../canvas.tsx"
import { createThree } from "../create-three.tsx"
import { useRef } from "../utils.ts"

/**
 * Minimal WebGL2RenderingContext mock for testing
 */
class WebGL2RenderingContextMock {
  [key: string]: any
  VERSION = 37444
  SHADING_LANGUAGE_VERSION = 37445
  MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661
  SCISSOR_BOX = 3088
  VIEWPORT = 2978
  MAX_RENDERBUFFER_SIZE = 34024
  MAX_TEXTURE_SIZE = 3379
  MAX_VIEWPORT_DIMS = 36349

  // Drawing buffer bits
  DEPTH_BUFFER_BIT = 256
  COLOR_BUFFER_BIT = 16384
  
  // Framebuffer status
  FRAMEBUFFER_COMPLETE = 36053
  
  // Capability constants
  CULL_FACE = 2884
  BLEND = 3042
  DEPTH_TEST = 2929
  POLYGON_OFFSET_FILL = 32823

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.drawingBufferWidth = canvas.width
    this.drawingBufferHeight = canvas.height
  }

  getParameter(paramId: number): any {
    switch (paramId) {
      case this.VERSION:
      case 37444: // GL_VERSION
        return 'WebGL 2.0'
      case this.SHADING_LANGUAGE_VERSION:
      case 37445: // GL_SHADING_LANGUAGE_VERSION
        return 'WebGL GLSL ES 3.00'
      case this.SCISSOR_BOX:
      case 3088:
      case this.VIEWPORT:
      case 2978:
        return [0, 0, this.drawingBufferWidth, this.drawingBufferHeight]
      case this.MAX_VIEWPORT_DIMS:
      case 36349:
        return [8192, 8192]
      case this.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
      case 35661:
        return 16
      case this.MAX_TEXTURE_SIZE:
      case 3379:
        return 8192
    }
    return 0
  }

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

  // WebGL methods stubs (required by Three.js)
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
  createBuffer() { return {} }
  bindBuffer() {}
  bufferData() {}
  bufferSubData() {}
  deleteBuffer() {}
  getBufferParameter() { return 0 }
  createVertexArray() { return {} }
  bindVertexArray() {}
  deleteVertexArray() {}
  enableVertexAttribArray() {}
  disableVertexAttribArray() {}
  vertexAttribPointer() {}
  vertexAttrib4f() {}
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
  createRenderbuffer() { return {} }
  bindRenderbuffer() {}
  renderbufferStorage() {}
  renderbufferStorageMultisample() {}
  deleteRenderbuffer() {}
  getRenderbufferParameter() { return 0 }
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
  enable() {}
  disable() {}
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
  scissor() {}
  viewport() {}
  pixelStorei() {}
  pixelStoref() {}
  stencilFunc() {}
  stencilOp() {}
  stencilOpSeparate() {}
  stencilFuncSeparate() {}
  stencilMask() {}
  stencilMaskSeparate() {}
  depthFunc() {}
  depthMask() {}
  depthRange() {}
  blendFunc() {}
  blendFuncSeparate() {}
  blendEquation() {}
  blendEquationSeparate() {}
  blendColor() {}
  polygonOffset() {}
  colorMask() {}
  cullFace() {}
  frontFace() {}
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
   uniformBlockBinding() {}
   getUniformBlockIndex() { return 0 }
   bindSampler() {}
   createSampler() { return {} }
   deleteSampler() {}
   samplerParameterf() {}
   samplerParameteri() {}
   getSamplerParameter() { return 0 }
   createTransformFeedback() { return {} }
   deleteTransformFeedback() {}
   bindTransformFeedback() {}
   beginTransformFeedback() {}
   endTransformFeedback() {}
   transformFeedbackVaryings() {}
   getTransformFeedbackVarying() { return null }
   createQuery() { return {} }
   deleteQuery() {}
   getQueryParameter() { return 0 }
   getQuery() { return null }
   beginQuery() {}
   endQuery() {}
   queryCounter() {}
   hint() {}
   lineWidth() {}
   getError() { return 0 }
   activeTexture() {}
   getActiveAttrib() { return null }
   getActiveUniform() { return null }
   getAttachedShaders() { return [] }
   getVertexAttrib() { return null }
   getVertexAttribOffset() { return 0 }
   getProgramParameter() { return 0 }
}

/**
 * Initializes a testing enviromnent for `solid-three`.
 *
 * @param children - An accessor for the `AugmentedElement` to render.
 * @param [props] - Optional properties to configure canvas.
 * @returns `S3.Context` augmented with methods to unmount the scene and to wait for the next animation frame.
 *
 * @example
 * const testScene = test(() => <Mesh />, { camera: position: [0,0,5] });
 * await testScene.waitTillNextFrame();
 * testScene.unmount();
 */
export function test(
  children: Accessor<JSX.Element>,
  props?: Omit<CanvasProps, "children">,
): TestApi {
  const canvas = createTestCanvas()
  let context: ReturnType<typeof createThree> = null!
  let unmount: () => void = null!

  // Check if we're in a browser environment (vitest with browser provider)
  const isBrowser = typeof document !== "undefined" && typeof document.createElement === "function"

  if (isBrowser) {
    // Browser environment: render to DOM
    const container = document.createElement("div")
    container.style.width = "1280px"
    container.style.height = "800px"
    container.style.position = "absolute"
    container.style.top = "0"
    container.style.left = "0"
    document.body.appendChild(container)
    container.appendChild(canvas)

    createRoot(dispose => {
      unmount = () => {
        dispose()
        document.body.removeChild(container)
      }
      context = createThree(
        canvas,
        merge(
          {
            get children() {
              return children()
            },
            defaultCamera: {
              position: [0, 0, 5] as [number, number, number],
            },
          },
          props,
        ),
      )
      
      // Set camera aspect based on canvas dimensions
      const camera = context.camera
      if ('aspect' in camera) {
        camera.aspect = canvas.width / canvas.height
        camera.updateProjectionMatrix()
      }
      
      // Render the scene graph to the DOM
      render(() => context.SceneGraph(), container)
    })
  } else {
    // Node environment: use createRoot only
    createRoot(dispose => {
      unmount = dispose
      context = createThree(
        canvas,
        merge(
          {
            get children() {
              return children()
            },
            defaultCamera: {
              position: [0, 0, 5] as [number, number, number],
            },
          },
          props,
        ),
      )
      
      // Force component rendering by calling SceneGraph
      // This triggers the context providers to be set up and accessible to children
      context.SceneGraph()
    })
  }

  const waitTillNextFrame = () =>
    new Promise<void>(resolve => {
      const cleanup = context.addFrameListener(() => (cleanup(), resolve()))
    })

  return merge(context, {
    unmount,
    waitTillNextFrame,
  })
}
type TestApi = ReturnType<typeof createThree> & {
  unmount: () => void
  waitTillNextFrame: () => Promise<void>
}

/**
 * Canvas element tailored for testing.
 *
 * @param props
 * @returns The canvas JSX element.
 *
 * @example
 * render(<TestCanvas camera={{ position: [0,0,5] }} />);
 */
export function TestCanvas(props: CanvasProps) {
  const canvas = createTestCanvas()
  const container = (
    <div style={{ width: "100%", height: "100%" }}>{canvas}</div>
  ) as HTMLDivElement

  let three: ReturnType<typeof createThree> = null!
  createRoot(() => {
    three = createThree(canvas, props)
    useRef(props, three)
    
    // Call the ref callback with the context if provided
    if (props.ref) {
      if (typeof props.ref === 'function') {
        (props.ref as any)(three)
      } else if (props.ref && typeof props.ref === 'object') {
        (props.ref as any).value = three
      }
    }
  })

  return container
}

/**
 * Creates a mock canvas element for testing purposes. This function dynamically generates a canvas,
 * suitable for environments with or without a standard DOM. In non-DOM environments, it simulates
 * essential canvas properties and methods, including WebGL contexts.
 *
 * @param [options] - Configuration options for the canvas.
 * @returns A canvas element with specified dimensions and stubbed if necessary.
 *
 * @example
 * // Create a test canvas of default size
 * const canvas = createTestCanvas();
 *
 * @example
 * // Create a test canvas with custom dimensions
 * const customCanvas = createTestCanvas({ width: 1024, height: 768 });
 */
const createTestCanvas = ({ width = 1280, height = 800 } = {}) => {
  let canvas: HTMLCanvasElement

  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    canvas = document.createElement("canvas")
  } else {
    const mockCanvas = {
      style: {},
      listeners: {} as Record<string, any[]>,
      addEventListener: ((type: string, listener: any) => {
        const mc = mockCanvas as any
        if (!mc.listeners[type]) {
          mc.listeners[type] = []
        }
        mc.listeners[type].push(listener)
      }) as any,
      removeEventListener: ((type: string, listener: any) => {
        const mc = mockCanvas as any
        if (mc.listeners[type]) {
          mc.listeners[type] = mc.listeners[type].filter((l: any) => l !== listener)
        }
      }) as any,
      dispatchEvent: ((event: Event) => {
        const mc = mockCanvas as any
        const type = (event as any).type
        if (mc.listeners[type]) {
          for (const listener of mc.listeners[type]) {
            listener(event)
          }
        }
        return true
      }) as any,
      clientWidth: width,
      clientHeight: height,
      width,
      height,
      getContext: (() => new WebGL2RenderingContextMock(mockCanvas)) as any,
      getBoundingClientRect: (() => ({
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
        toJSON: () => ({})
      })) as any,
    } as unknown as HTMLCanvasElement
    canvas = mockCanvas
  }
  canvas.width = width
  canvas.height = height

  // eslint-disable-next-line
  if (globalThis.HTMLCanvasElement) {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string) {
      if (id.startsWith("webgl")) return new WebGL2RenderingContextMock(this) as any
      return getContext.apply(this, arguments as any)
    } as any
  }

  class WebGLRenderingContext extends WebGL2RenderingContextMock {}
  // eslint-disable-next-line
  globalThis.WebGLRenderingContext ??= WebGLRenderingContext as any
  // eslint-disable-next-line
  globalThis.WebGL2RenderingContext ??= WebGL2RenderingContextMock as any

  return canvas
}
