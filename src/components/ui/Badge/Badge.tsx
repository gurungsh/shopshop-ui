import type { ReactNode } from 'react'

import styles from './Badge.module.css'

interface BadgeProps {
  tone: 'success' | 'neutral' | 'info'
  children: ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
