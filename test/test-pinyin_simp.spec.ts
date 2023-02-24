import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '袖珍简拼'
const schemaId = 'pinyin_simp'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'xiu', 'zhen', '2')
  await expectValue(page, '袖珍')
})

test('Reverse lookup stroke', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 fan')).toBeVisible()
})
