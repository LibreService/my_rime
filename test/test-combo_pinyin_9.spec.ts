import { test } from '@playwright/test'
import { init, inputCombo, expectValue } from './util'

const ime = '宫保拼音·九指禅'
const schemaId = 'combo_pinyin_9'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await inputCombo(page, 'fukl', 'vjo', 'zi', 'r kl', ' ')
  await expectValue(page, '宫保鸡丁')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await inputCombo(page, 'fukl', 'vjo', 'zi', 'r kl', ' ')
  await expectValue(page, '宮保雞丁')
})
