import type { SubmitEventHandler, ReactNode } from 'react'

import styles from './FormCard.module.css'

export function FormCard({
  onSubmit,
  children,
}: {
  onSubmit: SubmitEventHandler<HTMLFormElement>
  children: ReactNode
}) {
  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}
