import type { OrderStatus } from '@/api/types/ordering'

import { statusLabels } from '../lib/status'
import styles from './OrderStatusBadge.module.css'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={styles.badge} data-status={status}>
      <span className={styles.dot} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  )
}
