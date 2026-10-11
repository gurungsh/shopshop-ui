import type { Meta, StoryObj } from '@storybook/react-vite'

import { connectTestUser } from '@/testing/auth'
import { addMockOrder, orderId } from '@/testing/mocks/data/ordering'

import { OrderDetailPage } from './OrderDetailPage'

const detail = (id: string) => ({
  router: { path: '/account/orders/:id', url: `/account/orders/${id}` },
})

const meta = {
  title: 'Orders/OrderDetailPage',
  component: OrderDetailPage,
  parameters: { layout: 'padded' },
  beforeEach: () => connectTestUser(),
} satisfies Meta<typeof OrderDetailPage>

export default meta
type Story = StoryObj<typeof meta>

const pendingId = orderId(91)

/** The mock Payment service answers after 3 seconds */
export const Pending: Story = {
  parameters: detail(pendingId),
  beforeEach: () => {
    addMockOrder({ id: pendingId })
  },
}

export const Processing: Story = { parameters: detail(orderId(5)) }

export const PaymentFailed: Story = { parameters: detail(orderId(2)) }

export const Shipped: Story = { parameters: detail(orderId(4)) }

export const Delivered: Story = { parameters: detail(orderId(6)) }

export const Canceled: Story = { parameters: detail(orderId(7)) }

export const Refunded: Story = { parameters: detail(orderId(8)) }

export const Failed: Story = { parameters: detail(orderId(3)) }

export const NotFound: Story = {
  parameters: detail('e0000999-0000-4000-8000-000000000999'),
}
