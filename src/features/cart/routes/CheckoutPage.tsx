import { Link } from 'react-router'

import { PaymentProvider } from '@/components/payment'
import { Banner } from '@/components/ui/Banner'
import { Skeleton } from '@/components/ui/Skeleton'

import { CartLoadError } from '../components/CartLoadError'
import { CheckoutForm } from '../components/CheckoutForm'
import { EmptyCart } from '../components/EmptyCart'
import { unavailableMessage } from '../lib/price-cart'
import { usePricedCart } from '../lib/use-priced-cart'
import styles from './CheckoutPage.module.css'

export function CheckoutPage() {
  const { cart, removed, isEmpty, isError, refetch } = usePricedCart()

  return (
    <>
      <title>Checkout · ShopShop</title>
      <div className={styles.heading}>
        <h1 className={styles.title}>Checkout</h1>
        <Link to="/cart">Back to cart</Link>
      </div>

      {removed.length > 0 && (
        <Banner
          tone="info"
          title={unavailableMessage(removed)}
          className={styles.notice}
        />
      )}

      <CheckoutContent
        cart={cart}
        isEmpty={isEmpty}
        isError={isError}
        refetch={refetch}
      />
    </>
  )
}

function CheckoutContent({
  cart,
  isEmpty,
  isError,
  refetch,
}: Omit<ReturnType<typeof usePricedCart>, 'removed'>) {
  if (isEmpty) {
    return <EmptyCart />
  }

  if (cart) {
    return (
      <PaymentProvider amount={cart.subtotal}>
        <CheckoutForm cart={cart} />
      </PaymentProvider>
    )
  }

  if (isError) {
    return <CartLoadError onRetry={() => void refetch()} />
  }

  return (
    <div className={styles.layout} aria-hidden="true">
      <Skeleton className={styles.formSkeleton} />
      <Skeleton className={styles.summarySkeleton} />
    </div>
  )
}
