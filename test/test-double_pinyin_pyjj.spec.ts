import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '拼音加加双拼'
const schemaId = 'double_pinyin_pyjj'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'ih', 'pl ')
  await expectValue(page, '双拼')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'ih', 'pl ')
  await expectValue(page, '雙拼')
})
