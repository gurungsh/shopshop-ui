import { useQuery } from '@tanstack/react-query'
import { Check, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { z } from 'zod'

import { ApiError } from '@/api/errors'
import type { OrderDetail, OrderStatus } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

import { orderQuery } from '../api/queries'
import { OrderItemsCard, ShippingAddressCard } from '../components/OrderCards'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { RetryPayment } from '../components/RetryPayment'
import { orderNumber } from '../lib/order-number'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '../lib/polling'
import styles from './OrderPlacedPage.module.css'

type Outcome =
  | 'processing'
  | 'slow'
  | 'confirmed'
  | 'paymentFailed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

function outcomeOf(status: OrderStatus, timedOut: boolean): Outcome {
  switch (status) {
    case 'Pending':
      return timedOut ? 'slow' : 'processing'
    case 'PaymentFailed':
      return 'paymentFailed'
    case 'Failed':
      return 'failed'
    case 'Cancelled':
      return 'cancelled'
    case 'Refunded':
      return 'refunded'
    default:
      return 'confirmed'
  }
}

const copy: Record<Outcome, { title: string; lede: string }> = {
  processing: {
    title: 'Processing your payment',
    lede: 'Your order is placed. We’re charging your card now, which usually takes a few seconds. You can leave this page and we’ll keep going.',
  },
  slow: {
    title: 'This is taking longer than usual',
    lede: 'Your order is placed, but we haven’t heard back about the payment yet. You don’t need to do anything. Check your orders in a few minutes, or come back to this page.',
  },
  confirmed: {
    title: 'Thanks, your order is confirmed',
    lede: 'Payment received. We’ll start getting your order ready.',
  },
  paymentFailed: {
    title: 'Your payment didn’t go through',
    lede: 'Your order is saved. Pay with a different card to keep it.',
  },
  failed: {
    title: 'We couldn’t take payment for this order',
    lede: 'Every payment attempt failed, so the order was closed.',
  },
  cancelled: {
    title: 'This order was canceled',
    lede: 'It won’t be charged or shipped.',
  },
  refunded: {
    title: 'This order was refunded',
    lede: 'The payment was returned to your card.',
  },
}

const icons: Record<Outcome, typeof Check> = {
  processing: LoaderCircle,
  slow: LoaderCircle,
  confirmed: Check,
  paymentFailed: TriangleAlert,
  failed: TriangleAlert,
  cancelled: X,
  refunded: X,
}

const placedState = z.object({ skippedItems: z.array(z.string()).min(1) })

export function OrderPlacedPage() {
  const { id = '' } = useParams()
  return <OrderPlaced key={id} id={id} />
}

function OrderPlaced({ id }: { id: string }) {
  const location = useLocation()
  const skippedItems = placedState.safeParse(location.state).data?.skippedItems

  // Restarts after a retry or "Check again", so each attempt gets the full window
  const [pollingSince, setPollingSince] = useState(Date.now)
  const order = useQuery({
    ...orderQuery(id),
    // Paused in background tabs (refetchIntervalInBackground is off)
    refetchInterval: (query) =>
      query.state.data?.status === 'Pending' &&
      Date.now() - pollingSince < POLL_TIMEOUT_MS
        ? POLL_INTERVAL_MS
        : false,
  })

  if (order.error instanceof ApiError && order.error.status === 404) {
    return (
      <div className={styles.page}>
        <title>Order not found · ShopShop</title>
        <h1 className={styles.title}>We couldn’t find that order</h1>
        <p className={styles.lede}>
          Check the link, or find it in{' '}
          <Link to="/account/orders">your orders</Link>.
        </p>
      </div>
    )
  }

  if (!order.data) {
    return (
      <div className={styles.page}>
        <title>Your order · ShopShop</title>
        {order.isError ? (
          <Banner
            title="We couldn’t load your order."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void order.refetch()}
              >
                Try again
              </Button>
            }
          >
            Your order is safe. Check your connection, then try again.
          </Banner>
        ) : (
          <div aria-hidden="true" className={styles.skeleton}>
            <Skeleton className={styles.skeletonHeading} />
            <Skeleton className={styles.skeletonCard} />
          </div>
        )}
      </div>
    )
  }

  const timedOut =
    order.data.status === 'Pending' &&
    order.dataUpdatedAt - pollingSince >= POLL_TIMEOUT_MS
  const outcome = outcomeOf(order.data.status, timedOut)

  return (
    <OrderOutcome
      order={order.data}
      outcome={outcome}
      skippedItems={skippedItems}
      onRestartPolling={() => {
        setPollingSince(Date.now())
        if (outcome === 'slow') void order.refetch()
      }}
    />
  )
}

interface OrderOutcomeProps {
  order: OrderDetail
  outcome: Outcome
  skippedItems: string[] | undefined
  onRestartPolling: () => void
}

function OrderOutcome({
  order,
  outcome,
  skippedItems,
  onRestartPolling,
}: OrderOutcomeProps) {
  const Icon = icons[outcome]
  const { title, lede } = copy[outcome]

  return (
    <div className={styles.page}>
      <title>{`${title} · ShopShop`}</title>

      <div className={styles.header}>
        <span className={styles.icon} data-outcome={outcome}>
          <Icon
            size={28}
            strokeWidth={2.4}
            aria-hidden="true"
            className={styles.iconGlyph}
          />
        </span>
        <div aria-live="polite" className={styles.headerText}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lede}>{lede}</p>
        </div>
        <div className={styles.meta}>
          <span>
            Order <span className={styles.number}>{orderNumber(order.id)}</span>
          </span>
          <span aria-hidden="true">·</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {skippedItems && <SkippedNotice names={skippedItems} />}

      {outcome === 'slow' && (
        <div>
          <Button variant="secondary" onClick={onRestartPolling}>
            Check again
          </Button>
        </div>
      )}

      {outcome === 'paymentFailed' && (
        <RetryPayment order={order} onRetried={onRestartPolling} />
      )}

      {outcome === 'failed' && (
        <Banner
          title="All payment attempts failed, so we closed this order."
          action={
            <Link to="/" className={buttonClass({ variant: 'secondary' })}>
              Start a new order
            </Link>
          }
        >
          You were not charged.
        </Banner>
      )}

      <OrderItemsCard order={order} />
      <ShippingAddressCard order={order} />

      <div className={styles.actions}>
        <Link to="/account/orders" className={buttonClass({ size: 'lg' })}>
          Your orders
        </Link>
        <Link
          to="/"
          className={buttonClass({ variant: 'secondary', size: 'lg' })}
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}

const list = new Intl.ListFormat('en-US', { type: 'conjunction' })

function SkippedNotice({ names }: { names: string[] }) {
  const one = names.length === 1
  return (
    <Banner
      tone="info"
      title={
        one
          ? '1 item wasn’t included.'
          : `${String(names.length)} items weren’t included.`
      }
    >
      {list.format(names)} became unavailable before your order went through.{' '}
      {one
        ? 'It isn’t part of this order and you won’t be charged for it.'
        : 'They aren’t part of this order and you won’t be charged for them.'}
    </Banner>
  )
}
