import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '云龙国际音标'

test('IPA', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'jj ')
  await expectValue(page, 'ʝ')
})
