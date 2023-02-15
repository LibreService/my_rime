import { test, expect, devices } from '@playwright/test'
import { baseURL, textarea, panelBox, input, expectValue } from '../test/util'

test.use({
  ...devices['iPhone 13 Mini']
})

test('Panel placement', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'zhiding')
  const box = await panelBox(page)
  expect(box.y).toBeLessThan(16)
})

test('Panel overflow', async ({ page }) => {
  await page.goto(baseURL)

  await textarea(page).click()
  await input(page, 'aaaaaaaaaaaaaaaaaaaaa ')
  await expectValue(page, '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊')

  await input(page, 'a')
  const { width } = (await page.locator('body').boundingBox())!
  const box = await panelBox(page)
  expect(box.x).toBeGreaterThan(width/2)
  expect(box.x + box.width).toBeLessThan(width)

  await page.mouse.move(box.x + box.width/2, box.y + box.height - 8)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width/2, box.y + box.height + 24)
  const newBox = await panelBox(page)
  expect(newBox.x + newBox.width).toBeLessThan(width)
  expect(newBox.y).toEqual(box.y + 32)
})
