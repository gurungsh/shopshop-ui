import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
    title: 'Cancel this order?',
    description:
      'Order #2B9D0E71 will be canceled and won’t be shipped. You can’t undo this.',
    cancelLabel: 'Keep order',
    confirmLabel: 'Cancel order',
    pendingLabel: 'Canceling…',
    variant: 'danger',
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pending: Story = { args: { isPending: true } }
