import { test } from '@playwright/test'
import { baseURL, inputCombo, expectValue, selectIME, changeVariant } from './util'

const ime = '宫保拼音·七指禅'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await inputCombo(page, 'fukl', 'v ,', 'xj', 'rjkl', ' ')
  await expectValue(page, '宫保鸡丁')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await inputCombo(page, 'fukl', 'v ,', 'xj', 'rjkl', ' ')
  await expectValue(page, '宮保雞丁')
})
