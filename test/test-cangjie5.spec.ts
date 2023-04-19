import { test, expect } from '@playwright/test'
import {
  init,
  luna,
  select,
  textarea,
  item,
  menu,
  input,
  expectValue,
  selectIME,
  changeLanguage,
  changeVariant,
  changeExtendedCharset
} from './util'

const ime = '仓颉五代'
const schemaId = 'cangjie5'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'oiar', 'grmbc ')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'oiar', 'grmbc ')
  await expectValue(page, '倉頡')
})

test('Extended charset', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'tm')
  await expect(item(page, '3 廿一')).toBeVisible()

  await page.keyboard.press('Escape')
  await changeExtendedCharset(page, '增')
  await input(page, 'tm')
  await expect(item(page, '3 㐀')).toBeVisible()
})

test('Reset Chinese after changing IME', async ({ page }) => {
  await init(page)

  await changeLanguage(page, 'En')
  await selectIME(page, ime)
  await expect(menu(page).nth(0)).toHaveText('中')
  await input(page, 'l ')
  await expectValue(page, '中')
})

test('Variant not affected by other IME', async ({ page }) => {
  await init(page)

  await changeVariant(page, '繁')
  await selectIME(page, ime)
  await input(page, 'hana', 'bbtwt ')
  await expectValue(page, '简体')
})

test('Variant restored', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await selectIME(page, luna)
  await changeVariant(page, '繁')

  await selectIME(page, ime)
  await input(page, 'okvif', 'bbtwt ')
  await expectValue(page, '繁體')
})

test('IME and variant restored after reload', async ({ page }) => {
  await init(page)

  await selectIME(page, ime)
  await changeVariant(page, '繁')

  await page.reload()
  await textarea(page).click()
  await expect(select(page)).toHaveText(ime)
  await expect(menu(page).nth(1)).toHaveText('繁')
  await input(page, 'okvif', 'bbtwt ')
  await expectValue(page, '繁體')
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, '`', 'fan')
  await expect(item(page, '1 飯 人戈竹水')).toBeVisible()
})
