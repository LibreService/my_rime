import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'pnpm run preview',
    port: 4173,
    reuseExistingServer: true
  }
}

export default config
