import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  Category,
  CategoryQuery,
  Product,
  ProductQuery,
} from '@/api/types/catalog'
import type { Paged } from '@/api/types/paged'

import { catalogKeys } from './queries'

export function adminProductListQuery(query: ProductQuery) {
  return queryOptions({
    queryKey: [...catalogKeys.products(), 'admin', 'list', query],
    queryFn: ({ signal }) =>
      apiFetch<Paged<Product>>('/api/products/search', {
        method: 'POST',
        body: query,
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function adminProductQuery(id: string) {
  return queryOptions({
    queryKey: [...catalogKeys.products(), 'admin', 'detail', id],
    queryFn: ({ signal }) =>
      apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`, { signal }),
    staleTime: 0,
  })
}

export function adminCategoryListQuery(query: CategoryQuery) {
  return queryOptions({
    queryKey: [...catalogKeys.categories(), 'admin', 'list', query],
    queryFn: ({ signal }) =>
      apiFetch<Paged<Category>>('/api/categories/search', {
        method: 'POST',
        body: query,
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function adminCategoryQuery(id: string) {
  return queryOptions({
    queryKey: [...catalogKeys.categories(), 'admin', 'detail', id],
    queryFn: ({ signal }) =>
      apiFetch<Category>(`/api/categories/${encodeURIComponent(id)}`, {
        signal,
      }),
    staleTime: 0,
  })
}

// Inactive ones too, for the category pickers. Only the first 100 (the API's
// page limit): page through them if the catalog outgrows that.
export function adminCategoryOptionsQuery() {
  return queryOptions({
    queryKey: [...catalogKeys.categories(), 'admin', 'options'],
    queryFn: ({ signal }) =>
      apiFetch<Paged<Category>>('/api/categories/search', {
        method: 'POST',
        body: { page: 1, pageSize: 100 },
        signal,
      }),
    select: (result) =>
      [...result.items].sort((a, b) => a.name.localeCompare(b.name)),
  })
}
