import type { Meta, StoryObj } from '@storybook/react-vite'

import { type CartLine, useCartStore } from '@/stores/cart-store'
import { connectTestUser } from '@/testing/auth'

import { CheckoutPage } from './CheckoutPage'

const lines: CartLine[] = [
  { productId: 'a0000000-0000-4000-8000-000000000001', quantity: 1 },
  { productId: 'a0000000-0000-4000-8000-000000000006', quantity: 1 },
  { productId: 'a0000000-0000-4000-8000-000000000003', quantity: 1 },
]

function withCart(cart: CartLine[]) {
  return () => {
    const previous = useCartStore.getState().lines
    useCartStore.setState({ lines: cart })
    const disconnect = connectTestUser()
    return () => {
      useCartStore.setState({ lines: previous })
      disconnect()
    }
  }
}

const meta = {
  title: 'Cart/CheckoutPage',
  component: CheckoutPage,
  parameters: {
    layout: 'padded',
    router: { path: '/checkout', url: '/checkout' },
  },
} satisfies Meta<typeof CheckoutPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: withCart(lines) }

export const Empty: Story = { beforeEach: withCart([]) }
