import { Component, type ErrorInfo, type ReactNode } from 'react'

import { reportError } from '@/api/report-error'
import { buttonClass } from '@/components/ui/Button'

import styles from './routes/ErrorPage.module.css'

interface State {
  failed: boolean
}

/**
 * Last line of defense above the router, so it cannot use router links.
 * Errors inside a route are caught by the router's errorElement first.
 */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  override state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, 'app')
    console.error(info.componentStack)
  }

  override render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className={styles.page}>
        <title>Something went wrong · ShopShop</title>
        <main className={styles.main}>
          <div className={styles.content}>
            <span className={styles.code}>Error</span>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.body}>
              An unexpected error stopped ShopShop from loading. Reload the page
              to try again.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={buttonClass({ size: 'lg' })}
                onClick={() => {
                  window.location.reload()
                }}
              >
                Reload the page
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
