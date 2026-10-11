import { clsx } from 'clsx'
import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './Banner.module.css'

interface BannerProps {
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}

export function Banner({ title, children, action, className }: BannerProps) {
  return (
    <div role="alert" className={clsx(styles.banner, className)}>
      <CircleAlert size={20} aria-hidden="true" className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  )
}
