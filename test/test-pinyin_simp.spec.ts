import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME } from './util'

const ime = '袖珍简拼'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'xiu', 'zhen', '2')
  await expectValue(page, '袖珍')
})

test('Reverse lookup stroke', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 fan')).toBeVisible()
})
