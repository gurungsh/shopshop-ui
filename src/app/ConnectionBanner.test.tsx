import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { setServiceUnavailable } from '@/api/service-status'

import { ConnectionBanner } from './ConnectionBanner'

function renderBanner() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ConnectionBanner />
    </QueryClientProvider>,
  )
}

describe('ConnectionBanner', () => {
  afterEach(() => {
    setServiceUnavailable(false)
    vi.restoreAllMocks()
  })

  it('shows nothing while everything works', () => {
    renderBanner()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('tells the shopper when the browser goes offline, and when it is back', () => {
    renderBanner()

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByRole('status')).toHaveTextContent('You’re offline')

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('warns when the service is unavailable and offers another try', () => {
    renderBanner()

    act(() => {
      setServiceUnavailable(true)
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'ShopShop is temporarily unavailable',
    )
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})
