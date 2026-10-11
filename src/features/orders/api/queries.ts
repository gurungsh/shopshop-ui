import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  OrderDetail,
  OrderQuery,
  OrderSummary,
} from '@/api/types/ordering'
import type { Paged } from '@/api/types/paged'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (query: OrderQuery) => [...orderKeys.lists(), query] as const,
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

function searchOrders(query: OrderQuery, signal: AbortSignal) {
  return apiFetch<Paged<OrderSummary>>('/api/orders/search', {
    method: 'POST',
    body: query,
    signal,
  })
}

export function orderListQuery(query: OrderQuery) {
  return queryOptions({
    queryKey: orderKeys.list(query),
    queryFn: ({ signal }) => searchOrders(query, signal),
    placeholderData: keepPreviousData,
  })
}

/** A one-row search, read for its totalCount */
export function orderCountQuery(query: Omit<OrderQuery, 'page' | 'pageSize'>) {
  const counted = { ...query, page: 1, pageSize: 1 }
  return queryOptions({
    queryKey: orderKeys.list(counted),
    queryFn: ({ signal }) => searchOrders(counted, signal),
    select: (result) => result.totalCount,
  })
}
