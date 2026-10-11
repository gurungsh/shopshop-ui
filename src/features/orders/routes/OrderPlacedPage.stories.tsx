import type { Meta, StoryObj } from '@storybook/react-vite'

import { connectTestUser } from '@/testing/auth'
import { addMockOrder, orderId } from '@/testing/mocks/data/ordering'

import { OrderPlacedPage } from './OrderPlacedPage'

const path = '/orders/:id/placed'
const placed = (id: string, state?: unknown) => ({
  router: { path, url: { pathname: `/orders/${id}/placed`, state } },
})

const meta = {
  title: 'Orders/OrderPlacedPage',
  component: OrderPlacedPage,
  parameters: { layout: 'padded' },
  beforeEach: () => connectTestUser(),
} satisfies Meta<typeof OrderPlacedPage>

export default meta
type Story = StoryObj<typeof meta>

const processingId = orderId(90)

/** The mock Payment service answers after 3 seconds */
export const Processing: Story = {
  parameters: placed(processingId),
  beforeEach: () => {
    addMockOrder({ id: processingId })
  },
}

export const Confirmed: Story = { parameters: placed(orderId(1)) }

export const PaymentFailed: Story = { parameters: placed(orderId(2)) }

export const Failed: Story = { parameters: placed(orderId(3)) }

export const SkippedItem: Story = {
  parameters: placed(orderId(1), { skippedItems: ['Pour-over Coffee Set'] }),
}
