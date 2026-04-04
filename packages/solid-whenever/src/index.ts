import {
  type Accessor,
  createEffect,
  createMemo,
  createRenderEffect,
} from 'solid-js'

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

type MaybeAccessor<T> = T | Accessor<T>
type Fn<TArgs extends any[] = any[], TReturn = any> = (...args: TArgs) => TReturn

type NonNullable<T> = Exclude<T, null | undefined | false>

type InferNonNullable<T> = T extends MaybeAccessor<infer TValue> | undefined
  ? NonNullable<TValue>
  : never
type InferNonNullableTuple<TAccessors extends Array<MaybeAccessor<any>>> = {
  [TKey in keyof TAccessors]: InferNonNullable<TAccessors[TKey]>
}

interface Check {
  <const TAccessor extends MaybeAccessor<any>, const TResult>(
    accessor: TAccessor,
    callback: (value: InferNonNullable<TAccessor>) => TResult,
  ): TResult | undefined
  <const TAccessor extends MaybeAccessor<any>, const TResult, const TFallbackResult>(
    accessor: TAccessor,
    callback: (value: InferNonNullable<TAccessor>) => TResult,
    fallback?: () => TFallbackResult,
  ): TResult | TFallbackResult
}

interface When {
  <const Args extends any[], const TValue, const TResult>(
    accessor: MaybeAccessor<TValue>,
    callback: (value: NonNullable<TValue>, ...args: Args) => TResult,
  ): (...args: Args) => TResult | undefined
  <const Args extends any[], const TValue, const TResult, const TFallbackResult>(
    accessor: MaybeAccessor<TValue>,
    callback: (value: NonNullable<TValue>, ...args: Args) => TResult,
    fallback?: (...args: Args) => TFallbackResult,
  ): (...args: Args) => TResult | TFallbackResult
}

interface WhenMemo {
  <const TAccessor extends MaybeAccessor<any>, const TResult>(
    accessor: TAccessor,
    callback: (value: InferNonNullable<TAccessor>, previous: NoInfer<TResult>) => TResult,
  ): () => TResult | undefined
  <const TAccessor extends MaybeAccessor<any>, const TResult, const TFallbackResult>(
    accessor: TAccessor,
    callback: (
      value: InferNonNullable<TAccessor>,
      previous: NoInfer<TResult | TFallbackResult>,
    ) => TResult,
    fallback: (previous: NoInfer<TResult | TFallbackResult>) => TFallbackResult,
  ): () => TResult | TFallbackResult
}

interface Effect {
  <const TValue, TResult, TPrev = TResult>(
    accessor: MaybeAccessor<TValue>,
    onTrack: (value: NonNullable<TValue>, prev: TPrev | undefined) => TResult,
    onApply?: (value: TResult) => (() => void) | void,
  ): void
}

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function resolve<T>(value: MaybeAccessor<T>): T {
  return typeof value !== 'function' ? value : (value as Accessor<T>)()
}

/**********************************************************************************/
/*                                                                                */
/*                                      Core                                     */
/*                                                                                */
/**********************************************************************************/

/**
 * Checks if the accessor's value is truthy and executes a callback with that value.
 * @param accessor - The value or function returning a value to check for truthiness
 * @param callback - The callback function to execute if the value is truthy
 * @param fallback - Optional callback function to execute if the value is falsy
 * @returns The result of the callback if truthy, fallback result if falsy, or undefined if no fallback
 */
export const check: Check = (accessor: MaybeAccessor<any>, callback: Fn, fallback?: Fn) => {
  const value = resolve(accessor)
  return value ? callback(value) : fallback ? fallback() : undefined
}

/**
 * Returns a function that conditionally executes a callback based on the truthiness of an accessor's value,
 * suitable for use in reactive programming contexts.
 * @param accessor - The value or function returning a value that is checked for truthiness
 * @param callback - The callback function to be executed if the accessor's value is truthy
 * @param fallback - Optional callback function to be executed if the accessor's value is falsy
 * @returns A function that conditionally executes the callback or fallback based on the accessor's value
 */
export const when: When = (accessor: MaybeAccessor<any>, callback: Fn, fallback?: Fn) => {
  return (...args: any[]) =>
    check(
      accessor,
      value => callback(value, ...args),
      fallback ? () => fallback(...args) : undefined,
    )
}

/**
 * Returns a function that conditionally executes and aggregates results from multiple accessors if all values are truthy.
 *
 * @param accessors Multiple accessors to be checked for truthiness.
 * @returns A function that can be called to conditionally execute based on the truthiness of all accessor values, returning their results as an array or undefined if any are not truthy.
 */
export function every<TAccessors extends Array<MaybeAccessor<any>>>(...accessors: TAccessors) {
  function callback() {
    const values = new Array(accessors.length)

    for (let i = 0; i < accessors.length; i++) {
      const _value = resolve(accessors[i])
      if (!_value) return undefined
      values[i] = _value
    }

    return values as InferNonNullableTuple<TAccessors>
  }
  return callback
}

/**
 * Higher-order function that transforms a function to conditionally execute based on the truthiness of an accessor's value.
 * Takes a function and returns a new function that wraps its execution with conditional logic using the `when` helper.
 *
 * @param fn - The function to be wrapped with conditional execution logic
 * @returns A new function that accepts:
 *   - accessor: The value or function returning a value to check for truthiness
 *   - callback: Function to execute when the accessor's value is truthy
 *   - fallback: Optional function to execute when the accessor's value is falsy
 *
 * @example
 * ```ts
 * const conditionalMemo = whenify(createMemo)
 *
 * // With fallback
 * const result = conditionalMemo(
 *   () => user(),
 *   (user, previous) => user.name ?? previous,
 *   () => 'Guest'
 * )
 *
 * // Without fallback
 * const count = conditionalMemo(
 *   () => data(),
 *   (data) => data.items.length
 * )
 * ```
 */
export function whenify(fn: Fn) {
  return function (accessor: MaybeAccessor<any>, callback: Fn, fallback?: Fn) {
    return fn(when(accessor, callback, fallback))
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                  Solid Wrappers                                */
/*                                                                                */
/**********************************************************************************/

/**
 * Creates a memo that returns the result of the callback when the accessor's value is truthy.
 * The truthiness check is memoized to avoid triggering reactivity on every value change.
 * @param accessor - The value or function returning a value to check for truthiness
 * @param callback - The callback function whose result will be memoized when the value is truthy
 * @param fallback - Optional callback function whose result will be memoized when the value is falsy
 * @returns A memoized accessor that returns the callback result when truthy, fallback result when falsy
 */
export const whenMemo: WhenMemo = (accessor, callback, fallback) => {
  const truthy = createMemo(() => !!resolve(accessor))
  return createMemo(() => (...args) => {
    if (!truthy()) return fallback ? fallback(...args) : undefined
    const value = resolve(accessor) as NonNullable<any>
    return callback(value, ...args)
  })
}

/**
 * Creates an effect that runs when the accessor's value is truthy.
 * Uses Solid 2's split effect pattern (compute → apply).
 * @param accessor - The value or function returning a value to check for truthiness
 * @param onTrack - Function to compute a value from the tracked reactive expression, receives previous value
 * @param onApply - Function to perform side effects with the computed value, can return cleanup
 */
export function whenEffect<TValue, TResult, TPrev = TResult>(
  accessor: MaybeAccessor<TValue>,
  onTrack: (value: NonNullable<TValue>, prev: TPrev | undefined) => TResult,
  onApply?: (value: TResult) => (() => void) | void,
): void {
  let prev: TPrev | undefined
  createEffect(
    (): TResult | undefined => {
      const value = resolve(accessor) as NonNullable<TValue>
      if (!value) return undefined
      const result = onTrack(value, prev)
      prev = result as unknown as TPrev
      return result
    },
    onApply,
  )
}

/**
 * Creates a render effect that runs when the accessor's value is truthy.
 * Uses Solid 2's split effect pattern (compute → apply).
 * @param accessor - The value or function returning a value to check for truthiness
 * @param onTrack - Function to compute a value from the tracked reactive expression, receives previous value
 * @param onApply - Function to perform side effects with the computed value, can return cleanup
 */
export function whenRenderEffect<TValue, TResult, TPrev = TResult>(
  accessor: MaybeAccessor<TValue>,
  onTrack: (value: NonNullable<TValue>, prev: TPrev | undefined) => TResult,
  onApply?: (value: TResult) => (() => void) | void,
): void {
  let prev: TPrev | undefined
  createRenderEffect(
    (): TResult | undefined => {
      const value = resolve(accessor) as NonNullable<TValue>
      if (!value) return undefined
      const result = onTrack(value, prev)
      prev = result as unknown as TPrev
      return result
    },
    onApply,
  )
}

/**
 * Creates a computed that runs the callback when the accessor's value is truthy.
 * The truthiness check is memoized to avoid triggering reactivity on every value change.
 * @param accessor - The value or function returning a value to check for truthiness
 * @param callback - The callback function to execute in the computed when the value is truthy
 * @param fallback - Optional callback function to execute in the computed when the value is falsy
 */
export const whenComputed: WhenMemo = (accessor, callback, fallback) => {
  const truthy = createMemo(() => !!resolve(accessor))
  return createMemo(() => (...args) => {
    if (!truthy()) return fallback ? fallback(...args) : undefined
    const value = resolve(accessor) as NonNullable<any>
    return callback(value, ...args)
  })
}
