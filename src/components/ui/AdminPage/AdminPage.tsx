import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './AdminPage.module.css'

interface AdminPageProps {
  title: string
  back?: { to: string; label: string }
  actions?: ReactNode
  children: ReactNode
}

export function AdminPage({ title, back, actions, children }: AdminPageProps) {
  return (
    <div className={styles.page}>
      <title>{`${title} · ShopShop Admin`}</title>
      {back && (
        <Link to={back.to} className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  )
}
