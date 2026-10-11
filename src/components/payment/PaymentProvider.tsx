import type { ReactNode } from 'react'

import { env } from '@/config/env'

import { PaymentContext, type PaymentContextValue } from './payment-context'
import { StripePaymentProvider } from './StripePaymentProvider'
import { TestPaymentProvider } from './TestPaymentProvider'

const unavailable: PaymentContextValue = {
  validate: () => Promise.resolve('Card payments aren’t available.'),
  create: () => Promise.resolve({ error: 'Card payments aren’t available.' }),
  unavailable: true,
}

interface PaymentProviderProps {
  /** The amount to charge, in dollars */
  amount: number
  children: ReactNode
}

export function PaymentProvider({ amount, children }: PaymentProviderProps) {
  if (env.VITE_PAYMENT_TEST_METHODS) {
    return <TestPaymentProvider>{children}</TestPaymentProvider>
  }

  if (env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <StripePaymentProvider
        publishableKey={env.VITE_STRIPE_PUBLISHABLE_KEY}
        amount={amount}
      >
        {children}
      </StripePaymentProvider>
    )
  }

  return <PaymentContext value={unavailable}>{children}</PaymentContext>
}
