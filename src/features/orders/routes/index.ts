import type { RouteObject } from 'react-router'

/** Wrap in a route that requires a session */
export const orderRoutes: RouteObject[] = [
  {
    path: 'orders/:id/placed',
    lazy: async () => {
      const { OrderPlacedPage } = await import('./OrderPlacedPage')
      return { Component: OrderPlacedPage }
    },
  },
  {
    path: 'account/orders',
    lazy: async () => {
      const { OrdersPage } = await import('./OrdersPage')
      return { Component: OrdersPage }
    },
  },
  {
    path: 'account/orders/:id',
    lazy: async () => {
      const { OrderDetailPage } = await import('./OrderDetailPage')
      return { Component: OrderDetailPage }
    },
  },
]
