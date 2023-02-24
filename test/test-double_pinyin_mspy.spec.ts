import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '微软双拼'
const schemaId = 'double_pinyin_mspy'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'ud', 'pn', 'x; ')
  await expectValue(page, '双拼行')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'ud', 'pn', 'x; ')
  await expectValue(page, '雙拼行')
})
