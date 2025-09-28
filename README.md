<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-three&background=tiles&project=%20" alt="solid-three">
</p>

# solid-three

`solid-three` is a port of [react-three-fiber](https://github.com/pmndrs/react-three-fiber) to [solid-js](https://www.solidjs.com/). It allows you to declaratively construct a [three.js](https://threejs.org/) scene, with reactive primitives, just as you would construct a DOM tree in `solid-js`.

- **Declarative `three.js` Components**: Utilize `three.js` objects as JSX components.
- **Reactive Prop Updates**: Properties of 3D objects update reactively, promoting efficient re-renders.
- **Integrated Animation Loop**: `useFrame` hook allows for easy animations.
- **Comprehensive Event System**: Enhanced event handling with support for `three.js` pointer and mouse events.
- **Extensible and Customizable**: Easily extendable with additional `three.js` entities or custom behaviors.
- **Optimized for `solid-js`**: Leverages `solid-js`' fine-grained reactivity for optimal performance.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Components](#components)
   - [Canvas](#canvas)
   - [T](#t)
   - [Entity](#entity)
   - [Portal](#portal)
   - [Resource](#resource)
4. [Hooks](#hooks)
   - [useThree](#usethree)
   - [useFrame](#useframe)
   - [useProps](#useprops)
5. [Utilities](#utilities)
   - [Raycasters](#raycasters)
   - [LoaderCache](#loadercache)
   - [autodispose](#autodispose)
   - [Metadata Utilities](#metadata-utilities)
   - [Testing Utilities](#testing-utilities)
6. [Event Handling](#event-handling)
   - [Controlling Raycasting with raycastable](#controlling-raycasting-with-raycastable)
   - [Supported Events](#supported-events)
   - [Event Object](#event-object)
   - [Event Propagation](#event-propagation)
   - [Missed Events](#missed-events)
   - [Hover Events](#hover-events)
7. [Performance Optimization](#performance-optimization)
8. [Contributing](#contributing)
9. [License](#license)

## Installation

```bash
npm install solid-three three
```

```bash
pnpm install solid-three three
```

```bash
yarn add solid-three three
```

Ensure that `solid-js` is installed in your environment, as it is a peer dependency of `solid-three`.

## Basic Usage

Here's a simple example to get you started:

```tsx
import { Component, createSignal } from "solid-js"
import { Canvas, Entity, useFrame } from "solid-three"
import * as THREE from "three"

const Box = () => {
  let mesh: THREE.Mesh | undefined
  const [hovered, setHovered] = createSignal(false)

  useFrame(() => (mesh!.rotation.y += 0.01))

  return (
    <Entity
      from={THREE.Mesh}
      ref={mesh}
      onPointerEnter={e => setHovered(true)}
      onPointerLeave={e => setHovered(false)}
    >
      <Entity from={THREE.BoxGeometry} />
      <Entity from={THREE.MeshStandardMaterial} args={[{ color: hovered() ? "green" : "red" }]} />
    </Entity>
  )
}

const App: Component = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Entity from={THREE.AmbientLight} args={[0.5]} />
      <Entity from={THREE.PointLight} position={[10, 10, 10]} />
      <Box />
    </Canvas>
  )
}
```

Alternatively, using the `createT()` pattern:

```tsx
import { Component, createSignal } from "solid-js"
import { Canvas, createT, useFrame } from "solid-three"
import * as THREE from "three"

// Create the T namespace
const T = createT(THREE)

const Box = () => {
  let mesh: THREE.Mesh | undefined
  const [hovered, setHovered] = createSignal(false)

  useFrame(() => (mesh!.rotation.y += 0.01))

  return (
    <T.Mesh
      ref={mesh}
      onPointerEnter={e => setHovered(true)}
      onPointerLeave={e => setHovered(false)}
    >
      <T.BoxGeometry args={[1, 1, 1]} />
      <T.MeshStandardMaterial color={hovered() ? "green" : "red"} />
    </T.Mesh>
  )
}

const App: Component = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <T.AmbientLight intensity={0.5} />
      <T.PointLight position={[10, 10, 10]} />
      <Box />
    </Canvas>
  )
}
```

**Choosing between `Entity` and `T`:**

- **Use `Entity`**: When building libraries, working with dynamic object types, or when you want to avoid creating a namespace
- **Use `T`**: When building applications where you want the convenience of pre-typed components and better autocomplete

## Components

### Canvas

The `Canvas` component initializes the `three.js` rendering context and acts as the root for your 3D scene. All `<T/>` and `<Entity/>` components must be children of this Canvas.

**Props:**

- **defaultCamera**: Configures the camera used in the scene. Can be partial props for a camera or an existing Camera instance.
- **fallback**: Element to render while the main content is loading asynchronously.
- **gl**: Defines options for the WebGLRenderer, a function returning a customized renderer, or an existing renderer instance.
- **scene**: Provides custom settings for the Scene instance or an existing Scene.
- **defaultRaycaster**: Configures the Raycaster for mouse and pointer events.
- **shadows**: Enables and configures shadows in the scene with various shadow mapping techniques.
- **orthographic**: Toggles between Orthographic and Perspective camera for the default camera.
- **linear**: Toggles linear interpolation for texture filtering.
- **flat**: Toggles flat interpolation for texture filtering.
- **frameloop**: Controls the rendering loop's operation mode:
  - `"always"`: Renders continuously on every frame
  - `"demand"`: Renders only when explicitly requested
  - `"never"`: Disables automatic rendering
- **style**: Custom CSS styles for the canvas container.
- **class**: CSS class names for the canvas container.
- **Event handlers**: All event handlers are supported on the Canvas component, allowing you to handle events that bubble through the entire scene (e.g., `onClick`, `onPointerMove`, `onClickMissed`, etc.)

<details>
<summary>Typescript Interface</summary>

```tsx
interface CanvasProps {
  defaultCamera?: Partial<PerspectiveCamera | OrthographicCamera> | Camera
  fallback?: JSX.Element
  gl?: Partial<WebGLRenderer> | ((canvas: HTMLCanvasElement) => WebGLRenderer) | WebGLRenderer
  scene?: Partial<Scene> | Scene
  defaultRaycaster?: Partial<Raycaster> | Raycaster
  shadows?: boolean | "basic" | "percentage" | "soft" | "variance" | WebGLRenderer["shadowMap"]
  orthographic?: boolean
  linear?: boolean
  flat?: boolean
  frameloop?: "never" | "demand" | "always"
  style?: JSX.CSSProperties
  class?: string
  // Plus all event handlers
}
```

</details>

**Example with all props:**

```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  fallback={<div>Loading...</div>}
  gl={{ antialias: true, alpha: true }}
  scene={{ fog: new Fog(0xffffff, 1, 100) }}
  raycaster={{ params: { Line: { threshold: 0.1 } } }}
  shadows="soft"
  orthographic={false}
  linear={false}
  flat={false}
  frameloop="always"
  style={{ background: "black" }}
  onClick={e => console.log("Canvas clicked")}
  onClickMissed={e => console.log("Clicked empty space")}
  onPointerMove={e => console.log("Pointer moved on canvas")}
>
  {/* Your 3D scene */}
</Canvas>
```

### T

The `T` namespace contains components that wrap `three.js` objects, allowing you to insert them into your scene declaratively. You create the namespace using the `createT()` factory function:

```tsx
import { createT } from "solid-three"
import * as THREE from "three"

// Create T namespace with all three.js objects
const T = createT(THREE)

// Now you can use T components
<T.Mesh>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshBasicMaterial color="hotpink" />
</T.Mesh>
```

You can also create a namespace with specific objects for tree-shaking purposes:

```tsx
import { createT } from "solid-three"
import { Mesh, BoxGeometry, MeshBasicMaterial } from "three"

// Create T namespace with only specific objects
const T = createT({ Mesh, BoxGeometry, MeshBasicMaterial })
```

**Usage Patterns:**

- **In Applications**: Create a single `T` and export it for use throughout your app
- **In Libraries**: create multiple `T` to allow for treeshaking or use [`<Entity/>`](#entity) instead
- **Multiple Ts**: Create multiple T instances for lazy loading different parts of three.js

#### Advanced Prop Patterns

`solid-three` supports advanced prop attachment patterns for precise control:

```tsx
const AdvancedProps = () => {
  return (
    <T.Mesh>
      <T.BoxGeometry args={[1, 1, 1]} />
      <T.MeshStandardMaterial
        // Direct property setting
        color="red"
        // Nested property access with dot notation
        material-color="blue"
        // Sub-property access with hyphens
        position-x={2}
        rotation-y={Math.PI / 4}
        scale-z={0.5}
        // Deep nested properties
        material-emissive-intensity={0.5}
      />
    </T.Mesh>
  )
}
```

**Supported patterns:**

- **Direct props**: `color="red"` → `object.color = "red"`
- **Hyphen notation**: `position-x={1}` → `object.position.x = 1`
- **Deep nesting**: `material-emissive-intensity={0.5}` → `object.material.emissive.intensity = 0.5`

These patterns automatically trigger `needsUpdate` flags on materials and geometries when necessary.

### Entity

The `Entity` component provides an alternative way to create three.js objects without needing to pre-create a T namespace. This is particularly useful in libraries or when working with dynamic object types:

```tsx
import { Entity } from "solid-three"
import { Mesh, BoxGeometry, MeshBasicMaterial } from "three"

function Constructor() {
  return (
    // Pass constructor with optional arguments
    <Entity from={Mesh}>
      <Entity from={BoxGeometry} />
      <Entity from={MeshBasicMaterial} args={[{ color: "orange" }]} />
    </Entity>
  )
}

function Instance() {
  // Pass instance
  const mesh = new Mesh()
  return <Entity from={mesh} position={[0, 0, 0]} />
}
```

**Props:**

- **from**: Either a three.js constructor (class) or an existing instance
- **args**: Arguments to pass to the constructor when using a class
- All other props supported by the three.js object

<details>
<summary>Typescript Interface</summary>

```tsx
interface EntityProps {
  from: Constructor | Instance
  args?: ConstructorParameters
  // Plus all THREE.js object props
}
```

</details>

#### Manual disposal of instance-entities

When passing an instance to `<Entity from={...}/>` disposal need to be handled manually. This can be done via the [`autodispose`-utility](#autodispose):

```tsx
import { Entity, autodispose } from "solid-three"
import { BoxGeometry, SphereGeometry } from "three"

function Wrong(props: { shape: "box" | "sphere" }) {
  const box = new BoxGeometry()
  const sphere = new SphereGeometry()
  return (
    <Show when={props.shape === "box"} fallback={<Entity from={sphere} />}>
      <Entity from={box} />
    </Show>
  )
}

function Good(props: { shape: "box" | "sphere" }) {
  const box = autodispose(new BoxGeometry())
  const sphere = autodispose(new SphereGeometry())
  return (
    <Show when={props.shape === "box"} fallback={<Entity from={sphere} />}>
      <Entity from={box} />
    </Show>
  )
}
```

### Portal

The `Portal` component allows you to place children outside the regular scene graph while maintaining reactive updates. This is useful for rendering objects into different scenes or bypassing the normal parent-child relationships.

**Props:**

- **element**: Optional `three.js` object to render into. If not provided, renders into the root scene.
- **children**: Elements to render in the portal.

<details>
<summary>Typescript Interface</summary>

```tsx
type PortalProps<T extends Object3D> = ParentProps<{
  element?: T | Meta<T>
  onUpdate?(value: T): void
}>
```

</details>

Example:

```tsx
import { Portal } from "solid-three"

// Create a separate scene for UI elements
const uiScene = new Scene()

const App = () => {
  return (
    <Canvas>
      <T.Mesh>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshBasicMaterial color="blue" />
      </T.Mesh>

      {/* Render these objects into a different scene */}
      <Portal element={uiScene}>
        <T.Mesh position={[2, 0, 0]}>
          <T.SphereGeometry args={[15, 32, 16]} />
          <T.MeshBasicMaterial color="red" />
        </T.Mesh>
      </Portal>
    </Canvas>
  )
}
```

### Resource

Wrapper-component around ['useLoader'](#useloader).

**Props:**

- `loader` - Three.js loader constructor (e.g., `TextureLoader`, `GLTFLoader`)
- `url` - URL(s) to load, depending on what the passed loader expects
- `children` - Optional render function
- `*` - Additional props are passed to the loaded resource

**Examples:**

```tsx
// CubeTextureLoader expects an array of strings
<Resource loader={CubeTextureLoader} url={[
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
]} />

// Set props of the resulting resource
<T.MeshStandardMaterial>
  <Resource loader={TextureLoader} url="diffuse.jpg" attach="map" />
  <Resource loader={TextureLoader} url="normal.jpg" attach="normalMap" />
</T.MeshStandardMaterial>

// Custom rendering with children function
<Resource loader={GLTFLoader} url="model.gltf">
{
  (gltf) => <Entity from={gltf.scene} scale={2} />
}
</Resource>

// Disable caching for specific resources
<Resource loader={TextureLoader} url="/dynamic-texture.png" cache={false} />
```

## Hooks

### useThree

Provides access to the `three.js` context, including the renderer, scene, camera, and more. This hook can be used with or without a selector function for optimized access to specific properties.

**Returns:**

- **bounds** (`Measure`): Reactive canvas bounds measurement.
- **camera** (`Camera`): The current camera.
- **setCamera** (`(camera: Camera) => () => void`): A setter-function for setting the current camera.
- **canvas** (`HTMLCanvasElement`): The canvas DOM element.
- **clock** (`Clock`): The `three.js` clock for timing.
- **dpr** (`number`): Device pixel ratio.
- **gl** (`WebGLRenderer`): The WebGL renderer instance.
- **raycaster** (`Raycaster`): The current raycaster used for pointer events.
- **setRaycaster** (`(raycaster: Raycaster) => () => void`): A setter-function for setting the current raycaster.
- **render** (`(delta: number) => void`): Function to manually trigger a render.
- **requestRender** (`() => void`): Function to request a render on the next frame.
- **scene** (`Scene`): The root scene.
- **xr** (`{ connect: () => void; disconnect: () => void }`): WebXR connection management.

**Camera and Raycaster Stack System:**

`solid-three` implements a stack-based system for managing its current camera and raycaster:

- **Stack-based Management**: Both cameras and raycasters are managed as stacks internally
- **Default at Tail**: The `defaultCamera` and `defaultRaycaster` from Canvas props form the tail of their respective stacks
- **Current Active Camera at Head**: The camera/raycaster at the top of the stack is the currently active camera/raycaster
- **Push To The Stack To Become Active**: By calling `setCamera(camera)` and `setRaycaster(raycaster)`, the camera/raycaster is pushed to the stack. This causes it to become the currently active camera/raycaster
- **Pop From The Stack To Deactivate**: `setCamera(camera)` and `setRaycaster(raycaster)` return a cleanup-function to pop the camera/raycaster from the stack. If the camera/raycaster was on top of the stack, the previous camera/raycaster in the stack becomes active again

**Usage:**

```tsx
function Camera(props) {
  const three = useThree()
  const customCamera = new OrthographicCamera(/* ... */)

  // Push a new camera onto the stack
  const restoreCamera = three.setCamera(customCamera)

  // The custom camera is now active
  // When done, call the cleanup to pop camera from the stack
  onCleanup(restoreCamera)

  return null!
}
```

**Practical Example - Camera Switching:**

```tsx
const CameraController = () => {
  const three = useThree()
  const [useOrtho, setUseOrtho] = createSignal(false)

  createEffect(() => {
    if (useOrtho()) {
      const orthoCamera = new OrthographicCamera(-5, 5, 5, -5, 0.1, 1000)
      orthoCamera.position.set(0, 0, 5)

      // Push ortho camera onto stack
      const restore = three.setCamera(orthoCamera)

      // Cleanup automatically restores previous camera
      onCleanup(restore)
    }
  })

  return <button onClick={() => setUseOrtho(v => !v)}>Toggle Orthographic Camera</button>
}
```

### useFrame

Registers a callback that will be called before every frame is rendered, useful for animations and updates.

**Parameters:**

- **callback** - Function called each frame with:
  - **context** - The three.js context object (same as `useThree()`)
  - **delta** - Time elapsed since last frame in seconds
  - **frame** - Optional XRFrame for WebXR sessions
- **options** - Optional configuration object:
  - **priority** - Execution priority (lower numbers run first, default: 0)
  - **stage** - Whether to run before or after rendering (default: "before")

<details>
<summary>Typescript Interface</summary>

```tsx
useFrame(
  callback: (context: Context, delta: number, frame?: XRFrame) => void,
  options?: FrameListenerOptions
)

interface FrameListenerOptions {
  priority?: number
  stage?: "before" | "after"
}
```

</details>

**Basic usage:**

```tsx
const RotatingMesh = () => {
  let mesh: THREE.Mesh = null!

  useFrame((context, delta) => {
    mesh.rotation.y += delta * Math.PI
  })

  return (
    <T.Mesh ref={mesh}>
      <T.BoxGeometry args={[1, 1, 1]} />
      <T.MeshStandardMaterial color="purple" />
    </T.Mesh>
  )
}
```

**With options:**

```tsx
const AnimatedMesh = () => {
  let mesh: THREE.Mesh = null!

  // Run with high priority before render
  useFrame(
    (context, delta) => {
      mesh.position.x = Math.sin(context.clock.elapsedTime) * 2
    },
    { priority: -1 },
  )

  // Run after render with lower priority
  useFrame(
    (context, delta) => {
      console.log("Frame rendered")
    },
    { stage: "after", priority: 10 },
  )

  return <T.Mesh ref={mesh} />
}
```

### useLoader

Manages asynchronous resource loading, such as textures or models, and integrates with `solid-js`' reactivity system. This hook can be used with Solid's `<Suspense>` to handle loading states.

By default, `useLoader` automatically caches resources via [`LoaderCache`](#loadercache).

You can customize caching behavior:

1. **Disable caching**: Pass `cache: false` in options for specific resources
2. **Custom cache**: Pass your own `LoaderRegistry` implementation in options
3. **Replace global cache**: Set `useLoader.cache` to your own implementation or `undefined` to disable

**Options:**

- **base**: Base URL for resolving relative paths
- **cache**: `true` to use global cache, `LoaderRegistry` instance for custom cache, or `false` to disable
- **onBeforeLoad**: Callback before loading starts (e.g., to set loader properties)
- **onLoad**: Callback after resource loads successfully

<details>
<summary>Typescript Interface</summary>

```tsx
interface UseLoaderOptions<TLoader, TResult> {
  base?: string
  cache?: true | LoaderRegistry | false
  onBeforeLoad?(loader: TLoader): void
  onLoad?(resource: TResult): void
}
```

</details>

#### Example

```tsx
// Load a single resource
const texture = useLoader(TextureLoader, url)
const gltf = useLoader(GLTFLoader, "model.gltf")

// Load multiple resources (with object keys)
const textures = useLoader(TextureLoader, {
  diffuse: "wood-diffuse.jpg",
  normal: "wood-normal.jpg",
})

// Reactive URLs (can be signals or getters)
const [url, setUrl] = createSignal("texture.jpg")
const texture = useLoader(TextureLoader, url)
```

#### Custom Cache

`solid-three` by default caches useLoader via `LoaderCache`, but you can also implement your own cache by conforming to the `LoaderRegistry` interface.

A cache registry needs two methods:

- **set**: Store a resource promise for a given loader and URL
- **get**: Retrieve a resource for a given loader and URL (returns either the promise or resolved value)

<details>
<summary>Typescript Interface</summary>

```tsx
interface LoaderRegistry {
  set<TLoader extends Loader<object, any>>(
    loader: TLoader,
    url: LoaderUrl<TLoader>,
    data: PromiseMaybe<LoaderData<TLoader>>,
  ): void

  get<TLoader extends Loader<object, any>>(
    loader: Loader<TData, TUrl>,
    url: LoaderUrl<TLoader>,
    warn?: boolean,
  ): PromiseMaybe<LoaderData<TLoader>> | undefined
}
```

</details>

### useProps

The `useProps` hook manages and applies `solid-three` props to THREE.js objects. It sets up reactive effects to ensure properties are correctly applied and updated, manages children attachment, and handles automatic disposal.

**Parameters:**

- **object**: An accessor function that returns the target THREE.js object
- **props**: Object containing props to apply (including `ref`, `children`, and THREE.js properties)

<details>
<summary>Typescript Signature</summary>

```tsx
function useProps<T extends object>(object: Accessor<T>, props: any): void
```

</details>

**Usage:**

This hook is primarily used internally by `solid-three` components, but can be useful when creating custom components or integrating existing THREE.js objects:

```tsx
import { createSignal } from "solid-js"
import { useProps } from "solid-three"
import { Mesh, BoxGeometry, MeshBasicMaterial } from "three"

const CustomMesh = props => {
  const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())

  // Apply solid-three props reactively to the mesh
  useProps(() => mesh, props)

  return mesh // Return the THREE.js object for use in JSX
}

// Usage
;<CustomMesh position={[1, 2, 3]} rotation={[0, Math.PI, 0]} color="red" />
```

**What it handles:**

- **Reactive prop updates**: Automatically applies prop changes to the THREE.js object
- **Ref assignment**: Handles both function refs and object refs
- **Children management**: Attaches/detaches child objects from the scene graph
- **Automatic disposal**: Cleans up the object when the component unmounts
- **Special props**: Processes `onUpdate` callbacks after prop applications

**Advanced usage:**

```tsx
import { createMemo, createRenderEffect, onCleanup } from "solid-js"
import { useProps, useThree } from "solid-three"
import { Mesh, SphereGeometry, MeshStandardMaterial } from "three"

export function OrbitControls(props: S3.Props<typeof ThreeOrbitControls>) {
  const three = useThree()
  const controls = createMemo<ThreeOrbitControls>(previous => {
    const controls = autodispose(new ThreeOrbitControls(three.camera))
    controls.connect(three.gl.domElement)
    return controls
  })

  useFrame(() => controls().update())

  useProps(controls, rest)

  return null!
}
```

## Utilities

### Raycasters

`solid-three` provides custom raycaster implementations that handle pointer tracking internally. All raycasters extend THREE.Raycaster and implement the `EventRaycaster` interface.

The interface adds one method to the standard THREE.Raycaster:

- **update**: Called automatically before intersection testing to update the raycaster's position based on the event

<details>
<summary>Typescript Interface</summary>

```tsx
interface EventRaycaster extends THREE.Raycaster {
  update(event: PointerEvent | MouseEvent | WheelEvent, context: Context): void
}
```

</details>

**When `update()` is called:**

The `update()` method is automatically called by `solid-three`'s event system whenever:

- **Mouse events**: `click`, `mousedown`, `mouseup`, `mousemove`, `contextmenu`, `dblclick`
- **Pointer events**: `pointerdown`, `pointerup`, `pointermove`
- **Wheel events**: `wheel`

This happens before intersection testing, ensuring the raycaster is properly positioned for accurate 3D object detection.

#### CursorRaycaster

The default raycaster that tracks the cursor position:

```tsx
import { Canvas } from "solid-three"
import { CursorRaycaster } from "solid-three"

const App = () => {
  const raycaster = new CursorRaycaster()

  // CursorRaycaster is used by default, but you can explicitly set it:
  return <Canvas defaultRaycaster={raycaster}>{/* Your scene */}</Canvas>
}
```

#### CenterRaycaster

A raycaster that always casts from the center of the screen:

```tsx
import { Canvas } from "solid-three"
import { CenterRaycaster } from "solid-three"

const App = () => {
  const raycaster = new CenterRaycaster()

  return <Canvas defaultRaycaster={raycaster}>>{/* Your scene */}</Canvas>
}
```

#### Creating Your Own Raycaster

You can create custom raycasters by extending THREE.Raycaster and (optionally) implementing the `EventRaycaster` interface:

```tsx
import { Raycaster, Vector2 } from "three"
import type { EventRaycaster, Context } from "solid-three"

class CustomRaycaster extends Raycaster implements EventRaycaster {
  constructor() {
    super()
    // Initialize your custom raycaster
  }

  update(event: PointerEvent | MouseEvent | WheelEvent, context: Context) {
    const pointer = new Vector2()

    // Calculate normalized device coordinates based on your custom logic

    // Example: Apply custom transformation to pointer coordinates
    pointer.x = ((event.offsetX / context.bounds.width) * 2 - 1) * 0.5 // Scale down horizontal movement
    pointer.y = (-(event.offsetY / context.bounds.height) * 2 + 1) * 0.5 // Scale down vertical movement

    // Update the raycaster with the transformed coordinates
    this.setFromCamera(pointer, context.camera)
  }
}

// Usage
const App = () => {
  const raycaster = new CustomRaycaster()

  return <Canvas defaultRaycaster={raycaster}>{/* Your scene */}</Canvas>
}
```

### LoaderCache

`LoaderCache` is the default cache-manager for `useLoader`. It implements the `LoaderRegistry` interface and adds additional methods to simplify managing the cached resources.

**Features:**

- **Automatic Reference Counting**: Tracks if a resource is currently actively in-use
- **Deferred Disposal**: Resources are added to a free list when no longer referenced
- **Disposal Methods**: Several methods to ease managing disposal of resources
  - **dispose(loader, path)**: dispose a resource based on loader and path
  - **disposeResource(resource)**: dispose a resource by passing the resource directly
  - **disposeFreeList()**: dispose all currently not referenced resources

**Example:**

```tsx
const TexturedBox = () => {
  // This increments the reference count for 'texture.jpg'
  const texture = useLoader(TextureLoader, "texture.jpg")

  // When this component unmounts, the reference count decreases
  // If it reaches zero, the texture is added to the free list
  return (
    <T.Mesh>
      <T.BoxGeometry />
      <T.MeshBasicMaterial map={texture()} />
    </T.Mesh>
  )
}

// Multiple components can share the same cached resource
const Scene = () => (
  <>
    <TexturedBox /> {/* ref count: 1 */}
    <TexturedBox /> {/* ref count: 2 */}
    <TexturedBox /> {/* ref count: 3 */}
  </>
)

const App = () => {
  const [visible, setVisible] = createSignal(true)

  onMount(() => {
    // ❌ Texture will not be disposed because it is referenced (3 times)
    useLoader.cache.disposeFreeList()

    setVisible(false)

    // ✅ Texture will be disposed because it is not referenced anymore
    useLoader.cache.disposeFreeList()
  })

  return (
    <Canvas>
      <Show when={visible}>
        <Scene />
      </Show>
    </Canvas>
  )
}
```

### autodispose

The `autodispose` utility ensures that three.js objects are properly disposed on cleanup.

```tsx
import { autodispose } from "solid-three"
import { BoxGeometry, MeshBasicMaterial } from "three"

function Component() {
  // Any object wrapped with autodispose will be disposed when Component's owner cleans up
  const geometry = autodispose(new BoxGeometry())
  const material = autodispose(new MeshBasicMaterial({ color: "red" }))
}
```

**Use cases:**

- Creating reusable instances that should be disposed with the component
- Working with conditional rendering where objects need cleanup
- Managing resources in reactive contexts

```tsx
import { Show, createSignal } from "solid-js"
import { Entity, autodispose } from "solid-three"
import { Mesh, BoxGeometry, MeshBasicMaterial } from "three"

function StrobeMesh() {
  const [visible, setVisible] = createSignal(true)

  // These will be disposed when ConditionalMesh unmounts
  const geometry = autodispose(new BoxGeometry())
  const material = autodispose(new MeshBasicMaterial())

  return (
    <Show when={visible()}>
      <Entity from={new Mesh(geometry, material)} />
    </Show>
  )
}
```

### Metadata Utilities

These utilities help manage metadata associated with THREE.js objects:

- **getMeta(object)**: Get metadata associated with a THREE.js object
- **hasMeta(object)**: Check if an object has metadata
- **meta**: WeakMap storing object metadata
- **$S3C**: Symbol used internally for component metadata

```tsx
import { getMeta, hasMeta } from "solid-three"

// Check if an object has solid-three metadata
if (hasMeta(mesh)) {
  const metadata = getMeta(mesh)
  console.log(metadata)
}
```

### Testing Utilities

Available from `"solid-three/testing"`:

- **TestCanvas**: A lightweight Canvas component for testing
- **test**: Testing utilities for solid-three components

```tsx
import { TestCanvas, test } from "solid-three/testing"

// Use TestCanvas in your tests for a minimal three.js environment
const MyTest = () => {
  return (
    <TestCanvas>
      <T.Mesh>
        <T.BoxGeometry />
        <T.MeshBasicMaterial />
      </T.Mesh>
    </TestCanvas>
  )
}
```

## Event Handling

`solid-three` provides a custom event system inspired by [`react-three-fiber`](https://github.com/pmndrs/react-three-fiber). Events are automatically handled through raycasting and support DOM-like propagation.

### Supported Events

- `onClick` - Fired when clicking on an object
- `onClickMissed` - Fired when a click doesn't hit any objects with onClick handlers
- `onContextMenu` - Fired when right-clicking on an object
- `onContextMenuMissed` - Fired when a right-click doesn't hit any objects with onContextMenu handlers
- `onDoubleClick` - Fired when double-clicking on an object
- `onDoubleClickMissed` - Fired when a double-click doesn't hit any objects with onDoubleClick handlers
- `onMouseDown` - Fired when mouse button is pressed
- `onMouseEnter` - Fired when mouse enters object
- `onMouseLeave` - Fired when mouse leaves object
- `onMouseMove` - Fired when mouse moves over object
- `onMouseUp` - Fired when mouse button is released
- `onPointerDown` - Fired when pointer is pressed
- `onPointerEnter` - Fired when pointer enters object
- `onPointerLeave` - Fired when pointer leaves object
- `onPointerMove` - Fired when pointer moves
- `onPointerUp` - Fired when pointer is released
- `onWheel` - Fired on mouse wheel events

### Event Object

Event handlers receive an event object with the following properties:

- **nativeEvent**: The original DOM event
- **stopped**: Whether propagation has been stopped (only for stoppable events)
- **stopPropagation**: Method to stop event propagation (only for stoppable events)

<details>
<summary>Typescript Interface</summary>

```tsx
interface Event<T> {
  nativeEvent: T
  stopped?: boolean
  stopPropagation?: () => void
}
```

</details>

### Event Propagation

solid-three implements a dual propagation system for events:

1. **Raycast Propagation (3D Space)**

   - When you click, solid-three casts a ray from the camera through your mouse position into the 3D scene. This ray may intersect multiple objects.
   - Events are processed for each intersected object in order from closest to farthest from the camera.
   - If an object calls `stopPropagation()`, objects further along the ray won't receive the event.

2. **Tree Propagation (Scene Graph)**
   - After an object handles an event, it bubbles up through the scene graph hierarchy (child → parent).
   - If `stopPropagation()` is called, parent objects won't receive the event.
   - If no object calls `stopPropagation()`, the event finally bubbles to the `<Canvas/>` component itself. This allows you to handle events at the canvas level, such as detecting clicks on empty space.

```tsx
const EventPropagation = () => {
  // Example showing all propagation types
  return (
    <Canvas onClick={() => console.log("4. Canvas clicked (canvas propagation)")}>
      <T.Group onClick={() => console.log("3. Group clicked (tree propagation)")}>
        <T.Mesh
          position={[0, 0, 0]}
          onClick={() => console.log("2. Back mesh clicked (raycast propagation)")}
        >
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshBasicMaterial color="blue" />
        </T.Mesh>

        <T.Mesh
          position={[0, 0, 2]} // In front
          onClick={e => {
            console.log("1. Front mesh clicked (raycast propagation)")
            e.stopPropagation() // Stops ALL propagation (raycast, tree, and canvas)
          }}
        >
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshBasicMaterial color="red" />
        </T.Mesh>
      </T.Group>
    </Canvas>
  )
}
```

In this example, clicking the overlapping area would normally trigger events in this order:

1. Front mesh (closest to camera)
2. Back mesh (further from camera)
3. Group (parent in tree)
4. Canvas (root container)

But with `stopPropagation()`, only the front mesh receives the event.

### Stoppable vs Non-Stoppable Events

Not all events in solid-three can be stopped with `stopPropagation()`. This design choice aligns with DOM behavior and ensures predictable event handling.

**Non-stoppable events:**

- `onClickMissed`, `onDoubleClickMissed`, `onContextMenuMissed` - [Missed Events](#missed-events) always fire for all registered handlers
- `onMouseEnter`, `onPointerEnter` - Enter events always fire [Hover Events](#hover-events-entermoveleave)
- `onMouseLeave`, `onPointerLeave` - Leave events always fire [Hover Events](#hover-events-entermoveleave)

**Stoppable events:**

- All other events (`onClick`, `onMouseMove`, `onPointerMove`, `onMouseDown`, etc.) can be stopped with `stopPropagation()`

### Missed Events

The "missed" events (`onClickMissed`, `onDoubleClickMissed`, `onContextMenuMissed`) fire when an object has registered a missed event handler and the click/interaction didn't hit the object or any of its descendants.

**When missed events fire:**

1. **Click outside object**: The click didn't intersect with the object or any of its descendants
2. **Blocked by stopPropagation**: Another object called `stopPropagation()` preventing the event from reaching this object

**Clicking outside the mesh**

```tsx
const ClickOutside = () => {
  return (
    <Canvas>
      <T.Mesh onClickMissed={() => console.log("Missed - clicked outside this mesh")}>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshBasicMaterial color="blue" />
      </T.Mesh>
    </Canvas>
  )
}
```

**Blocked by stopPropagation**

```tsx
const TreePropagation = () => {
  return (
    <Canvas>
      <T.Group onClickMissed={() => console.log("Group missed - child stopped propagation")}>
        <T.Mesh
          onClick={e => {
            e.stopPropagation()
            console.log("Child clicked")
          }}
        >
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshBasicMaterial color="red" />
        </T.Mesh>
      </T.Group>
    </Canvas>
  )
}
```

```tsx
const RayPropagation = () => {
  return (
    <Canvas defaultCamera={{ position: [0, 0, 5] }}>
      <T.Mesh
        name="front mesh"
        position={[0, 0, 2]}
        onClick={e => {
          e.stopPropagation()
          console.log("Front mesh clicked")
        }}
      >
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshBasicMaterial color="yellow" />
      </T.Mesh>
      <T.Mesh
        name="back mesh"
        position={[0, 0, 0]}
        onClickMissed={() => console.log("Back mesh missed - front mesh blocked it")}
      >
        <T.BoxGeometry args={[1, 1, 1]} />
        <T.MeshBasicMaterial color="green" />
      </T.Mesh>
    </Canvas>
  )
}
```

This is useful for:

- Deselecting objects when clicking outside them
- Creating UI layers where front objects can block interactions with objects behind
- Handling complex interaction patterns where parent containers need to know when their children intercepted events

### Hover Events (Enter/Move/Leave)

solid-three handles hover events (`onMouseEnter`, `onMouseMove`, `onMouseLeave`, `onPointerEnter`, `onPointerMove`, `onPointerLeave`) with a specific scheduling approach:

**Event Scheduling:**

1. **Enter Phase**: All enter events are processed first for newly hovered objects
2. **Move Phase**: All move events are processed for objects under the pointer
3. **Leave Phase**: All leave events are processed for objects no longer under the pointer

This ensures predictable event ordering and aligns with standard DOM behavior where enter/leave events have clear boundaries.

<details>
<summary>Differences from react-three-fiber</summary>

solid-three's hover event handling differs from react-three-fiber in several key ways:

**1. Event Order:**

- **solid-three**: Processes all enter events first, then move events, then leave events (DOM-like behavior)
- **react-three-fiber**: Intertwines enter/move/leave events as they occur during traversal

**2. Propagation:**

- **solid-three**:
  - Move events can be stopped with `stopPropagation()`
  - Enter/Leave events always fire and cannot be stopped (DOM-like behavior)
- **react-three-fiber**: All hover events can be stopped with `stopPropagation()`

**3. Parent-Child Behavior:**

- **solid-three**: When moving from child to parent, only the child receives a leave event (DOM-like behavior)
- **react-three-fiber**: When moving from child to parent, the parent receives both leave and immediate re-enter events
</details>

### Controlling Raycasting with raycastable

The `raycastable` prop controls whether an Object3D can be targeted by raycasting:

- **raycastable** (`boolean`): When set to `false`, the object will not be hit by rays, but can still receive events through propagation from its descendants. Default is `true`.

```tsx
const RaycastableMesh = () => {
  return (
    <T.Mesh name="parent" raycastable={false} onClick={() => console.log("Child clicked!")}>
      <T.Mesh name="child" />
    </T.Mesh>
  )
}
```

## Performance Optimization

`solid-three` provides several mechanisms to optimize rendering performance:

### Automatic Resource Disposal

`solid-three` automatically manages memory by disposing of three.js objects when components are removed from the scene:

```tsx
const AutoDisposedGeometry = () => {
  return (
    <T.Mesh>
      {/* Geometry and material are automatically disposed when component unmounts */}
      <T.BoxGeometry args={[1, 1, 1]} />
      <T.MeshBasicMaterial color="red" />
    </T.Mesh>
  )
}
```

**Manual disposal:** If you need custom disposal behavior, you can handle cleanup manually:

```tsx
const Boxes = () => {
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial()

  onCleanup(() => {
    geometry.dispose()
    material.dispose()
  })

  return <Index each={new Array(10)}>{() => <Mesh args={[geometry, material]} />}</Index>
}
```

or use the [`autodispose()`-utility](#autodispose)

```tsx
const Boxes = () => {
  const geometry = autodispose(new BoxGeometry(1, 1, 1))
  const material = autodispose(new MeshBasicMaterial())

  return <Index each={new Array(10)}>{() => <Mesh args={[geometry, material]} />}</Index>
}
```

### Frame Loop Control

Use the `frameloop` prop on Canvas to control when rendering occurs:

```tsx
// Only render on demand (when scene changes)
<Canvas frameloop="demand">
  {/* Your scene */}
</Canvas>

// Never render automatically (manual control)
<Canvas frameloop="never">
  {/* Your scene */}
</Canvas>

// Always render (default)
<Canvas frameloop="always">
  {/* Your scene */}
</Canvas>
```

**Demand Rendering System:**

When `frameloop="demand"` is set, `solid-three` automatically requests renders when:

- Component props change
- Scene graph structure changes (components added/removed)
- Object transformations are updated (position, rotation, scale)
- Material properties change

This provides optimal performance by only rendering when necessary while maintaining reactivity.

### Manual Rendering

When using `frameloop="demand"` or `"never"`, you can manually trigger renders:

```tsx
const ManualRender = () => {
  const three = useThree()

  // Immediate render
  const forceRender = () => three.render()

  // Request render on next frame
  const updateScene = () => three.requestRender()

  return <T.Mesh onClick={updateScene} />
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTION.md) for details on how to get started.

## License

`solid-three` is [MIT licensed](LICENSE).
