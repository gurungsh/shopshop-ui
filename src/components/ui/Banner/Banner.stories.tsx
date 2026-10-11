import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../Button'
import { Banner } from './Banner'

const meta = {
  title: 'UI/Banner',
  component: Banner,
  args: {
    title: 'We couldn’t load the products.',
    children: 'Check your connection, then try again.',
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const WithAction: Story = {
  args: {
    action: (
      <Button variant="secondary" size="sm">
        Try again
      </Button>
    ),
  },
}

export const TitleOnly: Story = { args: { children: undefined } }
