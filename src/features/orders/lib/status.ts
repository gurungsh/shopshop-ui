import type { OrderStatus } from '@/api/types/ordering'

export const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
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
