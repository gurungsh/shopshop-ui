import { clsx } from 'clsx'
import type { ReactNode } from 'react'

import type { OrderDetail } from '@/api/types/ordering'
import { formatMoney } from '@/lib/money'

import styles from './OrderCards.module.css'

interface CardProps {
  order: OrderDetail
  className?: string
}

export function OrderItemsCard({
  order,
  className,
  showNote = true,
}: CardProps & { showNote?: boolean }) {
  return (
    <section
      aria-labelledby="items-heading"
      className={clsx(styles.card, className)}
    >
      <h2 id="items-heading" className={styles.title}>
        Items
      </h2>
      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.itemName}>
              {item.productName}
              <span className={styles.muted}>
                {item.quantity} × {formatMoney(item.unitPrice)}
              </span>
            </span>
            <span>{formatMoney(item.totalPrice)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>Total</span>
        <span>{formatMoney(order.totalAmount)}</span>
      </div>
      {showNote && (
        <p className={styles.muted}>
          Prices are what you paid when you ordered, even if the catalog changes
          later.
        </p>
      )}
    </section>
  )
}

export function ShippingAddressCard({
  order,
  className,
  action,
}: CardProps & { action?: ReactNode }) {
  // The API stores the address as one string, a line per field (G14)
  const lines = order.shippingAddress.split(/\r?\n/).filter(Boolean)

  return (
    <section
      aria-labelledby="shipping-heading"
      className={clsx(styles.card, className)}
    >
      <div className={styles.heading}>
        <h2 id="shipping-heading" className={styles.title}>
          Shipping to
        </h2>
        {action}
      </div>
      <address className={styles.address}>
        {lines.map((line, index) => (
          <span key={index}>{line}</span>
        ))}
      </address>
    </section>
  )
}
