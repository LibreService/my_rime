import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME, changeVariant } from './util'

const ime = '粤语拼音'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峰为何说话')
})

test('Hong Kong', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '港')
  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峯為何説話')
})

test('Taiwan', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '港')
  await changeVariant(page, '臺')
  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峰為何說話')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '港')
  await changeVariant(page, '臺')
  await changeVariant(page, '繁')
  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峯爲何說話')
})
