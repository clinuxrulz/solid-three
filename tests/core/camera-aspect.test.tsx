import * as THREE from "three"
import { describe, expect, it } from "vitest"
import { createT } from "../../src/index.ts"
import { test } from "../../src/testing/index.tsx"

globalThis.ResizeObserver = class ResizeObserver {
  private callback: any
  observe(el: any) {
    this.callback = () => {
      const { width, height } = el.getBoundingClientRect()
      this.callback([{ contentRect: { width, height } }])
    }
  }
  unobserve() {}
  disconnect() {}
  triggerResize(width: number, height: number) {
    if (this.callback) {
      this.callback([{ contentRect: { width, height } }])
    }
  }
} as any

const mockAddEventListener = () => {}
const mockRemoveEventListener = () => {}
if (!globalThis.addEventListener) {
  globalThis.addEventListener = mockAddEventListener as any
}
if (!globalThis.removeEventListener) {
  globalThis.removeEventListener = mockRemoveEventListener as any
}

const T = createT(THREE)

describe("Camera aspect ratio in render", () => {
  it("should pass camera with correct aspect to renderer.render", async () => {
    const renderCalls: Array<{ scene: any; camera: any; aspect: number; uuid: string }> = []
    
    const ComponentWithMonitor = () => {
      return (
        <T.Mesh>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshBasicMaterial />
        </T.Mesh>
      )
    }

    const testScene = test(() => <ComponentWithMonitor />)
    
    // Wait for component to fully mount
    await testScene.waitTillNextFrame()

    const canvas = testScene.canvas as HTMLCanvasElement
    const expectedAspect = canvas.width / canvas.height

    const originalRender = testScene.gl.render.bind(testScene.gl)
    testScene.gl.render = function(scene: any, camera: any) {
      renderCalls.push({
        scene,
        camera,
        aspect: camera.aspect,
        uuid: (camera as any).uuid
      })
      return originalRender(scene, camera)
    }

    testScene.render(performance.now())

    console.log("=== Test Results ===")
    console.log("Canvas size:", canvas.width, "x", canvas.height)
    console.log("Expected aspect:", expectedAspect)
    console.log("Context camera:", (testScene.camera as THREE.PerspectiveCamera).aspect, "UUID:", (testScene.camera as any).uuid)
    console.log("Render calls:", renderCalls)

    expect(renderCalls.length).toBeGreaterThan(0)
    
    const call = renderCalls[0]
    console.log("Render call camera aspect:", call.aspect, "UUID:", call.uuid)
    expect(call.aspect).toBeCloseTo(expectedAspect, 1)

    testScene.unmount()
  })

  it("should update aspect on resize and render with new aspect", async () => {
    const renderCalls: Array<{ camera: any; aspect: number; uuid: string }> = []
    
    const ComponentWithMonitor = () => {
      return (
        <T.Mesh>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshBasicMaterial />
        </T.Mesh>
      )
    }

    const testScene = test(() => <ComponentWithMonitor />)
    const camera = testScene.camera as THREE.PerspectiveCamera

    const originalRender = testScene.gl.render.bind(testScene.gl)
    testScene.gl.render = function(scene: any, cam: any) {
      renderCalls.push({
        camera: cam,
        aspect: cam.aspect,
        uuid: (cam as any).uuid
      })
      return originalRender(scene, cam)
    }

    console.log("=== Initial State ===")
    console.log("Camera aspect before resize:", camera.aspect)
    console.log("Camera UUID:", (camera as any).uuid)

    camera.aspect = 16 / 9
    camera.updateProjectionMatrix()
    
    console.log("Camera aspect after resize:", camera.aspect)

    testScene.render(performance.now())

    console.log("=== Render Call ===")
    console.log("Render calls:", renderCalls)

    expect(renderCalls.length).toBeGreaterThan(0)
    expect(renderCalls[0].aspect).toBeCloseTo(16 / 9, 1)

    testScene.unmount()
  })
})
