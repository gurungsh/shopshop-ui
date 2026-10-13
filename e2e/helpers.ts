import type { Page } from '@playwright/test'

const IDS = {
  Customer: 'd0000000-0000-4000-8000-000000000001',
  Admin: 'd0000000-0000-4000-8000-000000000002',
}
const EMAILS = { Customer: 'alex@example.com', Admin: 'admin@example.com' }

const base64Url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/**
 * Starts the page signed in as a mock user. The mock admin has no password, so
 * the session is written straight to storage, in the shape the auth store
 * persists.
 */
export async function signInAs(page: Page, role: 'Customer' | 'Admin') {
  const expiresAt = Date.now() + 60 * 60 * 1000
  const token = [
    base64Url({ alg: 'none', typ: 'JWT' }),
    base64Url({
      sub: IDS[role],
      email: EMAILS[role],
      role,
      exp: Math.floor(expiresAt / 1000),
    }),
    'e2e-signature',
  ].join('.')
  const stored = JSON.stringify({
    state: {
      session: {
        user: { id: IDS[role], email: EMAILS[role], role },
        token,
        expiresAt,
      },
    },
    version: 0,
  })

  await page.addInitScript((value) => {
    sessionStorage.setItem('shopshop.session', value)
  }, stored)
}

export async function fillShippingAddress(page: Page) {
  await page.getByLabel('Full name').fill('Alex Doe')
  await page.getByLabel('Street address').fill('1 Main St')
  await page.getByLabel('City').fill('Springfield')
  await page.getByLabel('State / region').fill('IL')
  await page.getByLabel('Postal code').fill('62701')
}

/** Adds a product from the catalog, then opens checkout through the cart */
export async function addToCartAndCheckout(page: Page) {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Add Wireless Earbuds to cart' })
    .click()
  await page.getByRole('link', { name: 'Cart' }).click()
  await page.getByRole('link', { name: 'Check out' }).click()
}
