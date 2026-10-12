import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { User } from '@/api/types/identity'
import type {
  AdminOrderQuery,
  OrderDetail,
  OrderSummary,
} from '@/api/types/ordering'
import type { Paged } from '@/api/types/paged'

import { ADMIN_REFRESH_MS } from '../lib/polling'
import { orderKeys } from './queries'

export const adminOrderKeys = {
  lists: () => [...orderKeys.all, 'admin', 'list'] as const,
  detail: (id: string) => [...orderKeys.all, 'admin', 'detail', id] as const,
}

function searchAdminOrders(query: AdminOrderQuery, signal: AbortSignal) {
  return apiFetch<Paged<OrderSummary>>('/api/admin/orders/search', {
    method: 'POST',
    body: query,
    signal,
  })
}

export function adminOrderListQuery(query: AdminOrderQuery) {
  return queryOptions({
    queryKey: [...adminOrderKeys.lists(), query],
    queryFn: ({ signal }) => searchAdminOrders(query, signal),
    placeholderData: keepPreviousData,
    refetchInterval: ADMIN_REFRESH_MS,
  })
}

export function adminOrderCountQuery(
  query: Omit<AdminOrderQuery, 'page' | 'pageSize'>,
) {
  const counted = { ...query, page: 1, pageSize: 1 }
  return queryOptions({
    queryKey: [...adminOrderKeys.lists(), counted],
    queryFn: ({ signal }) => searchAdminOrders(counted, signal),
    select: (result) => result.totalCount,
    refetchInterval: ADMIN_REFRESH_MS,
  })
}

export function adminUserQuery(id: string) {
  return queryOptions({
    queryKey: ['admin', 'users', id],
    queryFn: ({ signal }) =>
      apiFetch<User>(`/api/admin/users/${id}`, { signal }),
    staleTime: Infinity,
  })
}

export function adminOrderQuery(id: string) {
  return queryOptions({
    queryKey: adminOrderKeys.detail(id),
    queryFn: ({ signal }) =>
      apiFetch<OrderDetail>(`/api/admin/orders/${id}`, { signal }),
    staleTime: 0,
  })
}
