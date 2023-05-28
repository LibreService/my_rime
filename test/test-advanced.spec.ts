import { test, Request, expect, Page } from '@playwright/test'
import {
  init,
  select,
  debugURL,
  textarea,
  input,
  expectValue,
  item,
  selectIME,
  chain,
  callOnDownload
} from './util'

function deploy (page: Page) {
  return page.locator('.n-button').getByText('Deploy').click()
}

const rimeDir = 'build/librime_native/bin/'

async function upload (page: Page, files: string[]) {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Click, or drag files to this area').click()
  ])
  return fileChooser.setFiles(files.map(file => rimeDir + file))
}

test('Debug', async ({ page }) => {
  await page.goto(debugURL)

  const debugInput = page.locator('input')

  await debugInput.fill('d')
  await page.keyboard.press('Enter')
  await expect(item(page, '1 的')).toBeVisible()
  await expect(debugInput).toBeFocused()
  await debugInput.fill('{Page_Down}')
  await page.keyboard.press('Enter')
  await expect(item(page, '1 等')).toBeVisible()

  for (const name of ['rime', 'opencc']) {
    await expect(page.locator('.n-tree').getByText(name, { exact: true })).toBeVisible()
  }
})

test('Advanced', async ({ page }) => {
  const simulator = /\/assets\/MySimulator-.*\.js$/
  const editor = /\/assets\/MyEditor-.*\.js$/
  let rejectDownloadSimulator: (request: Request) => void
  let rejectDownloadEditor: (request: Request) => void
  let simulatorPromise = new Promise((resolve, reject) => {
    rejectDownloadSimulator = callOnDownload(reject, simulator, new Error('MySimulator is eagerly loaded.'))
  })
  let editorPromise = new Promise((resolve, reject) => {
    rejectDownloadEditor = callOnDownload(reject, editor, new Error('MyEditor is eagerly loaded.'))
  })
  // @ts-ignore
  const rejectDownload = chain(rejectDownloadSimulator, rejectDownloadEditor)
  page.on('request', rejectDownload)
  await Promise.race([await init(page), simulatorPromise, editorPromise])
  page.off('request', rejectDownload)

  let resolveDownloadSimulator: (request: Request) => void
  let resolveDownloadEditor: (request: Request) => void
  simulatorPromise = new Promise(resolve => {
    resolveDownloadSimulator = callOnDownload(resolve, simulator)
  })
  editorPromise = new Promise(resolve => {
    resolveDownloadEditor = callOnDownload(resolve, editor)
  })
  // @ts-ignore
  const resolveDownload = chain(resolveDownloadSimulator, resolveDownloadEditor)
  page.on('request', resolveDownload)
  await page.getByRole('switch').click()
  await Promise.all([simulatorPromise, editorPromise])
})

test('Deploy', async ({ page }) => {
  await page.goto(debugURL)

  await selectIME(page, '粤语拼音')

  await deploy(page)
  await expect(page.getByText('Deployment failed')).toBeVisible()

  await page.getByText('rime', { exact: true }).click({
    button: 'right'
  })
  await page.getByText('Upload', { exact: true }).click()
  await upload(page, [
    'default.yaml',
    'essay.txt',
    'key_bindings.yaml',
    'luna_pinyin.dict.yaml',
    'luna_pinyin.schema.yaml',
    'pinyin.yaml',
    'punctuation.yaml',
    'symbols.yaml'
  ])
  await page.locator('.n-dialog .n-button').getByText('Upload').click()

  const content = page.locator('.cm-content')
  await page.locator('.n-tree').getByText('default.yaml', { exact: true }).click()
  await content.click()
  await page.keyboard.press('Control+f')
  await page.keyboard.insertText('  - schema: luna_pinyin_fluency[\\s\\S]+- schema: quick5\\n')
  await page.getByLabel('regexp').check()
  await page.getByText('replace all').click()
  await content.click()
  await page.keyboard.press('Control+s')

  await deploy(page)
  await expect(page.getByText('Deployment succeeded')).toBeVisible()
  await expect(select(page)).toHaveText('朙月拼音')

  await textarea(page).click()
  await input(page, 'fan', 'ti ')
  await expectValue(page, '繁體')
})
