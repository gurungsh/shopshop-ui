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

// Distinct in the first 8 characters, which is the order number on screen
export const orderId = (n: number) =>
  `e${String(n).padStart(7, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`

function orderItem(productIndex: number, quantity: number): OrderItem {
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

interface SeedOptions {
  paymentAttempts?: number
  paymentFailureReason?: string | null
  items?: OrderItem[]
  /** Defaults to Oct n, 2026 */
  createdAt?: string
  updatedDaysLater?: number
  userId?: string
}

function seed(
  n: number,
  status: OrderStatus,
  {
    paymentAttempts = 1,
    paymentFailureReason = null,
    items = [orderItem(0, 1), orderItem(5, 2)],
    createdAt = `2026-10-${String(n).padStart(2, '0')}T15:30:00Z`,
    updatedDaysLater = 0,
    userId = users[0]?.id ?? '',
  }: SeedOptions = {},
): MockOrder {
  const updated = new Date(createdAt)
  updated.setUTCDate(updated.getUTCDate() + updatedDaysLater)
  return {
    order: {
      id: orderId(n),
      userId,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      status,
      shippingAddress:
        'Alex Morgan\n221 Harbor Street\nPortland, OR 97201\nUnited States',
      items,
      createdAtUtc: createdAt,
      updatedAtUtc: updated.toISOString(),
      paymentFailureReason,
      paymentRetriesRemaining: 0,
    },
    paymentAttempts,
    paymentMethodId: 'pm_card_visa',
    attemptStartedAt: 0,
  }
}

const september = (day: number) =>
  `2026-09-${String(day).padStart(2, '0')}T10:00:00Z`

// Orders for alex@example.com in every status, enough for two pages, and one
// for someone else. 1 to 3 are the states the order placed page shows.
const seeds: MockOrder[] = [
  seed(1, 'Confirmed'),
  seed(2, 'PaymentFailed', {
    paymentAttempts: 2,
    paymentFailureReason: 'Your card was declined.',
  }),
  seed(3, 'Failed', {
    paymentAttempts: MAX_RETRIES + 1,
    paymentFailureReason: 'Your card has insufficient funds.',
  }),
  seed(4, 'Shipped', {
    items: [orderItem(1, 1)],
    createdAt: september(30),
    updatedDaysLater: 3,
  }),
  seed(5, 'Processing', {
    items: [orderItem(2, 1), orderItem(14, 1)],
    createdAt: september(24),
    updatedDaysLater: 2,
  }),
  seed(6, 'Delivered', {
    items: [orderItem(4, 1)],
    createdAt: september(12),
    updatedDaysLater: 6,
  }),
  seed(7, 'Cancelled', {
    items: [orderItem(3, 1), orderItem(15, 1)],
    createdAt: september(8),
  }),
  seed(8, 'Refunded', {
    items: [orderItem(7, 1)],
    createdAt: september(5),
    updatedDaysLater: 9,
  }),
  seed(9, 'Delivered', {
    items: [orderItem(9, 1), orderItem(21, 2)],
    createdAt: september(3),
    updatedDaysLater: 5,
  }),
  seed(10, 'Delivered', {
    items: [orderItem(10, 1)],
    createdAt: september(1),
    updatedDaysLater: 4,
  }),
  seed(11, 'Cancelled', {
    items: [orderItem(19, 1)],
    createdAt: '2026-08-30T10:00:00Z',
  }),
  seed(12, 'Delivered', {
    items: [orderItem(8, 2)],
    createdAt: '2026-08-03T10:00:00Z',
    updatedDaysLater: 6,
  }),
  seed(13, 'Shipped', {
    createdAt: september(20),
    userId: users[1]?.id ?? '',
  }),
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
  const mock = seed(1, status, { paymentAttempts })
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
