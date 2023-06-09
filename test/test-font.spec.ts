import { test, expect, Request, Page } from '@playwright/test'
import {
  init,
  callOnDownload
} from './util'
import fonts from '../fonts.json'

async function expectFirstFont (page: Page, fontFamily: string) {
  while (!await page.evaluate(() => document.fonts.keys().next().value));
  expect(await page.evaluate(() => document.fonts.keys().next().value.family)).toEqual(fontFamily)
}

test('Lazy cache font', async ({ page }) => {
  for (const {
    name,
    fontFamily,
    file
  } of fonts) {
    const resource = new RegExp(`/${file}$`)
    let resolveDownload: (request: Request) => void
    const promise = new Promise(resolve => {
      resolveDownload = callOnDownload(resolve, resource)
    })
    const checkbox = page.getByText(name)
    // @ts-ignore
    page.on('request', resolveDownload)
    await init(page)
    await checkbox.click()
    await promise
    await expectFirstFont(page, fontFamily)
    await checkbox.click()
    // @ts-ignore
    page.off('request', resolveDownload)
  }
})

test('Font restored after reload', async ({ page }) => {
  await init(page)

  const { fontFamily } = fonts[fonts.length - 1]
  const checkbox = page.locator('.n-checkbox-box').last()
  await checkbox.click()
  await expectFirstFont(page, fontFamily)
  await page.reload()
  await expect(checkbox).toBeChecked()
  await expectFirstFont(page, fontFamily)
})
