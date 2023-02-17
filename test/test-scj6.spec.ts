import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '快速仓颉'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'osus', 'gros ')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'osus', 'gros ')
  await expectValue(page, '倉頡')
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 弓水符 弓女一水 人 人水符 人竹水 人竹水尸 人戈水 人戈水尸 人戈竹水 人戈一水 人一水 人一水尸 人人竹水 人人一水')).toBeVisible()
})
