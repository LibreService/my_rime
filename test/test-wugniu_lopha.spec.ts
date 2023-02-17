import { test, expect } from '@playwright/test'
import { baseURL, item, input, expectValue, selectIME, changeVariant } from './util'

const ime = '上海吴语·老派'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'chin', 'rau ')
  await expectValue(page, '庆华')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'chin', 'rau ')
  await expectValue(page, '慶華')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 vae')).toBeVisible()
})
