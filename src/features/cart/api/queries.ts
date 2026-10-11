import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { Product } from '@/api/types/catalog'
import type { Paged } from '@/api/types/paged'
import { MAX_LINES } from '@/stores/cart-store'

const cartKeys = {
  all: ['cart'] as const,
  products: (ids: string[]) => [...cartKeys.all, 'products', ids] as const,
}

export function cartProductsQuery(productIds: string[]) {
  const ids = [...productIds].sort()

  return queryOptions({
    queryKey: cartKeys.products(ids),
    queryFn: ({ signal }) =>
      apiFetch<Paged<Product>>('/api/products/search', {
        method: 'POST',
        body: { ids, page: 1, pageSize: MAX_LINES },
        signal,
      }),
    enabled: ids.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
    select: (result) => result.items,
  })
}
