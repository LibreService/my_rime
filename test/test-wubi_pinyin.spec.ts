import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '86五笔·拼音'

test('Simplified/Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'dai', '4', 'dcg ')
  await expectValue(page, '代码')
})
