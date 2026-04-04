import { createSignal } from 'solid-js'
import { Canvas } from 'solid-three'

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
          <button onClick={() => setCount(c => c + 1)} style={{ marginRight: '8px' }}>
            Increment
          </button>
          <button onClick={() => setRotate(r => !r)}>
            Toggle Rotation
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas>
          <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          <T.Mesh
            rotation-x={count() * 0.1}
            rotation-y={count() * 0.1}
          >
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="#4488ff" />
          </T.Mesh>

          <T.Mesh position={[2, 0, 0]}>
            <T.SphereGeometry args={[0.5, 32, 32]} />
            <T.MeshStandardMaterial 
              color="#ff8844"
              emissive={rotate() ? "#ff4400" : "#000000"}
            />
          </T.Mesh>

          <T.Group rotation-z={Math.PI / 4}>
            <T.Mesh position={[-2, 0, 0]}>
              <T.TorusGeometry args={[0.4, 0.15, 16, 32]} />
              <T.MeshStandardMaterial color="#44ff88" />
            </T.Mesh>
          </T.Group>

          <T.AmbientLight intensity={0.5} />
          <T.DirectionalLight position={[5, 5, 5]} intensity={1} />

          <T.Group
            rotation-y={count() * 0.05}
          >
            <T.Mesh position={[0, 1.5, 0]}>
              <T.ConeGeometry args={[0.3, 0.8, 4]} />
              <T.MeshStandardMaterial color="#ff44ff" />
            </T.Mesh>
          </T.Group>
        </Canvas>
      </div>
    </div>
  )
}
