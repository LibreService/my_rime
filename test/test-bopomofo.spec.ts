import { expect, test } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '注音'
const schemaId = 'bopomofo'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '为何')
})

test('Taiwan', async ({ page }) => {
  await init(page, ime, schemaId, '臺')

  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '為何')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '爲何')
})

test('Space/ABCDE', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'q')
  await expect(item(page, '1 怕')).toBeVisible()
  await input(page, ' ')
  await expect(item(page, '1 拍')).toBeVisible()
  await input(page, 'A\n')
  await expectValue(page, '拍')
})

test('Reverse lookup stroke', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 ㄈㄢˇ')).toBeVisible()
})
