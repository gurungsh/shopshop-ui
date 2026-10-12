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

/** Children of the /admin route, which already requires an admin */
export const adminCatalogRoutes: RouteObject[] = [
  {
    path: 'products',
    lazy: async () => {
      const { AdminProductsPage } = await import('./AdminProductsPage')
      return { Component: AdminProductsPage }
    },
  },
  {
    path: 'products/new',
    lazy: async () => {
      const { AdminProductCreatePage } = await import('./AdminProductFormPages')
      return { Component: AdminProductCreatePage }
    },
  },
  {
    path: 'products/:id',
    lazy: async () => {
      const { AdminProductEditPage } = await import('./AdminProductFormPages')
      return { Component: AdminProductEditPage }
    },
  },
  {
    path: 'categories',
    lazy: async () => {
      const { AdminCategoriesPage } = await import('./AdminCategoriesPage')
      return { Component: AdminCategoriesPage }
    },
  },
  {
    path: 'categories/new',
    lazy: async () => {
      const { AdminCategoryCreatePage } =
        await import('./AdminCategoryFormPages')
      return { Component: AdminCategoryCreatePage }
    },
  },
  {
    path: 'categories/:id',
    lazy: async () => {
      const { AdminCategoryEditPage } = await import('./AdminCategoryFormPages')
      return { Component: AdminCategoryEditPage }
    },
  },
]
