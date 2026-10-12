import { Link } from 'react-router'

import type { OrderSummary } from '@/api/types/ordering'
import { formatDateTime } from '@/lib/date'
import { formatMoney } from '@/lib/money'

import { orderNumber } from '../lib/order-number'
import styles from './Dashboard.module.css'
import { OrderStatusBadge } from './OrderStatusBadge'

export function NeedsAttention({ orders }: { orders: OrderSummary[] }) {
  return (
    <section aria-labelledby="needs" className={styles.card}>
      <div className={styles.cardHeading}>
        <h2 id="needs">Needs attention</h2>
        <Link to="/admin/orders?status=PaymentFailed">Payment failures</Link>
      </div>
      <p className={styles.note}>
        Payment failures, and orders still Pending 10 minutes after they were
        placed. Pending should clear in seconds once the payment result arrives.
      </p>
      {orders.length === 0 ? (
        <p className={styles.note}>
          Nothing needs attention. No failed payments and no stuck orders.
        </p>
      ) : (
        <div
          role="region"
          aria-label="Orders needing attention"
          // Focusable so keyboard users can scroll it on narrow screens
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={styles.scroller}
        >
          <table className={styles.attention}>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Issue</th>
                <th scope="col">Since</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/orders/${order.id}`}>
                      {orderNumber(order.id)}
                    </Link>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>{formatDateTime(order.updatedAtUtc)}</td>
                  <td>{formatMoney(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
