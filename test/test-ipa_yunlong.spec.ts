import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '云龙国际音标'
const schemaId = 'ipa_yunlong'

test('IPA', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'jj ')
  await expectValue(page, 'ʝ')
})
