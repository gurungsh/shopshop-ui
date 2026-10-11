import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Serves mockServiceWorker.js to the dev server only, so the worker never
    // sits in public/ and never ships in a production build
    { ...msw({ mode: 'worker-only' }), apply: 'serve' },
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
  },
})
