import type { RouteObject } from 'react-router'

export const catalogRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => {
      const { CatalogPage } = await import('./CatalogPage')
      return { Component: CatalogPage }
    },
  },
  {
    path: 'products/:id',
    lazy: async () => {
      const { ProductPage } = await import('./ProductPage')
      return { Component: ProductPage }
    },
  },
]
