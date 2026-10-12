import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { renderRoute } from '@/testing/render'

import { AdminOrdersPage } from './AdminOrdersPage'

const customerId = users[0]?.id ?? ''
const adminId = users[1]?.id ?? ''

function renderOrders(url = '/admin/orders') {
  return renderRoute(<AdminOrdersPage />, { path: '/admin/orders', url })
}

const rows = async () => {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

describe('AdminOrdersPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
  })

  it('lists every customer’s orders with their emails and a count per tab', async () => {
    renderOrders()

    expect(await rows()).toHaveLength(13)
    expect(
      (await screen.findAllByText('alex@example.com')).length,
    ).toBeGreaterThan(0)
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument()

    expect(
      await screen.findByRole('tab', { name: 'All (13)', selected: true }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ongoing (5)' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Past (8)' })).toBeInTheDocument()
  })

  it('filters by customer id and keeps the filter in the URL', async () => {
    const { user, router } = renderOrders()
    await rows()

    await user.type(screen.getByLabelText('Customer id'), adminId)
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(async () => {
      expect(await rows()).toHaveLength(1)
    })
    expect(router.state.location.search).toBe(`?customer=${adminId}`)
    expect(screen.getByText('#E0000013')).toBeInTheDocument()
  })

  it('filters by status chip within the tab', async () => {
    const { user, router } = renderOrders('/admin/orders?tab=past')
    await rows()

    await user.click(screen.getByRole('button', { name: 'Refunded' }))

    await waitFor(async () => {
      expect(await rows()).toHaveLength(1)
    })
    expect(router.state.location.search).toBe('?tab=past&status=Refunded')
  })

  it('ignores a customer id that is not a full id', async () => {
    renderOrders(`/admin/orders?customer=${customerId.slice(0, 8)}`)

    expect(await rows()).toHaveLength(13)
  })

  it('changes the rows per page and offers a refresh', async () => {
    const { user, router } = renderOrders()
    await rows()

    await user.selectOptions(screen.getByLabelText('Rows per page'), '10')

    await waitFor(async () => {
      expect(await rows()).toHaveLength(10)
    })
    expect(router.state.location.search).toBe('?size=10')
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })
})
