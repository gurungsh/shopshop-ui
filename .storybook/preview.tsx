import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@/styles/index.css'

import type { Preview } from '@storybook/react-vite'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'

import { handlers } from '@/testing/mocks/handlers'

import { type RouterParameters, StoryProviders } from './StoryProviders'

const preview: Preview = {
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker(...handlers)
      await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
      return worker
    }),
  ],
  decorators: [
    (Story, { parameters }) => (
      <StoryProviders router={parameters.router as RouterParameters}>
        <Story />
      </StoryProviders>
    ),
  ],
}

export default preview
