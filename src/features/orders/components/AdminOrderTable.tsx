import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import type { OrderSummary } from '@/api/types/ordering'
import { formatDate } from '@/lib/date'
import { formatMoney } from '@/lib/money'

import { adminUserQuery } from '../api/admin-queries'
import { orderNumber } from '../lib/order-number'
import { OrderStatusBadge } from './OrderStatusBadge'
import styles from './OrderTable.module.css'

function Customer({ userId }: { userId: string }) {
  const { data } = useQuery(adminUserQuery(userId))
  return <span title={userId}>{data?.email ?? userId.slice(0, 8)}</span>
}

export function AdminOrderTable({
  orders,
  isStale = false,
}: {
  orders: OrderSummary[]
  isStale?: boolean
}) {
  return (
    <div
      role="region"
      aria-label="Orders"
      // Focusable so keyboard users can scroll it on narrow screens
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={styles.scroller}
    >
      <table className={styles.table} aria-busy={isStale} data-stale={isStale}>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Placed</th>
            <th scope="col">Last update</th>
            <th scope="col">Status</th>
            <th scope="col" className={styles.end}>
              Total
            </th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const number = orderNumber(order.id)
            return (
              <tr key={order.id}>
                <td className={styles.number}>{number}</td>
                <td>
                  <Customer userId={order.userId} />
                </td>
                <td>{formatDate(order.createdAtUtc)}</td>
                <td className={styles.muted}>
                  {formatDate(order.updatedAtUtc)}
                </td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className={styles.total}>
                  {formatMoney(order.totalAmount)}
                </td>
                <td className={styles.actions}>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    aria-label={`View order ${number}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
