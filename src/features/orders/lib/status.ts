import type { OrderStatus } from '@/api/types/ordering'

export const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Canceled',
  Refunded: 'Refunded',
  Failed: 'Failed',
  PaymentFailed: 'Payment failed',
}

/** The tabs on the order history page (G18) */
export const ongoingStatuses: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'PaymentFailed',
]

export const pastStatuses: OrderStatus[] = [
  'Delivered',
  'Cancelled',
  'Refunded',
  'Failed',
]

/** OrderingService.CustomerCancellableStatuses */
export const cancellableStatuses: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'PaymentFailed',
]

export const trackerSteps: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
]

/** The happy path. PaymentFailed sits on the first step (G19) */
export function hasTracker(status: OrderStatus): boolean {
  return status === 'PaymentFailed' || trackerSteps.includes(status)
}

export const allStatuses = Object.keys(statusLabels) as OrderStatus[]

/** The status "Mark as next" moves to. Nothing follows Delivered or the dead ends */
export function nextStatus(status: OrderStatus): OrderStatus | undefined {
  const index = trackerSteps.indexOf(status)
  return index === -1 ? undefined : trackerSteps[index + 1]
}

/** Moves that end an order, or can't be undone from here, so ask first */
export const askFirstStatuses: OrderStatus[] = [
  'Cancelled',
  'Refunded',
  'Failed',
]
