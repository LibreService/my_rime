import { test, Request, expect } from '@playwright/test'
import {
  init,
  baseURL,
  item,
  callOnDownload
} from './util'

test('Debug', async ({ page }) => {
  await page.goto(`${baseURL}?debug=on`)

  const debugInput = page.locator('input')

  await debugInput.fill('d')
  await page.keyboard.press('Enter')
  await expect(item(page, '1 的')).toBeVisible()
  await expect(debugInput).toBeFocused()
  await debugInput.fill('{Page_Down}')
  await page.keyboard.press('Enter')
  await expect(item(page, '1 等')).toBeVisible()
})

test('Advanced', async ({ page }) => {
  const resource = /\/assets\/MySimulator-.*\.js$/
  let rejectDownload: (request: Request) => void
  let promise = new Promise((resolve, reject) => {
    rejectDownload = callOnDownload(reject, resource, new Error('MySimulator is eagerly loaded.'))
  })
  // @ts-ignore
  page.on('request', rejectDownload)
  await Promise.race([await init(page), promise])
  // @ts-ignore
  page.off('request', rejectDownload)

  let resolveDownload: (request: Request) => void
  promise = new Promise(resolve => {
    resolveDownload = callOnDownload(resolve, resource)
  })
  // @ts-ignore
  page.on('request', resolveDownload)
  await page.getByRole('switch').click()
  await promise
})
