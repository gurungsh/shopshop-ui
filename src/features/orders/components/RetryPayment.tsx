import { type SyntheticEvent, useRef, useState } from 'react'

import { ApiError } from '@/api/errors'
import type { OrderDetail } from '@/api/types/ordering'
import {
  PaymentFields,
  PaymentProvider,
  usePayment,
} from '@/components/payment'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/money'

import { useRetryPayment } from '../api/mutations'
import styles from './RetryPayment.module.css'

interface RetryPaymentProps {
  order: OrderDetail
  /** Called just before the retry is sent */
  onRetried?: () => void
}

export function RetryPayment({ order, onRetried }: RetryPaymentProps) {
  return (
    <PaymentProvider amount={order.totalAmount}>
      <RetryForm order={order} onRetried={onRetried} />
    </PaymentProvider>
  )
}

const GENERIC_REASON = 'We couldn’t process your payment. Please try again.'

function RetryForm({ order, onRetried }: RetryPaymentProps) {
  const payment = usePayment()
  const retry = useRetryPayment(order.id)
  const paying = useRef(false)
  const [isPaying, setIsPaying] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  async function pay(event: SyntheticEvent) {
    event.preventDefault()
    if (paying.current) return
    paying.current = true
    setIsPaying(true)
    setCardError(null)
    retry.reset()

    try {
      const problem = await payment.validate()
      if (problem) {
        setCardError(problem)
        return
      }
      const method = await payment.create()
      if ('error' in method) {
        setCardError(method.error)
        return
      }
      // Before the response, so the new Pending order gets a full polling window
      onRetried?.()
      await retry.mutateAsync({ paymentMethodId: method.paymentMethodId })
    } catch {
      // retry.error holds the failure and the banner shows it
    } finally {
      paying.current = false
      setIsPaying(false)
    }
  }

  const tries = order.paymentRetriesRemaining

  return (
    <form
      noValidate
      aria-labelledby="retry-heading"
      className={styles.retry}
      onSubmit={(event) => {
        void pay(event)
      }}
    >
      <Banner title={order.paymentFailureReason ?? GENERIC_REASON}>
        {tries === 1
          ? 'You have 1 try left.'
          : `You have ${String(tries)} tries left.`}
      </Banner>

      <h2 id="retry-heading" className={styles.title}>
        Pay with a different card
      </h2>
      <PaymentFields />

      {cardError && (
        <p role="alert" className={styles.error}>
          {cardError}
        </p>
      )}
      {retry.error && <RetryError error={retry.error} />}

      <div>
        <Button
          type="submit"
          size="lg"
          disabled={isPaying || payment.unavailable}
          aria-busy={isPaying || undefined}
        >
          {isPaying ? 'Paying…' : `Pay ${formatMoney(order.totalAmount)}`}
        </Button>
      </div>
      <p className={styles.note}>
        Each try is a new charge attempt. If every attempt fails, we close the
        order and you are not charged.
      </p>
    </form>
  )
}

function RetryError({ error }: { error: Error }) {
  if (error instanceof ApiError && error.status === 401) return null

  const message =
    error instanceof ApiError && (error.status === 400 || error.status === 409)
      ? error.message
      : 'Something went wrong on our side. Try again in a moment.'

  return <Banner title="We couldn’t retry the payment.">{message}</Banner>
}
