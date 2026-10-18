import type { OrderStatus } from '@/api/types/ordering'

export type Outcome =
  | 'processing'
  | 'slow'
  | 'confirmed'
  | 'paymentFailed'
  | 'failed'
  | 'canceled'
  | 'refunded'

export function outcomeOf(status: OrderStatus, timedOut: boolean): Outcome {
  switch (status) {
    case 'Pending':
      return timedOut ? 'slow' : 'processing'
    case 'PaymentFailed':
      return 'paymentFailed'
    case 'Failed':
      return 'failed'
    case 'Cancelled':
      return 'canceled'
    case 'Refunded':
      return 'refunded'
    default:
      return 'confirmed'
  }
}
