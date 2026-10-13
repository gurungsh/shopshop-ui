import { expect, test } from '@playwright/test'

test('tells the shopper when the browser goes offline and when it returns', async ({
  page,
  context,
}) => {
  await page.goto('/')
  const banner = page.getByRole('status').filter({ hasText: 'You’re offline' })
  await expect(banner).toBeHidden()

  await context.setOffline(true)
  await expect(banner).toBeVisible()

  await context.setOffline(false)
  await expect(banner).toBeHidden()
})
