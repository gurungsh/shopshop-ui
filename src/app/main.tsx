import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@/styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { Providers } from '@/app/providers'
import { router } from '@/app/router'
import { env } from '@/config/env'

/** Starts the MSW service worker before the first request, in dev only */
async function enableMocking() {
  if (!import.meta.env.DEV || !env.VITE_API_MOCKING) return

  try {
    const { worker } = await import('@/testing/mocks/browser')
    await worker.start()
  } catch (error) {
    console.error(
      'API mocking could not start; calls go to the gateway.',
      error,
    )
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found in index.html')

await enableMocking()

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
