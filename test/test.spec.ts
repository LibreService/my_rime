import { test, expect, Page } from '@playwright/test'

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

test('Simplified', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'jianti ')
  await expectValue(page, '简体')
})

test('Traditional', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await page.getByRole('button', { name: '简' }).click()
  await input(page, 'fanti ')
  await expectValue(page, '繁體')
})
