import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppErrorBoundary } from './AppErrorBoundary'

function Broken(): never {
  throw new Error('render failed')
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows its children when nothing fails', () => {
    render(
      <AppErrorBoundary>
        <p>All good</p>
      </AppErrorBoundary>,
    )

    expect(screen.getByText('All good')).toBeVisible()
  })

  it('replaces a crashed app with a reload page and reports the error', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <AppErrorBoundary>
        <Broken />
      </AppErrorBoundary>,
    )

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Reload the page' }),
    ).toBeVisible()
    expect(log).toHaveBeenCalledWith(
      '[app]',
      '',
      expect.objectContaining({ message: 'render failed' }),
    )
  })
})
