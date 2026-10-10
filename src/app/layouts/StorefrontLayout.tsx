import { clsx } from 'clsx'
import { Search, ShoppingCart, UserRound } from 'lucide-react'
import { Form, Link, Outlet, useSearchParams } from 'react-router'

import styles from './StorefrontLayout.module.css'

export function StorefrontLayout() {
  const [searchParams] = useSearchParams()

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

          <Form action="/" role="search" className={styles.search}>
            <Search
              size={18}
              aria-hidden="true"
              className={styles.searchIcon}
            />
            <label htmlFor="q" className="sr-only">
              Search products
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Search products"
              defaultValue={searchParams.get('q') ?? ''}
              className={styles.searchInput}
            />
          </Form>

          <nav aria-label="Account" className={styles.nav}>
            <Link to="/account/orders" className={styles.navLink}>
              <UserRound size={20} aria-hidden="true" />
              Account
            </Link>
            <Link to="/cart" className={clsx(styles.navLink, styles.cartLink)}>
              <ShoppingCart size={20} aria-hidden="true" />
              Cart
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className={clsx('container', styles.main)}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={clsx('container', styles.footerInner)}>ShopShop</div>
      </footer>
    </div>
  )
}
