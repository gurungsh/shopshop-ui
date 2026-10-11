import { Link } from 'react-router'

import type { OrderSummary } from '@/api/types/ordering'
import { formatDate } from '@/lib/date'
import { formatMoney } from '@/lib/money'

import { orderNumber } from '../lib/order-number'
import { OrderStatusBadge } from './OrderStatusBadge'
import styles from './OrderTable.module.css'

interface OrderTableProps {
  orders: OrderSummary[]
  isStale?: boolean
}

export function OrderTable({ orders, isStale = false }: OrderTableProps) {
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
            const to = `/account/orders/${order.id}`
            return (
              <tr key={order.id}>
                <td className={styles.number}>{number}</td>
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
                  {order.status === 'PaymentFailed' && (
                    <Link
                      to={to}
                      aria-label={`Pay again for order ${number}`}
                      className={styles.payAgain}
                    >
                      Pay again
                    </Link>
                  )}
                  <Link to={to} aria-label={`View order ${number}`}>
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
