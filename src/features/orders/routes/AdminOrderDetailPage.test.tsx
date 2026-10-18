import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { formatDate } from '@/lib/date'
import { connectTestUser } from '@/testing/auth'
import { products } from '@/testing/mocks/data/catalog'
import { users } from '@/testing/mocks/data/identity'
import { addMockOrder, orders } from '@/testing/mocks/data/ordering'
import { renderRoute } from '@/testing/render'

import { AdminOrderDetailPage } from './AdminOrderDetailPage'

function renderDetail(id: string) {
  return renderRoute(<AdminOrderDetailPage />, {
    path: '/admin/orders/:id',
    url: `/admin/orders/${id}`,
  })
}

const statusOf = (id: string) =>
  orders.find((o) => o.order.id === id)?.order.status

describe('AdminOrderDetailPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
  })

  it('shows the order, its customer, address and activity', async () => {
    const id = addMockOrder({ status: 'Processing' })
    renderDetail(id)

    expect(
      await screen.findByRole('heading', { name: /^Order #/ }),
    ).toBeInTheDocument()
    expect(await screen.findByText('alex@example.com')).toBeInTheDocument()
    expect(screen.getByText(products[0]?.name ?? '')).toBeInTheDocument()
    expect(screen.getByText('221 Harbor Street')).toBeInTheDocument()
    expect(screen.getByText('Last updated')).toBeInTheDocument()
    expect(screen.getByText('Order placed')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mark as Shipped' }),
    ).toBeInTheDocument()
  })

  it('shows when the order was placed and updated, and refreshes it after a change', async () => {
    const id = addMockOrder({ status: 'Confirmed' })
    const mock = orders.find((o) => o.order.id === id)
    if (!mock) throw new Error('mock order missing')
    mock.order.createdAtUtc = '2026-01-05T10:00:00Z'
    mock.order.updatedAtUtc = '2026-01-06T10:00:00Z'
    const { user } = renderDetail(id)

    expect(
      await screen.findByText(`Placed ${formatDate('2026-01-05T10:00:00Z')}`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Updated ${formatDate('2026-01-06T10:00:00Z')}`),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark as Processing' }))

    expect(
      await screen.findByText(
        `Updated ${formatDate(new Date().toISOString())}`,
      ),
    ).toBeInTheDocument()
  })

  it('moves the order to the next status', async () => {
    const id = addMockOrder({ status: 'Confirmed' })
    const { user } = renderDetail(id)

    await user.click(
      await screen.findByRole('button', { name: 'Mark as Processing' }),
    )

    expect(
      await screen.findByRole('button', { name: 'Mark as Shipped' }),
    ).toBeInTheDocument()
    expect(statusOf(id)).toBe('Processing')
  })

  it('asks before refunding', async () => {
    const id = addMockOrder({ status: 'Delivered' })
    const { user } = renderDetail(id)

    await user.click(
      await screen.findByRole('button', { name: 'Change status' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Refunded' }))
    expect(statusOf(id)).toBe('Delivered')

    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Mark as Refunded' }),
    )

    expect(await screen.findByText('Refunded')).toBeInTheDocument()
    expect(statusOf(id)).toBe('Refunded')
    expect(screen.queryByRole('button', { name: /^Mark as/ })).toBeNull()
  })

  it('cancels through the cancel endpoint', async () => {
    const id = addMockOrder({ status: 'Confirmed' })
    const { user } = renderDetail(id)

    await user.click(
      await screen.findByRole('button', { name: 'Change status' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Canceled' }))
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Mark as Canceled',
      }),
    )

    await screen.findByText('Canceled')
    expect(statusOf(id)).toBe('Cancelled')
  })

  it('edits the shipping address', async () => {
    const id = addMockOrder({ status: 'Confirmed' })
    const { user } = renderDetail(id)

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const field = screen.getByLabelText('Shipping address')
    await user.clear(field)
    await user.type(field, 'Sam Lee{Enter}9 Elm Road')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('9 Elm Road')).toBeInTheDocument()
    expect(screen.queryByLabelText('Shipping address')).toBeNull()
    expect(statusOf(id)).toBe('Confirmed')
  })

  it('says when the order does not exist', async () => {
    renderDetail('00000000-0000-4000-8000-000000000000')

    expect(
      await screen.findByRole('heading', {
        name: 'We couldn’t find that order',
      }),
    ).toBeInTheDocument()
  })
})
