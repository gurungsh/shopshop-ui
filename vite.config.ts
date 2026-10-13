import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Adds a Content Security Policy to the built index.html only: the dev server
 * needs inline scripts and a websocket for hot reload. Stripe.js and its
 * card frame are the only third parties; the gateway is the only API.
 */
function contentSecurityPolicy(apiOrigin: string): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self' https://js.stripe.com",
    // Stripe Elements and Radix set inline style attributes
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.stripe.com",
    ['connect-src', "'self'", apiOrigin, 'https://*.stripe.com']
      .filter(Boolean)
      .join(' '),
    'frame-src https://js.stripe.com https://hooks.stripe.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
        injectTo: 'head-prepend',
      },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiOrigin = env.VITE_API_BASE_URL
    ? new URL(env.VITE_API_BASE_URL).origin
    : ''

  return {
    plugins: [
      react(),
      // Serves mockServiceWorker.js to the dev server only, so the worker never
      // sits in public/ and never ships in a production build
      { ...msw({ mode: 'worker-only' }), apply: 'serve' },
      contentSecurityPolicy(apiOrigin),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/testing/setup.ts'],
      exclude: ['e2e/**', 'node_modules/**'],
    },
  }
})
