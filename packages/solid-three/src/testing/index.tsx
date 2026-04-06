import { type Accessor, type JSX, createRoot, merge } from "solid-js"
import type { CanvasProps } from "../canvas.tsx"
import { createThree } from "../create-three.tsx"
import { useRef } from "../utils.ts"

/**
 * Minimal WebGL2RenderingContext mock for testing
 */
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

  createRoot(dispose => {
    unmount = dispose
    context = createThree(
      canvas,
      merge(
        {
          get children() {
            return children()
          },
          camera: {
            position: [0, 0, 5] as [number, number, number],
          },
        },
        props,
      ),
    )
  })

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

  const three = createRoot(() => createThree(canvas, props))
  useRef(props, three)

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
      addEventListener: (() => {}) as any,
      removeEventListener: (() => {}) as any,
      clientWidth: width,
      clientHeight: height,
      width,
      height,
      getContext: (() => new WebGL2RenderingContextMock(mockCanvas)) as any,
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
