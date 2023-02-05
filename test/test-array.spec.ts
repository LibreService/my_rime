import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME, changeVariant } from './util'

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
