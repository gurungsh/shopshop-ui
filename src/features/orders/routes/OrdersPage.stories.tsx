import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'

import { connectTestUser } from '@/testing/auth'
import { apiUrl, errorResponse, paginate } from '@/testing/mocks/http'

import { OrdersPage } from './OrdersPage'

const search = apiUrl('/api/orders/search')

const meta = {
  title: 'Orders/OrdersPage',
  component: OrdersPage,
  parameters: {
    layout: 'padded',
    router: { path: '/account/orders', url: '/account/orders' },
  },
  beforeEach: () => connectTestUser(),
} satisfies Meta<typeof OrdersPage>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}

export const Ongoing: Story = {
  parameters: {
    router: { path: '/account/orders', url: '/account/orders?tab=ongoing' },
  },
}

export const Empty: Story = {
  beforeEach({ msw }) {
    msw.use(http.post(search, () => HttpResponse.json(paginate([]))))
  },
}

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(search, async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
  },
}

export const LoadFailed: Story = {
  beforeEach({ msw }) {
    msw.use(http.post(search, () => errorResponse(500, 'Boom')))
  },
}
