import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '86五笔·繁体'

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'dcg ')
  await expectValue(page, '碼')
})
