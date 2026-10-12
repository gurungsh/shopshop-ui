import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '@/api/errors'
import type { OrderDetail, OrderStatus } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'

import { useSetOrderStatus } from '../api/admin-mutations'
import { adminOrderQuery } from '../api/admin-queries'
import { ActivityCard, CustomerCard } from '../components/AdminOrderCards'
import { AdminShippingAddress } from '../components/AdminShippingAddress'
import { AdminStatusMenu } from '../components/AdminStatusMenu'
import { OrderItemsCard } from '../components/OrderCards'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderTracker } from '../components/OrderTracker'
import { orderNumber } from '../lib/order-number'
import {
  askFirstStatuses,
  hasTracker,
  nextStatus,
  statusLabels,
} from '../lib/status'
import styles from './AdminOrderDetailPage.module.css'

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const order = useQuery(adminOrderQuery(id))

  if (order.error instanceof ApiError && order.error.status === 404) {
    return (
      <div className={styles.page}>
        <title>Order not found · ShopShop Admin</title>
        <BackLink />
        <h1 className={styles.title}>We couldn’t find that order</h1>
        <p>
          Check the link, or search in <Link to="/admin/orders">orders</Link>.
        </p>
      </div>
    )
  }

  if (!order.data) {
    return (
      <div className={styles.page}>
        <title>Order · ShopShop Admin</title>
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
    <Link to="/admin/orders" className={styles.back}>
      <ArrowLeft size={16} aria-hidden="true" />
      All orders
    </Link>
  )
}

function Order({ order }: { order: OrderDetail }) {
  const setStatus = useSetOrderStatus(order.id)
  const [confirming, setConfirming] = useState<OrderStatus | null>(null)
  const number = orderNumber(order.id)
  const next = nextStatus(order.status)

  function change(status: OrderStatus) {
    setStatus.reset()
    if (askFirstStatuses.includes(status)) setConfirming(status)
    else setStatus.mutate(status)
  }

  const confirmingLabel = confirming ? statusLabels[confirming] : ''

  return (
    <div className={styles.page}>
      <title>{`Order ${number} · ShopShop Admin`}</title>
      <BackLink />

      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>
            Order <span className={styles.number}>{number}</span>
          </h1>
          <div className={styles.meta}>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className={styles.actions}>
          {next && (
            <Button
              disabled={setStatus.isPending}
              onClick={() => {
                change(next)
              }}
            >
              Mark as {statusLabels[next]}
            </Button>
          )}
          <AdminStatusMenu
            current={order.status}
            disabled={setStatus.isPending}
            onSelect={change}
          />
        </div>
      </div>

      {setStatus.isError && (
        <Banner title="We couldn’t change the status.">
          Something went wrong. Try again in a moment.
        </Banner>
      )}

      {hasTracker(order.status) && <OrderTracker status={order.status} />}

      {order.paymentFailureReason && (
        <Banner tone="info" title="Payment failed">
          {order.paymentFailureReason}
        </Banner>
      )}

      <div className={styles.cards}>
        <OrderItemsCard
          order={order}
          showNote={false}
          className={styles.items}
        />
        <div className={styles.side}>
          <CustomerCard userId={order.userId} />
          <AdminShippingAddress order={order} />
          <ActivityCard order={order} />
        </div>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null)
        }}
        title={`Mark this order as ${confirmingLabel}?`}
        description={`Order ${number} will be marked as ${confirmingLabel}. This only changes its status; no money is moved.`}
        confirmLabel={`Mark as ${confirmingLabel}`}
        pendingLabel="Saving…"
        variant="danger"
        isPending={setStatus.isPending}
        onConfirm={() => {
          if (!confirming) return
          setStatus.mutate(confirming, {
            onSettled: () => {
              setConfirming(null)
            },
          })
        }}
      />
    </div>
  )
}
