import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Button, buttonClass } from '@/components/ui/Button'

import styles from './ErrorPage.module.css'

interface ErrorPageProps {
  code: string
  title: string
  body: string
  retry?: boolean
  /** Shown under the body */
  children?: ReactNode
  /** Replaces the default buttons */
  actions?: ReactNode
}

export function ErrorPage({
  code,
  title,
  body,
  retry = false,
  children,
  actions,
}: ErrorPageProps) {
  return (
    <div className={styles.page}>
      <title>{`${title} · ShopShop`}</title>

      <header className={styles.header}>
        <div className="container">
          <Link to="/" className={styles.logo}>
            ShopShop
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <span className={styles.code}>{code}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.body}>{body}</p>
          {children}

          <div className={styles.actions}>
            {actions ??
              (retry ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => {
                      window.location.reload()
                    }}
                  >
                    Try again
                  </Button>
                  <Link
                    to="/"
                    className={buttonClass({
                      variant: 'secondary',
                      size: 'lg',
                    })}
                  >
                    Go to the shop
                  </Link>
                </>
              ) : (
                <Link to="/" className={buttonClass({ size: 'lg' })}>
                  Back to the shop
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
