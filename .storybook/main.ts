import type { StorybookConfig } from '@storybook/react-vite'
import { msw } from 'msw/vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', 'msw-storybook-addon'],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig, { configType }) =>
    configType === 'PRODUCTION'
      ? mergeConfig(viteConfig, { plugins: [msw({ mode: 'worker-only' })] })
      : viteConfig,
}

export default config
