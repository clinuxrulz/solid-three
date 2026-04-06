import {
  For,
  type Accessor,
  children,
  createMemo,
  createRenderEffect,
  type JSXElement,
  onCleanup,
  untrack,
} from "solid-js"
import {
  BufferGeometry,
  Color,
  Fog,
  Material,
  Object3D,
  RGBAFormat,
  Texture,
  UnsignedByteType,
} from "three"
import { isEventType } from "./create-events.ts"
import { useThree } from "./hooks.ts"
import { addToEventListeners } from "./internal-context.ts"
import type { AccessorMaybe, Context, Meta } from "./types.ts"
import { getMeta, hasColorSpace, hasMeta, resolve } from "./utils.ts"

function isWritable(object: object, propertyName: string) {
  return Object.getOwnPropertyDescriptor(object, propertyName)?.writable
}

function applySceneGraph(parent: object, child: object): (() => void) | undefined {
  const cleanups: (() => void)[] = []

  const parentMeta = getMeta(parent)
  if (parentMeta) {
    parentMeta.children.add(child)
    cleanups.push(() => parentMeta.children.delete(child))
  }

  const childMeta = getMeta(child)
  if (childMeta) {
    childMeta.parent = parent
    cleanups.push(() => { childMeta.parent = undefined })
  }

  let attachProp = childMeta?.props.attach

  if (typeof attachProp === "function") {
    const cleanup = attachProp(parent, child as any)
    if (cleanup) cleanups.push(cleanup)
    return () => cleanups.forEach(fn => fn())
  }

  if (!attachProp) {
    if (child instanceof Material) attachProp = "material"
    else if (child instanceof BufferGeometry) attachProp = "geometry"
    else if (child instanceof Fog) attachProp = "fog"
  }

  if (attachProp) {
    let target = parent as any
    let property: string | undefined

    const path = attachProp.split("-")

    while ((property = path.shift())) {
      if (path.length === 0) {
        target[property] = child
        const capturedTarget = target
        const capturedProperty = property
        cleanups.push(() => { capturedTarget[capturedProperty] = undefined })
        break
      } else {
        target = target[property]
      }
    }

    return () => cleanups.forEach(fn => fn())
  }

  if (child instanceof Object3D && parent instanceof Object3D && !parent.children.includes(child)) {
    parent.add(child)
    cleanups.push(() => parent.remove(child))
    return () => cleanups.forEach(fn => fn())
  }

  console.error(
    "Error while connecting/attaching child: child does not have attach-props defined and is not an Object3D",
    parent,
    child,
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                   Scene Graph                                  */
/*                                                                                */
/**********************************************************************************/

/**
 * Dynamically attaches/connects child elements to a parent within a scene graph based on specified attachment properties.
 * The function supports different attachment behaviors:
 * - Direct assignment for standard properties like material, geometry, or fog.
 * - Custom attachment logic through a callback function provided in the attach property of the child.
 * - Default behavior for Three.js Object3D instances where children are added to the parent's children array if no specific attach property is provided.
 *
 * @template T The type parameter for the elements in the scene graph.
 * @param parent - The parent element to which children will be attached.
 * @param childAccessor - A function returning the child or children to be managed.
 */
export const useSceneGraph = <T extends object>(
  _parent: AccessorMaybe<T | undefined>,
  props: { children?: JSXElement | JSXElement[]; onUpdate?(event: T): void },
) => {
  const childArray = createMemo(() => {
    const rawChildren = props.children
    if (!rawChildren) return []
    const arr = Array.isArray(rawChildren) ? rawChildren : [rawChildren]
    return arr as unknown as (Meta<object> | undefined)[]
  })

  let currentCleanups: (() => void)[] = []

  createRenderEffect(
    () => {
      const parent = resolve(_parent)
      const childs = childArray()
      if (!parent) return undefined
      return { parent, childs }
    },
    (data) => {
      if (!data) return
      const { parent, childs } = data

      currentCleanups.forEach(fn => fn())
      currentCleanups = []

      for (const _child of childs) {
        const child = resolve(_child)
        if (!child) continue
        const cleanup = applySceneGraph(parent, child)
        if (cleanup) currentCleanups.push(cleanup)
      }
      props.onUpdate?.(parent)
    },
  )

  return () => currentCleanups.forEach(fn => fn())
}

/**********************************************************************************/
/*                                                                                */
/*                                   Apply Prop                                   */
/*                                                                                */
/**********************************************************************************/

const NEEDS_UPDATE = [
  "map",
  "envMap",
  "bumpMap",
  "normalMap",
  "transparent",
  "morphTargets",
  "skinning",
  "alphaTest",
  "useVertexColors",
  "flatShading",
]

/**
 * Applies a specified property value to an `AugmentedElement`. This function handles nested properties,
 * automatic updates of the `needsUpdate` flag, color space conversions, and event listener management.
 * It efficiently manages property assignments with appropriate handling for different data types and structures.
 *
 * @param source - The target object for property application.
 * @param type - The property name, which can include nested paths indicated by hyphens.
 * @param value - The value to be assigned to the property; can be of any appropriate type.
 */
function applyProp<T extends Record<string, any>>(
  context: Pick<Context, "requestRender" | "gl" | "props">,
  source: T,
  type: string,
  value: any,
) {
  const target = source[type]

  try {
    // Copy if properties match signatures
    if (target?.copy && target?.constructor === value?.constructor && !isWritable(source, type)) {
      target.copy(value)
    } else if (target?.set && Array.isArray(value)) {
      if (target.fromArray) target.fromArray(value)
      else target.set(...value)
    }
    // Set literal types, ignore undefined
    // https://github.com/pmndrs/react-three-fiber/issues/274
    else if (target?.set && typeof value !== "object") {
      const isColor = target instanceof Color

      // Allow setting array scalars
      if (!isColor && target.setScalar && typeof value === "number") {
        target.setScalar(value)
      }
      // Otherwise just set ...
      else if (value !== undefined) {
        target.set(value)
      }
    }
    // Handle event handlers
    else if (isEventType(type)) {
      if (source instanceof Object3D && hasMeta(source)) {
        const cleanup = addToEventListeners(source, type)
        onCleanup(cleanup)
      } else {
        console.error(
          "Event handlers can only be added to Three elements extending from Object3D. Ignored event-type:",
          type,
          "from element",
          source,
        )
      }
    }
    // Else, just overwrite the value
    else {
      // @ts-expect-error TODO: fix type-error
      source[type] = value

      // Auto-convert sRGB textures, for now ...
      // https://github.com/pmndrs/react-three-fiber/issues/344
      if (
        source[type] instanceof Texture &&
        // sRGB textures must be RGBA8 since r137 https://github.com/mrdoob/three.js/pull/23129
        source[type].format === RGBAFormat &&
        source[type].type === UnsignedByteType
      ) {
        createRenderEffect(
          () => {
            context.props.linear
            context.props.flat
            return source[type] as Texture
          },
          texture => {
            if (hasColorSpace(texture) && hasColorSpace(context.gl)) {
              texture.colorSpace = context.gl.outputColorSpace
            } else {
              // @ts-expect-error TODO: fix type-error
              texture.encoding = context.gl.outputEncoding
            }
          },
        )
      }
    }
  } finally {
    if ("needsUpdate" in source) {
      // @ts-expect-error
      source.needsUpdate = true
    }
    if (untrack(() => context.props.frameloop) === "demand") {
      untrack(() => context.requestRender())
    }
  }
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
 * @param accessor - An accessor function that returns the target object to which properties will be applied.
 * @param props - An object containing the props to apply. This includes both direct properties
 *                and special properties like `ref` and `children`.
 * @param context - The Three.js context (requestRender, gl, props).
 * @param parent - Optional parent object for scene graph attachment. If provided, children will attach to this parent.
 */
export function useProps<T extends Record<string, any>>(
  accessor: T | undefined | Accessor<T | undefined>,
  props: any,
  context: Pick<Context, "requestRender" | "gl" | "props" | "setCamera"> = useThree(),
  parent?: Meta<object>,
) {
  const objectRef = resolve(accessor)
  if (!objectRef) return

  if (parent) {
    applySceneGraph(parent, objectRef)
  }

  if (typeof props.ref === "function") {
    props.ref(objectRef)
  } else if (props.ref && typeof props.ref === "object" && "current" in props.ref) {
    props.ref.current = objectRef
  }

  if (props.makeDefault) {
    context.setCamera?.(objectRef as any)
  }

  const keys = Object.keys(props).filter(k => !['children', 'ref', 'onUpdate', 'key', 'attach', 'args', 'makeDefault'].includes(k))
  for (const key of keys) {
    const subKeys = keys.filter(_key => key !== _key && _key.includes(key))
    const capturedKey = key
    createRenderEffect(
      (prevValue) => {
        const value = props[capturedKey]
        return value
      },
      (value) => {
        applyProp(context, objectRef, capturedKey, value)
        for (const subKey of subKeys) {
          applyProp(context, objectRef, subKey, props[subKey])
        }
      },
    )
  }

  untrack(() => props.onUpdate)?.(objectRef)
}
