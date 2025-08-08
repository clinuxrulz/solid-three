import type { Accessor, JSX, Setter, Component as SolidComponent } from "solid-js"
import type * as THREE from "three"
import type { $S3C } from "./constants.ts"
import type { Measure } from "./utils/use-measure.ts"

interface ContextElements {
  camera: Instance<CameraType>
  setCamera: (camera: CameraType | Accessor<CameraType>) => () => void
  gl: Instance<THREE.WebGLRenderer>
  setGl: (gl: THREE.WebGLRenderer | Accessor<THREE.WebGLRenderer>) => () => void
  raycaster: Instance<THREE.Raycaster>
  setRaycaster: (raycaster: THREE.Raycaster | Accessor<THREE.Raycaster>) => () => void
  scene: Instance<THREE.Scene>
  setScene: (scene: THREE.Scene | Accessor<THREE.Scene>) => () => void
}

/** `solid-three` context. Accessible via `useThree`. */
export interface Context extends ContextElements {
  clock: THREE.Clock
  canvas: HTMLCanvasElement
  render: (delta: number) => void
  requestRender: () => void
  pointer: THREE.Vector2
  setPointer: Setter<THREE.Vector2>
  xr: {
    connect: () => void
    disconnect: () => void
  }
  bounds: Measure
  dpr: number
}

/** Possible camera types. */
export type CameraType = THREE.PerspectiveCamera | THREE.OrthographicCamera

/**********************************************************************************/
/*                                                                                */
/*                                      Event                                     */
/*                                                                                */
/**********************************************************************************/

/** Generic `solid-three` event. */
export type ThreeEvent<TEvent = Event, TStoppable = true> = TStoppable extends true
  ? {
      nativeEvent: TEvent
      stopped: boolean
      stopPropagation: () => void
    }
  : {
      nativeEvent: TEvent
    }

/** Event handlers for various `solid-three` events. */
export interface EventHandlers {
  onClick(event: ThreeEvent<MouseEvent>): void
  onClickMissed(event: ThreeEvent<MouseEvent, false>): void
  onDoubleClick(event: ThreeEvent<MouseEvent>): void
  onDoubleClickMissed(event: ThreeEvent<MouseEvent, false>): void
  onContextMenu(event: ThreeEvent<MouseEvent>): void
  onContextMenuMissed(event: ThreeEvent<MouseEvent, false>): void
  onMouseDown(event: ThreeEvent<MouseEvent>): void
  onMouseEnter(event: ThreeEvent<MouseEvent, false>): void
  onMouseLeave(event: ThreeEvent<MouseEvent, false>): void
  onMouseMove(event: ThreeEvent<MouseEvent>): void
  onMouseUp(event: ThreeEvent<MouseEvent>): void
  onPointerUp(event: ThreeEvent<MouseEvent>): void
  onPointerDown(event: ThreeEvent<MouseEvent>): void
  onPointerMove(event: ThreeEvent<MouseEvent>): void
  onPointerEnter(event: ThreeEvent<MouseEvent, false>): void
  onPointerLeave(event: ThreeEvent<MouseEvent, false>): void
  onWheel(event: ThreeEvent<WheelEvent>): void
}

/** The names of all `SolidThreeEventHandlers` */
export type EventName = keyof EventHandlers

/**********************************************************************************/
/*                                                                                */
/*                           Solid Three Representation                           */
/*                                                                                */
/**********************************************************************************/

interface ThreeMathRepresentation {
  set(...args: number[]): any
}
interface ThreeVectorRepresentation extends ThreeMathRepresentation {
  setScalar(s: number): any
}

/** Map given type to `solid-three` representation. */
type Representation<T> = T extends THREE.Color
  ? ConstructorParameters<typeof THREE.Color> | THREE.ColorRepresentation
  : T extends ThreeVectorRepresentation | THREE.Layers | THREE.Euler
  ? T | Parameters<T["set"]> | number
  : T extends ThreeMathRepresentation
  ? T | Parameters<T["set"]>
  : T

export type Vector2 = Representation<THREE.Vector2>
export type Vector3 = Representation<THREE.Vector3>
export type Vector4 = Representation<THREE.Vector4>
export type Color = Representation<THREE.Color>
export type Layers = Representation<THREE.Layers>
export type Quaternion = Representation<THREE.Quaternion>
export type Euler = Representation<THREE.Euler>
export type Matrix3 = Representation<THREE.Matrix3>
export type Matrix4 = Representation<THREE.Matrix4>

/**********************************************************************************/
/*                                                                                */
/*                                  Three To JSX                                  */
/*                                                                                */
/**********************************************************************************/

type ExtractConstructors<T> = T extends Constructor ? T : never
/** All constructors within the `THREE` namespace */
type ThreeConstructors = ExtractConstructors<(typeof THREE)[keyof typeof THREE]>
/** Generic instance of a given `Constructor`. */
export type ThreeInstance = InstanceFromConstructor<ThreeConstructors>

/** Instance of a given constructor augmented with `S3Metadata`. Defaults to `ThreeConstructor`*/
export type Instance<T = ThreeConstructors> = InstanceFromConstructor<T> & {
  [$S3C]: Metadata<T>
}

/** Metadata of a `solid-three` instance. */
export type Metadata<T extends object> = {
  props?: Props<InstanceFromConstructor<T>>
  children: Set<Instance>
}

/** Generic `solid-three` component. */
export type Component<T> = SolidComponent<Props<T>>

/** Maps properties of given type to their `solid-three` representations. */
type MapToRepresentation<T> = {
  [TKey in keyof T]: Representation<T[TKey]>
}

/** Generic `solid-three` props of a given class. */
export type Props<T extends object | unknown> = Partial<
  Overwrite<
    MapToRepresentation<InstanceFromConstructor<T>>,
    {
      args: T extends Constructor ? ConstructorOverloadParameters<T> : unknown
      attach:
        | string
        | ((
            parent: Instance<THREE.Object3D>,
            self: Instance<InstanceFromConstructor<T>>,
          ) => () => void)
      children?: JSX.Element
      onUpdate: (self: Instance<InstanceFromConstructor<T>>) => void
      /**
       * Prevents the Object3D from being cast by the ray.
       * Object3D can still receive events via propagation from its descendants.
       */
      raycastable: boolean
    } & EventHandlers
  >
>

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

/** Generic constructor. Returns instance of given type. Defaults to any. */
export type Constructor<T = any> = new (...args: any[]) => T

/** Extracts the instance from a constructor. */
export type InstanceFromConstructor<TConstructor> = TConstructor extends Constructor<infer TObject>
  ? TObject
  : TConstructor

/** Omit function-properties from given type. */
type OmitFunctionProperties<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
/** Overwrites the properties in `T` with the properties from `O`. */
export type Overwrite<T, O> = Omit<T, OmitFunctionProperties<O>> & O

/**
 * Extracts the parameters of all possible overloads of a given constructor.
 *
 * @example
 * class Example {
 *   constructor(a: string);
 *   constructor(a: number, b: boolean);
 *   constructor(a: any, b?: any) {
 *     // Implementation
 *   }
 * }
 *
 * type ExampleParameters = ConstructorOverloadParameters<typeof Example>;
 * // ExampleParameters will be equivalent to: [string] | [number, boolean]
 */
export type ConstructorOverloadParameters<T extends Constructor> = T extends {
  new (...o: infer U): void
  new (...o: infer U2): void
  new (...o: infer U3): void
  new (...o: infer U4): void
  new (...o: infer U5): void
  new (...o: infer U6): void
  new (...o: infer U7): void
}
  ? U | U2 | U3 | U4 | U5 | U6 | U7
  : T extends {
      new (...o: infer U): void
      new (...o: infer U2): void
      new (...o: infer U3): void
      new (...o: infer U4): void
      new (...o: infer U5): void
      new (...o: infer U6): void
    }
  ? U | U2 | U3 | U4 | U5 | U6
  : T extends {
      new (...o: infer U): void
      new (...o: infer U2): void
      new (...o: infer U3): void
      new (...o: infer U4): void
      new (...o: infer U5): void
    }
  ? U | U2 | U3 | U4 | U5
  : T extends {
      new (...o: infer U): void
      new (...o: infer U2): void
      new (...o: infer U3): void
      new (...o: infer U4): void
    }
  ? U | U2 | U3 | U4
  : T extends {
      new (...o: infer U): void
      new (...o: infer U2): void
      new (...o: infer U3): void
    }
  ? U | U2 | U3
  : T extends {
      new (...o: infer U): void
      new (...o: infer U2): void
    }
  ? U | U2
  : T extends {
      new (...o: infer U): void
    }
  ? U
  : never
