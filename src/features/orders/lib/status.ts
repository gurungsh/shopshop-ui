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

export type StatusTone =
  'warning' | 'info' | 'success' | 'caution' | 'danger' | 'neutral'

export const statusTones: Record<OrderStatus, StatusTone> = {
  Pending: 'warning',
  Confirmed: 'info',
  Processing: 'info',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'neutral',
  Refunded: 'neutral',
  Failed: 'danger',
  PaymentFailed: 'caution',
}
