import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME } from './util'

const ime = '注音·快打'

test('Omit vowel', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'j', 'c')
  await page.keyboard.press('Enter')
  await expectValue(page, '武汉')
})
