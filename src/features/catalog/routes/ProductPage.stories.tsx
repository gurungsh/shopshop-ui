import type { Meta, StoryObj } from '@storybook/react-vite'

import { ProductPage } from './ProductPage'

const meta = {
  title: 'Catalog/ProductPage',
  component: ProductPage,
  parameters: {
    layout: 'padded',
    router: {
      path: '/products/:id',
      url: '/products/a0000000-0000-4000-8000-000000000001',
    },
  },
} satisfies Meta<typeof ProductPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NotFound: Story = {
  parameters: {
    router: { path: '/products/:id', url: '/products/unknown' },
  },
}
