import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '智能ABC双拼'
const schemaId = 'double_pinyin_abc'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'vt', 'pc ')
  await expectValue(page, '双拼')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'vt', 'pc ')
  await expectValue(page, '雙拼')
})
