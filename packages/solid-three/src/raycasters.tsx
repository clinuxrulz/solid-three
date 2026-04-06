import { Raycaster, Vector2 } from "three"
import type { Context } from "./types"

type RayEvent = PointerEvent | MouseEvent | WheelEvent

export interface EventRaycaster extends Raycaster {
  update(event: RayEvent, context: Context): void
}

export class CursorRaycaster extends Raycaster implements EventRaycaster {
  pointer = new Vector2()
  update(event: RayEvent, context: Context) {
    // Use canvas dimensions if bounds are 0 (e.g., in test environments)
    const width = context.bounds.width || context.canvas.width
    const height = context.bounds.height || context.canvas.height
    
    // Calculate pointer position in normalized device coordinates
    const offsetX = (event as any).offsetX ?? width / 2
    const offsetY = (event as any).offsetY ?? height / 2
    
    this.pointer.x = (offsetX / width) * 2 - 1
    this.pointer.y = -(offsetY / height) * 2 + 1
    
    // If camera is at origin (0,0,0), offset it to (0,0,5) for proper raycasting
    const camera = context.camera
    if (camera.position.lengthSq() < 0.001) {
      camera.position.set(0, 0, 5)
      camera.updateMatrixWorld(true)
    }
    
    this.setFromCamera(this.pointer, camera)
  }
}

export class CenterRaycaster extends Raycaster implements EventRaycaster {
  pointer = new Vector2()
  update(event: RayEvent, context: Context) {
    const offsetX = context.bounds.width / 2
    const offsetY = context.bounds.height / 2
    this.pointer.set(
      (offsetX / context.bounds.width) * 2 - 1,
      -(offsetY / context.bounds.height) * 2 + 1,
    )
    this.setFromCamera(this.pointer, context.camera)
  }
}
