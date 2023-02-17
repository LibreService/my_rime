import { test, Request, expect } from '@playwright/test'
import { baseURL, textarea, item, input, expectValue, changeVariant, changeWidth } from './util'

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'jian', 'ti ')
  await expectValue(page, '简体')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await changeVariant(page, '繁')
  await input(page, 'fan', 'ti ')
  await expectValue(page, '繁體')
})

test('English/Chinese', async ({ page }) => {
  await page.goto(baseURL)

  await page.keyboard.press('Shift')
  await textarea(page).click()
  await input(page, 'English')
  await expectValue(page, 'English')

  await page.getByRole('button', { name: 'En' }).click()
  await input(page, 'zhong', 'wen ')
  await expectValue(page, 'English中文')
})

test('Full width', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'a')
  await page.keyboard.press('Enter')
  await changeWidth(page)
  await input(page, 'a')
  await page.keyboard.press('Enter')
  await expectValue(page, 'aａ')

  await page.getByRole('button', { name: '中' }).click()
  await input(page, 'b')
  await changeWidth(page)
  await input(page, 'b')
  await expectValue(page, 'aａｂb')
})

test('Punctuation', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, '.')
  await page.getByRole('button', { name: '。' }).click()
  await input(page, '.')
  await expectValue(page, '。.')
})

test('No action', async ({ page }) => {
  await page.goto(baseURL)

  await input(page, 'wu', 'xiao ')
  await textarea(page).click() // Due to delay, expecting empty string here always succeeds.
  await input(page, 'you', 'xiao ')
  await expectValue(page, '有效')
})

test('Middle insertion', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'zuo', 'you ')
  await expectValue(page, '左右') // Due to async handler, ArrowLeft may happen when previous event isn't fully handled (still in edit mode), so rime will eat it.
  await page.keyboard.press('ArrowLeft')
  await input(page, 'zhong', 'jian ')
  await expectValue(page, '左中间右')
})

test('Control shortcut', async ({ page }) => {
  function Control (key: string) {
    const CONTROL = process.platform === 'darwin' ? 'Meta' : 'Control'
    return `${CONTROL}+${key}`
  }

  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'quan', 'xuan ')
  await expectValue(page, '全选')
  await page.keyboard.press(Control('a'))
  await page.keyboard.press(Control('x'))
  await expectValue(page, '')
  await page.keyboard.press(Control('v'))
  await expectValue(page, '全选')
  await page.keyboard.down('Shift')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.up('ArrowLeft')
  await page.keyboard.up('Shift')
  await page.keyboard.press(Control('c'))
  await page.keyboard.press('Home')
  await page.keyboard.press(Control('v'))
  await expectValue(page, '选全选')
})

test('Symbol', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, '/fh ')
  await expectValue(page, '©')
})

test('Emoji', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'chou', 'you', '2')
  await expectValue(page, '🦨')
})

test('Reverse lookup stroke', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 fan')).toBeVisible()
})

test('IndexedDB cache', async ({ page }) => {
  const resource = '/luna_pinyin.schema.yaml'
  let resolveDownload: (request: Request) => void
  let rejectDownload: (request: Request) => void
  let promise = new Promise(resolve => {
    resolveDownload = request => {
      if (request.url().endsWith(resource)) {
        resolve(null)
      }
    }
  })
  // @ts-ignore
  page.on('request', resolveDownload)
  await page.goto(baseURL)
  await promise
  // @ts-ignore
  page.off('request', resolveDownload)

  await textarea(page).click()
  await input(page, 'wang', 'luo ')
  await expectValue(page, '网络')

  promise = new Promise((resolve, reject) => {
    rejectDownload = request => {
      if (request.url().endsWith(resource)) {
        reject(new Error('IndexedDB is not used.'))
      }
    }
  })
  // @ts-ignore
  page.on('request', rejectDownload)

  await page.reload()
  await textarea(page).click()
  await input(page, 'huan', 'cun ')
  await Promise.race([expectValue(page, '缓存'), promise])
})
