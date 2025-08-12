import { createMemo, type JSX, mergeProps } from "solid-js"
import { useProps } from "./hooks.ts"
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
        cache.set(name, createEntity(constructor))
      }

      return cache.get(name)
    },
  })
}

/**
 * Creates an Entity-instance from a given source constructor.
 *
 * @template TConstructor The source constructor type.
 * @param Constructor - The constructor from which the component will be created.
 * @returns The created component.
 */
export function createEntity<TConstructor>(Constructor: TConstructor): Component<TConstructor> {
  return (props: any) => {
    const merged = mergeProps({ args: [] }, props)
    const memo = createMemo(() => {
      try {
        return augment(new (Constructor as any)(...merged.args), { props })
      } catch (e) {
        console.error(e)
        throw new Error("")
      }
    })
    useProps(memo, props)
    return memo as unknown as JSX.Element
  }
}
