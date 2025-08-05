import { createSignal, type ParentProps } from "solid-js"
import * as THREE from "three"
import { T, useFrame } from "../src/index.ts"

function Box(
  props: ParentProps<{
    name: string
    position: THREE.Vector3
    stopPropagation?: boolean
    noClick?: boolean
  }>,
) {
  const mesh = new THREE.Mesh()
  const [hovered, setHovered] = createSignal(false)

  useFrame(() => {
    mesh.rotation.y += 0.01
  })

  return (
    <T.Primitive
      object={mesh}
      name={props.name}
      position={props.position}
      onClick={
        !props.noClick
          ? event => {
              console.debug("click", props.name)
              if (props.stopPropagation) {
                event.stopPropagation()
              }
            }
          : undefined
      }
      onClickMissed={event => {
        console.debug("click missed!", props.name, event)
      }}
      onContextMenu={event => {
        console.debug("contextmenu", props.name, event)
      }}
      onContextMenuMissed={event => {
        console.debug("contextmenu missed", props.name, event)
      }}
      onPointerEnter={event => {
        console.debug("enter", props.name, event)
        setHovered(true)
      }}
      onPointerLeave={event => {
        console.debug("leave", props.name, event)
        setHovered(false)
      }}
      onPointerMove={event => {
        console.debug("move", props.name, event)
        if (props.stopPropagation) {
          event.stopPropagation()
        }
      }}
    >
      <T.BoxGeometry />
      <T.MeshBasicMaterial color={hovered() ? "green" : "red"} />
      {props.children}
    </T.Primitive>
  )
}

export function Basic() {
  return (
    <>
      <T.AmbientLight color={[0.2, 0.2, 0.2]} />
      <T.PointLight intensity={1.2} decay={1} position={[2, 2, 5]} rotation={[0, Math.PI / 3, 0]} />
      <Box name="1" position={new THREE.Vector3(0, 0, 0)}>
        <Box name="2" position={new THREE.Vector3(2, 0, 0)}>
          <Box name="3" position={new THREE.Vector3(2, 0, 0)} stopPropagation />
        </Box>
      </Box>
    </>
  )
}