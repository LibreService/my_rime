import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = 'X-SAMPA'

test('IPA', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'j\\')
  await expectValue(page, 'ʝ')
})
