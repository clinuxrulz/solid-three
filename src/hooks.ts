import { type Accessor, createContext, useContext } from "solid-js"
import type { Context, FrameListener } from "./types"

/**********************************************************************************/
/*                                                                                */
/*                                    Use Frame                                   */
/*                                                                                */
/**********************************************************************************/

export const frameContext = createContext<FrameListener>()

/**
 * Hook to register a callback that will be executed on each animation frame within the `<Canvas/>` component.
 * This hook must be used within a component that is a descendant of the `<Canvas/>` component.
 *
 * @param callback - The callback function to be executed on each frame.
 * @throws Throws an error if used outside of the Canvas component context.
 */
export const useFrame: FrameListener = (callback, options) => {
  const addFrameListener = useContext(frameContext)
  if (!addFrameListener) {
    throw new Error("S3: Hooks can only be used within the Canvas component!")
  }
  return addFrameListener(callback, options)
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
