import { queryOptions } from '@tanstack/react-query'

import { revenueStatuses } from '../lib/dashboard'
import { ADMIN_REFRESH_MS } from '../lib/polling'
import { adminOrderKeys, searchAdminOrders } from './admin-queries'

// update backend with admin dashboard endpoints
const PAGE_SIZE = 100
const MAX_PAGES = 10

export function adminRevenueQuery(createdAfterUtc: string) {
  return queryOptions({
    queryKey: [...adminOrderKeys.lists(), 'revenue', createdAfterUtc],
    refetchInterval: ADMIN_REFRESH_MS,
    queryFn: async ({ signal }) => {
      let cents = 0
      let counted = 0
      let page = 1
      let totalPages = 1
      let totalCount = 0
      while (page <= Math.min(totalPages, MAX_PAGES)) {
        const result = await searchAdminOrders(
          {
            statuses: revenueStatuses,
            createdAfterUtc,
            page,
            pageSize: PAGE_SIZE,
          },
          signal,
        )
        totalPages = result.totalPages
        totalCount = result.totalCount
        counted += result.items.length
        for (const o of result.items) cents += Math.round(o.totalAmount * 100)
        page += 1
      }
      return { total: cents / 100, partial: counted < totalCount }
    },
  })
}
