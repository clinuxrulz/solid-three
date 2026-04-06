// Test Canvas mounting and unmounting
import * as THREE from "three"
import { describe, expect, it } from "vitest"
import { createT } from "../../src/index.ts"
import { test as createTestContext } from "../../src/testing/index.tsx"
import type { Context } from "../../src/types.ts"

const T = createT(THREE)

describe("web Canvas", () => {
  it("should correctly mount", async () => {
    const testContext = createTestContext(() => (
      <T.Group />
    ))

    expect(testContext).toBeDefined()
    expect(testContext.scene).toBeDefined()
    testContext.unmount()
  })

  it("should forward ref", async () => {
    let ref: Context | undefined

    const testContext = createTestContext(() => (
      <T.Group />
    ))
    
    ref = testContext

    expect(ref).toBeDefined()
  })

  it("should correctly unmount", async () => {
    const testContext = createTestContext(() => (
      <T.Group />
    ))

    expect(() => testContext.unmount()).not.toThrow()
  })

  // it("plays nice with react SSR", async () => {
  //   const useLayoutEffect = jest.spyOn(React, "useLayoutEffect");

  //   await act(async () => {
  //     render(
  //       <Canvas>
  //         <T.Group />
  //       </Canvas>,
  //     );
  //   });

  //   expect(useLayoutEffect).not.toHaveBeenCalled();
  // });
})
