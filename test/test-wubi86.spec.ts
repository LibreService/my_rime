import { expect, test } from '@playwright/test'
import { init, item, input, expectValue, changeExtendedCharset } from './util'

const ime = '86五笔'
const schemaId = 'wubi86'

test('Simplified/Traditional', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'dc')
  await expect(item(page, '4 碼')).toBeVisible()
  await input(page, '2')
  await expectValue(page, '码')
})

test('Extended charset', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'gjgg')
  await expect(item(page, '1 表里不一')).toBeVisible()
  expect(await page.locator('.n-menu-item-content').count()).toEqual(1)

  await page.keyboard.press('Escape')
  await changeExtendedCharset(page, '增')
  await input(page, 'gjgg')
  await expect(item(page, '2 㐀')).toBeVisible()
})

test('Reverse lookup pinyin_simp', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'z', 'fan')
  await expect(item(page, '1 饭 qnr qnrc')).toBeVisible()
})
