import { Link } from 'react-router'

import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/money'

import { CartLineItem } from '../components/CartLineItem'
import { type PricedCart, unavailableMessage } from '../lib/price-cart'
import { usePricedCart } from '../lib/use-priced-cart'
import styles from './CartPage.module.css'

export function CartPage() {
  const { cart, removed, isEmpty, isError, refetch } = usePricedCart()

  return (
    <>
      <title>Your cart · ShopShop</title>
      <h1 className={styles.title}>Your cart</h1>

      {removed.length > 0 && (
        <Banner
          tone="info"
          title={unavailableMessage(removed)}
          className={styles.notice}
        />
      )}

      {isEmpty ? (
        <EmptyCart />
      ) : cart ? (
        <CartContents cart={cart} />
      ) : isError ? (
        <Banner
          title="We couldn’t load your cart."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          }
        >
          Your items are saved. Check your connection, then try again.
        </Banner>
      ) : (
        <CartSkeleton />
      )}
    </>
  )
}

function CartContents({ cart }: { cart: PricedCart }) {
  return (
    <div className={styles.layout}>
      <section aria-label="Cart items" className={styles.items}>
        <ul className={styles.list}>
          {cart.lines.map((line) => (
            <CartLineItem key={line.product.id} line={line} />
          ))}
        </ul>
      </section>

      <aside aria-labelledby="summary-heading" className={styles.summary}>
        <h2 id="summary-heading" className={styles.summaryTitle}>
          Order summary
        </h2>
        <div className={styles.row}>
          <span className={styles.muted}>Items ({cart.itemCount})</span>
          <span>{formatMoney(cart.subtotal)}</span>
        </div>
        <div className={styles.total}>
          <span>Estimated total</span>
          <span>{formatMoney(cart.subtotal)}</span>
        </div>
        <p className={styles.note}>
          Prices are refreshed from the catalog. Your final total is confirmed
          when you place the order.
        </p>
        <Link to="/checkout" className={buttonClass({ size: 'lg' })}>
          Check out
        </Link>
        <Link to="/" className={styles.continue}>
          Continue shopping
        </Link>
      </aside>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className={styles.empty}>
      <p>Your cart is empty.</p>
      <Link to="/" className={buttonClass({ variant: 'secondary' })}>
        Browse products
      </Link>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className={styles.layout} aria-hidden="true">
      <Skeleton className={styles.itemsSkeleton} />
      <Skeleton className={styles.summarySkeleton} />
    </div>
  )
}
