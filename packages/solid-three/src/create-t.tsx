import { createMemo, untrack, useContext, type Component } from "solid-js"
import { parentContext, useThree } from "./hooks.ts"
import { useProps } from "./props.ts"
import type { PropsWithCamera } from "./types.ts"
import { meta } from "./utils.ts"

/**********************************************************************************/
/*                                                                                */
/*                                    Create T                                    */
/*                                                                                */
/**********************************************************************************/

export function createT<TCatalogue extends Record<string, unknown>>(catalogue: TCatalogue) {
  const cache = new Map<string, Component<any>>()
  return new Proxy<{
    [K in keyof TCatalogue]: Component<PropsWithCamera<TCatalogue[K]>>
  }>({} as any, {
    get: (_, name: string) => {
      if (!cache.has(name)) {
        const constructor = catalogue[name]
        if (!constructor) return undefined
        cache.set(name, createEntity(constructor))
      }
      return cache.get(name)
    },
  })
}

export function createEntity<TConstructor>(
  Constructor: TConstructor,
): Component<PropsWithCamera<TConstructor>> {
  return (props: PropsWithCamera<TConstructor>) => {
    const obj = createMemo(() => {
      props.key
      try {
        return meta(new (Constructor as any)(...(props.args ?? [])), { props })
      } catch (e) {
        console.error(e)
        throw new Error("")
      }
    })
    
    // Access context inside createMemo where reactive root is established
    createMemo(() => {
      const context = useThree()
      const parent = useContext<any>(parentContext)
      useProps(obj, props, context, parent)
    })
    
    const Provider = parentContext as any
    return <Provider value={obj()}>{props.children}</Provider>
  }
}
