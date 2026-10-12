import type { OrderStatus, OrderSummary } from '@/api/types/ordering'

export const dashboardRanges = [7, 30, 90] as const
export type DashboardRange = (typeof dashboardRanges)[number]

export function parseRange(params: URLSearchParams): DashboardRange {
  const days = Number(params.get('range'))
  return dashboardRanges.find((r) => r === days) ?? 30
}

export function rangeStart(days: DashboardRange) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return start
}

export const toDay = (date: Date) => date.toLocaleDateString('en-CA')

/** Paid orders only: no Pending, PaymentFailed, Cancelled, Refunded or Failed */
export const revenueStatuses: OrderStatus[] = [
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
]

const STUCK_PENDING_MS = 10 * 60 * 1000

export function needsAttention(orders: OrderSummary[], now = Date.now()) {
  return orders.filter(
    (o) =>
      o.status === 'PaymentFailed' ||
      (o.status === 'Pending' &&
        now - Date.parse(o.createdAtUtc) > STUCK_PENDING_MS),
  )
}
