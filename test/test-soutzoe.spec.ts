import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '苏州吴语'
const schemaId = 'soutzoe'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'sou', 'tzoe ')
  await expectValue(page, '苏州')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'sou', 'tzoe ')
  await expectValue(page, '蘇州')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 ve')).toBeVisible()
})
