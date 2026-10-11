import type { Meta, StoryObj } from '@storybook/react-vite'

import { RegisterPage } from './RegisterPage'

const meta = {
  title: 'Auth/RegisterPage',
  component: RegisterPage,
  parameters: {
    layout: 'padded',
    router: { path: '/register', url: '/register' },
  },
} satisfies Meta<typeof RegisterPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
