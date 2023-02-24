import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '上海吴语·新派'
const schemaId = 'wugniu'

test('Simplified', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'chin', 'rau ')
  await expectValue(page, '清华')
})

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId, '繁')

  await input(page, 'chin', 'rau ')
  await expectValue(page, '清華')
})
