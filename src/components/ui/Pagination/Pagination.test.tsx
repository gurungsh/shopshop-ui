import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('marks the current page and shows where you are', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('reports the page that was picked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Page 1' }))

    expect(onPageChange.mock.calls).toEqual([[3], [1]])
  })
})
