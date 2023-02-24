import { test } from '@playwright/test'
import { init, input, expectValue } from './util'

const ime = '86五笔·繁体'
const schemaId = 'wubi_trad'

test('Traditional', async ({ page }) => {
  await init(page, ime, schemaId)

  await input(page, 'dcg ')
  await expectValue(page, '碼')
})
