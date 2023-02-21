import { expect, test } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeExtendedCharset } from './util'

const ime = '86五笔'

test('Simplified/Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'dc')
  await expect(item(page, '4 碼')).toBeVisible()
  await input(page, '2')
  await expectValue(page, '码')
})

test('Extended charset', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'gjgg')
  await expect(item(page, '1 表里不一')).toBeVisible()
  expect(await page.locator('.n-menu-item-content').count()).toEqual(1)

  await page.keyboard.press('Escape')
  await changeExtendedCharset(page, '增')
  await input(page, 'gjgg')
  await expect(item(page, '2 㐀')).toBeVisible()
})

test('Reverse lookup pinyin_simp', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'z', 'fan')
  await expect(item(page, '1 饭 qnr qnrc')).toBeVisible()
})
