import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = 'X-SAMPA'
const schemaId = 'ipa_xsampa'

test('IPA', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'j\\')
  await expectValue(page, 'ʝ')
})
