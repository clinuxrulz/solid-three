import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  // Apply solid plugin for JSX transformation
  plugins: [solid()],
  resolve: {
    alias: {
      'solid-js': 'solid-js/dist/solid.js'
    }
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Exclude Playwright test files
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  // Don't apply these configs outside of test mode
  define: process.env.VITEST ? {} : undefined,
})
