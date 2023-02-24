import { test } from '@playwright/test'
import { init, inputCombo, expectValue } from './util'

const ime = '宫保拼音·八指禅'
const schemaId = 'combo_pinyin_8'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await inputCombo(page, 'gukl', 'v ,', 'fj', 'rjkl', ' ')
  await expectValue(page, '宫保鸡丁')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await inputCombo(page, 'gukl', 'v ,', 'fj', 'rjkl', ' ')
  await expectValue(page, '宮保雞丁')
})
