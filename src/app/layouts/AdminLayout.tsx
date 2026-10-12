import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'

import styles from './AdminLayout.module.css'

export function AdminLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/admin" className={styles.logo}>
          ShopShop Admin
        </Link>
        <nav aria-label="Admin" className={styles.nav}>
          <NavLink to="/admin" end className={styles.link}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={styles.link}>
            Orders
          </NavLink>
        </nav>
        <Link to="/" className={styles.link}>
          Back to store
        </Link>
      </aside>

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <ScrollRestoration />
    </div>
  )
}
