import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { OrderDetail } from '@/api/types/ordering'
import { connectTestUser } from '@/testing/auth'
import { addMockOrder, orderId, orders } from '@/testing/mocks/data/ordering'
import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { OrderPlacedPage } from './OrderPlacedPage'

function renderPlaced(id: string, state?: unknown) {
  return renderRoute(<OrderPlacedPage />, {
    path: '/orders/:id/placed',
    url: { pathname: `/orders/${id}/placed`, state },
  })
}

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

const heading = (name: string) => screen.findByRole('heading', { name })

describe('OrderPlacedPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    disconnect = connectTestUser()
  })

  afterEach(() => {
    disconnect()
    vi.useRealTimers()
  })

  it('polls a pending order until the payment is confirmed', async () => {
    const id = addMockOrder()
    renderPlaced(id)

    expect(await heading('Processing your payment')).toBeInTheDocument()

    await advance(4000)

    expect(await heading('Thanks, your order is confirmed')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })

  it('says it is still processing after 30 seconds, without claiming failure', async () => {
    const seeded = orders[0]
    if (!seeded) throw new Error('No seeded orders')
    const pending: OrderDetail = { ...seeded.order, status: 'Pending' }
    let reads = 0
    server.use(
      http.get(apiUrl('/api/orders/:id'), () => {
        reads += 1
        return HttpResponse.json(pending)
      }),
    )
    const { user } = renderPlaced(pending.id)

    await heading('Processing your payment')
    for (let i = 0; i < 16; i++) await advance(2000)

    expect(
      await heading('This is taking longer than usual'),
    ).toBeInTheDocument()
    const readsAtTimeout = reads
    await advance(10_000)
    expect(reads).toBe(readsAtTimeout)

    await user.click(screen.getByRole('button', { name: 'Check again' }))
    expect(await heading('Processing your payment')).toBeInTheDocument()
  })

  it('shows the decline reason and confirms after a retry with a good card', async () => {
    const id = addMockOrder({ paymentMethodId: 'pm_card_chargeDeclined' })
    const { user } = renderPlaced(id)

    await advance(4000)

    expect(await heading('Your payment didn’t go through')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your card was declined.You have 3 tries left.',
    )

    await user.click(screen.getByRole('button', { name: 'Pay $247.00' }))

    expect(await heading('Processing your payment')).toBeInTheDocument()
    await advance(4000)
    expect(await heading('Thanks, your order is confirmed')).toBeInTheDocument()
  })

  it('closes the order after the last attempt fails', async () => {
    const id = addMockOrder({
      status: 'PaymentFailed',
      paymentAttempts: 3,
      paymentMethodId: 'pm_card_chargeDeclined',
      paymentFailureReason: 'Your card was declined.',
    })
    const { user } = renderPlaced(id)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You have 1 try left.',
    )
    await user.click(screen.getByLabelText(/Card with insufficient funds/))
    await user.click(screen.getByRole('button', { name: /^Pay / }))
    await advance(4000)

    expect(
      await heading('We couldn’t take payment for this order'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Pay / })).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Start a new order' }),
    ).toBeInTheDocument()
  })

  it('shows the order as it is when the page is reloaded', async () => {
    renderPlaced(orderId(3))

    expect(
      await heading('We couldn’t take payment for this order'),
    ).toBeInTheDocument()
    expect(screen.getByText('#E0000000')).toBeInTheDocument()
    expect(screen.getByText(/221 Harbour Street/)).toBeInTheDocument()
  })

  it('lists products that were left out of the order', async () => {
    renderPlaced(orderId(1), { skippedItems: ['Pour-over Coffee Set'] })

    expect(
      await screen.findByText('1 item wasn’t included.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Pour-over Coffee Set became unavailable/),
    ).toBeInTheDocument()
  })

  it('says when the order does not exist', async () => {
    renderPlaced('e0000000-0000-4000-8000-000000000999')

    expect(await heading('We couldn’t find that order')).toBeInTheDocument()
  })
})
