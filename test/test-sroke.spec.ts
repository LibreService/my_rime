import { test, expect } from '@playwright/test'
import { init, menu, input, expectValue, item, panelBox } from './util'

const ime = '五笔画'
const schemaId = 'stroke'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  const button = menu(page).nth(1)
  await expect(button).toBeDisabled()
  await expect(button).toHaveText(/^$/)
  await input(page, 'hszh', 'phnphnphhz ', 'hszhshzs ')
  await expectValue(page, '五笔画')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'hszh', 'phnphnzhhhhs', 'zhhhshszhshh ')
  await expectValue(page, '五筆畫')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`fan')
  await expect(item(page, '1 飯 ⼃⼂⼀⼄⼀⼀⼄⼂⼀⼃⼄⼂ ⼃⼂⼂⼄⼀⼀⼄⼂⼃⼃⼄⼂')).toBeVisible()
  const box = await panelBox(page)
  expect(box.width).toBeLessThan(720)
})
