import { test, expect } from "@playwright/test"

test("camera aspect ratio is correct in browser", async ({ page }) => {
  await page.goto("http://localhost:3000")

  await page.waitForTimeout(2000)

  const info = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const rect = canvas?.getBoundingClientRect()
    return {
      canvasWidth: rect?.width ?? 0,
      canvasHeight: rect?.height ?? 0,
    }
  })

  console.log(`Canvas size: ${info.canvasWidth} x ${info.canvasHeight}`)
  const expectedAspect = info.canvasWidth / info.canvasHeight
  console.log(`Expected aspect: ${expectedAspect}`)

  expect(info.canvasWidth).toBeGreaterThan(0)
  expect(info.canvasHeight).toBeGreaterThan(0)
  expect(expectedAspect).toBeCloseTo(1280 / 590, 0)
})

test("camera.aspect is actually updated", async ({ page }) => {
  await page.goto("http://localhost:3000")

  await page.waitForTimeout(2000)

  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const rect = canvas?.getBoundingClientRect()
    return {
      canvasWidth: rect?.width ?? 0,
      canvasHeight: rect?.height ?? 0,
    }
  })

  const cameraInfo = await page.evaluate(() => {
    const debug = document.getElementById('camera-debug')
    return {
      aspect: debug?.getAttribute('data-aspect'),
      pos: debug?.getAttribute('data-pos'),
    }
  })

  console.log(`Canvas: ${canvasInfo.canvasWidth}x${canvasInfo.canvasHeight}`)
  console.log(`Camera aspect: ${cameraInfo.aspect}`)
  console.log(`Camera pos: ${cameraInfo.pos}`)

  // The camera aspect should match the canvas aspect (within reasonable precision)
  const expectedAspect = canvasInfo.canvasWidth / canvasInfo.canvasHeight
  expect(parseFloat(cameraInfo.aspect || '0')).toBeCloseTo(expectedAspect, 1)
})
