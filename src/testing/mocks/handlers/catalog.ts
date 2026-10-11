import { delay, http, HttpResponse } from 'msw'

import type {
  Category,
  CategoryQuery,
  Product,
  ProductQuery,
} from '@/api/types/catalog'
import type { Paged } from '@/api/types/paged'

import { categories, products } from '../data/catalog'
import { apiUrl, errorResponse, paginate } from '../http'

// Mirrors Catalog.Api's ProductService and CategoryService
export const catalogHandlers = [
  http.post<never, ProductQuery, Paged<Product>>(
    apiUrl('/api/products/search'),
    async ({ request }) => {
      const { categoryIds, name, minPrice, maxPrice, page, pageSize } =
        await request.json()

      const matches = products
        .filter(
          (p) =>
            (!categoryIds?.length || categoryIds.includes(p.categoryId)) &&
            // Case-sensitive, like the backend's Contains on Postgres
            (!name?.trim() || p.name.includes(name)) &&
            (minPrice === undefined || p.price >= minPrice) &&
            (maxPrice === undefined || p.price <= maxPrice),
        )
        .sort((a, b) => a.createdAtUtc.localeCompare(b.createdAtUtc))

      await delay()
      return HttpResponse.json(paginate(matches, page, pageSize))
    },
  ),

  http.get<{ id: string }>(apiUrl('/api/products/:id'), async ({ params }) => {
    const product = products.find((p) => p.id === params.id)
    await delay()
    if (!product) return errorResponse(404, 'Product not found.')
    return HttpResponse.json(product)
  }),

  http.post<never, CategoryQuery, Paged<Category>>(
    apiUrl('/api/categories/search'),
    async ({ request }) => {
      const { ids, page, pageSize } = await request.json()
      const matches = categories.filter(
        (c) => !ids?.length || ids.includes(c.id),
      )
      await delay()
      return HttpResponse.json(paginate(matches, page, pageSize))
    },
  ),

  http.get<{ id: string }>(
    apiUrl('/api/categories/:id'),
    async ({ params }) => {
      const category = categories.find((c) => c.id === params.id)
      await delay()
      if (!category) return errorResponse(404, 'Category not found.')
      return HttpResponse.json(category)
    },
  ),
]
