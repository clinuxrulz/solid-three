import type { Instance } from "src/types.ts"
import { $S3C } from "../constants.ts"

export const isInstance = <T extends object>(element: T): element is Instance<T> =>
  typeof element === "object" && $S3C in element
