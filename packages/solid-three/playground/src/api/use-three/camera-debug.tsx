import { Portal } from "@solidjs/web"
import * as THREE from "three"
import { Canvas, createT, useFrame, useThree } from "../../../../src/index.ts"

declare global {
  interface Window {
    __debugInfo: any
    __renderCalls: any[]
    __rendererRenderCalls: any[]
  }
}

const T = createT(THREE)

let container: HTMLDivElement
let frameCount = 0

function DebugOverlay() {
  const three = useThree()

  useFrame(() => {
    frameCount++
    const contextCam = three.camera as THREE.PerspectiveCamera
    
    if (!window.__renderCalls) {
      window.__renderCalls = []
    }
    
    window.__renderCalls.push({
      frame: frameCount,
      source: "useFrame",
      cameraUuid: (contextCam as any).uuid,
      aspect: contextCam.aspect,
      timestamp: performance.now(),
    })
    
    if (frameCount === 1) {
      const canvas = document.querySelector("canvas")
      const rect = canvas?.getBoundingClientRect()
      
      window.__debugInfo = {
        canvasWidth: rect?.width || 0,
        canvasHeight: rect?.height || 0,
        contextCameraAspect: contextCam.aspect,
        contextCameraUuid: (contextCam as any).uuid,
        frameCount,
      }
      
      console.log("=== CAMERA DEBUG INFO ===")
      console.log("Canvas size:", rect?.width, "x", rect?.height)
      console.log("Context camera UUID:", (contextCam as any).uuid)
      console.log("Context camera aspect:", contextCam.aspect)
      console.log("=========================")
    }
  })

  const originalRender = three.gl.render.bind(three.gl)
  three.gl.render = function(scene: THREE.Scene, camera: THREE.Camera) {
    const cam = camera as THREE.PerspectiveCamera
    if (!window.__rendererRenderCalls) {
      window.__rendererRenderCalls = []
    }
    window.__rendererRenderCalls.push({
      frame: frameCount,
      source: "renderer.render",
      cameraUuid: (cam as any).uuid,
      aspect: cam.aspect,
      timestamp: performance.now(),
    })
    
    if (window.__rendererRenderCalls.length <= 3) {
      console.log(`[renderer.render #${frameCount}] camera UUID: ${(cam as any).uuid}, aspect: ${cam.aspect}`)
    }
    
    return originalRender(scene, camera)
  }

  return (
    <Portal mount={container!}>
      <details open style={{ position: "absolute", top: "0px", left: "300px", background: "white", padding: "10px", "z-index": 1000 }}>
        <summary>
          <h3>Camera Debug Info</h3>
        </summary>
        <div>
          <h3>useThree Context</h3>
          <ul>
            <li>
              <strong>Camera Type:</strong> {three.camera.type}
            </li>
            <li>
              <strong>Canvas Size:</strong> {three.bounds.width}×{three.bounds.height}
            </li>
            <li>
              <strong>Camera Aspect:</strong> {(three.camera as THREE.PerspectiveCamera).aspect}
            </li>
            <li>
              <strong>Renderer:</strong> {three.gl.constructor.name}
            </li>
            <li>
              <strong>Scene Children:</strong> {three.scene.children.length}
            </li>
            <li>
              <strong>Clock Time:</strong> {three.clock.elapsedTime.toFixed(2)}s
            </li>
          </ul>
        </div>
      </details>
    </Portal>
  )
}

export default function () {
  return (
    <div ref={container!} style={{ width: "800px", height: "600px" }}>
      <Canvas defaultCamera={{ position: [0, 0, 5] }} style={{ width: "100%", height: "100%" }}>
        <T.AmbientLight intensity={0.5} />
        <T.PointLight position={[10, 10, 10]} />

        <T.Mesh>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshStandardMaterial color="red" />
        </T.Mesh>

        <DebugOverlay />
      </Canvas>
    </div>
  )
}
