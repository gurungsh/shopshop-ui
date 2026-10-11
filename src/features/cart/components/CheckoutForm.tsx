import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { type SyntheticEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/errors'
import { PaymentFields, usePayment } from '@/components/payment'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatMoney } from '@/lib/money'
import { useCartStore } from '@/stores/cart-store'

import { useCreateOrder } from '../api/mutations'
import {
  type Address,
  type AddressInput,
  addressSchema,
  clearAddressDraft,
  joinAddress,
  loadAddressDraft,
  saveAddressDraft,
} from '../lib/address'
import type { PricedCart } from '../lib/price-cart'
import { AddressFields } from './AddressFields'
import styles from './CheckoutForm.module.css'

export function CheckoutForm({ cart }: { cart: PricedCart }) {
  const navigate = useNavigate()
  const clearCart = useCartStore((state) => state.clear)
  const payment = usePayment()
  const createOrder = useCreateOrder()
  const formRef = useRef<HTMLFormElement>(null)
  const placing = useRef(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const {
    register,
    trigger,
    getValues,
    subscribe,
    formState: { errors },
  } = useForm<AddressInput, unknown, Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: loadAddressDraft(),
  })

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          saveAddressDraft(values)
        },
      }),
    [subscribe],
  )

  async function placeOrder(event: SyntheticEvent) {
    event.preventDefault()
    // A second click while the first is in flight would place a second order
    if (placing.current) return
    placing.current = true
    setIsPlacing(true)
    setAttempted(true)
    setCardError(null)
    createOrder.reset()

    let placed = false
    try {
      const [addressValid, cardProblem] = await Promise.all([
        trigger(undefined, { shouldFocus: true }),
        payment.validate(),
      ])
      setCardError(cardProblem)
      if (!addressValid || cardProblem) return

      const method = await payment.create()
      if ('error' in method) {
        setCardError(method.error)
        return
      }

      const { order, skippedProductIds } = await createOrder.mutateAsync({
        shippingAddress: joinAddress(addressSchema.parse(getValues())),
        items: cart.lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        paymentMethodId: method.paymentMethodId,
      })
      placed = true

      const skippedItems = skippedProductIds.map(
        (id) =>
          cart.lines.find((line) => line.product.id === id)?.product.name ??
          'An item',
      )
      await navigate(`/orders/${order.id}/placed`, {
        replace: true,
        state: { skippedItems },
      })
      // Only now, so a failed order keeps the cart and the address
      clearCart()
      clearAddressDraft()
    } catch {
      // createOrder.error holds the failure and the banner shows it
    } finally {
      if (!placed) {
        placing.current = false
        setIsPlacing(false)
      }
    }
  }

  const fieldErrorCount = Object.keys(errors).length

  return (
    <>
      {createOrder.error && (
        <OrderError
          error={createOrder.error}
          onRetry={() => {
            formRef.current?.requestSubmit()
          }}
        />
      )}
      {attempted && fieldErrorCount > 0 && (
        <Banner title="Check your shipping address." className={styles.notice}>
          {fieldErrorCount === 1
            ? '1 field needs attention.'
            : `${String(fieldErrorCount)} fields need attention.`}
        </Banner>
      )}
      {cardError && (
        <Banner title="Check your card details." className={styles.notice}>
          {cardError}
        </Banner>
      )}

      <form
        ref={formRef}
        noValidate
        aria-label="Checkout"
        className={styles.layout}
        onSubmit={(event) => {
          void placeOrder(event)
        }}
      >
        <div className={styles.details}>
          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className={styles.sectionTitle}>
              Shipping address
            </h2>
            <AddressFields register={register} errors={errors} />
          </section>

          <section aria-labelledby="payment-heading" className={styles.payment}>
            <div className={styles.paymentHeading}>
              <h2 id="payment-heading" className={styles.sectionTitle}>
                Payment
              </h2>
              <span className={styles.secure}>
                <Lock size={14} aria-hidden="true" />
                Card details are handled by Stripe
              </span>
            </div>
            <PaymentFields />
            <p className={styles.note}>
              We charge your card as soon as you place the order. ShopShop never
              sees or stores your card number.
            </p>
          </section>
        </div>

        <aside aria-labelledby="summary-heading" className={styles.summary}>
          <h2 id="summary-heading" className={styles.summaryTitle}>
            Order summary
          </h2>
          <ul className={styles.lines}>
            {cart.lines.map(({ product, quantity, total }) => (
              <li key={product.id} className={styles.line}>
                <ProductImage
                  categoryId={product.categoryId}
                  iconSize={20}
                  className={styles.image}
                />
                <span className={styles.lineName}>
                  {product.name}
                  <span className={styles.muted}>Qty {quantity}</span>
                </span>
                <span>{formatMoney(total)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Estimated total</span>
            <span>{formatMoney(cart.subtotal)}</span>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isPlacing || payment.unavailable}
            aria-busy={isPlacing || undefined}
          >
            {isPlacing ? 'Placing your order…' : 'Place order'}
          </Button>
          <p className={styles.note}>
            You will see the result of the payment on the next page.
          </p>
        </aside>
      </form>
    </>
  )
}

function OrderError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  // A 401 ends the session and goes to sign in; the cart and draft are kept
  if (error instanceof ApiError && error.status === 401) return null

  const retry = (
    <Button variant="secondary" size="sm" onClick={onRetry}>
      Try again
    </Button>
  )

  if (error instanceof ApiError && error.status === 503) {
    return (
      <Banner
        title="We couldn’t place your order."
        action={retry}
        className={styles.notice}
      >
        The store is having trouble checking prices right now. Your cart is
        saved, so you can try again in a moment.
      </Banner>
    )
  }

  if (error instanceof ApiError && error.status === 400) {
    return (
      <Banner title="We couldn’t place your order." className={styles.notice}>
        {error.message}
      </Banner>
    )
  }

  return (
    <Banner
      title="We couldn’t place your order."
      action={retry}
      className={styles.notice}
    >
      Something went wrong on our side. Your cart is saved, so you can try again
      in a moment.
    </Banner>
  )
}
