import type { Accessor, Context, JSX } from "solid-js"
import { createRenderEffect, type MergeProps, mergeProps, onCleanup, type Ref } from "solid-js"
import type { Augment, CameraKind, Constructor, Loader } from "src/types.ts"
import {
  Camera,
  Material,
  Object3D,
  OrthographicCamera,
  type Renderer,
  Texture,
  Vector3,
} from "three"
import { $S3C } from "./constants.ts"
import type { Instance } from "./types"
import type { Measure } from "./utils/use-measure.ts"

/**********************************************************************************/
/*                                                                                */
/*                                      Guards                                    */
/*                                                                                */
/**********************************************************************************/

export const isOrthographicCamera = (def: Camera): def is OrthographicCamera =>
  "isOrthographicCamera" in def && !!def.isOrthographicCamera

export const isVector3 = (def: object): def is Vector3 => "isVector3" in def && !!def.isVector3

/**********************************************************************************/
/*                                                                                */
/*                                  Auto Dispose                                  */
/*                                                                                */
/**********************************************************************************/

export function autodispose<T extends { dispose?: () => void }>(object: T): T {
  if (object.dispose) {
    onCleanup(object.dispose.bind(object))
  }
  return object
}

/**********************************************************************************/
/*                                                                                */
/*                                  Auto Listen                                   */
/*                                                                                */
/**********************************************************************************/

type WithUndefinedListener<T> = T extends (
  type: infer Type,
  listener: infer L,
  ...args: infer A
) => infer R
  ? (type: Type, listener: L | undefined, ...args: A) => R
  : never

export function autolisten<
  TTarget extends {
    addEventListener(...args: any[]): void
    removeEventListener(...args: any[]): void
  },
>(
  object: TTarget,
): TTarget["addEventListener"] & WithUndefinedListener<TTarget["addEventListener"]> {
  return ((type: any, callback: any, ...options: any[]) => {
    if (callback === undefined || callback === null) return
    object.addEventListener(type, callback, ...options)
    onCleanup(() => object.removeEventListener(type, callback, ...options))
  }) as any
}

/**********************************************************************************/
/*                                                                                */
/*                                     Augment                                    */
/*                                                                                */
/**********************************************************************************/

/**
 * A utility to add metadata to a given instance.
 * This data can be accessed behind the `S3C` symbol and is used internally in `solid-three`.
 *
 * @param instance - `three` instance
 * @param augmentation - additional data: `{ props }`
 * @returns the `three` instance with the additional data
 */
export const augment = <T>(instance: T, augmentation = { props: {} }) => {
  if (instance && typeof instance === "object" && $S3C in instance) {
    return instance as Instance<T>
  }
  // @ts-expect-error TODO: fix type-error
  instance[$S3C] = { children: new Set(), ...augmentation }
  return instance as Instance<T>
}

/**********************************************************************************/
/*                                                                                */
/*                                   Build Graph                                  */
/*                                                                                */
/**********************************************************************************/

export interface ObjectMap {
  nodes: Record<string, Object3D>
  materials: Record<string, Material>
}
// Collects nodes and materials from a THREE.Object3D
export function buildGraph(object: Object3D): ObjectMap {
  const data: ObjectMap = { nodes: {}, materials: {} }
  object.traverse((obj: any) => {
    if (obj.name) data.nodes[obj.name] = obj
    if (obj.material && !(obj.material.name in data.materials)) {
      data.materials[obj.material.name] = obj.material
    }
  })
  return data
}

/**********************************************************************************/
/*                                                                                */
/*                                  Default Props                                 */
/*                                                                                */
/**********************************************************************************/

/** Extracts the keys of the optional properties in T. */
type KeyOfOptionals<T> = keyof {
  [K in keyof T as T extends Record<K, T[K]> ? never : K]: T[K]
}

export function defaultProps<T, K extends KeyOfOptionals<T>>(
  props: T,
  defaults: Required<Pick<T, K>>,
): MergeProps<[Required<Pick<T, K>>, T]> {
  return mergeProps(defaults, props)
}

/**********************************************************************************/
/*                                                                                */
/*                                 Has Color Space                                */
/*                                                                                */
/**********************************************************************************/

/**
 * Returns `true` with correct TS type inference if an object has a configurable color space (since r152).
 */
export const hasColorSpace = <
  T extends Renderer | Texture | object,
  P = T extends Renderer ? { outputColorSpace: string } : { colorSpace: string },
>(
  object: T,
): object is T & P => "colorSpace" in object || "outputColorSpace" in object

/**********************************************************************************/
/*                                                                                */
/*                                   Is Guards                                    */
/*                                                                                */
/**********************************************************************************/

export function isConstructor<T>(value: T | Constructor): value is Constructor {
  // @ts-expect-error
  console.log(value, value.prototype)
  return typeof value === "function" && value.prototype !== undefined
}

export const isInstance = <T extends object>(element: T): element is Augment<T> =>
  typeof element === "object" && $S3C in element

/**********************************************************************************/
/*                                                                                */
/*                            Remove Element From Array                           */
/*                                                                                */
/**********************************************************************************/

export const removeElementFromArray = (array: any[], value: any) => {
  const index = array.indexOf(value)
  if (index !== -1) array.splice(index, 1)
  return array
}

/**********************************************************************************/
/*                                                                                */
/*                                     Resolve                                    */
/*                                                                                */
/**********************************************************************************/

export function resolve<T>(child: Accessor<T> | T, recursive = false): T {
  return typeof child !== "function"
    ? child
    : recursive
    ? resolve((child as Accessor<T>)())
    : (child as Accessor<T>)()
}

/**********************************************************************************/
/*                                                                                */
/*                                   With Context                                 */
/*                                                                                */
/**********************************************************************************/

export type ContextProviderProps = {
  children?: JSX.Element
} & Record<string, unknown>
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: JSX.Element } & T,
) => JSX.Element
/**
 * A utility-function to provide context to components.
 *
 * @param children Accessor of Children
 * @param context Context<T>
 * @param value T
 *
 * @example
 * ```tsx
 * const NumberContext = createContext<number>
 *
 * const children = withContext(
 *    () => props.children,
 *    NumberContext,
 *    1
 * )
 * ```
 */

export function withContext<T, TResult>(
  children: Accessor<TResult>,
  context: Context<T>,
  value: T,
) {
  let result: TResult

  context.Provider({
    value,
    children: (() => {
      result = children()
      return ""
    }) as any as JSX.Element,
  })

  return result!
}

/**********************************************************************************/
/*                                                                                */
/*                              With Multi Contexts                               */
/*                                                                                */
/**********************************************************************************/

/**
 * A utility-function to provide multiple context to components.
 *
 * @param children Accessor of Children
 * @param values Array of tuples of `[Context<T>, value T]`.
 *
 * @example
 * ```tsx
 * const NumberContext = createContext<number>
 * const StringContext = createContext<string>
 * const children = withContext(
 *    () => props.children,
 *    [
 *      [NumberContext, 1],
 *      [StringContext, "string"]
 *    ]
 * )
 * ```
 */

export function withMultiContexts<TResult, T extends readonly [unknown?, ...unknown[]]>(
  children: () => TResult,
  values: {
    [K in keyof T]: readonly [Context<T[K]>, [T[K]][T extends unknown ? 0 : never]]
  },
) {
  let result: TResult
  ;(values as [Context<any>, any]).reduce((acc, [context, value], index) => {
    return () =>
      context.Provider({
        value,
        children: () => {
          if (index === 0) result = acc()
          else acc()
        },
      })
  }, children)()

  return result!
}

/**********************************************************************************/
/*                                                                                */
/*                                       Load                                     */
/*                                                                                */
/**********************************************************************************/

export function load<TSource, TResult extends object>(
  loader: Loader<TSource, TResult>,
  path: TSource,
) {
  return new Promise<TResult>((resolve, reject) => loader.load(path, resolve, undefined, reject))
}

/**********************************************************************************/
/*                                                                                */
/*                                     Use Ref                                    */
/*                                                                                */
/**********************************************************************************/

export function useRef<T>(props: { ref?: Ref<T> }, value: T | Accessor<T>) {
  createRenderEffect(() => {
    const result =
      typeof value === "function"
        ? // @ts-expect-error
          value()
        : value
    if (typeof props.ref === "function") {
      // @ts-expect-error
      props.ref(result)
    } else {
      props.ref = result
    }
  })
}

/**********************************************************************************/
/*                                                                                */
/*                              Get Current Viewport                              */
/*                                                                                */
/**********************************************************************************/

const tempTarget = new Vector3()
const position = new Vector3()
export function getCurrentViewport(
  _camera: CameraKind,
  target: Vector3 | Parameters<Vector3["set"]>,
  { width, height, top, left }: Measure,
) {
  const aspect = width / height

  if (isVector3(target)) {
    tempTarget.copy(target)
  } else {
    tempTarget.set(...target)
  }

  const distance = _camera.getWorldPosition(position).distanceTo(tempTarget)

  if (isOrthographicCamera(_camera)) {
    return {
      width: width / _camera.zoom,
      height: height / _camera.zoom,
      top,
      left,
      factor: 1,
      distance,
      aspect,
    }
  }

  const fov = (_camera.fov * Math.PI) / 180 // convert vertical fov to radians
  const h = 2 * Math.tan(fov / 2) * distance // visible height
  const w = h * (width / height)
  return { width: w, height: h, top, left, factor: width / w, distance, aspect }
}
