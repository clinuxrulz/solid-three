import type { Plugin } from "esbuild";
import babel from "@babel/core";

const solidPlugin = (): Plugin => ({
  name: "esbuild-plugin-solid-babel",
  setup(build) {
    build.onLoad({ filter: /\.(tsx|jsx|ts|js)$/ }, async args => {
      const result = await babel.transformFileAsync(args.path, {
        plugins: [
          [
            require.resolve("babel-preset-solid"),
            {
              generateJSX: true,
              solidAnnotations: true,
            },
          ],
        ],
        loader: args.path.endsWith(".tsx") || args.path.endsWith(".jsx")
          ? "tsx"
          : "ts",
        sourceType: "module",
      });

      if (!result) {
        return null;
      }

      return {
        contents: result.code,
        loader: "js",
      };
    });
  },
});

export default solidPlugin;
