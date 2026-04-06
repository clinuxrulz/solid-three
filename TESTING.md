## Testing

`solid-three` provides a comprehensive testing framework for unit testing 3D components. The testing utilities are available as a separate export.

### Setup

This project uses **Vitest** with custom polyfills for testing solid-three in a Node.js environment. The test infrastructure is configured in:
- `vitest.config.ts` - Test configuration with Solid plugin
- `vitest.setup.ts` - Global polyfills for ResizeObserver, WebGL, EventTarget, and requestAnimationFrame

#### Solid 2.0 Migration Notes

- Tests use the native `test()` function from `solid-three/testing` instead of `@solidjs/testing-library`
- The testing framework provides its own canvas and WebGL mocks
- All test files must use `.test.tsx` extension (`.spec.ts` files are reserved for Playwright E2E tests)

### Basic Testing

```tsx
import { test } from "solid-three/testing"
import { createT } from "solid-three"

const T = createT(THREE)

describe("mesh rendering", () => {
  it("renders a mesh", () => {
    const { canvas, scene, unmount, waitTillNextFrame } = test(() => (
      <T.Mesh>
        <T.BoxGeometry />
        <T.MeshBasicMaterial />
      </T.Mesh>
    ))

    expect(scene.children).toHaveLength(1)
    expect(scene.children[0]).toBeDefined()

    // Clean up
    unmount()
  })
})
```

### Using TestCanvas for JSX-based Testing

```tsx
import { TestCanvas } from "solid-three/testing"

it("renders with TestCanvas", () => {
  let context

  test(() => (
    <TestCanvas 
      ref={ctx => { context = ctx }}
      camera={{ position: [0, 0, 5] }}
    >
      <T.Mesh>
        <T.BoxGeometry />
        <T.MeshBasicMaterial />
      </T.Mesh>
    </TestCanvas>
  ))

  expect(context.scene).toBeDefined()
  expect(context.gl).toBeDefined()
})
```

### Mock WebGL Context

The testing framework includes a mock `WebGL2RenderingContext` for environments without GPU support:

```tsx
import { WebGL2RenderingContext } from "solid-three/testing"

// Automatically used when real WebGL is unavailable
// Provides all WebGL methods as no-ops for testing
```

### Testing Events

For Solid 2.0, use the `dispatchEvent` method directly on the canvas:

```tsx
import { test } from "solid-three/testing"

it("handles pointer events", () => {
  let clicked = false

  const { canvas } = test(() => (
    <T.Mesh onClick={() => (clicked = true)}>
      <T.BoxGeometry />
      <T.MeshBasicMaterial />
    </T.Mesh>
  ))

  // Create a mock click event on the canvas
  const clickEvent = new MouseEvent("click")
  Object.defineProperty(clickEvent, "offsetX", { get: () => 640 })
  Object.defineProperty(clickEvent, "offsetY", { get: () => 400 })

  canvas.dispatchEvent(clickEvent)

  expect(clicked).toBe(true)
})
```

### Testing Hooks

```tsx
import { test } from "solid-three/testing"
import { useThree } from "solid-three"

it("useThree returns context", () => {
  let context

  const TestComponent = () => {
    context = useThree()
    return (
      <T.Mesh>
        <T.BoxGeometry />
        <T.MeshBasicMaterial />
      </T.Mesh>
    )
  }

  const { unmount } = test(() => <TestComponent />)

  expect(context.camera).toBeDefined()
  expect(context.gl).toBeDefined()
  expect(context.scene).toBeDefined()

  unmount()
})
```

### Testing Animations

```tsx
import { test } from "solid-three/testing"
import { useFrame } from "solid-three"

it("animates on frame", async () => {
  let rotation = 0

  const AnimatedBox = () => {
    useFrame(() => {
      rotation += 0.01
    })

    return <T.Mesh />
  }

  const { waitTillNextFrame } = test(() => <AnimatedBox />, { frameloop: "always" })

  // Wait for animation frame using test utility
  await waitTillNextFrame()

  expect(rotation).toBeGreaterThan(0)
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/core/renderer.test.tsx

# Run in watch mode
pnpm test --watch

# Run with UI
pnpm test --ui
```

### Known Issues and Limitations

- The test environment runs in Node.js without a real GPU, so all WebGL calls are mocked
- ResizeObserver is polyfilled and may not behave identically to the browser implementation
- Some tests that depend on specific timing or browser APIs may need adjustments for Solid 2.0

