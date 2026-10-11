import { clsx } from 'clsx'
import { Link, Outlet, ScrollRestoration } from 'react-router'

import styles from './AuthLayout.module.css'

/** Sign in and register: just the logo, so nothing pulls the user away */
export function AuthLayout() {
  return (
    <div className={styles.shell}>
      <header className={clsx('container', styles.header)}>
        <Link to="/" className={styles.logo}>
          ShopShop
        </Link>
      </header>

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <ScrollRestoration />
    </div>
  )
}
