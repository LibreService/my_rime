import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  retries: 3,
  webServer: {
    command: 'pnpm run preview',
    port: 4173,
    reuseExistingServer: true
  }
}

export default config
