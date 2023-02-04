import { test, expect } from '@playwright/test'
import { baseURL, menu, input, expectValue, selectIME } from './util'

const ime = '五笔画'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  const button = menu(page).nth(1)
  await expect(button).toBeDisabled()
  await expect(button).toHaveText(/^$/)
  await input(page, 'hszh', 'phnphnphhz ', 'hszhshzs ')
  await expectValue(page, '五笔画')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'hszh', 'phnphnzhhhhs', 'zhhhshszhshh ')
  await expectValue(page, '五筆畫')
})
