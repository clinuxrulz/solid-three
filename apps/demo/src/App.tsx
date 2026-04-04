import { createSignal } from 'solid-js'
import { Canvas, createT, useThree } from 'solid-three'
import * as THREE from 'three'

const T = createT(THREE)

function DebugScene() {
  const three = useThree()
  
  // Expose debug info to window
  const w = globalThis as any
  const updateDebug = () => {
    const scene = three.scene
    const mesh = scene?.children.find(c => c.type === 'Mesh') as THREE.Mesh | undefined
    const camera = three.camera as THREE.PerspectiveCamera
    
    console.log('[DebugScene] scene.children:', scene?.children.map(c => c.type))
    console.log('[DebugScene] scene.children count:', scene?.children.length)
    console.log('[DebugScene] three.camera:', camera?.type, camera?.position.toArray())
    console.log('[DebugScene] three.camera id:', (camera as any)?.id)
    
    w.__solidThreeDebug = {
      scene: scene ? scene.type : null,
      sceneChildren: scene ? scene.children.length : null,
      sceneChildrenTypes: scene ? scene.children.map(c => c.type) : null,
      camera: camera ? {
        type: camera.type,
        position: camera.position.toArray(),
        lookAt: camera.getWorldDirection(new THREE.Vector3()).toArray(),
      } : null,
      mesh: mesh ? {
        type: mesh.type,
        position: mesh.position.toArray(),
        geometry: mesh.geometry?.type,
        geometryLoaded: !!mesh.geometry,
        material: mesh.material ? (mesh.material as THREE.Material).type : null,
        materialLoaded: !!mesh.material,
      } : null,
    }
  }
  updateDebug()
  setTimeout(updateDebug, 100)
  
  return null
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
          <DebugScene />
          <T.Color attach="background" args={["#1a1a2e"]} />
          <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          <T.Mesh>
            <T.BoxGeometry args={[1, 1, 1]} />
            <T.MeshStandardMaterial color="#4488ff" />
          </T.Mesh>

          <T.AmbientLight intensity={0.5} />
          <T.DirectionalLight position={[5, 5, 5]} intensity={1} />
        </Canvas>
      </div>
    </div>
  )
}
