import { test, expect, Page, Locator } from '@playwright/test'
import {
  expectValue,
  expectSuccessfulDeployment,
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

async function installAndDeploy (page: Page, mp: Locator, ime: string) {
  await mp.getByRole('button').getByText('Install').click()
  await mp.getByRole('button').getByText('Deploy').click()
  await expectSuccessfulDeployment(page)
  await expect(variantButton(page)).toBeDisabled()
  return newIMEReady(page, ime)
}

test('Install from URL, then reload with query string', async ({ page }) => {
  const url = 'https://github.com/lotem/rime-zhengma/blob/master/zhengma.schema.yaml'
  const ime = '郑码'
  const sequence = 'uggx'
  const text = '郑码'
  await init(page)

  await page.getByText('Micro Plum').click()
  const mp = microPlum(page)
  await mp.getByPlaceholder('GitHub URL of *.schema.yaml').click()
  await page.keyboard.insertText(url)
  await installAndDeploy(page, mp, ime)
  await input(page, sequence, ' ')
  await expectValue(page, text)

  await page.reload()
  await newIMEReady(page, ime)
  await input(page, sequence, ' ')
  await expectValue(page, text)

  await init(page, '粤语拼音', 'jyut6ping3', '港')
  await input(page, 'saan', 'fung ', 'wai', 'ho ', 'syut', 'waa ')
  await expectValue(page, '山峯為何説話')
  await page.keyboard.press('F4')
  await expect(item(page, '4 朙月拼音·语句流')).toBeVisible()
})

test('Install from plum, then reset', async ({ page }) => {
  const target = 'ipa'
  const schemas = ['ipa_xsampa', 'ipa_yunlong']
  const names = ['X-SAMPA', '雲龍國際音標']
  const sequence = 'jj'
  const text = 'ʝ'
  await init(page)

  await page.getByText('Micro Plum').click()
  const mp = microPlum(page)
  await mp.getByLabel('jsDelivr').click()
  await mp.getByLabel('Plum').click()
  await mp.getByPlaceholder('rime-luna-pinyin').click()
  await page.keyboard.insertText(target)
  for (const schema of schemas) {
    await mp.getByText('luna_pinyin').click()
    await page.keyboard.insertText(schema)
    await mp.getByText('Schemas').click()
  }
  await installAndDeploy(page, mp, names[0])
  await select(page).click()
  await expect(page.locator('.n-base-select-option')).toHaveCount(names.length)
  await page.getByText(names[1]).click()
  await expect(select(page)).toHaveText(names[1])
  await input(page, sequence, ' ')
  await expectValue(page, text)

  await page.reload()
  await newIMEReady(page, names[1])
  await input(page, sequence, ' ')
  await expectValue(page, text)

  await page.getByText('Reset').click()
  await newIMEReady(page, luna)
  await input(page, 'jian', 'ti ')
  await expectValue(page, 'ʝ简体')
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
