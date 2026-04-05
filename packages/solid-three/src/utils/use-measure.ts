import { createEffect, createMemo, createRoot, createSignal, merge, onCleanup, untrack } from "solid-js"
import { debounce as createDebounce } from "./debounce.ts"

function resolve<T>(value: (() => T) | T): T {
  return typeof value === "function" ? (value as () => T)() : value
}

function when<TValue, TResult>(
  accessor: (() => TValue) | TValue,
  callback: (value: NonNullable<TValue>) => TResult,
  fallback?: () => TResult,
): () => TResult {
  return () => {
    const value = resolve(accessor)
    return value ? callback(value as NonNullable<TValue>) : fallback?.()!
  }
}

declare type ResizeObserverCallback = (entries: any[], observer: ResizeObserver) => void
declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback)
  observe(target: Element, options?: any): void
  unobserve(target: Element): void
  disconnect(): void
  static toString(): string
}

export interface Measure {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
}

type HTMLOrSVGElement = HTMLElement | SVGElement

export type UseMeasureOptions = {
  debounce?: number | { scroll: number; resize: number }
  scroll?: boolean
  polyfill?: { new (cb: ResizeObserverCallback): ResizeObserver }
  offsetSize?: boolean
}

export function useMeasure(options?: UseMeasureOptions) {
  const config = merge(
    {
      debounce: 0,
      scroll: false,
      offsetSize: false,
    },
    options,
  )

  const ResizeObserver =
    config.polyfill ||
    (typeof globalThis === "undefined"
      ? class ResizeObserver {}
      : (globalThis as any).ResizeObserver)

  if (!ResizeObserver) {
    throw new Error(
      "This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills",
    )
  }

  const [element, setElement] = createSignal<HTMLOrSVGElement | null>(null)
  const [bounds, setBounds] = createSignal<Measure>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
  })
  const scrollContainers = createMemo(() => findScrollContainers(element()))
  let lastBounds: Measure | undefined

  const getDebounce = (type: "scroll" | "resize") => {
    const debounce = config.debounce
      ? typeof config.debounce === "number"
        ? config.debounce
        : config.debounce[type]
      : null
    if (debounce) return createDebounce(forceRefresh, debounce)
    return forceRefresh
  }

  const forceRefresh = when(element, element => {
    const { left, top, width, height, bottom, right, x, y } =
      element.getBoundingClientRect() as unknown as Measure

    const bounds = {
      left,
      top,
      width,
      height,
      bottom,
      right,
      x,
      y,
    }

    if (element instanceof HTMLElement && config.offsetSize) {
      bounds.height = element.offsetHeight
      bounds.width = element.offsetWidth
    }

    Object.freeze(bounds)

    if (!lastBounds || !areBoundsEqual(lastBounds, bounds)) {
      lastBounds = bounds
      setBounds(bounds)
    }
  })

  createRoot(dispose => {
    const onScroll = getDebounce("scroll")

    createEffect(
      () => {
        if (!config.scroll) return false
        globalThis.addEventListener("scroll", onScroll, { capture: true, passive: true })
        return true
      },
      (hasScroll) => {
        if (hasScroll) {
          return () => globalThis.removeEventListener("scroll", onScroll, true)
        }
      },
    )

    if (config.scroll) {
      createRoot(dispose => {
        const onScroll = getDebounce("scroll")
        globalThis.addEventListener("scroll", onScroll, { capture: true, passive: true })
        onCleanup(() => globalThis.removeEventListener("scroll", onScroll, true))

        createEffect(() => scrollContainers(), (containers) => {
          containers.forEach((scrollContainer: Element) =>
            scrollContainer.addEventListener("scroll", onScroll, {
              capture: true,
              passive: true,
            }),
          )
          return () => {
            containers.forEach((element: Element) => {
              element.removeEventListener("scroll", onScroll, true)
            })
          }
        })
        return dispose
      })
    }

    onCleanup(dispose)
  })

  createRoot(dispose => {
    const onResize = getDebounce("resize")
    globalThis.addEventListener("resize", onResize)
    onCleanup(() => globalThis.removeEventListener("resize", onResize))

    createEffect(() => element(), (el) => {
      if (!el) return
      const observer = new ResizeObserver(onResize)
      observer.observe(el)
      return () => observer.disconnect()
    })
    onCleanup(dispose)
  })

  return {
    setElement: (source: HTMLOrSVGElement | null) => {
      if (!source || source === element()) return
      queueMicrotask(() => untrack(() => setElement(source)))
    },
    bounds,
    forceRefresh,
  }
}

// Returns a list of scroll offsets
function findScrollContainers(element: HTMLOrSVGElement | null): HTMLOrSVGElement[] {
  const result: HTMLOrSVGElement[] = []
  if (!element || element === document.body) return result
  const { overflow, overflowX, overflowY } = globalThis.getComputedStyle(element)
  if ([overflow, overflowX, overflowY].some(prop => prop === "auto" || prop === "scroll"))
    result.push(element)
  return [...result, ...findScrollContainers(element.parentElement)]
}

// Checks if element boundaries are equal
const keys: (keyof Measure)[] = ["x", "y", "top", "bottom", "left", "right", "width", "height"]
const areBoundsEqual = (a: Measure, b: Measure): boolean => keys.every(key => a[key] === b[key])
