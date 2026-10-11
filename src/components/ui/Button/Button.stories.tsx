import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './Button'
import { buttonClass } from './button-class'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Add to cart' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Clear filters' },
}

export const Small: Story = { args: { size: 'sm', children: 'Add' } }

export const Large: Story = { args: { size: 'lg' } }

export const Disabled: Story = { args: { disabled: true } }

export const AsLink: Story = {
  render: () => (
    <a href="/" className={buttonClass({ size: 'lg' })}>
      Back to the shop
    </a>
  ),
}

export const Danger: Story = {
  args: { variant: 'danger', children: 'Cancel order' },
}

export const DangerOutline: Story = {
  args: { variant: 'dangerOutline', children: 'Cancel order' },
}
