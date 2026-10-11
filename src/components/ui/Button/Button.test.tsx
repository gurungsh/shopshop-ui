import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'
import { buttonClass } from './button-class'

describe('Button', () => {
  it('is a plain button by default, so it never submits a form by accident', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('can still be a submit button', () => {
    render(<Button type="submit">Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  it('calls onClick, but not when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Add</Button>)

    await user.click(screen.getByRole('button', { name: 'Add' }))
    rerender(
      <Button onClick={onClick} disabled>
        Add
      </Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('passes other props through to the button', () => {
    render(<Button aria-label="Add headphones to cart">Add</Button>)

    expect(
      screen.getByRole('button', { name: 'Add headphones to cart' }),
    ).toBeInTheDocument()
  })
})

describe('buttonClass', () => {
  it('keeps the caller’s class', () => {
    expect(buttonClass({ className: 'extra' }).split(' ')).toContain('extra')
  })
})
