import type { Meta, StoryObj } from '@storybook/react-vite'

import { type CartLine, useCartStore } from '@/stores/cart-store'

import { CartPage } from './CartPage'

const lines: CartLine[] = [
  { productId: 'a0000000-0000-4000-8000-000000000001', quantity: 1 },
  { productId: 'a0000000-0000-4000-8000-000000000002', quantity: 2 },
  { productId: 'a0000000-0000-4000-8000-000000000005', quantity: 1 },
]

function withCart(cart: CartLine[]) {
  return () => {
    const previous = useCartStore.getState().lines
    useCartStore.setState({ lines: cart })
    return () => {
      useCartStore.setState({ lines: previous })
    }
  }
}

const meta = {
  title: 'Cart/CartPage',
  component: CartPage,
  parameters: { layout: 'padded', router: { path: '/cart', url: '/cart' } },
} satisfies Meta<typeof CartPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: withCart(lines) }

export const UnavailableItem: Story = {
  beforeEach: withCart([
    ...lines,
    { productId: 'a0000000-0000-4000-8000-000000000030', quantity: 1 },
  ]),
}

export const Empty: Story = { beforeEach: withCart([]) }
