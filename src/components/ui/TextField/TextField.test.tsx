import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TextField } from './TextField'

describe('TextField', () => {
  it('describes the input with its error, then its hint', () => {
    render(
      <TextField
        label="Password"
        hint="At least 8 characters."
        error="Password is required."
      />,
    )

    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      'Password is required. At least 8 characters.',
    )
  })

  it('is valid and undescribed without an error or hint', () => {
    render(<TextField label="Email" />)

    const input = screen.getByLabelText('Email')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })
})
