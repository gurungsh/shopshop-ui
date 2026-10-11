import type { Meta, StoryObj } from '@storybook/react-vite'

import type { Product } from '@/api/types/catalog'

import { ProductCard } from './ProductCard'

const product: Product = {
  id: 'a0000000-0000-4000-8000-000000000001',
  categoryId: 'c0000000-0000-4000-8000-000000000001',
  name: 'Over-ear Wireless Headphones',
  description: 'Closed-back headphones with active noise canceling.',
  sku: 'AUD-HP-200',
  price: 149,
  isActive: true,
  createdAtUtc: '2026-02-01T01:00:00.000Z',
  updatedAtUtc: '2026-02-01T01:00:00.000Z',
}

const meta = {
  title: 'Catalog/ProductCard',
  component: ProductCard,
  args: { product, categoryName: 'Audio' },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongName: Story = {
  args: {
    product: {
      ...product,
      name: 'Turntable with Built-in Preamp and Bluetooth Output, Walnut',
    },
  },
}
