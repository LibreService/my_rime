import { test, expect } from '@playwright/test'
import { baseURL, luna, item, input, expectValue, selectIME, changeVariant, changeExtendedCharset } from './util'

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

test('Extended charset', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'tm')
  await expect(item(page, '3 廿一')).toBeVisible()

  await page.keyboard.press('Escape')
  await changeExtendedCharset(page, '增')
  await input(page, 'tm')
  await expect(item(page, '3 㐀')).toBeVisible()
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

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, '`', 'fan')
  await expect(item(page, '1 飯 人戈竹水')).toBeVisible()
})
