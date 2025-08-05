import { createMemo, onCleanup, type Ref } from "solid-js"
import type { Event } from "three"
import { OrbitControls as ThreeOrbitControls } from "three-stdlib"
import { useThree, type S3 } from "../../src/index.ts"
import { manageProps } from "../../src/props.ts"
import { every, whenEffect } from "../../src/utils/conditionals.ts"
import { processProps } from "./process-props.ts"

export type OrbitControlsProps = S3.ClassProps<typeof ThreeOrbitControls> & {
  ref?: Ref<ThreeOrbitControls>
  camera?: S3.CameraType
  domElement?: HTMLElement
  enableDamping?: boolean
  onChange?: (e?: Event<"change", ThreeOrbitControls>) => void
  onEnd?: (e?: Event<"end", ThreeOrbitControls>) => void
  onStart?: (e?: Event<"start", ThreeOrbitControls>) => void
  regress?: boolean
  target?: S3.Vector3
  keyEvents?: boolean | HTMLElement
}

export function OrbitControls(props: OrbitControlsProps) {
  const [config, rest] = processProps(
    props,
    {
      enableDamping: true,
      keyEvents: false,
    },
    [
      "camera",
      "regress",
      "domElement",
      "keyEvents",
      "onChange",
      "onStart",
      "onEnd",
      "object",
      "dispose",
    ],
  )
  const three = useThree()
  const controls = createMemo(() => new ThreeOrbitControls(config.camera ?? three.camera))

  whenEffect(controls, controls => {
    controls.connect(props.domElement ?? three.gl.domElement)
    onCleanup(() => controls.dispose())
  })

  whenEffect(
    every(controls, () => config.onStart),
    ([controls, callback]) => {
      controls.addEventListener("start", callback)
      onCleanup(() => controls.removeEventListener("start", callback))
    },
  )
  whenEffect(
    every(controls, () => config.onChange),
    ([controls, callback]) => {
      controls.addEventListener("change", callback)
      onCleanup(() => controls.removeEventListener("change", callback))
    },
  )
  whenEffect(
    every(controls, () => config.onEnd),
    ([controls, callback]) => {
      controls.addEventListener("end", callback)
      onCleanup(() => controls.removeEventListener("end", callback))
    },
  )

  manageProps(controls, rest)

  return null!
}
