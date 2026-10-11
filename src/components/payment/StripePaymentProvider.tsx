import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'
import { type ReactNode, useMemo, useState } from 'react'

import { Banner } from '@/components/ui/Banner'

import { PaymentContext, type PaymentContextValue } from './payment-context'

let stripePromise: Promise<Stripe | null> | undefined

function getStripe(publishableKey: string) {
  stripePromise ??= loadStripe(publishableKey)
  return stripePromise
}

const toCents = (amount: number) => Math.round(amount * 100)

interface StripePaymentProviderProps {
  publishableKey: string
  amount: number
  children: ReactNode
}

export function StripePaymentProvider({
  publishableKey,
  amount,
  children,
}: StripePaymentProviderProps) {
  return (
    <Elements
      stripe={getStripe(publishableKey)}
      options={{
        mode: 'payment',
        amount: toCents(amount),
        currency: 'usd',
        // Ordering.Api takes a payment method id and Payment confirms it
        // server side, with redirects off, so only cards work
        paymentMethodCreation: 'manual',
        paymentMethodTypes: ['card'],
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1d4ed8',
            colorText: '#15171c',
            colorDanger: '#b42318',
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSizeBase: '16px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <StripeBridge>{children}</StripeBridge>
    </Elements>
  )
}

const notReady = 'The card form is still loading. Try again in a moment.'
const checkCard = 'Check your card details.'

function StripeBridge({ children }: { children: ReactNode }) {
  const stripe = useStripe()
  const elements = useElements()

  const value = useMemo<PaymentContextValue>(
    () => ({
      validate: async () => {
        if (!elements) return notReady
        const { error } = await elements.submit()
        return error ? (error.message ?? checkCard) : null
      },
      create: async () => {
        if (!stripe || !elements) return { error: notReady }
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          elements,
        })
        return error
          ? { error: error.message ?? checkCard }
          : { paymentMethodId: paymentMethod.id }
      },
    }),
    [stripe, elements],
  )

  return <PaymentContext value={value}>{children}</PaymentContext>
}

export function StripeCardFields() {
  const [loadError, setLoadError] = useState(false)

  if (loadError) {
    return (
      <Banner title="We couldn’t load the card form.">
        Check your connection, then reload the page.
      </Banner>
    )
  }

  return (
    <PaymentElement
      // Link can pay from a bank, which settles later; Payment only handles cards
      options={{ layout: 'tabs', wallets: { link: 'never' } }}
      onLoadError={() => {
        setLoadError(true)
      }}
    />
  )
}
