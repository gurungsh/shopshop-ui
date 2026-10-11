import { Check, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { Link } from 'react-router'

import type { OrderDetail } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'

import type { Outcome } from '../lib/outcome'
import { orderNumber } from '../lib/order-number'
import { OrderItemsCard, ShippingAddressCard } from './OrderCards'
import styles from './OrderOutcome.module.css'
import { OrderStatusBadge } from './OrderStatusBadge'
import { RetryPayment } from './RetryPayment'

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

interface OrderOutcomeProps {
  order: OrderDetail
  outcome: Outcome
  skippedItems: string[] | undefined
  onRestartPolling: () => void
}

export function OrderOutcome({
  order,
  outcome,
  skippedItems,
  onRestartPolling,
}: OrderOutcomeProps) {
  const Icon = icons[outcome]
  const { title, lede } = copy[outcome]

  return (
    <>
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
    </>
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
