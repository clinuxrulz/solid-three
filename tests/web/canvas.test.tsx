// Test Canvas mounting and unmounting
import * as THREE from "three"
import { describe, expect, it } from "vitest"
import { createT } from "../../src/index.ts"
import { TestCanvas, test as createTestContext } from "../../src/testing/index.tsx"
import type { Context } from "../../src/types.ts"

const T = createT(THREE)

describe("web Canvas", () => {
  it("should correctly mount", async () => {
    let context: Context | undefined

    const testContext = createTestContext(() => (
      <TestCanvas
        ref={ctx => {
          context = ctx
        }}
      >
        <T.Group />
      </TestCanvas>
    ))

    expect(context).toBeDefined()
    expect(context?.scene).toBeDefined()
    testContext.unmount()
  })

  it("should forward ref", async () => {
    let ref: Context | undefined

    createTestContext(() => (
      <TestCanvas
        ref={r => {
          ref = r
        }}
      >
        <T.Group />
      </TestCanvas>
    ))

    expect(ref).toBeDefined()
  })

  it("should correctly unmount", async () => {
    const testContext = createTestContext(() => (
      <TestCanvas>
        <T.Group />
      </TestCanvas>
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
