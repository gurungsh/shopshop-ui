import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { Pagination } from './Pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  args: { page: 1, totalPages: 3, onPageChange: fn() },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPage: Story = {}

export const ManyPages: Story = { args: { page: 5, totalPages: 10 } }

export const LastPage: Story = { args: { page: 3 } }
