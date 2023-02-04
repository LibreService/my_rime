import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '仓颉五代·快打'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'oiar', 'g')
  await expectValue(page, '仓')
  await expect(item(page, '1 土')).toBeVisible()
  await input(page, 'rmbc')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'oiar', 'g')
  await expectValue(page, '倉')
  await expect(item(page, '1 土')).toBeVisible()
  await input(page, 'rmbc')
  await expectValue(page, '倉頡')
})
