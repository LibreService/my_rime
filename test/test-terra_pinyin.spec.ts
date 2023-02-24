import { expect, test } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '地球拼音'
const schemaId = 'terra_pinyin'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'dong-', 'wu/', 'dong\\', 'wu, ')
  await expectValue(page, '东吴动武')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'dong-', 'wu/', 'dong\\', 'wu, ')
  await expectValue(page, '東吳動武')
})

test('Commit tone', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'shu,', 'shi/', 'shu-', 'shi\\')
  await page.keyboard.press('Control+Enter')
  await expectValue(page, 'shǔ shí shū shì')
})

test('Commit candidate tone', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'shu', 'shi')
  await expect(item(page, '1 舒适')).toBeVisible()
  await expect(item(page, '2 术士')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Control+Shift+Enter')
  await expectValue(page, 'shù shì')
})

test('Reverse lookup stroke', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 fǎn')).toBeVisible()
})
