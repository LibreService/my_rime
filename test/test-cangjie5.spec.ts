import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '仓颉五代'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'oiargrmbc ')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await page.getByRole('button', { name: '简' }).click()
  await selectIME(page, ime)
  await input(page, 'oiargrmbc ')
  await expectValue(page, '倉頡')
})
