import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME, changeVariant } from './util'

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
