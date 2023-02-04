import { expect, test } from '@playwright/test'
import { baseURL, panel, input, expectValue, selectIME } from './util'

const ime = '粤语拼音·IPA'

test('IPA', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'jyutping')
  await expect(panel(page).locator('text=jyːt̚.pʰeŋ')).toBeVisible()
  await input(page, ' ')
  await expectValue(page, '粤拼')
})
