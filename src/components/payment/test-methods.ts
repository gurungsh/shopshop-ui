// Stripe's test payment methods, accepted by a backend with a test secret key
export const testMethods = [
  { id: 'pm_card_visa', label: 'Visa that succeeds' },
  { id: 'pm_card_chargeDeclined', label: 'Card that is declined' },
  {
    id: 'pm_card_chargeDeclinedInsufficientFunds',
    label: 'Card with insufficient funds',
  },
] as const
