import { expect, test } from '@playwright/test'
import { init, panel, input, expectValue } from './util'

const ime = '粤语拼音·IPA'
const schemaId = 'jyut6ping3_ipa'

test('IPA', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'jyut', 'ping')
  await expect(panel(page).locator('text=jyːt̚.pʰeŋ')).toBeVisible()
  await input(page, ' ')
  await expectValue(page, '粤拼')
})

test('Commit tone', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'jyut', 'ping')
  await page.keyboard.press('Shift+Enter')
  await expectValue(page, 'jyːt̚.pʰeŋ')
})
