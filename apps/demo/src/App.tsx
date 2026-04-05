import { createSignal } from 'solid-js'
import { Canvas, createT, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'

const T = createT(THREE)

function RotatingCube() {
  const meshRef = { current: null as THREE.Mesh | null }
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta
      meshRef.current.rotation.x += delta * 0.5
    }
  })
  
  return (
    <T.Mesh ref={meshRef}>
      <T.BoxGeometry args={[1, 1, 1]} />
      <T.MeshStandardMaterial color="#4488ff" />
    </T.Mesh>
  )
}

function CameraDebug() {
  const { camera } = useThree()
  const [aspect, setAspect] = createSignal(0)
  const [pos, setPos] = createSignal('')
  
  useFrame(() => {
    setAspect(camera.aspect)
    setPos(`${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`)
  })
  
  return (
    <div id="camera-debug" data-aspect={aspect()} data-pos={pos()} />
  )
}

export function App() {
  const [count, setCount] = createSignal(0)
  const [rotate, setRotate] = createSignal(true)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', "flex-direction": 'column' }}>
      <div style={{ padding: '16px', "background-color": '#1a1a1a', color: 'white' }}>
        <h1 style={{ "font-size": '24px', "margin-bottom": '8px' }}>Solid Three Demo</h1>
        <p>Counter: {count()}</p>
        <p>Rotation: {rotate() ? 'ON' : 'OFF'}</p>
        <div style={{ "margin-top": '8px' }}>
          <button onClick={() => setCount(c => c + 1)} style={{ "margin-right": '8px' }}>
            Increment
          </button>
          <button onClick={() => setRotate(r => !r)}>
            Toggle Rotation
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas>
          <T.Color attach="background" args={["#1a1a2e"]} />
          <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          <RotatingCube />

          <T.AmbientLight intensity={0.5} />
          <T.DirectionalLight position={[5, 5, 5]} intensity={1} />
          
          <CameraDebug />
        </Canvas>
      </div>
    </div>
  )
}
