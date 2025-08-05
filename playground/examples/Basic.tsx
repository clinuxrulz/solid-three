import { createContext, createSignal, Show, useContext, type ParentProps, type Ref } from "solid-js"
import * as THREE from "three"
import { Canvas, T, useFrame } from "../../src/index.ts"

const HoverContext = createContext<{
  hovered: () => string | null
  setHovered: (name: string | null) => void
}>()

function useHover() {
  const context = useContext(HoverContext)
  if (!context) throw new Error("useHover must be used within HoverProvider")
  return context
}

function CelestialBody(
  props: ParentProps<{
    ref?: Ref<THREE.Object3D>
    name: string
    radius: number
    color: string
    emissive?: string
    position?: [number, number, number]
    rotation?: [number, number, number]
  }>,
) {
  const [hovered, setHovered] = createSignal(false)

  return (
    <T.Mesh
      ref={props.ref}
      position={props.position || [0, 0, 0]}
      rotation={props.rotation || [0, 0, 0]}
      onPointerEnter={e => {
        setHovered(true)
      }}
      onPointerLeave={e => {
        setHovered(false)
      }}
    >
      <T.SphereGeometry args={[props.radius, 32, 32]} />
      <T.MeshBasicMaterial color={props.color} />
      {props.children}

      {/* Outline sphere - only visible when hovered */}
      <Show when={hovered()}>
        <T.Mesh>
          <T.SphereGeometry args={[props.radius + 0.1, 32, 32]} />
          <T.MeshBasicMaterial color="red" side={THREE.BackSide} />
        </T.Mesh>
      </Show>
    </T.Mesh>
  )
}

export function Basic() {
  const [hovered, setHovered] = createSignal<string | null>(null)
  let earthRef: THREE.Object3D = null!
  let moonRef: THREE.Object3D = null!

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: new THREE.Vector3(0, 0, 15) }}
      onClick={event => console.debug("canvas clicked", event)}
      onClickMissed={event => console.debug("canvas click missed", event)}
      onPointerLeave={event => console.debug("canvas pointer leave", event)}
      onPointerEnter={event => console.debug("canvas pointer enter", event)}
    >
      {(() => {
        useFrame(state => {
          // Earth orbits around sun in an ellipse
          const time = state.clock.getElapsedTime()
          const a = 4 // semi-major axis
          const b = 3 // semi-minor axis
          earthRef.position.x = a * Math.cos(time * 0.125)
          earthRef.position.z = b * Math.sin(time * 0.125)

          // Moon orbits around earth
          moonRef.position.x = 1.5 * Math.cos(time * 0.5)
          moonRef.position.z = 1.5 * Math.sin(time * 0.5)
        })
        return null!
      })()}
      <HoverContext.Provider value={{ hovered, setHovered }}>
        <T.AmbientLight intensity={0.2} />
        <T.PointLight position={[0, 0, 0]} intensity={2} />

        {/* Sun */}
        <CelestialBody
          name="sun"
          radius={1.5}
          color="#FDB813"
          emissive="#FDB813"
          rotation={[0.5, 0.5, 0.5]}
        >
          {/* Earth system */}
          <CelestialBody
            ref={earthRef!}
            name="earth"
            radius={0.5}
            color="#1E90FF"
            emissive="#4169E1"
          >
            {/* Moon */}
            <CelestialBody
              ref={moonRef!}
              name="moon"
              radius={0.2}
              color="#C0C0C0"
              emissive="#FFFFFF"
            />
          </CelestialBody>
        </CelestialBody>
      </HoverContext.Provider>
    </Canvas>
  )
}
