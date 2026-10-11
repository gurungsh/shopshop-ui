import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from './Skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// Skeletons take their size from the layout; grid rows stretch them here
export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '180px 20px 28px',
        gap: 12,
        width: 260,
      }}
    >
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  ),
}
