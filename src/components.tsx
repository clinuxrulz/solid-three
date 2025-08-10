import {
  type JSX,
  type ParentProps,
  createMemo,
  createRenderEffect,
  mergeProps,
  splitProps,
} from "solid-js"
import { Object3D } from "three"
import { threeContext, useThree } from "./hooks.ts"
import { manageSceneGraph, useProps } from "./props.ts"
import type { Constructor, Instance, Overwrite, Props } from "./types.ts"
import { type InstanceFromConstructor } from "./types.ts"
import { augment, autodispose, isConstructor, isInstance, withContext } from "./utils.ts"

/**********************************************************************************/
/*                                                                                */
/*                                     Portal                                     */
/*                                                                                */
/**********************************************************************************/

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

/**********************************************************************************/
/*                                                                                */
/*                                     Entity                                     */
/*                                                                                */
/**********************************************************************************/

type EntityProps<T extends object | Constructor<object>> = Overwrite<
  Props<T>,
  {
    from: T
  }
>
/**
 * Wraps a `ThreeElement` and allows it to be used as a JSX-component within a `solid-three` scene.
 *
 * @function Entity
 * @template T - Extends `ThreeInstance`
 * @param props - The properties for the Three.js object including the object instance's methods,
 *                                    optional children, and a ref that provides access to the object instance.
 * @returns The Three.js object wrapped as a JSX element, allowing it to be used within Solid's component system.
 */
export function Entity<T extends object | Constructor<object>>(props: EntityProps<T>) {
  const [config, rest] = splitProps(props, ["from", "args"])
  const memo = createMemo(() => {
    return augment(
      isConstructor(config.from)
        ? autodispose(new config.from(...(config.args ?? [])))
        : config.from,
      { props },
    ) as Instance<T>
  })
  useProps(memo, rest)
  return memo as unknown as JSX.Element
}
