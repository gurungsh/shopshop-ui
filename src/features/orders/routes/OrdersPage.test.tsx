import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { apiUrl, errorResponse, paginate } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { OrdersPage } from './OrdersPage'

function renderOrders(url = '/account/orders') {
  return renderRoute(<OrdersPage />, { path: '/account/orders', url })
}

const rows = async () => {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

describe('OrdersPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser()
  })

  afterEach(() => {
    disconnect()
  })

  it('lists the customer’s own orders, newest first, with a count per tab', async () => {
    renderOrders()

    const [first, second] = await rows()
    expect(first).toHaveTextContent('#E0000003')
    expect(first).toHaveTextContent('Failed')
    expect(second).toHaveTextContent('#E0000002')
    expect(screen.queryByText('#E0000013')).toBeNull()

    expect(
      await screen.findByRole('tab', { name: 'All (12)', selected: true }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ongoing (4)' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Past (8)' })).toBeInTheDocument()
  })

  it('filters by tab and keeps the tab in the URL', async () => {
    const { user, router } = renderOrders()
    await rows()

    await user.click(screen.getByRole('tab', { name: /^Ongoing/ }))

    expect(router.state.location.search).toBe('?tab=ongoing')
    await screen.findByRole('tab', { name: /^Ongoing/, selected: true })
    await waitFor(async () => {
      expect(await rows()).toHaveLength(4)
    })
    expect(screen.queryByText('Delivered')).toBeNull()
  })

  it('pages through the orders', async () => {
    const { user, router } = renderOrders()
    expect(await rows()).toHaveLength(10)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(router.state.location.search).toBe('?page=2')
    await waitFor(async () => {
      expect(await rows()).toHaveLength(2)
    })
    expect(screen.getByText('#E0000012')).toBeInTheDocument()
  })

  it('offers to pay again for an order whose payment failed', async () => {
    renderOrders('/account/orders?tab=ongoing')

    expect(
      await screen.findByRole('link', {
        name: 'Pay again for order #E0000002',
      }),
    ).toHaveAttribute(
      'href',
      '/account/orders/e0000002-0000-4000-8000-000000000002',
    )
  })

  it('says when there are no orders yet', async () => {
    server.use(
      http.post(apiUrl('/api/orders/search'), () =>
        HttpResponse.json(paginate([])),
      ),
    )
    renderOrders()

    expect(
      await screen.findByText('You haven’t placed any orders yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse products' }),
    ).toBeInTheDocument()
  })

  it('offers a retry when the orders fail to load', async () => {
    let fail = true
    server.use(
      http.post(apiUrl('/api/orders/search'), () =>
        fail ? errorResponse(500, 'Boom') : undefined,
      ),
    )
    const { user } = renderOrders()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t load your orders.',
    )

    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await rows()).toHaveLength(10)
  })
})
