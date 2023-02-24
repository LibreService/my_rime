import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '注音·快打'
const schemaId = 'bopomofo_express'

test('Omit vowel', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'j', 'c')
  await page.keyboard.press('Enter')
  await expectValue(page, '武汉')
})
