import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { addToCartAndCheckout, fillShippingAddress, signInAs } from './helpers'
import { openRoute, routes } from './routes'

for (const route of routes) {
  test(`${route.name} has no serious axe violations`, async ({ page }) => {
    await openRoute(page, route)

    const { violations, passes } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The query devtools button only exists in development
      .exclude('.tsqd-parent-container')
      .analyze()

    expect(passes.length).toBeGreaterThan(0)
    const blocking = violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(
      blocking.map((v) => ({
        rule: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target.join(' ')),
      })),
    ).toEqual([])
  })
}

test('checkout works with the keyboard alone', async ({ page }) => {
  await signInAs(page, 'Customer')
  await addToCartAndCheckout(page)
  await fillShippingAddress(page)

  await page.getByRole('radio', { name: /Visa that succeeds/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(
    page.getByRole('radio', { name: /Card that is declined/ }),
  ).toBeChecked()
  await page.keyboard.press('ArrowUp')

  await page.getByRole('button', { name: 'Place order' }).focus()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/orders\/.+\/placed/)
})

test('the cancel dialog traps focus and returns it on Escape', async ({
  page,
}) => {
  await signInAs(page, 'Customer')
  await addToCartAndCheckout(page)
  await fillShippingAddress(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page).toHaveURL(/\/orders\/.+\/placed/)
  await page.goto('/account/orders')
  await page
    .getByRole('link', { name: /^View order/ })
    .first()
    .click()
  const open = page.getByRole('button', { name: 'Cancel order' })
  await open.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(open).toBeFocused()
})

test('respects reduced motion while a payment is processing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await signInAs(page, 'Customer')
  await addToCartAndCheckout(page)
  await fillShippingAddress(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(
    page.getByRole('heading', { name: 'Processing your payment' }),
  ).toBeVisible()

  const running = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) =>
            a.playState === 'running' &&
            a.effect?.getTiming().iterations === Infinity,
        ).length,
  )
  expect(running).toBe(0)
})
