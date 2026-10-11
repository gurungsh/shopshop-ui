import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/Button'

import styles from './EmptyCart.module.css'

export function EmptyCart() {
  return (
    <div className={styles.empty}>
      <p>Your cart is empty.</p>
      <Link to="/" className={buttonClass({ variant: 'secondary' })}>
        Browse products
      </Link>
    </div>
  )
}
