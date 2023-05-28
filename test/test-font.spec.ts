import { test, expect, Request } from '@playwright/test'
import {
  init,
  callOnDownload
} from './util'
import fonts from '../fonts.json'

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
    // @ts-ignore
    page.on('request', resolveDownload)
    await init(page)
    await page.getByText(name).click()
    await promise
    while (!await page.evaluate(() => document.fonts.keys().next().value));
    expect(await page.evaluate(() => document.fonts.keys().next().value.family)).toEqual(fontFamily)
    // @ts-ignore
    page.off('request', resolveDownload)
  }
})
