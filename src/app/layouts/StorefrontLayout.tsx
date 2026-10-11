import { clsx } from 'clsx'
import { Link, Outlet, ScrollRestoration } from 'react-router'

import { AccountMenu } from '@/features/auth'
import { CartLink } from '@/features/cart'
import { HeaderSearch } from '@/features/catalog'

import styles from './StorefrontLayout.module.css'

export function StorefrontLayout() {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>

      <header className={styles.header}>
        <div className={clsx('container', styles.headerInner)}>
          <Link to="/" className={styles.logo}>
            ShopShop
          </Link>

          <HeaderSearch />

          <nav aria-label="Account" className={styles.nav}>
            <AccountMenu className={styles.navLink} />
            <CartLink className={clsx(styles.navLink, styles.cartLink)} />
          </nav>
        </div>
      </header>

      <main id="main" className={clsx('container', styles.main)}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={clsx('container', styles.footerInner)}>ShopShop</div>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
