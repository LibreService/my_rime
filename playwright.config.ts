import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  expect: { timeout: 10000 },
  retries: 3,
  webServer: {
    command: 'pnpm run preview',
    port: 4173,
    reuseExistingServer: true
  }
}

export default config
