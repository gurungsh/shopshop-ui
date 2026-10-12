import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { Link } from 'react-router'

import type { OrderDetail } from '@/api/types/ordering'
import { formatDateTime } from '@/lib/date'

import { adminUserQuery } from '../api/admin-queries'
import styles from './OrderCards.module.css'

export function CustomerCard({
  userId,
  className,
}: {
  userId: string
  className?: string
}) {
  const { data, isError } = useQuery(adminUserQuery(userId))

  return (
    <section
      aria-labelledby="customer-heading"
      className={clsx(styles.card, className)}
    >
      <h2 id="customer-heading" className={styles.title}>
        Customer
      </h2>
      <p>{data?.email ?? (isError ? 'Email unavailable' : 'Loading…')}</p>
      <p className={styles.muted}>{userId}</p>
      <Link to={`/admin/orders?customer=${userId}`}>View their orders</Link>
    </section>
  )
}

// The API keeps no history, so these are the only two moments it knows (G29)
export function ActivityCard({
  order,
  className,
}: {
  order: OrderDetail
  className?: string
}) {
  return (
    <section
      aria-labelledby="activity-heading"
      className={clsx(styles.card, className)}
    >
      <h2 id="activity-heading" className={styles.title}>
        Activity
      </h2>
      <ul className={styles.items}>
        <li>
          Last updated
          <span className={styles.muted}>
            {' '}
            · {formatDateTime(order.updatedAtUtc)}
          </span>
        </li>
        <li>
          Order placed
          <span className={styles.muted}>
            {' '}
            · {formatDateTime(order.createdAtUtc)}
          </span>
        </li>
      </ul>
    </section>
  )
}
