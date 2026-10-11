import { Banner } from '@/components/ui/Banner'

import { usePayment } from './payment-context'
import styles from './PaymentFields.module.css'
import { StripeCardFields } from './StripePaymentProvider'
import { testMethods } from './test-methods'

export function PaymentFields() {
  const { testMethod, unavailable } = usePayment()

  if (unavailable) {
    return (
      <Banner title="Card payments aren’t available right now.">
        Try again later.
      </Banner>
    )
  }

  if (!testMethod) return <StripeCardFields />

  return (
    <fieldset className={styles.testMethods}>
      <legend className={styles.legend}>Test payment method</legend>
      <p className={styles.hint}>
        Development only. Sends a Stripe test payment method instead of a card.
      </p>
      {testMethods.map((method) => (
        <label key={method.id} className={styles.option}>
          <input
            type="radio"
            name="test-payment-method"
            value={method.id}
            checked={testMethod.value === method.id}
            onChange={() => {
              testMethod.onChange(method.id)
            }}
          />
          <span>{method.label}</span>
          <code className={styles.code}>{method.id}</code>
        </label>
      ))}
    </fieldset>
  )
}
