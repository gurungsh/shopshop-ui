import type { ReactNode } from 'react'

import styles from './DataTable.module.css'

interface DataTableProps {
  label: string
  /** Dims the rows while a new page loads */
  isStale?: boolean
  children: ReactNode
}

export function DataTable({
  label,
  isStale = false,
  children,
}: DataTableProps) {
  return (
    <div
      role="region"
      aria-label={label}
      // Focusable so keyboard users can scroll it on narrow screens
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={styles.scroller}
    >
      <table className={styles.table} aria-busy={isStale} data-stale={isStale}>
        {children}
      </table>
    </div>
  )
}
