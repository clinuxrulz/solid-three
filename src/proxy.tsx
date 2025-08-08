import { createMemo, type JSX, mergeProps } from "solid-js"
import { augment } from "./augment.ts"
import { Portal, Primitive } from "./components.tsx"
import { manageProps } from "./props.ts"
import type { Component } from "./types.ts"

/**********************************************************************************/
/*                                                                                */
/*                                    Create T                                    */
/*                                                                                */
/**********************************************************************************/

export function createT<TCatalogue extends Record<string, unknown>>(catalogue: TCatalogue) {
  /** Predefined components that can be used directly within the system. */
  const components: SolidThree.Components = {
    Primitive,
    Portal,
  }

  /** Cache for storing initialized components. */
  const t_cache = new Map<string, Component<any>>(Object.entries(components))

  return new Proxy<
    {
      [K in keyof TCatalogue]: Component<TCatalogue[K]>
    } & SolidThree.Components
  >({} as any, {
    get: (_, name: string) => {
      /* Create and memoize a wrapper component for the specified property. */
      if (!t_cache.has(name)) {
        /* Try and find a constructor within the THREE namespace. */
        const constructor = catalogue[name]

        /* If no constructor is found, return undefined. */
        if (!constructor) return undefined

        /* Otherwise, create and memoize a component for that constructor. */
        t_cache.set(name, createThreeComponent(constructor))
      }

      return t_cache.get(name)
    },
  })
}

/**
 * Creates a ThreeComponent instance for a given source constructor.
 *
 * @template TSource The source constructor type.
 * @param source - The constructor from which the component will be created.
 * @returns The created component.
 */
function createThreeComponent<TSource>(source: TSource): Component<TSource | SolidThree.Elements> {
  return (props: any) => {
    const merged = mergeProps({ args: [] }, props)
    const memo = createMemo(() => {
      try {
        return augment(new (source as any)(...merged.args), { props })
      } catch (e) {
        console.error(e)
        throw new Error("")
      }
    })
    manageProps(memo, props)
    return memo as unknown as JSX.Element
  }
}
