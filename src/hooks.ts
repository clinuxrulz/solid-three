import {
  type Accessor,
  type Resource,
  children,
  createContext,
  createRenderEffect,
  createResource,
  onCleanup,
  splitProps,
  untrack,
  useContext,
} from "solid-js"
import { applyProps } from "./props.ts"
import type { Context } from "./types"
import { check } from "./utils/conditionals.ts"

/**********************************************************************************/
/*                                                                                */
/*                                    Use Frame                                   */
/*                                                                                */
/**********************************************************************************/

type FrameContext = (callback: (context: Context, delta: number, frame?: XRFrame) => void) => void
export const frameContext = createContext<FrameContext>()

/**
 * Hook to register a callback that will be executed on each animation frame within the `<Canvas/>` component.
 * This hook must be used within a component that is a descendant of the `<Canvas/>` component.
 *
 * @param callback - The callback function to be executed on each frame.
 * @throws Throws an error if used outside of the Canvas component context.
 */
export const useFrame = (callback: (context: Context, delta: number, frame?: XRFrame) => void) => {
  const addFrameListener = useContext(frameContext)
  if (!addFrameListener) {
    throw new Error("S3: Hooks can only be used within the Canvas component!")
  }
  addFrameListener(callback)
}

/**********************************************************************************/
/*                                                                                */
/*                                   Use Loader                                   */
/*                                                                                */
/**********************************************************************************/

type Loader<TSource = any, TResult = any, TReturnValue = any> = {
  load: (
    url: TSource,
    onLoad: (result: TResult) => void,
    onProgress: (() => void) | undefined,
    onReject: ((error: ErrorEvent | unknown) => void) | undefined,
  ) => TReturnValue
}
type LoaderUrl<T extends Loader> = Parameters<T["load"]>[0]
type LoaderResult<T extends Loader> = Parameters<Parameters<T["load"]>[1]>[0]

type LoaderCache<T = Loader<any>> = { loader: T; resources: {} }
const LOADER_CACHE = new Map<any, LoaderCache>()

/**
 * Hook to create and manage a resource using a Three.js loader. It ensures that the loader is
 * reused if it has been instantiated before, and manages the resource lifecycle automatically.
 *
 * @template TResult The type of the resolved data when the loader completes loading.
 * @template TArg The argument type expected by the loader function.
 * @param Constructor - The loader class constructor.
 * @param args - The arguments to be passed to the loader function, wrapped in an accessor to enable reactivity.
 * @returns An accessor containing the loaded resource, re-evaluating when inputs change.
 */
export function useLoader<
  const TLoader extends Loader,
  const TArgs extends LoaderUrl<TLoader> | Array<LoaderUrl<TLoader>>,
>(
  Constructor: new (...args: any[]) => TLoader,
  args: Accessor<TArgs>,
  setup?: (loader: NoInfer<TLoader>) => void,
) {
  let cache = LOADER_CACHE.get(Constructor) as LoaderCache<TLoader>
  if (!cache) {
    cache = {
      loader: new Constructor(),
      resources: {},
    }
    LOADER_CACHE.set(Constructor, cache)
  }
  const { loader, resources } = cache
  setup?.(loader)

  const load = (arg: string) => {
    // @ts-expect-error TODO: fix type-error
    if (resources[arg]) return resources[arg]
    // @ts-expect-error TODO: fix type-error
    return (resources[arg] = new Promise((resolve, reject) =>
      loader.load(
        arg,
        value => {
          // @ts-expect-error TODO: fix type-error
          resources[arg] = value
          resolve(value)
        },
        undefined,
        reject,
      ),
    ))
  }

  const [resource] = createResource(args, args =>
    Array.isArray(args)
      ? Promise.all((args as string[]).map(arg => load(arg)))
      : load(args as string),
  )

  return resource as /* TArgs extends  LoaderUrl<TLoader>
    ? Resource<LoaderResult<TLoader>>
    : */ Resource<{ [K in keyof TArgs]: LoaderResult<TLoader> }>
}

/**********************************************************************************/
/*                                                                                */
/*                                    Use Props                                   */
/*                                                                                */
/**********************************************************************************/

/**
 * Manages and applies `solid-three` props to its Three.js object. This function sets up reactive effects
 * to ensure that properties are correctly applied and updated in response to changes. It also manages the
 * attachment of children and the disposal of the object.
 *
 * @template T - The type of the augmented element.
 * @param object - An accessor function that returns the target object to which properties will be applied.
 * @param props - An object containing the props to apply. This includes both direct properties
 *                and special properties like `ref` and `children`.
 */
export function useProps<T extends object>(object: Accessor<T>, props: any) {
  const [local, instanceProps] = splitProps(props, ["ref", "args", "object", "attach", "children"])

  // Assign ref
  createRenderEffect(() => {
    if (local.ref instanceof Function) local.ref(object())
    else local.ref = object()
  })

  createRenderEffect(() => {
    if ("children" in props) {
      // Connect or attach children to THREE-instance
      const childrenAccessor = children(() => props.children)
      // @ts-expect-error TODO: fix type-error
      manageSceneGraph(object(), childrenAccessor as unknown as Accessor<Instance>)
    }
  })

  // Apply the props to THREE-instance
  createRenderEffect(() => {
    applyProps(object(), instanceProps)
    // NOTE: see "onUpdate should not update itself"-test
    untrack(() => props.onUpdate)?.(object())
  })

  // Automatically dispose
  onCleanup(() =>
    check(object, object => {
      if ("dispose" in object && typeof object.dispose === "function") {
        object.dispose()
      }
    }),
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                    Use Three                                   */
/*                                                                                */
/**********************************************************************************/

export const threeContext = createContext<Context>(null!)

/**
 * Custom hook to access all necessary Three.js objects needed to manage a 3D scene.
 * This hook must be used within a component that is a descendant of the `<Canvas/>` component.
 *
 * @template T The expected return type after applying the callback to the context.
 * @param [callback] - Optional callback function that processes and returns a part of the context.
 * @returns Returns `Context` directly, or as a selector if a callback is provided.
 * @throws Throws an error if used outside of the Canvas component context.
 */
export function useThree(): Context
export function useThree<T>(callback: (value: Context) => T): Accessor<T>
export function useThree(callback?: (value: Context) => any) {
  const store = useContext(threeContext)
  if (!store) {
    throw new Error("S3: Hooks can only be used within the Canvas component!")
  }
  if (callback) return () => callback(store)
  return store
}
