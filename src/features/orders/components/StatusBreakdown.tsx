import { Link } from 'react-router'

import type { OrderStatus } from '@/api/types/ordering'

import { allStatuses, statusLabels } from '../lib/status'
import styles from './Dashboard.module.css'

export function StatusBreakdown({
  counts,
  from,
}: {
  counts: Record<OrderStatus, number | undefined>
  from: string
}) {
  const max = Math.max(1, ...allStatuses.map((s) => counts[s] ?? 0))
  return (
    <ul className={styles.bars}>
      {allStatuses.map((status) => {
        const count = counts[status]
        return (
          <li key={status}>
            <Link
              to={`/admin/orders?from=${from}&status=${status}`}
              className={styles.bar}
              data-status={status}
            >
              <span>{statusLabels[status]}</span>
              <span className={styles.track} aria-hidden="true">
                <span
                  className={styles.fill}
                  style={{
                    inlineSize: `${String(((count ?? 0) / max) * 100)}%`,
                  }}
                />
              </span>
              <span className={styles.count}>
                <span className="sr-only">: </span>
                {count === undefined ? '–' : String(count)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
