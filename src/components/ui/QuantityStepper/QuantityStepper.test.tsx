import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { QuantityStepper } from './QuantityStepper'

function Stepper({
  initial = 1,
  max = 99,
}: {
  initial?: number
  max?: number
}) {
  const [value, setValue] = useState(initial)
  return <QuantityStepper value={value} onChange={setValue} max={max} />
}

describe('QuantityStepper', () => {
  it('steps the quantity up and down', async () => {
    const user = userEvent.setup()
    render(<Stepper />)
    const group = screen.getByRole('group', { name: 'Quantity' })

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }))

    expect(group).toHaveTextContent('2')
  })

  it('stops at the minimum and maximum', () => {
    const { unmount } = render(<Stepper initial={1} />)
    expect(
      screen.getByRole('button', { name: 'Decrease quantity' }),
    ).toBeDisabled()
    unmount()

    render(<Stepper initial={5} max={5} />)
    expect(
      screen.getByRole('button', { name: 'Increase quantity' }),
    ).toBeDisabled()
  })
})
