import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { z } from 'zod'

import { ApiError } from '@/api/errors'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

import { orderQuery } from '../api/queries'
import { OrderOutcome } from '../components/OrderOutcome'
import { outcomeOf } from '../lib/outcome'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '../lib/polling'
import styles from './OrderPlacedPage.module.css'

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
    <div className={styles.page}>
      <OrderOutcome
        order={order.data}
        outcome={outcome}
        skippedItems={skippedItems}
        onRestartPolling={() => {
          setPollingSince(Date.now())
          if (outcome === 'slow') void order.refetch()
        }}
      />
    </div>
  )
}
