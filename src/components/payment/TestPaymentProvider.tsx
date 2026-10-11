import { type ReactNode, useMemo, useState } from 'react'

import { PaymentContext, type PaymentContextValue } from './payment-context'
import { testMethods } from './test-methods'

export function TestPaymentProvider({ children }: { children: ReactNode }) {
  const [method, setMethod] = useState<string>(testMethods[0].id)

  const value = useMemo<PaymentContextValue>(
    () => ({
      validate: () => Promise.resolve(null),
      create: () => Promise.resolve({ paymentMethodId: method }),
      testMethod: { value: method, onChange: setMethod },
    }),
    [method],
  )

  return <PaymentContext value={value}>{children}</PaymentContext>
}
