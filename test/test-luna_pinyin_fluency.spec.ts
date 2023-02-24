import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '朙月拼音·语句流'
const schemaId = 'luna_pinyin_fluency'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'yu', 'ju', 'liu', '25 ')
  await expectValue(page, '语句流')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'yu', 'ju', 'liu', '25 ')
  await expectValue(page, '語句流')
})

test('Enter', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'hui', 'che')
  await page.keyboard.press('Enter')
  await expectValue(page, '回车')
})
