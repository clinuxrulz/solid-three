import {
  children,
  createEffect,
  createMemo,
  createRenderEffect,
  mergeProps,
  onCleanup,
} from "solid-js"
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  Camera,
  Clock,
  NoToneMapping,
  OrthographicCamera,
  PCFShadowMap,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  VSMShadowMap,
  WebGLRenderer,
} from "three"
import type { CanvasProps } from "./canvas.tsx"
import { createEvents } from "./create-events.ts"
import { Stack } from "./data-structure/stack.ts"
import { frameContext, threeContext } from "./hooks.ts"
import { eventContext } from "./internal-context.ts"
import { manageSceneGraph, useProps } from "./props.ts"
import { CursorRaycaster, type EventRaycaster } from "./raycasters.tsx"
import type { CameraKind, Context } from "./types.ts"
import {
  augment,
  defaultProps,
  getCurrentViewport,
  removeElementFromArray,
  useRef,
  withMultiContexts,
} from "./utils.ts"
import { useMeasure } from "./utils/use-measure.ts"

/**
 * Creates and manages a `solid-three` scene. It initializes necessary objects like
 * camera, renderer, raycaster, and scene, manages the scene graph, setups up an event system
 * and rendering loop based on the provided properties.
 */
export function createThree(canvas: HTMLCanvasElement, props: CanvasProps) {
  const canvasProps = defaultProps(props, { frameloop: "always" })

  /**********************************************************************************/
  /*                                                                                */
  /*                                 Frame Listeners                                */
  /*                                                                                */
  /**********************************************************************************/

  type FrameListener = (context: Context, delta: number, frame?: XRFrame) => void

  const frameListeners: FrameListener[] = []
  // Adds a callback to be called on each frame
  function addFrameListener(callback: FrameListener) {
    frameListeners.push(callback)
    const cleanup = () => removeElementFromArray(frameListeners, callback)
    onCleanup(cleanup)
    return cleanup
  }

  /**********************************************************************************/
  /*                                                                                */
  /*                                        XR                                      */
  /*                                                                                */
  /**********************************************************************************/

  // Handle frame behavior in WebXR
  const handleXRFrame: XRFrameRequestCallback = (timestamp: number, frame?: XRFrame) => {
    if (canvasProps.frameloop === "never") return
    render(timestamp, frame)
  }
  // Toggle render switching on session
  function handleSessionChange() {
    context.gl.xr.enabled = context.gl.xr.isPresenting
    context.gl.xr.setAnimationLoop(context.gl.xr.isPresenting ? handleXRFrame : null)
  }
  // WebXR session-manager
  const xr = {
    connect() {
      context.gl.xr.addEventListener("sessionstart", handleSessionChange)
      context.gl.xr.addEventListener("sessionend", handleSessionChange)
    },
    disconnect() {
      context.gl.xr.removeEventListener("sessionstart", handleSessionChange)
      context.gl.xr.removeEventListener("sessionend", handleSessionChange)
    },
  }

  /**********************************************************************************/
  /*                                                                                */
  /*                                     Render                                     */
  /*                                                                                */
  /**********************************************************************************/

  let pendingRenderRequest: number | undefined
  function render(timestamp: number, frame?: XRFrame) {
    if (!context.gl) {
      return
    }
    if (props.frameloop === "never") {
      context.clock.elapsedTime = timestamp
    }
    pendingRenderRequest = undefined
    context.gl.render(context.scene, context.currentCamera)
    frameListeners.forEach(listener => listener(context, context.clock.getDelta(), frame))
  }
  function requestRender() {
    if (pendingRenderRequest) return
    pendingRenderRequest = requestAnimationFrame(render)
  }
  onCleanup(() => pendingRenderRequest && cancelAnimationFrame(pendingRenderRequest))

  /**********************************************************************************/
  /*                                                                                */
  /*                                  Three Context                                 */
  /*                                                                                */
  /**********************************************************************************/

  const defaultCamera = createMemo(() =>
    augment(
      props.defaultCamera instanceof Camera
        ? (props.defaultCamera as OrthographicCamera | PerspectiveCamera)
        : props.orthographic
        ? new OrthographicCamera()
        : new PerspectiveCamera(),
      {
        get props() {
          return props.defaultCamera || {}
        },
      },
    ),
  )
  const cameraStack = new Stack<CameraKind>("camera")

  const scene = createMemo(() =>
    augment(props.scene instanceof Scene ? props.scene : new Scene(), {
      get props() {
        return props.scene || {}
      },
    }),
  )
  const raycaster = createMemo(() =>
    augment<Raycaster | EventRaycaster>(
      props.raycaster instanceof Raycaster ? props.raycaster : new CursorRaycaster(),
      {
        get props() {
          return props.raycaster || {}
        },
      },
    ),
  )
  const gl = createMemo(() => {
    const gl =
      props.gl instanceof WebGLRenderer
        ? // props.gl can be a WebGLRenderer provided by the user
          props.gl
        : typeof props.gl === "function"
        ? // or a callback that returns a Renderer
          props.gl(canvas)
        : // if props.gl is not defined we default to a WebGLRenderer
          new WebGLRenderer({ canvas })

    return augment(gl, {
      get props() {
        return props.gl || {}
      },
    })
  })

  const measure = useMeasure()
  measure.setElement(canvas)

  const defaultTarget = new Vector3()
  const viewport = createMemo(() =>
    getCurrentViewport(defaultCamera(), defaultTarget, measure.bounds()),
  )

  const clock = new Clock()
  clock.start()

  const context: Context = {
    get bounds() {
      return measure.bounds()
    },
    canvas,
    clock,
    get dpr() {
      return this.gl.getPixelRatio()
    },
    props,
    render,
    requestRender,
    get viewport() {
      return viewport()
    },
    xr,
    // elements
    get currentCamera() {
      return cameraStack.peek() ?? defaultCamera()
    },
    setCurrentCamera(camera: CameraKind) {
      return cameraStack.push(camera)
    },
    get scene() {
      return scene()
    },
    get raycaster() {
      return raycaster()
    },
    get gl() {
      return gl()
    },
  }

  withMultiContexts(
    () => useRef(props, context),
    [
      [threeContext, context],
      [frameContext, addFrameListener],
    ],
  )

  /**********************************************************************************/
  /*                                                                                */
  /*                                     Effects                                    */
  /*                                                                                */
  /**********************************************************************************/

  withMultiContexts(() => {
    createRenderEffect(() => {
      if (props.frameloop === "never") {
        context.clock.stop()
        context.clock.elapsedTime = 0
      } else {
        context.clock.start()
      }
    })

    // Manage camera
    createRenderEffect(() => {
      if (cameraStack.peek()) return
      if (!props.defaultCamera || props.defaultCamera instanceof Camera) return
      useProps(defaultCamera, props.defaultCamera)
      // NOTE:  Manually update camera's matrix with updateMatrixWorld is needed.
      //        Otherwise casting a ray immediately after start-up will cause the incorrect matrix to be used.
      defaultCamera().updateMatrixWorld(true)
    })

    // Manage scene
    createRenderEffect(() => {
      if (!props.scene || props.scene instanceof Scene) return
      useProps(scene, props.scene)
    })

    // Manage raycaster
    createRenderEffect(() => {
      if (!props.raycaster || props.raycaster instanceof Raycaster) return
      useProps(raycaster, props.raycaster)
    })

    // Manage gl
    createRenderEffect(() => {
      // Set shadow-map
      createRenderEffect(() => {
        const _gl = gl()
        if (_gl.shadowMap) {
          const oldEnabled = _gl.shadowMap.enabled
          const oldType = _gl.shadowMap.type
          _gl.shadowMap.enabled = !!props.shadows

          if (typeof props.shadows === "boolean") {
            _gl.shadowMap.type = PCFSoftShadowMap
          } else if (typeof props.shadows === "string") {
            const types = {
              basic: BasicShadowMap,
              percentage: PCFShadowMap,
              soft: PCFSoftShadowMap,
              variance: VSMShadowMap,
            }
            _gl.shadowMap.type = types[props.shadows] ?? PCFSoftShadowMap
          } else if (typeof props.shadows === "object") {
            Object.assign(_gl.shadowMap, props.shadows)
          }

          if (oldEnabled !== _gl.shadowMap.enabled || oldType !== _gl.shadowMap.type)
            _gl.shadowMap.needsUpdate = true
        }
      })

      createEffect(() => {
        const renderer = gl()
        // Connect to xr if property exists
        if (renderer.xr) context.xr.connect()
      })

      // Set color space and tonemapping preferences
      const LinearEncoding = 3000
      const sRGBEncoding = 3001
      // Color management and tone-mapping
      useProps(gl, {
        get outputEncoding() {
          return props.linear ? LinearEncoding : sRGBEncoding
        },
        get toneMapping() {
          return props.flat ? NoToneMapping : ACESFilmicToneMapping
        },
      })

      // Manage props
      if (props.gl && !(props.gl instanceof WebGLRenderer)) {
        useProps(gl, props.gl)
      }
    })
  }, [[threeContext, context]])

  /**********************************************************************************/
  /*                                                                                */
  /*                                   Render Loop                                  */
  /*                                                                                */
  /**********************************************************************************/

  let pendingLoopRequest: number | undefined
  function loop(value: number) {
    pendingLoopRequest = requestAnimationFrame(loop)
    context.render(value)
  }
  createRenderEffect(() => {
    if (canvasProps.frameloop === "always") {
      pendingLoopRequest = requestAnimationFrame(loop)
    }
    onCleanup(() => pendingLoopRequest && cancelAnimationFrame(pendingLoopRequest))
  })

  /**********************************************************************************/
  /*                                                                                */
  /*                                     Events                                     */
  /*                                                                                */
  /**********************************************************************************/

  // Initialize event-system
  const { addEventListener } = createEvents(context)

  /**********************************************************************************/
  /*                                                                                */
  /*                                   Scene Graph                                  */
  /*                                                                                */
  /**********************************************************************************/

  manageSceneGraph(
    // @ts-expect-error TODO: fix type-error
    context.scene,
    children(() => (
      <eventContext.Provider value={addEventListener}>
        <frameContext.Provider value={addFrameListener}>
          <threeContext.Provider value={context}>{canvasProps.children}</threeContext.Provider>
        </frameContext.Provider>
      </eventContext.Provider>
    )) as any,
  )

  // Return context merged with `addFrameListeners``
  // This is used in `@solid-three/testing`
  return mergeProps(context, { addFrameListener })
}
