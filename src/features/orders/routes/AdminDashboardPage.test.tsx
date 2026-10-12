import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from 'msw'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { apiUrl, errorResponse } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { AdminDashboardPage } from './AdminDashboardPage'

function renderDashboard(url = '/admin') {
  return renderRoute(<AdminDashboardPage />, { path: '/admin', url })
}

const tile = (name: string) => screen.getByText(name).closest('a, div')

describe('AdminDashboardPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
    server.resetHandlers()
    vi.useRealTimers()
  })

  it('counts orders by status and links each count to Admin orders', async () => {
    renderDashboard('/admin?range=90')

    const breakdown = screen.getByRole('region', { name: 'Orders by status' })
    const delivered = await within(breakdown).findByRole('link', {
      name: /Delivered:\s*4/,
    })
    expect(delivered.getAttribute('href')).toMatch(
      /^\/admin\/orders\?from=\d{4}-\d{2}-\d{2}&status=Delivered$/,
    )
    expect(
      within(breakdown).getByRole('link', { name: /Payment failed:\s*1/ }),
    ).toBeInTheDocument()
    expect(tile('Ongoing orders')).toHaveTextContent('5')
    expect(
      await within(tile('Revenue') as HTMLElement).findByText(/^\$/),
    ).toBeInTheDocument()
  })

  it('lists payment failures under needs attention and the newest orders', async () => {
    renderDashboard('/admin?range=90')

    const attention = screen.getByRole('region', { name: 'Needs attention' })
    expect(
      await within(attention).findByText('Payment failed'),
    ).toBeInTheDocument()
    expect(within(attention).getAllByRole('row')).toHaveLength(2)

    const recent = screen.getByRole('region', { name: 'Recent orders' })
    expect(await within(recent).findAllByRole('row')).toHaveLength(6)
  })

  it('switches the range and keeps it in the URL', async () => {
    const { user, router } = renderDashboard('/admin?range=90')
    const breakdown = screen.getByRole('region', { name: 'Orders by status' })
    await within(breakdown).findByRole('link', { name: /Delivered:\s*4/ })

    await user.click(screen.getByRole('button', { name: '7 days' }))

    expect(router.state.location.search).toBe('?range=7')
    expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      await within(breakdown).findByRole('link', { name: /Delivered:\s*0/ }),
    ).toBeInTheDocument()
  })

  it('offers a retry when the orders can’t be loaded', async () => {
    server.use(
      http.post(apiUrl('/api/admin/orders/search'), () =>
        errorResponse(500, 'Boom'),
      ),
    )
    renderDashboard('/admin?range=90')

    expect(
      await screen.findByText('We couldn’t load all of the dashboard.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
