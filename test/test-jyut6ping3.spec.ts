import { test, expect } from '@playwright/test'
import { init, item, input, expectValue } from './util'

const ime = '粤语拼音'
const schemaId = 'jyut6ping3'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峰为何说话')
})

test('Hong Kong', async ({ page }) => {
  await init(page, ime, schemaId, '港')

  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峯為何説話')
})

test('Taiwan', async ({ page }) => {
  await init(page, ime, schemaId, '臺')

  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峰為何說話')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峯爲何說話')
})

test('Reverse lookup luna_pinyin', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, '`', 'fan')
  await expect(item(page, '1 饭 faan5 faan6')).toBeVisible()
})

test('Reverse lookup stroke', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'x', 'ppzn')
  await expect(item(page, '1 反 faan1 faan2 faan3')).toBeVisible()
})

test('Reverse lookup cangjie5', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'v', 'he')
  await expect(item(page, '1 反 faan1 faan2 faan3')).toBeVisible()
})
