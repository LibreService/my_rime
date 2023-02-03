import { test } from '@playwright/test'
import { baseURL, input, expectValue, selectIME, changeVariant } from './util'

const ime = '朙月拼音·语句流'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'yujuliu24 ')
  await expectValue(page, '语句流')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await changeVariant(page, '繁')
  await input(page, 'yujuliu24 ')
  await expectValue(page, '語句流')
})

test('Enter', async ({ page }) => {
  await page.goto(baseURL)

  await selectIME(page, ime)
  await input(page, 'huiche')
  await page.keyboard.press('Enter')
  await expectValue(page, '回车')
})
