import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '上海吴语·老派'
const schemaId = 'wugniu_lopha'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'chin', 'rau ')
  await expectValue(page, '庆华')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'chin', 'rau ')
  await expectValue(page, '慶華')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 vae')).toBeVisible()
})
