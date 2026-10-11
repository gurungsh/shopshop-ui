import { delay, http, HttpResponse } from 'msw'

import type {
  CreateOrderRequest,
  OrderDetail,
  OrderQuery,
  OrderStatus,
  OrderSummary,
  RetryPaymentRequest,
} from '@/api/types/ordering'

import { products } from '../data/catalog'
import {
  MAX_RETRIES,
  type MockOrder,
  orders,
  PAYMENT_DELAY_MS,
  saveOrders,
} from '../data/ordering'
import {
  apiUrl,
  errorResponse,
  paginate,
  userIdFrom,
  validationProblem,
} from '../http'

const PAYMENT_METHOD_ID = /^pm_[A-Za-z0-9_]+$/
const GENERIC_FAILURE = 'We couldn’t process your payment. Please try again.'

// Stripe's test payment methods. Ids from a real card form (pm_1...) succeed.
const declines: Record<string, string> = {
  pm_card_chargeDeclined: 'Your card was declined.',
  pm_card_chargeDeclinedInsufficientFunds: 'Your card has insufficient funds.',
}

function paymentOutcome(paymentMethodId: string): string | null {
  if (paymentMethodId in declines) return declines[paymentMethodId] ?? null
  if (paymentMethodId === 'pm_card_visa') return null
  // Stripe rejects unknown test ids, which Payment reports as the generic reason
  return paymentMethodId.startsWith('pm_card_') ? GENERIC_FAILURE : null
}

/** OrderingService.CustomerCancellableStatuses */
const cancellable: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'PaymentFailed',
]

const retriesRemaining = (mock: MockOrder) =>
  Math.max(0, MAX_RETRIES - (mock.paymentAttempts - 1))

// Payment answers through RabbitMQ; here the answer arrives on the first read
// after PAYMENT_DELAY_MS, like PaymentEventsConsumer updating the order
function settlePayment(mock: MockOrder) {
  const { order } = mock
  if (order.status !== 'Pending') return
  if (Date.now() - mock.attemptStartedAt < PAYMENT_DELAY_MS) return

  const failure = paymentOutcome(mock.paymentMethodId)
  if (!failure) {
    order.status = 'Confirmed'
  } else if (retriesRemaining(mock) > 0) {
    order.status = 'PaymentFailed'
  } else {
    order.status = 'Failed'
  }
  order.paymentFailureReason = failure
  order.updatedAtUtc = new Date().toISOString()
  saveOrders()
}

function toResponse(mock: MockOrder): OrderDetail {
  return {
    ...mock.order,
    paymentRetriesRemaining:
      mock.order.status === 'PaymentFailed' ? retriesRemaining(mock) : 0,
  }
}

function toSummary({ order }: MockOrder): OrderSummary {
  const { id, userId, totalAmount, status, createdAtUtc, updatedAtUtc } = order
  return { id, userId, totalAmount, status, createdAtUtc, updatedAtUtc }
}

function findOrder(id: unknown, userId: string) {
  const mock = orders.find((o) => o.order.id === id)
  return mock?.order.userId === userId ? mock : undefined
}

function paymentMethodErrors(paymentMethodId: string | undefined) {
  if (!paymentMethodId) return ['Payment method id is required.']
  if (!PAYMENT_METHOD_ID.test(paymentMethodId)) {
    return ['Payment method id must be a Stripe payment method id (pm_...).']
  }
  return []
}

// Mirrors Ordering.Api's OrderEndpoints, its validators and OrderingService
export const orderingHandlers = [
  http.post<never, Partial<CreateOrderRequest>>(
    apiUrl('/api/orders'),
    async ({ request }) => {
      const userId = userIdFrom(request)
      if (!userId) return new HttpResponse(null, { status: 401 })

      const {
        shippingAddress,
        items = [],
        paymentMethodId,
      } = await request.json()
      await delay()

      const errors: Record<string, string[]> = {}
      if (!shippingAddress) {
        errors.ShippingAddress = ['Shipping address is required.']
      } else if (shippingAddress.length > 500) {
        errors.ShippingAddress = [
          'Shipping address must not exceed 500 characters.',
        ]
      }
      const paymentErrors = paymentMethodErrors(paymentMethodId)
      if (paymentErrors.length) errors.PaymentMethodId = paymentErrors
      if (items.length === 0) {
        errors.Items = ['At least one item is required.']
      } else if (items.length > 100) {
        errors.Items = ['An order can contain at most 100 items.']
      }
      if (Object.keys(errors).length) return validationProblem(errors)

      const quantities = new Map<string, number>()
      for (const item of items) {
        quantities.set(
          item.productId,
          (quantities.get(item.productId) ?? 0) + item.quantity,
        )
      }

      const valid = [...quantities].flatMap(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId && p.isActive)
        return product ? [{ product, quantity }] : []
      })
      const skippedProductIds = [...quantities.keys()].filter(
        (productId) => !valid.some((v) => v.product.id === productId),
      )

      if (valid.length === 0) {
        return errorResponse(
          400,
          'None of the requested products are available.',
        )
      }

      const now = new Date().toISOString()
      const orderItems = valid.map(({ product, quantity }) => ({
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity,
        totalPrice: product.price * quantity,
      }))
      const mock: MockOrder = {
        order: {
          id: crypto.randomUUID(),
          userId,
          totalAmount: orderItems.reduce((sum, i) => sum + i.totalPrice, 0),
          status: 'Pending',
          shippingAddress: shippingAddress ?? '',
          items: orderItems,
          createdAtUtc: now,
          updatedAtUtc: now,
          paymentFailureReason: null,
          paymentRetriesRemaining: 0,
        },
        paymentAttempts: 1,
        paymentMethodId: paymentMethodId ?? '',
        attemptStartedAt: Date.now(),
      }
      orders.push(mock)
      saveOrders()

      return HttpResponse.json(
        { order: toResponse(mock), skippedProductIds },
        { status: 201 },
      )
    },
  ),

  http.post<never, OrderQuery>(
    apiUrl('/api/orders/search'),
    async ({ request }) => {
      const userId = userIdFrom(request)
      if (!userId) return new HttpResponse(null, { status: 401 })

      const { statuses, page = 1, pageSize = 20 } = await request.json()
      await delay()

      const errors: Record<string, string[]> = {}
      if (page < 1) errors.Page = ['Page must be at least 1.']
      if (pageSize < 1 || pageSize > 100) {
        errors.PageSize = ['Page size must be between 1 and 100.']
      }
      if (Object.keys(errors).length) return validationProblem(errors)

      const mine = orders.filter((mock) => mock.order.userId === userId)
      mine.forEach(settlePayment)

      const matching = mine
        .filter(
          (mock) => !statuses?.length || statuses.includes(mock.order.status),
        )
        .sort(
          (a, b) =>
            Date.parse(b.order.createdAtUtc) -
              Date.parse(a.order.createdAtUtc) ||
            a.order.id.localeCompare(b.order.id),
        )
        .map(toSummary)

      return HttpResponse.json(paginate(matching, page, pageSize))
    },
  ),

  http.get<{ id: string }>(
    apiUrl('/api/orders/:id'),
    async ({ request, params }) => {
      const userId = userIdFrom(request)
      if (!userId) return new HttpResponse(null, { status: 401 })

      const mock = findOrder(params.id, userId)
      await delay()
      if (!mock) return errorResponse(404, 'Order not found.')

      settlePayment(mock)
      return HttpResponse.json(toResponse(mock))
    },
  ),

  http.post<{ id: string }>(
    apiUrl('/api/orders/:id/cancel'),
    async ({ request, params }) => {
      const userId = userIdFrom(request)
      if (!userId) return new HttpResponse(null, { status: 401 })

      const mock = findOrder(params.id, userId)
      await delay()
      if (!mock) return errorResponse(404, 'Order not found.')

      settlePayment(mock)
      if (!cancellable.includes(mock.order.status)) {
        return errorResponse(409, 'Order can no longer be cancelled.')
      }

      mock.order.status = 'Cancelled'
      mock.order.updatedAtUtc = new Date().toISOString()
      saveOrders()

      return HttpResponse.json(toResponse(mock))
    },
  ),

  http.post<{ id: string }, Partial<RetryPaymentRequest>>(
    apiUrl('/api/orders/:id/retry-payment'),
    async ({ request, params }) => {
      const userId = userIdFrom(request)
      if (!userId) return new HttpResponse(null, { status: 401 })

      const { paymentMethodId } = await request.json()
      await delay()

      const paymentErrors = paymentMethodErrors(paymentMethodId)
      if (paymentErrors.length) {
        return validationProblem({ PaymentMethodId: paymentErrors })
      }

      const mock = findOrder(params.id, userId)
      if (!mock) return errorResponse(404, 'Order not found.')

      settlePayment(mock)
      if (
        mock.order.status !== 'PaymentFailed' ||
        retriesRemaining(mock) <= 0
      ) {
        return errorResponse(
          409,
          'Payment can only be retried after a failed payment, while retries remain.',
        )
      }

      mock.paymentAttempts += 1
      mock.paymentMethodId = paymentMethodId ?? ''
      mock.attemptStartedAt = Date.now()
      mock.order.status = 'Pending'
      mock.order.paymentFailureReason = null
      mock.order.updatedAtUtc = new Date().toISOString()
      saveOrders()

      return HttpResponse.json(toResponse(mock))
    },
  ),
]
