import { expect, test } from '@playwright/test'

import { signInAs } from './helpers'

test('an admin moves an order to another status', async ({ page }) => {
  await signInAs(page, 'Admin')
  await page.goto('/admin/orders')
  await page
    .getByRole('link', { name: /^View order/ })
    .first()
    .click()

  await page.getByRole('button', { name: 'Change status' }).click()
  await page.getByRole('menuitem', { name: 'Delivered' }).click()

  await page.getByRole('button', { name: 'Change status' }).click()
  await expect(
    page.getByRole('menuitem', { name: 'Delivered (current)' }),
  ).toBeVisible()
})

test('a customer cannot open the admin area', async ({ page }) => {
  await signInAs(page, 'Customer')
  await page.goto('/admin')

  await expect(
    page.getByRole('heading', { name: 'You don’t have access to this page' }),
  ).toBeVisible()
})
