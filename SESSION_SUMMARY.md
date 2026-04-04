## Goal

Migrate solid-three from Solid 1 to Solid 2.0.0-beta.4 and get a demo app working to test the migration.

## Instructions

- Update only dependencies to Solid 2
- Reference Solid 2 migration patterns (split effects, context providers, etc.)
- In Solid 2, `render` is under `@solidjs/web` (not `solid-js/web`)
- Use Vite 7 + `vite-plugin-solid@3.0.0-next.3` + `babel-preset-solid@2.0.0-beta.3` for Solid 2 projects
- Override `babel-preset-solid` to version 2.x since `esbuild-plugin-solid` bundles v1.x
- Debug via Playwright to find runtime errors
- **Critical**: In Solid 2, effects can only be created within the **first** function of a split effect
- **Critical**: `onCleanup` cannot be called in the second function passed to `createEffect`
- If nesting effects in the 2nd function of `createEffect`, use `createRoot` inside it - the function returned by the function called in the 2nd function is the cleanup function for cleaning up roots

## Discoveries

Key Solid 2 migration patterns discovered:
1. **Split effect pattern**: `createEffect(() => trackedValue, (value) => { /* side effect */ })`
2. **`onMount` is gone**: Use `createEffect(() => undefined, () => { /* code */ })`
3. **`createResource` is removed**: Use `createMemo` with async functions instead
4. **`createComputed` is removed**: Use `createMemo` instead
5. **`mergeProps` → `merge`**
6. **Context Provider changed**: `Context.Provider` → `Context` (context IS the provider)
7. **`solid-js/web` doesn't exist**: `render` and `isServer` are in `@solidjs/web`
8. **`babel-preset-solid@1.x` bundles with `esbuild-plugin-solid`**: Needs pnpm override to use v2.x
9. **`batch` is removed in Solid 2**: Batching happens automatically
10. **`getListener` is removed in Solid 2**: No longer needed
11. **`equalFn` renamed to `isEqual`** in Solid 2 (exported from `@solidjs/signals`)

**Critical Solid 2 Effect Nesting Rules**:
- Effects can only be created inside the **first** function (tracking function) of a split effect
- Calling `createEffect`, `createRenderEffect`, or any function that creates effects inside the **second** function (effect function) causes warnings and broken behavior
- `onCleanup` cannot be called in the second function of a split effect
- If you need to nest effect creation in the second function, use `createRoot` inside it

## Accomplished

### Main solid-three migration:
1. **`src/hooks.ts`**: Replaced `createResource` with `createMemo` async pattern
2. **`src/utils.ts`**: Updated `withContext`/`withMultiContexts` to new Solid 2 syntax
3. **`src/props.ts`**: Simplified `useProps` to avoid nested split effects by resolving object immediately and only creating effects for reactive props
4. **`src/create-three.tsx`**: Fixed effect patterns - moved reactive reads to tracking functions, removed nested `createRoot` calls
5. **`src/utils/use-measure.ts`**: Fixed nested effect creation by using `createRoot` and proper split effect patterns
6. **`src/canvas.tsx`**: Refactored to use component-based approach where `createThree` returns a `SceneGraph` component

### Demo app created at `apps/demo/`:
- Vite 7 + `vite-plugin-solid@3.0.0-next.3` + `babel-preset-solid@2.0.0-beta.3`
- Added DebugScene component to debug scene contents
- Shows 3D scene with cubes, sphere, torus with reactive controls

### Build configuration updates:
- Added `babel-preset-solid@2.0.0-beta.3` with pnpm override
- Added `@solidjs/web@2.0.0-beta.4` dependency
- Set `external: ["@solidjs/web"]` in tsup.config.ts
- Added `"solid-js": "2.0.0-beta.4"` override in pnpm config

## Current Status

**Build**: Main library builds successfully with all dist files generated.

**Demo**: 
- Canvas element exists with WebGL context and correct dimensions
- Three.js renderer is detected (`data-engine="three.js r164"`)
- Camera and renderer are created correctly
- **BUT scene has 0 children** - no Three.js objects are being added to the scene
- All pixels show `[0, 0, 0, 0]` (transparent black - nothing rendered)
- **CRITICAL ISSUE**: Getting persistent warnings:
  - "Effects created outside a reactive context will never be disposed"
  - "onCleanup called outside a reactive context will never be run"
  - "A Signal was written to in an owned scope"
  - These warnings appear many times, indicating effects are being created in a problematic pattern

## Critical Issue: Architectural Incompatibility

The solid-three architecture relies on patterns that are fundamentally incompatible with Solid 2's stricter reactive model:

### Problem 1: `createRoot` usage
- `useProps` and `addFrameListener` use `createRoot` to manage effect disposal
- In Solid 2, `createRoot` creates a disposal scope but **does not establish a reactive context**
- Effects created inside `createRoot` are created "outside a reactive context" and don't work properly
- **Note**: We tried removing `createRoot` but warnings persist, indicating deeper issues

### Problem 2: Scene Graph Context
- The scene graph requires context to be available when children render
- In Solid 2, context providers work differently - calling `Context({ value, children })` sets up context
- But the context must be established **before** children try to access it via `useContext`
- The architecture of solid-three creates a chicken-and-egg problem where:
  1. Context needs to be set up for children to access
  2. But children are rendered via `useSceneGraph` which is called from `createThree`
  3. `createThree` is called inside an effect in `Canvas`

### Problem 3: Effect Creation Timing
- Solid 2 requires effects to be created within reactive contexts
- The split effect pattern (`createEffect(() => tracked, (v) => {...})`) creates effects in the second function
- But Solid 2 requires effects to be created in the **first** function
- solid-three's architecture creates effects dynamically (via `useProps`, `useSceneGraph`) which doesn't fit Solid 2's model

## Relevant files / directories

### Root project config
- `/root/tmp/solid-three/package.json` - Main package with overrides for Solid 2
- `/root/tmp/solid-three/packages/solid-three/package.json` - Library package config
- `/root/tmp/solid-three/packages/solid-three/tsup.config.ts` - Build config

### Main library source files (all migrated to Solid 2)
- `/root/tmp/solid-three/packages/solid-three/src/hooks.ts`
- `/root/tmp/solid-three/packages/solid-three/src/utils.ts`
- `/root/tmp/solid-three/packages/solid-three/src/props.ts` - **Key file for scene graph attachment**
- `/root/tmp/solid-three/packages/solid-three/src/create-three.tsx` - **Key file where scene graph is initialized**
- `/root/tmp/solid-three/packages/solid-three/src/utils/use-measure.ts`
- `/root/tmp/solid-three/packages/solid-three/src/components.tsx`
- `/root/tmp/solid-three/packages/solid-three/src/canvas.tsx`
- `/root/tmp/solid-three/packages/solid-three/src/create-t.tsx`
- `/root/tmp/solid-three/packages/solid-three/src/create-events.ts`
- `/root/tmp/solid-three/packages/solid-three/src/data-structure/stack.ts`
- `/root/tmp/solid-three/packages/solid-three/src/data-structure/augmented-stack.ts`
- `/root/tmp/solid-three/packages/solid-three/src/data-structure/loader-cache.ts`

### Demo app
- `/root/tmp/solid-three/apps/demo/` - Demo app directory
- `/root/tmp/solid-three/apps/demo/src/App.tsx` - Demo app with DebugScene component
- `/root/tmp/solid-three/apps/demo/debug.mjs` - Playwright debug script

### Build output
- `/root/tmp/solid-three/packages/solid-three/dist/` - Built library files

## Conclusion

The Solid 2 migration for solid-three reveals fundamental architectural incompatibilities:

1. **Effect creation patterns**: Solid 2 requires effects to be created within reactive contexts and specifically in the tracking phase of split effects. solid-three's dynamic effect creation doesn't fit this model.

2. **Context provider patterns**: Solid 2's context API requires providers to be established before children access context. The current architecture creates this ordering problem.

3. **`createRoot` semantics**: Solid 2 changed how `createRoot` works - it creates disposal scopes but not reactive contexts. This breaks solid-three's cleanup patterns.

**Recommendation**: The Solid 2 migration for a library like solid-three requires a significant architectural redesign that goes beyond simple API changes. Consider:
- Waiting for Solid 2 to stabilize further
- Collaborating with the solid-three maintainers on a proper migration strategy
- Potentially forking or creating a new version specifically for Solid 2

## Next Steps (if continuing)

If attempting to fix these issues:

1. **Fix context setup**: Restructure so ThreeProvider is set up BEFORE any child components render
2. **Fix effect patterns**: All effects must be created in reactive contexts, not inside `createRoot` or split effect second functions
3. **Redesign scene graph**: The scene graph attachment mechanism needs to work with Solid 2's reactive model
4. **Consider Solid 2 native patterns**: Use Solid 2's native patterns (like `createContextProvider` or similar) rather than trying to emulate Solid 1 patterns
