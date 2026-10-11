import type { OrderStatus } from '@/api/types/ordering'

import { statusLabels, statusTones } from '../lib/status'
import styles from './OrderStatusBadge.module.css'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={styles.badge} data-tone={statusTones[status]}>
      <span className={styles.dot} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  )
}
