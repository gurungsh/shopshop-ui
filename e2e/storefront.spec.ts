import { expect, test } from '@playwright/test'

import { addToCartAndCheckout, fillShippingAddress } from './helpers'

test('browses and filters the catalog', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('30 products')).toBeVisible()

  await page.getByRole('checkbox', { name: 'Audio' }).click()
  await expect(page.getByRole('checkbox', { name: 'Audio' })).toBeChecked()
  await expect(page).toHaveURL(/category=/)
  await expect(
    page.getByRole('heading', { name: 'Over-ear Wireless Headphones' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Pour-over Coffee Set' }),
  ).toBeHidden()

  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('checkbox', { name: 'Audio' })).not.toBeChecked()
  await page.getByRole('searchbox', { name: 'Search products' }).fill('lamp')
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Desk Lamp with Dimmer' }),
  ).toBeVisible()

  await page
    .getByRole('link', { name: 'Desk Lamp with Dimmer' })
    .first()
    .click()
  await expect(
    page.getByRole('heading', { name: 'Desk Lamp with Dimmer', level: 1 }),
  ).toBeVisible()
})

test('registers a new account', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill('new.shopper@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Shopper1!')
  await page.getByLabel('Confirm password').fill('Shopper1!')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/')
  await page.getByRole('button', { name: 'Account' }).click()
  await expect(page.getByText('new.shopper@example.com')).toBeVisible()
})

test('keeps the cart across a reload', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Add Wireless Earbuds to cart' })
    .click()
  await page.reload()
  await page.getByRole('link', { name: 'Cart' }).click()

  await expect(
    page.getByRole('link', { name: 'Wireless Earbuds' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.getByText('$198.00').first()).toBeVisible()
})

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Email').fill('buyer@example.com')
    await page.getByLabel('Password', { exact: true }).fill('Shopper1!')
    await page.getByLabel('Confirm password').fill('Shopper1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL('/')
  })

  test('checks out with a card that succeeds', async ({ page }) => {
    await addToCartAndCheckout(page)
    await fillShippingAddress(page)
    await page.getByRole('button', { name: 'Place order' }).click()

    await expect(
      page.getByRole('heading', { name: 'Processing your payment' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: /Thank you|Order confirmed|confirmed/i,
      }),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('retries a declined payment with another card', async ({ page }) => {
    await addToCartAndCheckout(page)
    await fillShippingAddress(page)
    await page.getByRole('radio', { name: /Card that is declined/ }).check()
    await page.getByRole('button', { name: 'Place order' }).click()

    await expect(
      page.getByRole('heading', { name: 'Your payment didn’t go through' }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Your card was declined.')).toBeVisible()

    await page.getByRole('radio', { name: /Visa that succeeds/ }).check()
    await page.getByRole('button', { name: /^Pay \$/ }).click()
    await expect(
      page.getByRole('heading', { name: /Your payment didn’t go through/ }),
    ).toBeHidden({ timeout: 15_000 })
    await expect(
      page.getByRole('heading', { name: 'Processing your payment' }),
    ).toBeVisible()
  })

  test('cancels an order', async ({ page }) => {
    await addToCartAndCheckout(page)
    await fillShippingAddress(page)
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page).toHaveURL(/\/orders\/.+\/placed/)

    await page.goto('/account/orders')
    await page
      .getByRole('link', { name: /^View order/ })
      .first()
      .click()
    await page.getByRole('button', { name: 'Cancel order' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancel order' })
      .click()

    await expect(page.getByText('This order was canceled.')).toBeVisible()
  })
})
