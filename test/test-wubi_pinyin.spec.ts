import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '86五笔·拼音'
const schemaId = 'wubi_pinyin'

test('Simplified/Traditional', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'dai', '4', 'dcg ')
  await expectValue(page, '代码')
})
