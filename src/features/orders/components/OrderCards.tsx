import { clsx } from 'clsx'

import type { OrderDetail } from '@/api/types/ordering'
import { formatMoney } from '@/lib/money'

import styles from './OrderCards.module.css'

interface CardProps {
  order: OrderDetail
  className?: string
}

export function OrderItemsCard({ order, className }: CardProps) {
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
      <p className={styles.muted}>
        Prices are what you paid when you ordered, even if the catalog changes
        later.
      </p>
    </section>
  )
}

export function ShippingAddressCard({ order, className }: CardProps) {
  // The API stores the address as one string, a line per field (G14)
  const lines = order.shippingAddress.split(/\r?\n/).filter(Boolean)

  return (
    <section
      aria-labelledby="shipping-heading"
      className={clsx(styles.card, className)}
    >
      <h2 id="shipping-heading" className={styles.title}>
        Shipping to
      </h2>
      <address className={styles.address}>
        {lines.map((line, index) => (
          <span key={index}>{line}</span>
        ))}
      </address>
    </section>
  )
}
