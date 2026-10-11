import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'

import { QuantityStepper } from './QuantityStepper'

const meta = {
  title: 'UI/QuantityStepper',
  component: QuantityStepper,
  args: { value: 1, onChange: fn() },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <QuantityStepper
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof QuantityStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AtMaximum: Story = { args: { value: 5, max: 5 } }
