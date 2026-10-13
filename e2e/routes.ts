import { expect, type Page } from '@playwright/test'

import { addToCartAndCheckout, signInAs } from './helpers'

export interface RouteCase {
  name: string
  role?: 'Customer' | 'Admin'
  open: (page: Page) => Promise<void>
}

const heading = (page: Page) => page.getByRole('heading', { level: 1 })

async function openPath(page: Page, path: string) {
  await page.goto(path)
  await expect(heading(page)).toBeVisible()
}

/** Opens the first row's link on a list page, to reach a detail or edit page */
const openFirstRow =
  (listPath: string, link: string | RegExp) => async (page: Page) => {
    await page.goto(listPath)
    await page.getByRole('link', { name: link }).first().click()
    await expect(heading(page)).toBeVisible()
  }

export const routes: RouteCase[] = [
  { name: 'catalog', open: (page) => openPath(page, '/') },
  {
    name: 'product',
    open: async (page) => {
      await page.goto('/')
      await page.getByRole('link', { name: 'Wireless Earbuds' }).click()
      await expect(heading(page)).toBeVisible()
    },
  },
  { name: 'empty cart', open: (page) => openPath(page, '/cart') },
  {
    name: 'cart',
    open: async (page) => {
      await page.goto('/')
      await page
        .getByRole('button', { name: 'Add Wireless Earbuds to cart' })
        .click()
      await page.getByRole('link', { name: 'Cart' }).click()
      await expect(heading(page)).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Wireless Earbuds' }),
      ).toBeVisible()
    },
  },
  { name: 'sign in', open: (page) => openPath(page, '/login') },
  { name: 'register', open: (page) => openPath(page, '/register') },
  { name: 'not found', open: (page) => openPath(page, '/no-such-page') },
  {
    name: 'checkout',
    role: 'Customer',
    open: async (page) => {
      await addToCartAndCheckout(page)
      await expect(heading(page)).toBeVisible()
      await expect(page.getByLabel('Full name')).toBeVisible()
    },
  },
  {
    name: 'order history',
    role: 'Customer',
    open: (page) => openPath(page, '/account/orders'),
  },
  {
    name: 'order detail',
    role: 'Customer',
    open: openFirstRow('/account/orders', /^View order/),
  },
  {
    name: 'profile',
    role: 'Customer',
    open: (page) => openPath(page, '/account/profile'),
  },
  {
    name: 'forbidden',
    role: 'Customer',
    open: (page) => openPath(page, '/admin'),
  },
  {
    name: 'admin dashboard',
    role: 'Admin',
    open: (page) => openPath(page, '/admin'),
  },
  {
    name: 'admin orders',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/orders'),
  },
  {
    name: 'admin order detail',
    role: 'Admin',
    open: openFirstRow('/admin/orders', /^View order/),
  },
  {
    name: 'admin products',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/products'),
  },
  {
    name: 'admin new product',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/products/new'),
  },
  {
    name: 'admin categories',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/categories'),
  },
  {
    name: 'admin new category',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/categories/new'),
  },
  {
    name: 'admin users',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/users'),
  },
  {
    name: 'admin new user',
    role: 'Admin',
    open: (page) => openPath(page, '/admin/users/new'),
  },
]

export async function openRoute(page: Page, route: RouteCase) {
  if (route.role) await signInAs(page, route.role)
  await route.open(page)
  await page.waitForLoadState('networkidle')
}
