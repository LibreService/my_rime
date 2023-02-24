import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '仓颉五代·快打'
const schemaId = 'cangjie5_express'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'oiar', 'g')
  await expectValue(page, '仓')
  await expect(item(page, '1 土')).toBeVisible()
  await input(page, 'rmbc')
  await expectValue(page, '仓颉')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'oiar', 'g')
  await expectValue(page, '倉')
  await expect(item(page, '1 土')).toBeVisible()
  await input(page, 'rmbc')
  await expectValue(page, '倉頡')
})
