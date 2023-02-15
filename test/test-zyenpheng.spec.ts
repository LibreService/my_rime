import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME, changeVariant } from './util'

const ime = '中古全拼'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'kox', 'yonh ')
  await expectValue(page, '古韵')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'kox', 'yonh ')
  await expectValue(page, '古韻')
})