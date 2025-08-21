import type { JSX, Ref, Component as SolidComponent } from "solid-js"
import type {
  Clock,
  ColorRepresentation,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Color as ThreeColor,
  Euler as ThreeEuler,
  Layers as ThreeLayers,
  Matrix3 as ThreeMatrix3,
  Matrix4 as ThreeMatrix4,
  Quaternion as ThreeQuaternion,
  Vector2 as ThreeVector2,
  Vector3 as ThreeVector3,
  Vector4 as ThreeVector4,
  WebGLRenderer,
} from "three"
import type { CanvasProps } from "./canvas.tsx"
import type { $S3C } from "./constants.ts"
import type { EventRaycaster } from "./raycasters.tsx"
import type { Measure } from "./utils/use-measure.ts"

export interface Context {
  bounds: Measure
  canvas: HTMLCanvasElement
  clock: Clock
  currentCamera: CameraKind
  currentRaycaster: Raycaster | EventRaycaster
  dpr: number
  gl: Meta<WebGLRenderer>
  props: CanvasProps
  render: (delta: number) => void
  requestRender: () => void
  scene: Meta<Scene>
  setCurrentCamera(camera: CameraKind): () => void
  setCurrentRaycaster(camera: Raycaster): () => void
  viewport: Viewport
  xr: {
    connect: () => void
    disconnect: () => void
  }
}

export interface Viewport {
  width: number
  height: number
  top: number
  left: number
  factor: number
  distance: number
  aspect: number
}

/** Possible camera types. */
export type CameraKind = PerspectiveCamera | OrthographicCamera

export type Loader<TSource, TResult extends object> = {
  setPath?(path: string): void
  load: (
    url: TSource,
    onLoad: (result: TResult) => void,
    onProgress: (() => void) | undefined,
    onReject: ((error: ErrorEvent | unknown) => void) | undefined,
  ) => unknown
}

export type FrameListenerCallback = (context: Context, delta: number, frame?: XRFrame) => void
export type FrameListenerOptions = { priority?: number; stage?: "before" | "after" }
export type FrameListener = (
  callback: FrameListenerCallback,
  options?: FrameListenerOptions,
) => () => void

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
export type Representation<T> = T extends ThreeColor
  ? ConstructorParameters<typeof ThreeColor> | ColorRepresentation
  : T extends ThreeVectorRepresentation | ThreeLayers | ThreeEuler
  ? T | Parameters<T["set"]> | number
  : T extends ThreeMathRepresentation
  ? T | Parameters<T["set"]>
  : T

export type Vector2 = Representation<ThreeVector2>
export type Vector3 = Representation<ThreeVector3>
export type Vector4 = Representation<ThreeVector4>
export type Color = Representation<ThreeColor>
export type Layers = Representation<ThreeLayers>
export type Quaternion = Representation<ThreeQuaternion>
export type Euler = Representation<ThreeEuler>
export type Matrix3 = Representation<ThreeMatrix3>
export type Matrix4 = Representation<ThreeMatrix4>

/**********************************************************************************/
/*                                                                                */
/*                                  Three To JSX                                  */
/*                                                                                */
/**********************************************************************************/

export type Meta<T = unknown> = T & {
  [$S3C]: Data<T>
}

/** Metadata of a `solid-three` instance. */
export type Data<T> = {
  props: Props<InstanceOf<T>>
  children: Set<Meta<unknown>>
}

/** Generic `solid-three` component. */
export type Component<T> = SolidComponent<Props<T>>

/** Maps properties of given type to their `solid-three` representations. */
export type MapToRepresentation<T> = {
  [TKey in keyof T]: Representation<T[TKey]>
}

/** Generic `solid-three` props of a given class. */
export type Props<T> = Partial<
  Overwrite<
    MapToRepresentation<InstanceOf<T>>,
    {
      args: T extends Constructor ? ConstructorOverloadParameters<T> : undefined
      attach: string | ((parent: Meta<Object3D>, self: Meta<InstanceOf<T>>) => () => void)
      ref: Ref<InstanceOf<T>>
      children: JSX.Element
      onUpdate: (self: Meta<InstanceOf<T>>) => void
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
export type InstanceOf<T> = T extends Constructor<infer TObject> ? TObject : T

/** Overwrites the properties in `T` with the properties from `O`. */
export type Overwrite<T, O> = Omit<T, keyof O> & O

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
