import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '行列30'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'x ')
  await expectValue(page, '风')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'x ')
  await expectValue(page, '風')
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 [ 5↓1↓! ][ 8↑5↓9↓5↓ ][ 8↑5↓1↓5↓ ]')).toBeVisible()
})
