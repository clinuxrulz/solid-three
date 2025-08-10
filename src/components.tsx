import { type JSX, type ParentProps, createMemo, createRenderEffect, mergeProps } from "solid-js"
import { Object3D } from "three"
import { threeContext, useThree } from "./hooks.ts"
import { manageSceneGraph, useProps } from "./props.ts"
import type { Instance, Props } from "./types.ts"
import { type InstanceFromConstructor } from "./types.ts"
import { augment, autodispose, isConstructor, isInstance, withContext } from "./utils.ts"

type PortalProps = ParentProps<{
  element?: InstanceFromConstructor<Object3D> | Instance<Object3D>
}>
/**
 * A component for placing its children outside the regular `solid-three` scene graph managed by Solid's reactive system.
 * This is useful for bypassing the normal rendering flow and manually managing children, similar to Solid's Portal but specific to `solid-three`.
 *
 * @function Portal
 * @param props - The component props containing `children` to be rendered and an optional Object3D `element` to be rendered into.
 * @returns An empty JSX element.
 */
export const Portal = (props: PortalProps) => {
  const context = useThree()
  const scene = createMemo(() => {
    return props.element
      ? isInstance(props.element)
        ? (props.element as Instance<Object3D>)
        : augment(props.element, { props: {} })
      : context.scene
  })

  createRenderEffect(() => {
    // @ts-expect-error TODO: fix type-error
    manageSceneGraph(scene(), () =>
      withContext(
        () => props.children as unknown as Instance | Instance[],
        // @ts-expect-error TODO: fix type-error
        threeContext,
        mergeProps(context, {
          get scene() {
            return scene()
          },
        }),
      ),
    )
  })

  return null
}

type EntityProps<T> = ParentProps<{ from: T; ref?: T | ((value: T) => void) }> &
  (T extends new (...args: any[]) => any
    ? Omit<Props<T>, "object" | "children" | "ref">
    : Omit<Props<T>, "object" | "children" | "ref" | "args"> & {
        args?: never
      })

/**
 * Wraps a `ThreeElement` and allows it to be used as a JSX-component within a `solid-three` scene.
 *
 * @function Entity
 * @template T - Extends `ThreeInstance`
 * @param props - The properties for the Three.js object including the object instance's methods,
 *                                    optional children, and a ref that provides access to the object instance.
 * @returns The Three.js object wrapped as a JSX element, allowing it to be used within Solid's component system.
 */
export function Entity<T extends object | (new (...args: any[]) => object)>(props: EntityProps<T>) {
  const memo = createMemo(() => {
    return augment(
      isConstructor(props.from) ? autodispose(new props.from(...(props.args ?? []))) : props.from,
      { props },
    ) as Instance<T>
  })
  useProps(memo, props)
  return memo as unknown as JSX.Element
}
