import { expect, Page } from '@playwright/test'

const baseURL = 'http://localhost:4173/'
const luna = '朙月拼音'

function browserName (page: Page) {
  return page.context().browser()!.browserType().name()
}

function textarea (page: Page) {
  return page.locator('textarea')
}

async function init (page: Page, ime?: string, schemaId?: string, variantName?: string) {
  let url = baseURL
  if (schemaId) {
    url += `?schemaId=${schemaId}`
    if (variantName !== undefined) {
      url += `&variantName=${variantName}`
    }
  }
  await page.goto(url)
  await expect(page.locator('.n-select')).toHaveText(ime || luna)
  await textarea(page).click()
}

function panel (page: Page) {
  return page.locator('.n-popover')
}

async function panelBox (page: Page) {
  const element = panel(page)
  await expect(element).toBeVisible()
  return (await element.boundingBox())!
}

function item (page: Page, text: string) {
  return panel(page).locator(`text=${text}`)
}

async function input (page: Page, ...sequences: string[]) {
  for (const sequence of sequences) {
    for (const key of sequence) {
      await page.keyboard.press(key)
    }
  }
}

async function inputCombo (page: Page, ...sequences: string[]) {
  for (const sequence of sequences) {
    for (const key of sequence) {
      await page.keyboard.down(key)
    }
    for (const key of sequence) {
      await page.keyboard.up(key)
    }
  }
}

function expectValue (page: Page, value: string | RegExp) {
  return expect(textarea(page)).toHaveValue(value)
}

async function selectIME (page: Page, ime: string) {
  const select = page.locator('.n-select')
  await select.click()
  const options = page.locator('.n-base-select-option')
  const first = options.getByText(luna, { exact: true })
  const klass = 'n-base-select-option--pending'
  const current = page.locator(`.${klass}`)
  await expect(current).toBeVisible()
  do {
    const focusedIME = (await current.textContent())!
    if (focusedIME === ime) {
      break
    }
    await page.keyboard.press('ArrowDown')
    const prev = options.getByText(focusedIME, { exact: true })
    await Promise.race([
      expect(prev).not.toHaveClass(new RegExp(`.*${klass}.*`)),
      Promise.all([
        expect(first).toBeVisible(),
        expect(prev).not.toBeVisible()
      ]) // from bottom to top
    ])
  } while (true)
  await current.click()
  return expect(select).toHaveText(ime) // ensure changed
}

function menu (page: Page) {
  return page.getByRole('group').nth(0).getByRole('button')
}

function bottomMenu (page: Page) {
  return page.getByRole('group').nth(1).getByRole('button')
}

const changeCharLabel = (n: number) => async (page: Page, label: string) => {
  const button = menu(page).nth(n)
  await button.click()
  return expect(button).toHaveText(label)
}

const changeLanguage = changeCharLabel(0)
const changeVariant = changeCharLabel(1)
const changeExtendedCharset = changeCharLabel(3)
const changePunctuation = changeCharLabel(4)
const changeEmoji = changeCharLabel(5)

async function changeWidth (page: Page, full: boolean) {
  const button = menu(page).nth(2)
  await button.click()
  return expect(button.locator('path')).toHaveAttribute('d', full ? /^M8.*/ : /^M7.*/)
}

function cut (page: Page) {
  return bottomMenu(page).nth(0).click()
}

function copy (page: Page) {
  return bottomMenu(page).nth(1).click()
}

function copyLink (page: Page) {
  return bottomMenu(page).nth(2).click()
}

export { baseURL, luna, browserName, init, textarea, panel, panelBox, item, menu, input, inputCombo, expectValue, selectIME, changeLanguage, changeVariant, changeExtendedCharset, changePunctuation, changeEmoji, changeWidth, cut, copy, copyLink }
