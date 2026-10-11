import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectField } from './SelectField'

const meta = {
  title: 'UI/SelectField',
  component: SelectField,
  args: {
    label: 'Country',
    autoComplete: 'country-name',
    children: (
      <>
        <option>United States</option>
        <option>Canada</option>
        <option>United Kingdom</option>
      </>
    ),
  },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: { error: 'Choose a country.' },
}
