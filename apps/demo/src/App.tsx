import { createSignal } from 'solid-js'
import { Canvas, createT, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'

const T = createT(THREE)

function RotatingCube(props: { rotate: boolean; size: number }) {
  const meshRef = { current: null as THREE.Mesh | null }
  
  useFrame((_, delta) => {
    if (meshRef.current && props.rotate) {
      meshRef.current.rotation.y += delta
      meshRef.current.rotation.x += delta * 0.5
    }
  })
  
  return (
    <T.Mesh ref={meshRef} scale={props.size}>
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
  const [size, setSize] = createSignal(1)
  const [rotate, setRotate] = createSignal(true)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', "flex-direction": 'column' }}>
      <div style={{ padding: '16px', "background-color": '#1a1a1a', color: 'white' }}>
        <h1 style={{ "font-size": '24px', "margin-bottom": '8px' }}>Solid Three Demo</h1>
        <p>Size: {size().toFixed(2)}x</p>
        <p>Rotation: {rotate() ? 'ON' : 'OFF'}</p>
        <div style={{ "margin-top": '8px', display: 'flex', "align-items": 'center', gap: '16px' }}>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1"
            value={size()} 
            onInput={(e) => setSize(parseFloat(e.currentTarget.value))}
            style={{ width: '200px' }}
          />
          <button onClick={() => setRotate(r => !r)}>
            Toggle Rotation
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas>
          <T.Color attach="background" args={["#1a1a2e"]} />
          <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          <RotatingCube rotate={rotate()} size={size()} />

          <T.AmbientLight intensity={0.5} />
          <T.DirectionalLight position={[5, 5, 5]} intensity={1} />
          
          <CameraDebug />
        </Canvas>
      </div>
    </div>
  )
}
