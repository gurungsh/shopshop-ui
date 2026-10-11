import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('is hidden from screen readers', () => {
    const { container } = render(<Skeleton />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes the caller’s class for its size', () => {
    const { container } = render(<Skeleton className="card" />)

    expect(container.firstChild).toHaveClass('card')
  })
})
