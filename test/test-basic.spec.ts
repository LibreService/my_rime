import { test, Request, expect } from '@playwright/test'
import {
  baseURL,
  browserName,
  init,
  select,
  textarea,
  item,
  menu,
  input,
  expectValue,
  selectIME,
  changeLanguage,
  changeVariant,
  changePunctuation,
  changeEmoji,
  changeWidth,
  luna,
  cut,
  copy,
  copyLink,
  callOnDownload,
  patch
} from './util'

test('Simplified', async ({ page }) => {
  await init(page)

  await input(page, 'jian', 'ti ')
  await expectValue(page, '简体')
})

test('Traditional', async ({ page }) => {
  await init(page)

  await changeVariant(page, '繁')
  await input(page, 'fan', 'ti ')
  await expectValue(page, '繁體')
})

test('English/Chinese', async ({ page }) => {
  await init(page)

  await page.keyboard.press('Shift')
  await input(page, 'English')
  await expectValue(page, 'English')

  await changeLanguage(page, '中')
  await input(page, 'zhong', 'wen ')
  await expectValue(page, 'English中文')
})

test('Full width', async ({ page }) => {
  await init(page)

  await input(page, 'a')
  await page.keyboard.press('Enter')
  await changeWidth(page, true)
  await input(page, 'a')
  await page.keyboard.press('Enter')
  await expectValue(page, 'aａ')

  await page.getByRole('button', { name: '中' }).click()
  await input(page, 'b')
  await changeWidth(page, false)
  await input(page, 'b')
  await expectValue(page, 'aａｂb')
})

test('Punctuation', async ({ page }) => {
  await init(page)

  await input(page, '.')
  await changePunctuation(page, '.')
  await input(page, '.')
  await expectValue(page, '。.')
})

test('Punctuation restored', async ({ page }) => {
  await init(page)

  await changePunctuation(page, '.')
  await selectIME(page, luna)
  await input(page, ',')
  await expectValue(page, ',')
})

test('No action', async ({ page }) => {
  await init(page)

  await textarea(page).blur()
  await input(page, 'wu', 'xiao ')
  await textarea(page).click() // Due to delay, expecting empty string here always succeeds.
  await input(page, 'you', 'xiao ')
  await expectValue(page, '有效')
})

test('Middle insertion', async ({ page }) => {
  await init(page)

  await input(page, 'zuo', 'you ')
  await expectValue(page, '左右') // Due to async handler, ArrowLeft may happen when previous event isn't fully handled (still in edit mode), so rime will eat it.
  await page.keyboard.press('ArrowLeft')
  await input(page, 'zhong', 'jian ')
  await expectValue(page, '左中间右')
})

function Control (key: string) {
  const CONTROL = process.platform === 'darwin' ? 'Meta' : 'Control'
  return `${CONTROL}+${key}`
}

test('Tab composing', async ({ page }) => {
  test.skip(browserName(page) === 'firefox' || browserName(page) === 'webkit')
  await patch(page, (content: any) => {
    content.key_binder.bindings.push({
      accept: 'Tab',
      send: 'Page_Down',
      when: 'has_menu'
    }, {
      accept: 'Release+Tab',
      send: 'Page_Up',
      when: 'has_menu'
    })
  })
  await init(page)

  await input(page, 'zg')
  await expect(item(page, '1 这个')).toBeVisible()
  await page.keyboard.down('Tab')
  await expect(item(page, '1 找个')).toBeVisible()
  await page.keyboard.up('Tab')
  await expect(item(page, '1 这个')).toBeVisible()
})

test('Space no candidates', async ({ page }) => {
  test.skip(browserName(page) === 'firefox' || browserName(page) === 'webkit')
  await patch(page, (content: any) => {
    content.key_binder.bindings.push({
      accept: 'space',
      send: 'space',
      when: 'has_menu'
    }, {
      accept: 'space',
      send: 'Escape',
      when: 'composing'
    })
  })
  await init(page)

  await input(page, ' ')
  await expectValue(page, ' ')
  await input(page, 'j', ' ')
  await expectValue(page, ' 就')
  await input(page, 'u', ' ')
  await input(page, 'x', ' ')
  await expectValue(page, ' 就下')
})

test('Shift', async ({ page }) => {
  await init(page)

  await changeLanguage(page, 'En')
  await page.keyboard.down('Shift')
  await page.keyboard.down('!')
  await page.keyboard.up('Shift')
  await page.keyboard.up('1')
  await expectValue(page, '!')
})

test('Control shortcut', async ({ page }) => {
  await init(page)

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
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press(Control('v'))
  await expectValue(page, '选全选')
})

test('Control shortcut composing', async ({ page }) => {
  await init(page)

  await input(page, 'qj')
  await expect(item(page, '1 期间')).toBeVisible()
  await page.keyboard.press('Control+h')
  await expect(item(page, '1 去')).toBeVisible()
})

test('Control Shift shortcut', async ({ page }) => {
  await init(page)

  await page.keyboard.down('Control')
  await page.keyboard.down('Shift')
  await page.keyboard.down('@')
  await page.keyboard.up('@')
  await page.keyboard.up('Shift')
  await page.keyboard.up('Control')
  await expect(menu(page).nth(0)).toHaveText('En')
})

test('Alt composing', async ({ page }) => {
  test.skip(browserName(page) === 'firefox' || browserName(page) === 'webkit')
  await patch(page, (content: any) => {
    content.key_binder.bindings.push({
      accept: 'Alt_L',
      send: 'Page_Down',
      when: 'has_menu'
    }, {
      accept: 'Alt_R',
      send: 'Page_Up',
      when: 'has_menu'
    })
  })
  await init(page)

  await input(page, 'yy')
  await expect(item(page, '1 一样')).toBeVisible()
  await page.keyboard.press('AltLeft')
  await expect(item(page, '1 拥有')).toBeVisible()
  await page.keyboard.press('AltRight')
  await expect(item(page, '1 一样')).toBeVisible()
})

test('Alt shortcut composing', async ({ page }) => {
  await init(page)

  await input(page, 'xy')
  await expect(item(page, '1 需要')).toBeVisible()
  await page.keyboard.press('=')
  await expect(item(page, '1 想要')).toBeVisible()
  await page.keyboard.press('Alt+v')
  await expect(item(page, '1 需要')).toBeVisible()
})

test('Switcher', async ({ page }) => {
  await init(page)

  await changeVariant(page, '繁')
  await page.keyboard.press('F4')
  await expect(item(page, '4 粤语拼音')).toBeVisible()
  await input(page, '4')
  await expect(select(page)).toHaveText('粤语拼音')

  await page.keyboard.press('Control+`')
  await expect(item(page, '1 粤语拼音')).toBeVisible()
  await input(page, '2')
  await expect(item(page, '5 香港傳統漢字')).toBeVisible()
  await input(page, '5')
  await expect(menu(page).nth(1)).toHaveText('港')
  await input(page, 'syut ')
  await expectValue(page, '説')

  await page.keyboard.press('Control+`')
  await expect(item(page, '3 朙月拼音')).toBeVisible()
  await input(page, '3')
  await expect(select(page)).toHaveText('朙月拼音')
  await expect(menu(page).nth(1)).toHaveText('繁')

  await selectIME(page, '粤语拼音')
  await expect(menu(page).nth(1)).toHaveText('港')
})

test('Symbol', async ({ page }) => {
  await init(page)

  await input(page, '/fh ')
  await expectValue(page, '©')
})

test('Emoji', async ({ page }) => {
  await init(page)

  await input(page, 'chou', 'you', '2')
  await expectValue(page, '🦨')
  await changeEmoji(page, '🚫')
  await input(page, 'chou', 'you')
  await expect(item(page, '2 抽')).toBeVisible()
})

test('Reverse lookup stroke', async ({ page }) => {
  await init(page)

  await input(page, '`', 'ppzn')
  await expect(item(page, '1 反 fan')).toBeVisible()
})

test('IndexedDB cache', async ({ page }) => {
  test.skip(browserName(page) === 'firefox')
  const resource = /\/luna_pinyin.schema\.yaml$/
  let resolveDownload: (request: Request) => void
  let rejectDownload: (request: Request) => void
  let promise = new Promise(resolve => {
    resolveDownload = callOnDownload(resolve, resource)
  })
  // @ts-ignore
  page.on('request', resolveDownload)
  await init(page)
  await promise
  // @ts-ignore
  page.off('request', resolveDownload)

  await input(page, 'wang', 'luo ')
  await expectValue(page, '网络')

  promise = new Promise((resolve, reject) => {
    rejectDownload = callOnDownload(reject, resource, new Error('IndexedDB is not used.'))
  })
  // @ts-ignore
  page.on('request', rejectDownload)

  await page.reload()
  await expect(select(page)).toHaveText(luna)
  await textarea(page).click()
  await input(page, 'huan', 'cun ')
  await Promise.race([expectValue(page, '缓存'), promise])
})

test('Cut button', async ({ page }) => {
  test.skip(browserName(page) !== 'chromium')
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await init(page)

  await input(page, 'jian', 'qie ')
  await expectValue(page, '剪切')
  await cut(page)
  while (await page.evaluate(() => navigator.clipboard.readText()) !== '剪切');
  await expectValue(page, '')
})

test('Copy button', async ({ page }) => {
  test.skip(browserName(page) !== 'chromium')
  page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await init(page)

  await input(page, 'fu', 'zhi ')
  await expectValue(page, '复制')
  await copy(page)
  await expect(textarea(page)).toBeFocused()
  while (await page.evaluate(() => navigator.clipboard.readText()) !== '复制');
})

test('Copy link button', async ({ page }) => {
  test.skip(browserName(page) !== 'chromium')
  page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await init(page)

  await changeVariant(page, '繁')
  await copyLink(page)
  await expect(textarea(page)).toBeFocused()
  const copiedURL = `${baseURL}?schemaId=luna_pinyin&variantName=%E7%B9%81`
  while (await page.evaluate(() => navigator.clipboard.readText()) !== copiedURL);
})

test('Lua', async ({ page }) => {
  test.skip(browserName(page) === 'firefox' || browserName(page) === 'webkit')
  await patch(page, (content: any) => {
    content.engine.translators.push('lua_translator@*date_translator')
  })
  await init(page)

  await input(page, 'date', '2')
  await expectValue(page, /^\d+年\d+月\d+日$/)
})
