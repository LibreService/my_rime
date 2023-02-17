import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '速成'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'or', 'gc', '2')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'or', 'gc', '2')
  await expectValue(page, '倉頡')
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 人戈竹水')).toBeVisible()
})
