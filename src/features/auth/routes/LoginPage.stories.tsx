import type { Meta, StoryObj } from '@storybook/react-vite'

import { LoginPage } from './LoginPage'

const meta = {
  title: 'Auth/LoginPage',
  component: LoginPage,
  parameters: { layout: 'padded', router: { path: '/login', url: '/login' } },
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FromCheckout: Story = {
  parameters: {
    router: { path: '/login', url: '/login?returnTo=%2Fcheckout' },
  },
}

export const SessionExpired: Story = {
  parameters: { router: { path: '/login', url: '/login?reason=expired' } },
}
