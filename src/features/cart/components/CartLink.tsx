import { ShoppingCart } from 'lucide-react'
import { NavLink } from 'react-router'

import { selectItemCount, useCartStore } from '@/stores/cart-store'

import styles from './CartLink.module.css'

export function CartLink({ className }: { className?: string }) {
  const count = useCartStore(selectItemCount)
  const label = `${String(count)} ${count === 1 ? 'item' : 'items'} in cart`

  return (
    <>
      <NavLink
        to="/cart"
        aria-label={count > 0 ? `Cart, ${label}` : 'Cart'}
        className={className}
      >
        <ShoppingCart size={20} aria-hidden="true" />
        Cart
        {count > 0 && (
          <span aria-hidden="true" className={styles.badge}>
            {count}
          </span>
        )}
      </NavLink>
      <span role="status" className="sr-only">
        {count > 0 ? label : ''}
      </span>
    </>
  )
}
