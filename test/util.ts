import { expect, Page } from '@playwright/test'
const baseURL = 'http://localhost:4173/'

function textarea (page: Page) {
  return page.locator('textarea')
}

async function input (page: Page, sequence: string) {
  for (const key of sequence) {
    await page.keyboard.press(key)
  }
}

function expectValue (page: Page, value: string) {
  return expect(textarea(page)).toHaveValue(value)
}

export { baseURL, textarea, input, expectValue }
