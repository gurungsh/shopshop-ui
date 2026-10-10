import { clsx } from 'clsx'
import { Link } from 'react-router'

import styles from './ErrorPage.module.css'

interface ErrorPageProps {
  code: string
  title: string
  body: string
  retry?: boolean
}

export function ErrorPage({
  code,
  title,
  body,
  retry = false,
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

          <div className={styles.actions}>
            {retry ? (
              <>
                <button
                  type="button"
                  className={clsx(styles.action, styles.primary)}
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Try again
                </button>
                <Link to="/" className={clsx(styles.action, styles.secondary)}>
                  Go to the shop
                </Link>
              </>
            ) : (
              <Link to="/" className={clsx(styles.action, styles.primary)}>
                Back to the shop
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
