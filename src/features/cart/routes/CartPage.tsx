import { Link } from 'react-router'

import { Banner } from '@/components/ui/Banner'
import { buttonClass } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/money'

import { CartLineItem } from '../components/CartLineItem'
import { CartLoadError } from '../components/CartLoadError'
import { EmptyCart } from '../components/EmptyCart'
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

      <CartContent
        cart={cart}
        isEmpty={isEmpty}
        isError={isError}
        refetch={refetch}
      />
    </>
  )
}

function CartContent({
  cart,
  isEmpty,
  isError,
  refetch,
}: Omit<ReturnType<typeof usePricedCart>, 'removed'>) {
  if (isEmpty) {
    return <EmptyCart />
  }

  if (cart) {
    return <CartContents cart={cart} />
  }

  if (isError) {
    return <CartLoadError onRetry={() => void refetch()} />
  }

  return <CartSkeleton />
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

function CartSkeleton() {
  return (
    <div className={styles.layout} aria-hidden="true">
      <Skeleton className={styles.itemsSkeleton} />
      <Skeleton className={styles.summarySkeleton} />
    </div>
  )
}
