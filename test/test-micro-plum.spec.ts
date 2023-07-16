import { test, expect, Page } from '@playwright/test'
import {
  expectValue,
  init,
  select,
  menu,
  luna,
  input,
  item,
  textarea
} from './util'

async function newIMEReady (page: Page, ime: string) {
  await expect(select(page)).toHaveText(ime)
  return textarea(page).click()
}

function variantButton (page: Page) {
  return menu(page).nth(1)
}

function microPlum (page: Page) {
  return page.locator('.n-dialog')
}

test('Install from URL', async ({ page }) => {
  const url = 'https://github.com/lotem/rime-zhengma/blob/master/zhengma.schema.yaml'
  const ime = '郑码'
  const sequence = 'uggx'
  const text = '郑码'
  await init(page)

  await page.getByText('Micro Plum').click()
  const mp = microPlum(page)
  await mp.getByPlaceholder('GitHub URL of *.schema.yaml').click()
  await page.keyboard.insertText(url)
  await mp.getByRole('button').getByText('Install').click()
  await mp.getByRole('button').getByText('Deploy').click()
  await expect(page.getByText('Deployment succeeded')).toBeVisible()
  await expect(variantButton(page)).toBeDisabled()
  await newIMEReady(page, ime)
  await input(page, sequence, ' ')
  await expectValue(page, text)
})

test('Reset frequency', async ({ page }) => {
  await init(page)

  await input(page, 'ci', 'pin')
  await expect(item(page, '2 词频')).toBeVisible()
  await input(page, '2')
  await expectValue(page, '词频')
  // The first commit only lifts frequency temporarily so a second commit is needed.
  await input(page, 'ci', 'pin ')
  await expectValue(page, '词频词频')

  await page.reload()
  await newIMEReady(page, luna)
  await input(page, 'ci', 'pin ')
  await expectValue(page, '词频')

  await page.getByText('Reset').click()
  await newIMEReady(page, luna)
  await input(page, 'ci', 'pin')
  await expect(item(page, '2 词频')).toBeVisible()
})
