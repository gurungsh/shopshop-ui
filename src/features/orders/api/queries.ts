import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { OrderDetail } from '@/api/types/ordering'

export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
}

export function orderQuery(id: string) {
  return queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: ({ signal }) =>
      apiFetch<OrderDetail>(`/api/orders/${id}`, { signal }),
    staleTime: 0,
  })
}
