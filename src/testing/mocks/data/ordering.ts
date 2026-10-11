import type { OrderDetail, OrderItem, OrderStatus } from '@/api/types/ordering'

import { products } from './catalog'
import { users } from './identity'

/** Payment.MaxRetries in Ordering.Api's appsettings */
export const MAX_RETRIES = 3

/** How long the mock Payment service takes to answer */
export const PAYMENT_DELAY_MS = 3000

export interface MockOrder {
  order: OrderDetail
  paymentAttempts: number
  paymentMethodId: string
  attemptStartedAt: number
}

export const orderId = (n: number) =>
  `e0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export function orderItem(productIndex: number, quantity: number): OrderItem {
  const product = products[productIndex]
  if (!product) throw new Error(`No mock product at ${String(productIndex)}`)
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity,
    totalPrice: product.price * quantity,
  }
}

function seed(
  n: number,
  status: OrderStatus,
  paymentAttempts: number,
  paymentFailureReason: string | null = null,
): MockOrder {
  const items = [orderItem(0, 1), orderItem(5, 2)]
  const date = `2026-10-${String(n).padStart(2, '0')}T15:30:00Z`
  return {
    order: {
      id: orderId(n),
      userId: users[0]?.id ?? '',
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      status,
      shippingAddress:
        'Alex Morgan\n221 Harbour Street\nPortland, OR 97201\nUnited States',
      items,
      createdAtUtc: date,
      updatedAtUtc: date,
      paymentFailureReason,
      paymentRetriesRemaining: 0,
    },
    paymentAttempts,
    paymentMethodId: 'pm_card_visa',
    attemptStartedAt: 0,
  }
}

// Orders for alex@example.com in each state the order placed page shows
const seeds: MockOrder[] = [
  seed(1, 'Confirmed', 1),
  seed(2, 'PaymentFailed', 2, 'Your card was declined.'),
  seed(3, 'Failed', MAX_RETRIES + 1, 'Your card has insufficient funds.'),
]

// MSW runs in the page, so new orders are kept in sessionStorage to survive
// a reload, as they would in the real database
const STORAGE_KEY = 'shopshop.mock.orders'

function loadSavedOrders(): MockOrder[] {
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? '[]',
    )
    return Array.isArray(saved) ? (saved as MockOrder[]) : []
  } catch {
    return []
  }
}

export const orders: MockOrder[] = [...seeds, ...loadSavedOrders()]

export function saveOrders() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(orders.filter((o) => !seeds.includes(o))),
    )
  } catch {
    // Without storage, orders last until the page reloads
  }
}

/** Adds an order for alex@example.com whose payment attempt starts now */
export function addMockOrder({
  id = crypto.randomUUID(),
  status = 'Pending',
  paymentAttempts = 1,
  paymentMethodId = 'pm_card_visa',
  paymentFailureReason = null,
}: Partial<
  Pick<MockOrder, 'paymentAttempts' | 'paymentMethodId'> &
    Pick<OrderDetail, 'id' | 'status' | 'paymentFailureReason'>
> = {}): string {
  const mock = seed(1, status, paymentAttempts)
  const now = new Date().toISOString()
  mock.order.id = id
  mock.order.createdAtUtc = now
  mock.order.updatedAtUtc = now
  mock.order.paymentFailureReason = paymentFailureReason
  mock.paymentMethodId = paymentMethodId
  mock.attemptStartedAt = Date.now()

  const existing = orders.findIndex((o) => o.order.id === id)
  if (existing === -1) orders.push(mock)
  else orders[existing] = mock
  return id
}
