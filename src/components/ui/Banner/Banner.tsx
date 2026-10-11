import { clsx } from 'clsx'
import { CircleAlert, Info } from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './Banner.module.css'

interface BannerProps {
  title: string
  children?: ReactNode
  action?: ReactNode
  /** `danger` interrupts screen readers (alert); `info` waits its turn (status) */
  tone?: 'danger' | 'info'
  className?: string
}

export function Banner({
  title,
  children,
  action,
  tone = 'danger',
  className,
}: BannerProps) {
  const Icon = tone === 'danger' ? CircleAlert : Info

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={clsx(styles.banner, styles[tone], className)}
    >
      <Icon size={20} aria-hidden="true" className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  )
}
