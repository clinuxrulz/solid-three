import type { Augment } from "src/types.ts"
import { $S3C } from "../constants.ts"

export const isInstance = <T extends object>(element: T): element is Augment<T> =>
  typeof element === "object" && $S3C in element
