import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '@/api/errors'
import type { OrderDetail } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/date'

import { useCancelOrder } from '../api/mutations'
import { orderQuery } from '../api/queries'
import { OrderItemsCard, ShippingAddressCard } from '../components/OrderCards'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderTracker } from '../components/OrderTracker'
import { RetryPayment } from '../components/RetryPayment'
import { orderNumber } from '../lib/order-number'
import { DETAIL_POLL_INTERVAL_MS } from '../lib/polling'
import { cancellableStatuses, hasTracker } from '../lib/status'
import styles from './OrderDetailPage.module.css'

const endedCopy: Partial<Record<OrderDetail['status'], string>> = {
  Cancelled: 'This order was canceled. It won’t be shipped.',
  Refunded: 'This order was refunded. The payment was returned to your card.',
  Failed:
    'Every payment attempt failed, so we closed this order. You were not charged.',
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const order = useQuery({
    ...orderQuery(id),
    // Paused in background tabs
    refetchInterval: (query) =>
      query.state.data?.status === 'Pending' ? DETAIL_POLL_INTERVAL_MS : false,
  })

  if (order.error instanceof ApiError && order.error.status === 404) {
    return (
      <div className={styles.page}>
        <title>Order not found · ShopShop</title>
        <BackLink />
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
        <BackLink />
        {order.isError ? (
          <Banner
            title="We couldn’t load this order."
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
            Check your connection, then try again.
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

  return <Order key={order.data.id} order={order.data} />
}

function BackLink() {
  return (
    <Link to="/account/orders" className={styles.back}>
      <ArrowLeft size={16} aria-hidden="true" />
      All orders
    </Link>
  )
}

function Order({ order }: { order: OrderDetail }) {
  const cancel = useCancelOrder(order.id)
  const [confirming, setConfirming] = useState(false)
  const number = orderNumber(order.id)
  const ended = endedCopy[order.status]

  return (
    <div className={styles.page}>
      <title>{`Order ${number} · ShopShop`}</title>
      <BackLink />

      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>
            Order <span className={styles.number}>{number}</span>
          </h1>
          <div className={styles.meta}>
            <span>Placed {formatDate(order.createdAtUtc)}</span>
            <span aria-hidden="true">·</span>
            <span>Updated {formatDate(order.updatedAtUtc)}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        {cancellableStatuses.includes(order.status) && (
          <Button
            variant="dangerOutline"
            onClick={() => {
              cancel.reset()
              setConfirming(true)
            }}
          >
            Cancel order
          </Button>
        )}
      </div>

      {cancel.error && <CancelError error={cancel.error} />}

      {hasTracker(order.status) && <OrderTracker status={order.status} />}

      {order.status === 'Pending' && (
        <Banner tone="info" title="We’re processing your payment.">
          This usually takes a few seconds, and this page updates by itself.
        </Banner>
      )}

      {ended && (
        <p role="status" className={styles.ended}>
          {ended}
          {order.status === 'Failed' && (
            <>
              {' '}
              <Link to="/">Start a new order</Link>
            </>
          )}
        </p>
      )}

      {order.status === 'PaymentFailed' && <RetryPayment order={order} />}

      <div className={styles.cards}>
        <OrderItemsCard order={order} className={styles.items} />
        <ShippingAddressCard order={order} className={styles.shipping} />
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Cancel this order?"
        description={`Order ${number} will be canceled and won’t be shipped. You can’t undo this.`}
        cancelLabel="Keep order"
        confirmLabel="Cancel order"
        pendingLabel="Canceling…"
        variant="danger"
        isPending={cancel.isPending}
        onConfirm={() => {
          cancel.mutate(undefined, {
            onSettled: () => {
              setConfirming(false)
            },
          })
        }}
      />
    </div>
  )
}

function CancelError({ error }: { error: Error }) {
  if (error instanceof ApiError && error.status === 401) return null

  if (error instanceof ApiError && error.status === 409) {
    return (
      <Banner title="This order can’t be canceled anymore.">
        It moved on while you were looking. We’ve updated it to show where it is
        now.
      </Banner>
    )
  }

  return (
    <Banner title="We couldn’t cancel this order.">
      Something went wrong on our side. Try again in a moment.
    </Banner>
  )
}
