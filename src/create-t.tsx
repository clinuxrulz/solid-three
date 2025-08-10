import { createMemo, type JSX, mergeProps } from "solid-js"
import { useProps } from "./props.ts"
import type { Component } from "./types.ts"
import { augment } from "./utils.ts"

/**********************************************************************************/
/*                                                                                */
/*                                    Create T                                    */
/*                                                                                */
/**********************************************************************************/

export function createT<TCatalogue extends Record<string, unknown>>(catalogue: TCatalogue) {
  const cache = new Map<string, Component<any>>()
  return new Proxy<{
    [K in keyof TCatalogue]: Component<TCatalogue[K]>
  }>({} as any, {
    get: (_, name: string) => {
      /* Create and memoize a wrapper component for the specified property. */
      if (!cache.has(name)) {
        /* Try and find a constructor within the THREE namespace. */
        const constructor = catalogue[name]

        /* If no constructor is found, return undefined. */
        if (!constructor) return undefined

        /* Otherwise, create and memoize a component for that constructor. */
        cache.set(name, createTComponent(constructor))
      }

      return cache.get(name)
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
export function createTComponent<TSource>(source: TSource): Component<TSource> {
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
    useProps(memo, props)
    return memo as unknown as JSX.Element
  }
}
