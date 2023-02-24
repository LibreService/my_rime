import { test, expect } from '@playwright/test'
import { init, item, input, expectValue, changeExtendedCharset } from './util'

const ime = '行列30'
const schemaId = 'array30'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'x ')
  await expectValue(page, '风')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'x ')
  await expectValue(page, '風')
})

test('Extended charset', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'fai')
  await expect(item(page, '3 荚  8‐')).toBeVisible()

  await page.keyboard.press('Escape')
  await changeExtendedCharset(page, '增')
  await input(page, 'fai')
  await expect(item(page, '3 㐀')).toBeVisible()
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 [ 5↓1↓! ][ 8↑5↓9↓5↓ ][ 8↑5↓1↓5↓ ]')).toBeVisible()
})
