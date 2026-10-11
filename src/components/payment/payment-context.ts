import { createContext, useContext } from 'react'

type PaymentMethodResult = { paymentMethodId: string } | { error: string }

interface TestMethodChoice {
  value: string
  onChange: (value: string) => void
}

export interface PaymentContextValue {
  /** Checks the card details; resolves to an error message or null */
  validate: () => Promise<string | null>
  /** Turns the card into a Stripe payment method, in the browser */
  create: () => Promise<PaymentMethodResult>
  testMethod?: TestMethodChoice
  /** No way to pay is set up in this environment */
  unavailable?: boolean
}

export const PaymentContext = createContext<PaymentContextValue | null>(null)

export function usePayment(): PaymentContextValue {
  const value = useContext(PaymentContext)
  if (!value) throw new Error('usePayment must be used inside PaymentProvider')
  return value
}
