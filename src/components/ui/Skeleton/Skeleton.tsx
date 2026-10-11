import { clsx } from 'clsx'

import styles from './Skeleton.module.css'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx(styles.skeleton, className)} />
}
