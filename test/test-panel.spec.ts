import { test, expect } from '@playwright/test'
import { init, expectValue, input, panel, item } from './util'

test('Esc', async ({ page }) => {
  await init(page)

  await expect(panel(page)).not.toBeVisible()
  await input(page, 'lin', 'shi')
  await expect(panel(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel(page)).not.toBeVisible()
  await input(page, 'hou', 'xu ')
  await expectValue(page, '后续')
})

test('Enter', async ({ page }) => {
  await init(page)

  await input(page, 'shang', 'ping')
  await page.keyboard.press('Enter')
  await expectValue(page, 'shangping')
})

test('Home/End/Backspace/Delete', async ({ page }) => {
  await init(page)

  await input(page, 'alub')
  await page.keyboard.press('Home')
  await page.keyboard.press('Delete')
  await page.keyboard.press('End')
  await page.keyboard.press('Backspace')
  await page.keyboard.press(' ')
  await expectValue(page, '路')
})

test('Tab', async ({ page }) => {
  await init(page)

  await input(page, 'zhibiao')
  await expect(item(page, '1 指标')).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(item(page, '1 之')).toBeVisible()
})

test('Arrow Up/Down', async ({ page }) => {
  await init(page)

  await input(page, 'shang', 'xia')
  await page.keyboard.press('PageDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press(' ')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press(' ')
  await expectValue(page, '⬆️⬇️')
})

test('Arrow Left/Right', async ({ page }) => {
  await init(page)

  await input(page, 'zuo', 'you')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press(' ')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press(' ')
  await page.keyboard.press(' ')
  await expectValue(page, '做有偶')
})

test('Select', async ({ page }) => {
  await init(page)

  await input(page, 'shu', 'zi', 'dian', 'ji', '2')
  await item(page, '1 点击').click()
  await expectValue(page, '数字点击')
})

test('Switch page', async ({ page }) => {
  await init(page)

  await input(page, 'fan', 'ye')
  await expect(item(page, '1 翻页')).toBeVisible()
  await input(page, '=')
  await expect(item(page, '1 🍲')).toBeVisible()
  await panel(page).getByRole('button').nth(1).click()
  await expect(item(page, '1 🍱')).toBeVisible()
  await page.keyboard.press('PageDown')
  await expect(item(page, '1 反')).toBeVisible()
  await input(page, '-')
  await expect(item(page, '1 🍱')).toBeVisible()
  await panel(page).getByRole('button').nth(0).click()
  await expect(item(page, '1 🍲')).toBeVisible()
  await page.keyboard.press('PageUp')
  await expect(item(page, '1 翻页')).toBeVisible()
})

test('Delete candidate', async ({ page }) => {
  await init(page)

  await input(page, 'zzc')
  await expect(item(page, '1 自助餐')).toBeVisible()
  await expect(item(page, '2 制造出')).toBeVisible()
  await input(page, '2')
  await expectValue(page, '制造出')
  await input(page, 'zi', 'zao', 'ci', '42')
  await expectValue(page, '制造出自造词')

  await input(page, 'zzc')
  await expect(item(page, '1 自造词')).toBeVisible()
  await expect(item(page, '2 制造出')).toBeVisible()
  await expect(item(page, '3 自助餐')).toBeVisible()

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Shift+Delete')
  await expect(item(page, '1 自造词')).toBeVisible()
  await expect(item(page, '2 自助餐')).toBeVisible()
  await expect(item(page, '3 制造出')).toBeVisible()

  await page.keyboard.press('Shift+Delete')
  await expect(item(page, '1 自助餐')).toBeVisible()
  await expect(item(page, '2 制造出')).toBeVisible()
})
