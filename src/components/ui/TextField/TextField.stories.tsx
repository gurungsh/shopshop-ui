import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextField } from './TextField'

const meta = {
  title: 'UI/TextField',
  component: TextField,
  args: { label: 'Email', type: 'email', autoComplete: 'email' },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character.',
  },
}

export const WithError: Story = {
  args: {
    defaultValue: 'alex@',
    error: 'A valid email address is required.',
  },
}
