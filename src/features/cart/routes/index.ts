import type { RouteObject } from 'react-router'

export const cartRoutes: RouteObject[] = [
  {
    path: 'cart',
    lazy: async () => {
      const { CartPage } = await import('./CartPage')
      return { Component: CartPage }
    },
  },
]

/** Wrap in a route that requires a session */
export const checkoutRoutes: RouteObject[] = [
  {
    path: 'checkout',
    lazy: async () => {
      const { CheckoutPage } = await import('./CheckoutPage')
      return { Component: CheckoutPage }
    },
  },
]
