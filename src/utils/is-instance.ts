import type { Instance } from "src/types.ts"
import { $S3C } from "../constants.ts"

export const isInstance = <T>(element: T): element is Instance<T> =>
  typeof element === "object" && element && $S3C in element
