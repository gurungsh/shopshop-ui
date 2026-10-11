import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { Category, Product, ProductQuery } from '@/api/types/catalog'
import type { Paged } from '@/api/types/paged'

export const catalogKeys = {
  all: ['catalog'] as const,
  products: () => [...catalogKeys.all, 'products'] as const,
  productList: (query: ProductQuery) =>
    [...catalogKeys.products(), 'list', query] as const,
  product: (id: string) => [...catalogKeys.products(), 'detail', id] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
}

export function productQuery(id: string) {
  return queryOptions({
    queryKey: catalogKeys.product(id),
    queryFn: ({ signal }) =>
      apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`, { signal }),
  })
}

export function productListQuery(query: ProductQuery) {
  return queryOptions({
    queryKey: catalogKeys.productList(query),
    queryFn: ({ signal }) =>
      apiFetch<Paged<Product>>('/api/products/search', {
        method: 'POST',
        body: query,
        signal,
      }),
    placeholderData: keepPreviousData,
    select: (result) => ({
      ...result,
      items: result.items.filter((product) => product.isActive),
    }),
  })
}

export function categoriesQuery() {
  return queryOptions({
    queryKey: catalogKeys.categories(),
    queryFn: ({ signal }) =>
      apiFetch<Paged<Category>>('/api/categories/search', {
        method: 'POST',
        body: { page: 1, pageSize: 100 },
        signal,
      }),
    staleTime: 10 * 60_000,
    select: (result) =>
      result.items
        .filter((category) => category.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
  })
}
