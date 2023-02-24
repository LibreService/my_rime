import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '速成'
const schemaId = 'quick5'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'or', 'gc', '2')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'or', 'gc', '2')
  await expectValue(page, '倉頡')
})

test('Reverse lookup luna_quanpin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 人戈竹水')).toBeVisible()
})
