import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '中古三拼'
const schemaId = 'sampheng'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'koq', 'ylv ')
  await expectValue(page, '古韵')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'koq', 'ylv ')
  await expectValue(page, '古韻')
})
