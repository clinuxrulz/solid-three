import { solidPlugin } from "esbuild-plugin-solid"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  external: [
    "@solid-primitives/event-listener",
    "@solid-primitives/rootless",
    "@solid-primitives/static-store",
    "@solid-primitives/utils",
  ],
  esbuildPlugins: [solidPlugin()],
})
