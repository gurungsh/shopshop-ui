import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'

import { apiUrl } from '@/testing/mocks/http'

import { CatalogPage } from './CatalogPage'

const meta = {
  title: 'Catalog/CatalogPage',
  component: CatalogPage,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filtered: Story = {
  parameters: {
    router: { url: '/?category=c0000000-0000-4000-8000-000000000003&min=40' },
  },
}

export const NoResults: Story = {
  parameters: { router: { url: '/?q=nothing' } },
}

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(apiUrl('/api/products/search'), async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
  },
}

export const LoadFailed: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(apiUrl('/api/products/search'), () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 }),
      ),
    )
  },
}
