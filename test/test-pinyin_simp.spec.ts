import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '袖珍简拼'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'xiu', 'zhen', '2')
  await expectValue(page, '袖珍')
})
