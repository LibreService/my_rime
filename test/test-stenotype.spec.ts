import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '打字速记法'
const schemaId = 'stenotype'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'jy', 'T ')
  await expectValue(page, '简体')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'fa', 'T ')
  await expectValue(page, '繁體')
})
