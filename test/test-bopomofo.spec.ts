import { expect, test } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '注音'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '为何')
})

test('Taiwan', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '臺')
  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '為何')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '臺')
  await changeVariant(page, '繁')
  await input(page, 'jo', 'ck')
  await page.keyboard.press('Enter')
  await expectValue(page, '爲何')
})

test('Space/ABCDE', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'q')
  await expect(item(page, '1 怕')).toBeVisible()
  await input(page, ' ')
  await expect(item(page, '1 拍')).toBeVisible()
  await input(page, 'A\n')
  await expectValue(page, '拍')
})
