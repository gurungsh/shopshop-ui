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
