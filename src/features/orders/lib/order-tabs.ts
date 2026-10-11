import type { OrderQuery, OrderStatus } from '@/api/types/ordering'

import { ongoingStatuses, pastStatuses } from './status'

const PAGE_SIZE = 10

export const orderTabs = ['all', 'ongoing', 'past'] as const
export type OrderTab = (typeof orderTabs)[number]

export const tabLabels: Record<OrderTab, string> = {
  all: 'All',
  ongoing: 'Ongoing',
  past: 'Past',
}

const tabStatuses: Record<OrderTab, OrderStatus[] | undefined> = {
  all: undefined,
  ongoing: ongoingStatuses,
  past: pastStatuses,
}

export function isOrderTab(value: unknown): value is OrderTab {
  return orderTabs.includes(value as OrderTab)
}

export function parseOrderTab(params: URLSearchParams) {
  const tab = params.get('tab')
  const page = Math.trunc(Number(params.get('page') ?? 1))
  return {
    tab: isOrderTab(tab) ? tab : 'all',
    page: Number.isFinite(page) && page > 1 ? page : 1,
  }
}

export function toOrderSearchParams(tab: OrderTab, page: number) {
  const params = new URLSearchParams()
  if (tab !== 'all') params.set('tab', tab)
  if (page > 1) params.set('page', String(page))
  return params
}

export function toOrderQuery(tab: OrderTab, page = 1): OrderQuery {
  return { statuses: tabStatuses[tab], page, pageSize: PAGE_SIZE }
}

export function toCountQuery(tab: OrderTab): Pick<OrderQuery, 'statuses'> {
  return { statuses: tabStatuses[tab] }
}
