import { expect, Page } from '@playwright/test'
const baseURL = 'http://localhost:4173/'

function textarea (page: Page) {
  return page.locator('textarea')
}

function panel (page: Page) {
  return page.locator('.n-popover')
}

async function input (page: Page, sequence: string) {
  for (const key of sequence) {
    await page.keyboard.press(key)
  }
}

function expectValue (page: Page, value: string) {
  return expect(textarea(page)).toHaveValue(value)
}

async function selectIME (page: Page, ime: string) {
  await page.locator('.n-select').click()
  return page.locator('.n-base-select-option').getByText(ime).click()
}

export { baseURL, textarea, panel, input, expectValue, selectIME }
