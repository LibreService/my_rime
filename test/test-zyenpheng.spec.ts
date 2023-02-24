import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '中古全拼'
const schemaId = 'zyenpheng'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'kox', 'yonh ')
  await expectValue(page, '古韵')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'kox', 'yonh ')
  await expectValue(page, '古韻')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 byanh byanx')).toBeVisible()
})
