import { defineConfig, devices } from '@playwright/test'

const port = 5173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${String(port)}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --strictPort',
    port,
    reuseExistingServer: !process.env.CI,
    // Process env beats .env files, so a local Stripe key cannot change the run
    env: { VITE_API_MOCKING: 'true', VITE_PAYMENT_TEST_METHODS: 'true' },
  },
})
