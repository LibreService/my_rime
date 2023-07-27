import { expect, test } from '@playwright/test'
import {
  init,
  menu
} from './util'

const ime = '粤语拼音'
const schemaId = 'jyut6ping3'

test.describe('default/zh-CN', () => {
  test('CN font', async ({ page }) => {
    await init(page)

    await expect(page.locator('body')).toHaveCSS('font-family', /Noto Sans CJK SC.*Microsoft YaHei.*PingFang SC/)
  })

  test('CN variant', async ({ page }) => {
    await init(page, ime, schemaId)

    await expect(menu(page).nth(1)).toHaveText('简')
  })
})

test.describe('zh-HK', () => {
  test.use({ locale: 'zh-HK' })

  test('HK font', async ({ page }) => {
    await init(page)

    await expect(page.locator('body')).toHaveCSS('font-family', /Noto Sans CJK HK.*Microsoft JhengHei.*PingFang HK/)
  })

  test('HK variant', async ({ page }) => {
    await init(page, ime, schemaId)

    await expect(menu(page).nth(1)).toHaveText('港')
  })
})

test.describe('zh-TW', () => {
  test.use({ locale: 'zh-TW' })

  test('TW font', async ({ page }) => {
    await init(page)

    await expect(page.locator('body')).toHaveCSS('font-family', /Noto Sans CJK TC.*Microsoft JhengHei.*PingFang TC/)
  })

  test('TW variant', async ({ page }) => {
    await init(page, ime, schemaId)

    await expect(menu(page).nth(1)).toHaveText('臺')
  })
})
