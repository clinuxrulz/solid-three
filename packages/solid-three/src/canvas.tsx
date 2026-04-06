import { createEffect, createSignal, untrack, Show, type JSX, onCleanup, type ParentProps, type Ref } from "solid-js"
import { isServer } from "@solidjs/web"
import {
  Camera,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three"
import { createThree } from "./create-three.tsx"
import type { EventRaycaster } from "./raycasters.tsx"
import type { CanvasEventHandlers, Context, Props } from "./types.ts"

/**
 * Props for the Canvas component, which initializes the Three.js rendering context and acts as the root for your 3D scene.
 */
export interface CanvasProps extends ParentProps<Partial<CanvasEventHandlers>> {
  ref?: Ref<Context>
  class?: string
  /** Configuration for the camera used in the scene. */
  defaultCamera?: Partial<Props<PerspectiveCamera> | Props<OrthographicCamera>> | Camera
  /** Configuration for the Raycaster used for mouse and pointer events. */
  defaultRaycaster?: Partial<Props<EventRaycaster>> | EventRaycaster | Raycaster
  /** Element to render while the main content is loading asynchronously.  */
  fallback?: JSX.Element
  /** Toggles flat interpolation for texture filtering. */
  flat?: boolean
  /** Controls the rendering loop's operation mode. */
  frameloop?: "never" | "demand" | "always"
  /** Options for the WebGLRenderer or a function returning a customized renderer. */
  gl?:
    | Partial<Props<WebGLRenderer>>
    | ((canvas: HTMLCanvasElement) => WebGLRenderer)
    | WebGLRenderer
  /** Toggles linear interpolation for texture filtering. */
  linear?: boolean
  /** Toggles between Orthographic and Perspective camera. */
  orthographic?: boolean
  /** Configuration for the Scene instance. */
  scene?: Partial<Props<Scene>> | Scene
  /** Enables and configures shadows in the scene. */
  shadows?: boolean | "basic" | "percentage" | "soft" | "variance" | WebGLRenderer["shadowMap"]
  /** Custom CSS styles for the canvas container. */
  style?: JSX.CSSProperties
}

/**
 * Serves as the root component for all 3D scenes created with `solid-three`. It initializes
 * the Three.js rendering context, including a WebGL renderer, a scene, and a camera.
 * All `<T/>`-components must be children of this Canvas. Hooks such as `useThree` and
 * `useFrame` should only be used within this component to ensure proper context.
 *
 * @function Canvas
 * @param props - Configuration options include camera settings, style, and children elements.
 * @returns A div element containing the WebGL canvas configured to occupy the full available space.
 */
export function Canvas(props: ParentProps<CanvasProps>) {
  let canvas: HTMLCanvasElement = null!
  let container: HTMLDivElement = null!
  const [canvasSignal, setCanvasSignal] = createSignal<HTMLCanvasElement | null>(null)
  const [sceneResult, setSceneResult] = createSignal<ReturnType<typeof createThree> | null>(null)

  createEffect(
    () => {
      const _canvas = canvasSignal()
      if (!_canvas || !container) return undefined
      return { _canvas, container }
    },
    (data) => {
      if (!data) return
      const { _canvas, container: _container } = data
      const result = untrack(() => createThree(_canvas, props))
      untrack(() => setSceneResult(result))

      // Call the ref callback with the context if provided
      if (props.ref) {
        if (typeof props.ref === 'function') {
          (props.ref as any)(result)
        } else if (props.ref && typeof props.ref === 'object') {
          (props.ref as any).value = result
        }
      }

      if (!isServer) {
        const ro = new ResizeObserver(() => {
          const { width, height } = _container.getBoundingClientRect()
          result.gl.setSize(width, height)
          result.gl.setPixelRatio(globalThis.devicePixelRatio)

          const camera = result.camera
          if (camera instanceof OrthographicCamera) {
            camera.left = width / -2
            camera.right = width / 2
            camera.top = height / 2
            camera.bottom = height / -2
          } else {
            camera.aspect = width / height
          }

          camera.updateProjectionMatrix()
          result.render(performance.now())
        })
        ro.observe(_container)
        return () => ro.disconnect()
      }
    },
  )

  return (
    <div
      ref={container!}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        contain: "strict",
        display: "flex",
        ...props.style,
      }}
      class={props.class}
    >
      <canvas ref={el => { canvas = el; setCanvasSignal(el) }} />
      <Show when={sceneResult()}>
        {(resultAccessor) => {
          const result = resultAccessor()
          return <result.SceneGraph />
        }}
      </Show>
    </div>
  )
}
