import type { AdminOrderQuery, OrderStatus } from '@/api/types/ordering'

import { type OrderTab, parseOrderTab, tabStatuses } from './order-tabs'
import { allStatuses } from './status'

const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZES = [10, 20, 50]

export const GUID_PATTERN = '[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}'
const GUID = new RegExp(`^${GUID_PATTERN}$`)

export interface AdminFilters {
  tab: OrderTab
  page: number
  size: number
  id: string
  customer: string
  from: string
  to: string
  min: string
  max: string
  statuses: OrderStatus[]
}

export function statusChoices(tab: OrderTab): OrderStatus[] {
  return tabStatuses[tab] ?? allStatuses
}

export function parseAdminFilters(params: URLSearchParams): AdminFilters {
  const { tab, page } = parseOrderTab(params)
  const choices = statusChoices(tab)
  const size = Number(params.get('size'))
  return {
    tab,
    page,
    size: PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE,
    id: params.get('id') ?? '',
    customer: params.get('customer') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    statuses: params
      .getAll('status')
      .filter((s): s is OrderStatus => choices.includes(s as OrderStatus)),
  }
}

export function toAdminSearchParams(filters: AdminFilters) {
  const params = new URLSearchParams()
  if (filters.tab !== 'all') params.set('tab', filters.tab)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.size !== DEFAULT_PAGE_SIZE) {
    params.set('size', String(filters.size))
  }
  for (const key of ['id', 'customer', 'from', 'to', 'min', 'max'] as const) {
    if (filters[key]) params.set(key, filters[key])
  }
  for (const status of filters.statuses) params.append('status', status)
  return params
}

function boundary(day: string, time: string) {
  const date = new Date(`${day}T${time}`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function amount(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : undefined
}

// A URL can hold anything, so bad values are dropped instead of sent
function toFilterQuery(filters: AdminFilters) {
  const query: Omit<AdminOrderQuery, 'page' | 'pageSize' | 'statuses'> = {
    createdAfterUtc: boundary(filters.from, '00:00:00'),
    createdBeforeUtc: boundary(filters.to, '23:59:59.999'),
    minTotalAmount: amount(filters.min),
    maxTotalAmount: amount(filters.max),
  }
  if (GUID.test(filters.id)) query.ids = [filters.id]
  if (GUID.test(filters.customer)) query.userIds = [filters.customer]
  return query
}

export function toAdminOrderQuery(filters: AdminFilters): AdminOrderQuery {
  return {
    ...toFilterQuery(filters),
    statuses: filters.statuses.length
      ? filters.statuses
      : tabStatuses[filters.tab],
    page: filters.page,
    pageSize: filters.size,
  }
}

/** The tab counts follow the filters, except the status chips */
export function toAdminCountQuery(filters: AdminFilters, tab: OrderTab) {
  return { ...toFilterQuery(filters), statuses: tabStatuses[tab] }
}
