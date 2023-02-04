import { test } from '@playwright/test'
import { baseURL, luna, input, expectValue, selectIME, changeVariant } from './util'

const ime = '仓颉五代'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'oiar', 'grmbc ')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'oiar', 'grmbc ')
  await expectValue(page, '倉頡')
})

test('Variant not affected by other IME', async ({ page }) => {
  await page.goto(baseURL)

  await changeVariant(page, '繁')
  await selectIME(page, ime)
  await input(page, 'hana', 'bbtwt ')
  await expectValue(page, '简体')
})

test('Variant restored', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await selectIME(page, luna)
  await changeVariant(page, '繁')

  await selectIME(page, ime)
  await input(page, 'okvif', 'bbtwt ')
  await expectValue(page, '繁體')
})
